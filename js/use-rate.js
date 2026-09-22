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
  const NITROGEN_FORM_LABELS = {
    nitrateN: 'Nitrate N', ammoniacalN: 'Ammoniacal N', ureaN: 'Urea N',
    otherN: 'Other N', waterSolubleN: 'Other water-soluble N'
  };

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
        save();
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
        ? 'Published presets fill the component rates and remain editable.'
        : 'No published rate preset is loaded for this program; enter a custom rate.';
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
      element('useRateIdentity').innerHTML = '<b>' + escape(entry.record.brand + ' — ' + catalog.displayProgram(entry.record)) + '</b><span>' + escape(catalog.displayFormula(entry.record)) + ' · ' + escape(catalog.displayParts(entry.record)) + '</span>';
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
        return '<div class="rate-row"><div><b>' + escape(catalog.displayFormula(product)) + '</b><small class="muted">' + escape(entry.components[index].label) + '</small>' + densityNote + '</div><label>Rate<input class="urAmount" data-id="' + escape(product.id) + '" type="number" min="0" step=".01" value="' + format(amount, 4) + '"></label><label>Unit<select class="urUnit" data-id="' + escape(product.id) + '">' + allowedUnits.map(value => '<option value="' + value + '" ' + (value === unit ? 'selected' : '') + '>' + value + '</option>').join('') + '</select></label></div>';
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
        ? '<p class="muted">Approximate result: at least one volume dose uses the midpoint of a published SDS density range.</p>'
        : '';
      element('useRateSummary').innerHTML = '<div class="pill"><b>' + format(result.totalGPerLiter, 4) + ' g/L</b><span>Total fertilizer mass</span></div><div class="pill"><b>' + format(result.totalGPerLiter * chemistry.US_GALLON_LITERS, 4) + ' g/gal</b><span>Total fertilizer mass</span></div>' + result.lines.map(line => '<div class="pill"><b>' + escape(line.label) + '</b><span>' + format(line.gramsPerLiter, 4) + ' g/L normalized</span></div>').join('') + estimateNote;
      element('useRateResult').innerHTML = '<thead><tr>' + PPM_COLUMNS.map(column => '<th>' + column[1] + ' ppm</th>').join('') + '</tr></thead><tbody><tr>' + PPM_COLUMNS.map(([key]) => '<td>' + format(result.ppm[key], ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'].includes(key) ? 3 : 1) + '</td>').join('') + '</tr></tbody>';
      const nitrogenForms = Object.entries(result.nitrogenForms).filter(([, value]) => value > 0);
      element('useRateNitrogen').innerHTML = nitrogenForms.length
        ? '<h3>Published nitrogen forms</h3><div class="result-grid">' + nitrogenForms.map(([key, value]) => '<div class="pill"><b>' + format(value, 1) + ' ppm</b><span>' + escape(NITROGEN_FORM_LABELS[key] || key) + '</span></div>').join('') + '</div>'
        : '<p class="muted">No nitrogen-form breakdown is published for the selected inputs.</p>';
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
    }

    return Object.freeze({render, renderResult, applyPreset, currentEntry, currentResult, csvRows});
  }

  return Object.freeze({PPM_COLUMNS, doseUnits, resolveEntry, presetDoses, calculateRecipe, createComponent});
});
