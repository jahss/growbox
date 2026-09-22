(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxUseRate = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PPM_COLUMNS = [
    ['N', 'N'], ['P', 'P'], ['K', 'K'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S'],
    ['Fe', 'Fe'], ['Mn', 'Mn'], ['Zn', 'Zn'], ['B', 'B'], ['Cu', 'Cu'], ['Mo', 'Mo']
  ];
  const MICRO_KEYS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const NITROGEN_FORM_LABELS = {
    nitrateN: 'Nitrate N', ammoniacalN: 'Ammoniacal N', ureaN: 'Urea N',
    otherN: 'Other N', waterSolubleN: 'Other water-soluble N', unpublished: 'Form not published'
  };

  // N-form cards plus ammonium's share of total N. N from products that don't publish
  // their split shows as its own card, so the cards add up to total N.
  function nitrogenFormsHtml(forms, totalN, format, escape, target) {
    const entries = Object.entries(forms || {}).filter(([, value]) => value > 0);
    if (!entries.length && !Object.keys(target || {}).some(key => key in NITROGEN_FORM_LABELS && number(target[key]) > 0)) return '<p class="muted">No N-form breakdown is published for these products.</p>';
    const unpublished = number(totalN) - entries.reduce((sum, [, value]) => sum + value, 0);
    if (unpublished > 0.05) entries.push(['unpublished', unpublished]);
    const ammoniumShare = number(totalN) > 0 ? number(forms.ammoniacalN) / number(totalN) * 100 : 0;
    const card = ([key, value]) => {
      const goal = number(target && target[key]);
      if (goal <= 0) return '<div class="pill"><b>' + format(value, 1) + ' ppm</b><span>' + escape(NITROGEN_FORM_LABELS[key] || key) + '</span></div>';
      const diff = value - goal;
      const rounded = format(Math.abs(diff), 1);
      return '<div class="pill ' + (Math.abs(diff) <= 0.05 * goal ? 'diff-ok' : 'diff-off') + '"><b>' + format(value, 1) + ' ppm</b><span>' + escape(NITROGEN_FORM_LABELS[key] || key) + '</span><small>target ' + format(goal, 1) + ' · ' + (rounded === '0' ? '±' : diff > 0 ? '+' : '−') + rounded + '</small></div>';
    };
    // A targeted form the blend doesn't deliver still gets a card.
    Object.keys(target || {}).filter(key => key in NITROGEN_FORM_LABELS && number(target[key]) > 0 && !entries.some(([k]) => k === key)).forEach(key => entries.push([key, 0]));
    return '<h3>Nitrogen forms</h3><div class="result-grid">' + entries.map(card).join('') + '</div>' +
      '<p class="muted n-share">Ammonium is ' + format(ammoniumShare, 1) + '% of N' + (unpublished > 0.05 ? ' (some N has no published form)' : '') + '. Most hydro recipes keep ammonium under about 10–15% of N.</p>';
  }

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function doseUnits(product) {
    const units = ['g/gal', 'g/L'];
    if (product && product.form === 'liquid' && number(product.densityGPerMl) > 0) units.push('mL/gal', 'mL/L');
    return units;
  }

  function resolveEntry(selection, catalog) {
    const [kind, id] = String(selection || '').split(':');
    if (kind === 'p') {
      const product = catalog.product(id);
      if (!product || product.compareGroup !== '1-part') return null;
      return {
        kind, id, record: product, products: [product],
        components: [{productId: product.id, label: catalog.displayFormula(product)}],
        useRates: product.useRates || []
      };
    }
    if (kind === 's') {
      const system = catalog.system(id);
      if (!system) return null;
      return {
        kind, id, record: system,
        products: system.components.map(component => catalog.product(component.productId)),
        components: system.components.map(component => ({...component, label: catalog.partLabel(system, component.label)})),
        useRates: system.useRates || []
      };
    }
    return null;
  }

  function presetDoses(entry, rate) {
    if (!entry || !rate) return {};
    const sourceLines = entry.kind === 'p' ? [{productId: entry.id, ...rate}] : (rate.components || []);
    const doses = {};
    sourceLines.forEach(line => {
      if (line.gPerGal != null) doses[line.productId] = {amount: number(line.gPerGal), unit: 'g/gal'};
      else if (line.mLPerGal != null) doses[line.productId] = {amount: number(line.mLPerGal), unit: 'mL/gal'};
    });
    return doses;
  }

  function calculateRecipe(entry, doses, chemistry) {
    if (!entry) return null;
    const lines = entry.products.map((product, index) => {
      const allowedUnits = doseUnits(product);
      const saved = doses && doses[product.id] ? doses[product.id] : {};
      const unit = allowedUnits.includes(saved.unit) ? saved.unit : allowedUnits[0];
      const amount = Math.max(0, number(saved.amount));
      return {
        product,
        label: entry.components[index].label,
        amount,
        unit,
        usesEstimatedDensity: (unit === 'mL/gal' || unit === 'mL/L') && Boolean(product.densityEstimate),
        gramsPerLiter: chemistry.doseGramsPerLiter(product, amount, unit)
      };
    });
    return {lines, approximateDensity: lines.some(line => line.usesEstimatedDensity), ...chemistry.recipeAtDoses(lines)};
  }

  function createComponent(options) {
    const document = options.document;
    const products = options.products;
    const systems = options.systems;
    const chemistry = options.chemistry;
    const catalog = options.catalog;
    const getState = options.getState;
    const save = options.save;
    const format = options.format;
    const escape = options.escape;
    const onCopied = options.onCopied || (() => {});
    const element = id => document.getElementById(id);

    function currentEntry() {
      return resolveEntry(getState().useRate.selection, catalog);
    }

    function currentResult() {
      return calculateRecipe(currentEntry(), getState().useRate.doses, chemistry);
    }

    function applyPreset(index) {
      const state = getState();
      const entry = currentEntry();
      const rate = entry && entry.useRates[index];
      if (!rate) return false;
      entry.products.forEach(product => {
        state.useRate.doses[product.id] = {amount: 0, unit: doseUnits(product)[0]};
      });
      Object.assign(state.useRate.doses, presetDoses(entry, rate));
      state.useRate.preset = String(index);
      save();
      return true;
    }

    function renderPicker() {
      const state = getState();
      const onePart = products.filter(product => product.compareGroup === '1-part');
      const byParts = count => systems.filter(system => system.partCount === count);
      const group = (label, items, prefix) => '<optgroup label="' + label + '">' + items.map(item => '<option value="' + prefix + ':' + escape(item.id) + '">' + escape(item.brand + ' — ' + catalog.displayProgram(item) + ' · ' + catalog.displayFormula(item)) + '</option>').join('') + '</optgroup>';
      element('useRateProduct').innerHTML = group('1-Part', onePart, 'p') + group('2-Part', byParts(2), 's') + group('3-Part', byParts(3), 's');
      element('useRateProduct').value = state.useRate.selection;
      element('useRateProduct').onchange = event => {
        state.useRate.selection = event.target.value;
        state.useRate.preset = 'custom';
        // A new program starts on its first published rate, so the numbers mean something.
        if (!applyPreset(0)) save();
        render();
      };
    }

    function renderPreset(entry) {
      const state = getState();
      const rates = entry.useRates;
      const preset = rates[Number(state.useRate.preset)] ? state.useRate.preset : 'custom';
      state.useRate.preset = preset;
      element('useRatePreset').innerHTML = '<option value="custom">Custom rate</option>' + rates.map((rate, index) => '<option value="' + index + '">' + escape(rate.label) + '</option>').join('');
      element('useRatePreset').value = preset;
      element('useRatePreset').disabled = rates.length === 0;
      element('useRatePresetNote').textContent = rates.length
        ? ''
        : 'No published rate for this product yet; type your own below.';
      element('useRatePreset').onchange = event => {
        if (event.target.value === 'custom') {
          state.useRate.preset = 'custom';
          save();
          return;
        }
        applyPreset(Number(event.target.value));
        render();
      };
    }

    function renderInputs(entry) {
      const state = getState();
      const basis = entry.kind === 's' ? ' · parts mixed by ' + (entry.record.ratioBasis === 'volume' ? 'volume' : 'weight') : '';
      element('useRateIdentity').textContent = catalog.displayFormula(entry.record) + ' · ' + catalog.displayParts(entry.record) + basis;
      // Account-only later: "+ Add product" row here, so additives join the recipe as extra lines.
      element('useRateInputs').innerHTML = entry.products.map((product, index) => {
        const allowedUnits = doseUnits(product);
        const saved = state.useRate.doses[product.id] || {};
        const unit = allowedUnits.includes(saved.unit) ? saved.unit : allowedUnits[0];
        const amount = Math.max(0, number(saved.amount));
        const densityNote = product.form === 'liquid' && number(product.densityGPerMl) <= 0
          ? '<small class="muted">Density unavailable; mass units only.</small>'
          : (product.densityEstimate
            ? '<small class="muted">Approx. density: midpoint of published SDS range ' + escape(product.densityEstimate.min) + '–' + escape(product.densityEstimate.max) + ' g/mL.</small>'
            : '');
        // Brand above formula, like the Blend finder recipe; component formulas carry the part name.
        return '<div class="rate-row"><div><small class="muted">' + escape(product.brand) + '</small><b>' + escape(catalog.displayFormula(product)) + '</b>' + densityNote + '</div><label>Rate<input class="urAmount" data-id="' + escape(product.id) + '" type="number" min="0" step=".01" value="' + format(amount, 4) + '"></label><label>Unit<select class="urUnit" data-id="' + escape(product.id) + '">' + allowedUnits.map(value => '<option value="' + value + '" ' + (value === unit ? 'selected' : '') + '>' + value + '</option>').join('') + '</select></label></div>';
      }).join('');

      document.querySelectorAll('.urAmount').forEach(input => {
        input.oninput = () => {
          const existing = state.useRate.doses[input.dataset.id] || {unit: 'g/gal'};
          state.useRate.doses[input.dataset.id] = {...existing, amount: Math.max(0, number(input.value))};
          state.useRate.preset = 'custom';
          save();
          renderResult();
          element('useRatePreset').value = 'custom';
        };
      });
      document.querySelectorAll('.urUnit').forEach(select => {
        select.onchange = () => {
          const existing = state.useRate.doses[select.dataset.id] || {amount: 0};
          state.useRate.doses[select.dataset.id] = {...existing, unit: select.value};
          state.useRate.preset = 'custom';
          save();
          renderResult();
          element('useRatePreset').value = 'custom';
        };
      });
    }

    function renderResult() {
      const result = currentResult();
      if (!result) return;
      const estimateNote = result.approximateDensity
        ? '<br><small class="muted">Approximate: a volume dose uses the midpoint of a published SDS density range.</small>'
        : '';
      element('useRateSummary').innerHTML = 'Product weight <b>' + format(result.totalGPerLiter * chemistry.US_GALLON_LITERS, 3) + ' g/gal</b> <span class="muted">· ' + format(result.totalGPerLiter, 3) + ' g/L</span>' + estimateNote;
      element('useRateResult').innerHTML = PPM_COLUMNS.map(([key, label]) => '<span class="cmp-chip"><small>' + label + '</small><b>' + format(result.ppm[key], MICRO_KEYS.includes(key) ? 3 : 1) + '</b></span>').join('');
      element('useRateNitrogen').innerHTML = nitrogenFormsHtml(result.nitrogenForms, result.ppm.N, format, escape);
    }

    // Hands the exact delivered ppm to the Blend finder as a custom target, so stage
    // rates and hand-typed doses carry over too.
    function copyToBlend() {
      const state = getState();
      const entry = currentEntry();
      const result = currentResult();
      if (!entry || !result) return;
      PPM_COLUMNS.forEach(([key]) => { state.blend.target[key] = number(result.ppm[key]); });
      // Form targets only when the labels account for all of the N.
      const split = chemistry.fullNitrogenSplit(result.nitrogenForms, result.ppm.N);
      ['nitrateN', 'ammoniacalN', 'ureaN'].forEach(key => { state.blend.target[key] = split ? number(split[key]) : 0; });
      state.blend.targetId = '';
      state.blend.result = null;
      save();
      const rate = entry.useRates[Number(state.useRate.preset)];
      onCopied(catalog.entryTitle(entry.record) + ' · ' + (state.useRate.preset !== 'custom' && rate ? rate.label : 'your rate'));
    }

    function csvRows() {
      const entry = currentEntry();
      const result = currentResult();
      if (!entry || !result) return [];
      const formKeys = Object.keys(result.nitrogenForms);
      return [
        ['Program', 'Total g/L', 'Total g/gal', ...PPM_COLUMNS.map(column => column[0] + ' ppm'), ...formKeys.map(key => (NITROGEN_FORM_LABELS[key] || key) + ' ppm')],
        [catalog.entryTitle(entry.record), result.totalGPerLiter, result.totalGPerLiter * chemistry.US_GALLON_LITERS, ...PPM_COLUMNS.map(([key]) => result.ppm[key]), ...formKeys.map(key => result.nitrogenForms[key])],
        [],
        ['Component', 'Entered rate', 'Unit', 'Normalized g/L'],
        ...result.lines.map(line => [line.label, line.amount, line.unit, line.gramsPerLiter])
      ];
    }

    function render() {
      renderPicker();
      const entry = currentEntry();
      if (!entry) return;
      renderPreset(entry);
      renderInputs(entry);
      renderResult();
      element('useRateCopy').onclick = copyToBlend;
    }

    return Object.freeze({render, renderResult, applyPreset, currentEntry, currentResult, csvRows, copyToBlend});
  }

  return Object.freeze({PPM_COLUMNS, nitrogenFormsHtml, doseUnits, resolveEntry, presetDoses, calculateRecipe, createComponent});
});
