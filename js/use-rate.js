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

  // Source water, in JR Peters water-report order. ppm unless noted; N as N, S as S.
  const WATER_FIELDS = [
    ['pH', 'pH', ''], ['ec', 'Soluble salts', 'mS/cm'], ['alkalinity', 'Total alkalinity', 'ppm CaCO₃'], ['N', 'Total N', 'ppm'],
    ['P', 'Phosphorus', 'ppm'], ['K', 'Potassium', 'ppm'], ['Ca', 'Calcium', 'ppm'], ['Mg', 'Magnesium', 'ppm'], ['S', 'Sulfur', 'ppm'],
    ['Fe', 'Iron', 'ppm'], ['Mn', 'Manganese', 'ppm'], ['Cu', 'Copper', 'ppm'], ['B', 'Boron', 'ppm'], ['Zn', 'Zinc', 'ppm'], ['Mo', 'Molybdenum', 'ppm'],
    ['Na', 'Sodium', 'ppm'], ['Cl', 'Chlorides', 'ppm']
  ];
  // Irrigation-water ranges from UMass Extension, "Target range and Acceptable range of
  // nutrients and other components of irrigation water" (after Biernbaum 1995). Sulfate
  // (SO4 0–40 / <100) is converted to S. Zinc's printed target (<0.5) is looser than its
  // acceptable limit (<0.3), so 0.3 is used, matching Penn State Extension.
  const WATER_RANGES = {
    pH: {target: [5.5, 7], acceptable: [4, 10]}, ec: {target: [0.2, 0.8], acceptable: [0, 1.5]},
    alkalinity: {target: [40, 160], acceptable: [0, 400]},
    nitrateN: {acceptable: [0, 75]}, ammoniacalN: {acceptable: [0, 10]},
    P: {target: [0, 3], acceptable: [0, 5]}, K: {acceptable: [0, 100]},
    Ca: {target: [25, 75], acceptable: [0, 150]}, Mg: {target: [10, 30], acceptable: [0, 50]},
    S: {target: [0, 13.4], acceptable: [0, 33.4]},
    Fe: {target: [0, 1], acceptable: [0, 4]}, Mn: {target: [0, 1], acceptable: [0, 2]},
    Cu: {target: [0, 0.1], acceptable: [0, 0.2]}, B: {target: [0, 0.1], acceptable: [0, 0.5]},
    Zn: {acceptable: [0, 0.3]}, Mo: {target: [0, 0.1], acceptable: [0, 1]},
    Na: {target: [0, 20], acceptable: [0, 50]}, Cl: {target: [0, 20], acceptable: [0, 140]}
  };

  // How a water value sits against its range: null when blank or unranged.
  function waterStatus(key, value) {
    const range = WATER_RANGES[key];
    const amount = number(value);
    if (!range || amount <= 0) return null;
    const [low, high] = range.acceptable;
    if (amount > high) return {level: 'poor', text: 'too high'};
    if (amount < low) return {level: 'poor', text: 'too low'};
    if (range.target && amount > range.target[1]) return {level: 'fair', text: 'above target'};
    if (range.target && amount < range.target[0]) return {level: 'fair', text: 'below target'};
    return {level: 'ok', text: ''};
  }

  const WATER_EXTRAS = [['pH', 'pH', ''], ['Na', 'Na', 'ppm'], ['Cl', 'Cl', 'ppm'], ['alkalinity', 'alkalinity', 'ppm CaCO₃'], ['ec', 'EC', 'mS/cm']];

  // What the source water adds, as a plain {key: value} of what was entered; RO adds nothing.
  function waterPpm(water) {
    if (!water || water.ro !== false) return {};
    return Object.fromEntries(Object.entries(water.values || {}).filter(([, value]) => number(value) > 0).map(([key, value]) => [key, number(value)]));
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
    const onWaterChange = options.onWaterChange || (() => {});
    const nitrogenFieldHtml = options.nitrogenFieldHtml;
    const bindNitrogenField = options.bindNitrogenField || (() => {});
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

    // Nutrients plus source water: what's actually in the tank.
    function inSolution(result) {
      const water = waterPpm(getState().water);
      const ppm = {};
      PPM_COLUMNS.forEach(([key]) => { ppm[key] = number(result.ppm[key]) + number(water[key]); });
      const forms = {...result.nitrogenForms};
      ['nitrateN', 'ammoniacalN', 'ureaN'].forEach(key => { if (water[key]) forms[key] = number(forms[key]) + water[key]; });
      return {ppm, forms, water};
    }

    function renderResult() {
      const result = currentResult();
      if (!result) return;
      const solution = inSolution(result);
      const estimateNote = result.approximateDensity
        ? '<br><small class="muted">Approximate: a volume dose uses the midpoint of a published SDS density range.</small>'
        : '';
      element('useRateSummary').innerHTML = 'Product weight <b>' + format(result.totalGPerLiter * chemistry.US_GALLON_LITERS, 3) + ' g/gal</b> <span class="muted">· ' + format(result.totalGPerLiter, 3) + ' g/L</span>' + estimateNote;
      const digits = key => MICRO_KEYS.includes(key) ? 3 : 1;
      element('useRateResult').innerHTML = PPM_COLUMNS.map(([key, label]) => '<span class="cmp-chip"><small>' + label + '</small><b>' + format(solution.ppm[key], digits(key)) + '</b>' +
        (solution.water[key] ? '<small>+' + format(solution.water[key], digits(key)) + ' water</small>' : '') + '</span>').join('');
      const extras = WATER_EXTRAS.filter(([key]) => solution.water[key]).map(([key, label, unit]) => label + ' ' + format(solution.water[key], key === 'ec' ? 2 : 1) + (unit ? ' ' + unit : ''));
      if (element('useRateWaterNote')) element('useRateWaterNote').textContent = extras.length ? 'From your water: ' + extras.join(' · ') : '';
      element('useRateNitrogen').innerHTML = nitrogenFormsHtml(solution.forms, solution.ppm.N, format, escape);
    }

    // Hands the exact delivered ppm to the Blend finder as a custom target, so stage
    // rates and hand-typed doses carry over too.
    function copyToBlend() {
      const state = getState();
      const entry = currentEntry();
      const result = currentResult();
      if (!entry || !result) return;
      // The target is what's in the tank, water included; Blend subtracts the water again.
      const solution = inSolution(result);
      PPM_COLUMNS.forEach(([key]) => { state.blend.target[key] = solution.ppm[key]; });
      // Form targets only when the labels (and water report) account for all of the N.
      const split = chemistry.fullNitrogenSplit(solution.forms, solution.ppm.N);
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
      const solution = inSolution(result);
      const formKeys = Object.keys(solution.forms);
      const withWater = Object.keys(solution.water).length ? ' incl. water' : '';
      return [
        ['Program', 'Total g/L', 'Total g/gal', ...PPM_COLUMNS.map(column => column[0] + ' ppm' + withWater), ...formKeys.map(key => (NITROGEN_FORM_LABELS[key] || key) + ' ppm' + withWater)],
        [catalog.entryTitle(entry.record), result.totalGPerLiter, result.totalGPerLiter * chemistry.US_GALLON_LITERS, ...PPM_COLUMNS.map(([key]) => solution.ppm[key]), ...formKeys.map(key => solution.forms[key])],
        [],
        ['Component', 'Entered rate', 'Unit', 'Normalized g/L'],
        ...result.lines.map(line => [line.label, line.amount, line.unit, line.gramsPerLiter])
      ];
    }

    // "Your water" card: RO switch, report fields, and a one-line summary.
    function renderWater() {
      const water = getState().water;
      const card = element('waterCard');
      if (!element('waterInputs')) return;
      const changed = () => { save(); renderWaterSummary(); renderResult(); onWaterChange(); };
      element('waterRo').checked = water.ro;
      element('waterRo').onchange = () => {
        water.ro = element('waterRo').checked;
        element('waterInputs').classList.toggle('hidden', water.ro);
        changed();
      };
      element('waterInputs').classList.toggle('hidden', water.ro);
      const step = key => ['Fe', 'Mn', 'Cu', 'B', 'Zn', 'Mo', 'ec'].includes(key) ? '.01' : key === 'pH' ? '.1' : '1';
      // Range hint under a field: "target 25–75 · above target", coloured amber or red when off.
      const hint = (key, value) => {
        const range = WATER_RANGES[key];
        const status = waterStatus(key, value);
        const bounds = range && (range.target || range.acceptable);
        const limit = range && !range.target ? 'up to ' + format(bounds[1], 2) : bounds ? 'target ' + format(bounds[0], 2) + '–' + format(bounds[1], 2) : '';
        return {cls: status && status.level !== 'ok' ? 'water-' + status.level : '', text: [limit, status && status.text].filter(Boolean).join(' · ')};
      };
      element('waterInputs').innerHTML = WATER_FIELDS.map(([key, label, unit]) => {
        const value = number(water.values[key]);
        const input = '<input' + (key === 'N' ? ' id="wtN"' : '') + ' class="wti" data-k="' + key + '" type="number" min="0" step="' + step(key) + '" placeholder="0" value="' + (value > 0 ? format(value, 4) : '') + '">';
        return key === 'N' && nitrogenFieldHtml
          ? nitrogenFieldHtml('wt', label + ' ' + unit, input, 'wti', water.values, 'ppm', 'From the report\'s nitrate, ammonium and urea nitrogen. With N blank, these fill it in.', format)
          : (() => { const note = hint(key, value); return '<label' + (note.cls ? ' class="' + note.cls + '"' : '') + '>' + label + (unit ? ' ' + unit : '') + input + (note.text ? '<small>' + note.text + '</small>' : '') + '</label>'; })();
      }).join('');
      document.querySelectorAll('.wti').forEach(input => {
        input.oninput = () => {
          water.values[input.dataset.k] = Math.max(0, number(input.value));
          const label = input.parentElement;
          if (label && label.tagName === 'LABEL' && WATER_RANGES[input.dataset.k] && !input.classList.contains('nf-wt')) {
            const note = hint(input.dataset.k, input.value);
            label.className = note.cls;
            let small = label.querySelector('small');
            if (!small && note.text) { small = document.createElement('small'); label.appendChild(small); }
            if (small) small.textContent = note.text;
          }
          changed();
        };
      });
      bindNitrogenField(document, 'wt', format);
      if (card && !water.ro && !Object.keys(waterPpm(water)).length) card.open = true;
      renderWaterSummary();
    }

    function renderWaterSummary() {
      const water = getState().water;
      const entered = waterPpm(water);
      const short = {alkalinity: 'Alk', ec: 'EC', pH: 'pH'};
      const parts = WATER_FIELDS.filter(([key]) => entered[key] && !['nitrateN', 'ammoniacalN', 'ureaN'].includes(key))
        .map(([key]) => (short[key] || key) + ' ' + format(entered[key], key === 'ec' ? 2 : 1));
      // "· 2 above target, 1 too high", in the order the report lists them.
      const counts = new Map();
      if (!water.ro) Object.keys(entered).forEach(key => { const status = waterStatus(key, entered[key]); if (status && status.level !== 'ok') counts.set(status.text, (counts.get(status.text) || 0) + 1); });
      const flags = [...counts].map(([text, count]) => count + ' ' + text).join(', ');
      if (element('waterSummary')) element('waterSummary').textContent = water.ro ? 'RO / distilled · adds nothing' : (parts.length ? parts.join(' · ') : 'Nothing entered yet') + (flags ? ' · ' + flags : '');
    }

    function render() {
      renderWater();
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

  return Object.freeze({PPM_COLUMNS, WATER_FIELDS, WATER_RANGES, waterStatus, waterPpm, nitrogenFormsHtml, doseUnits, resolveEntry, presetDoses, calculateRecipe, createComponent});
});
