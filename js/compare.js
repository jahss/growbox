(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxCompare = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PERCENT_COLUMNS = [
    ['N', 'N'], ['P2O5', 'P₂O₅'], ['K2O', 'K₂O'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S'],
    ['Fe', 'Fe'], ['Mn', 'Mn'], ['Zn', 'Zn'], ['B', 'B'], ['Cu', 'Cu'], ['Mo', 'Mo']
  ];
  const PPM_COLUMNS = [
    ['N', 'N'], ['P', 'P'], ['K', 'K'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S'],
    ['Fe', 'Fe'], ['Mn', 'Mn'], ['Zn', 'Zn'], ['B', 'B'], ['Cu', 'Cu'], ['Mo', 'Mo']
  ];
  const MICRO_KEYS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function highlightClass(entries, key, index) {
    if (entries.length < 2) return '';
    const values = entries.map(entry => entry.values[key]).filter(Number.isFinite);
    if (values.length < 2) return '';
    const high = Math.max(...values);
    const low = Math.min(...values);
    const value = entries[index].values[key];
    if (Math.abs(high - low) < 1e-12) return '';
    if (Math.abs(value - high) < 1e-9) return 'hi';
    if (Math.abs(value - low) < 1e-9) return 'lo';
    return '';
  }

  function createComponent(options) {
    const document = options.document;
    const products = options.products;
    const systems = options.systems;
    const chemistry = options.chemistry;
    const catalog = options.catalog;
    const format = options.format;
    const escape = options.escape;
    const getState = options.getState;
    const save = options.save;
    const notify = options.notify;

    const element = id => document.getElementById(id);
    const product = catalog.product;
    const displayProgram = catalog.displayProgram;
    const displayFormula = catalog.displayFormula;
    const displayParts = catalog.displayParts;

    function entryCell(entry) {
      return escape(catalog.entryTitle(entry)) + '<br><small class="muted">' + escape(displayFormula(entry)) + ' · ' + escape(displayParts(entry)) + '</small>';
    }

    function selectionCount() {
      const state = getState();
      return state.compare.length + state.systemCompare.length;
    }

    function addItem(value) {
      if (!value) return;
      const state = getState();
      if (selectionCount() >= 5) {
        notify('Comparison is limited to 5 product lines. Remove one before adding another.', 'warn');
        return;
      }
      const [kind, id] = value.split(':');
      if (kind === 'p' && !state.compare.includes(id)) state.compare.push(id);
      if (kind === 's' && !state.systemCompare.includes(id)) state.systemCompare.push(id);
      save();
      renderControls();
      renderTables();
    }

    function removeItem(kind, id) {
      const state = getState();
      const list = kind === 'product' ? state.compare : state.systemCompare;
      const index = list.indexOf(id);
      if (index >= 0) list.splice(index, 1);
      save();
      renderControls();
      renderTables();
    }

    function systemMix(system) {
      return catalog.mixSystem(system, getState().systemParts[system.id]);
    }

    function renderControls() {
      const state = getState();
      const onePart = products.filter(item => item.compareGroup === '1-part' && !state.compare.includes(item.id));
      const twoPart = systems.filter(item => item.partCount === 2 && !state.systemCompare.includes(item.id));
      const threePart = systems.filter(item => item.partCount === 3 && !state.systemCompare.includes(item.id));
      const group = (label, items, prefix) => items.length
        ? '<optgroup label="' + label + '">' + items.map(item => '<option value="' + prefix + ':' + escape(item.id) + '">' + escape(item.brand + ' — ' + displayProgram(item) + ' · ' + displayFormula(item) + ' · ' + displayParts(item)) + '</option>').join('') + '</optgroup>'
        : '';

      element('productPicker').innerHTML = '<option value="">Add product line…</option>' + group('1-Part', onePart, 'p') + group('2-Part', twoPart, 's') + group('3-Part', threePart, 's');
      element('productPicker').disabled = selectionCount() >= 5;
      element('compareCount').textContent = selectionCount() + ' / 5 selected';

      const selected = [];
      state.compare.map(product).filter(Boolean).forEach(item => selected.push({
        kind: 'product', id: item.id, brand: item.brand, program: displayProgram(item), formula: displayFormula(item), parts: displayParts(item)
      }));
      state.systemCompare.map(catalog.system).filter(Boolean).forEach(system => {
        const mix = systemMix(system);
        const unit = system.ratioBasis === 'volume' ? 'volume' : 'mass';
        const controls = system.components.map((component, index) => '<label>' + escape(component.label) + ' <input class="spr" data-sys="' + escape(system.id) + '" data-i="' + index + '" type="number" min="0" step=".1" value="' + format(mix.parts[index], 3) + '"> ' + unit + ' parts</label>').join('');
        selected.push({kind: 'system', id: system.id, brand: system.brand, program: displayProgram(system), formula: displayFormula(system), parts: displayParts(system), controls});
      });

      element('selectedLines').innerHTML = selected.map(item => '<div class="selected-line"><div class="selected-line-head"><div><b>' + escape(item.brand + ' — ' + item.program) + '</b><div>' + escape(item.formula) + '</div><div class="muted">' + escape(item.parts) + '</div></div><button class="removeLine" data-kind="' + item.kind + '" data-id="' + escape(item.id) + '" type="button">Remove</button></div>' + (item.controls ? '<details><summary>Adjust part ratio</summary><div class="toolbar" style="margin-top:7px">' + item.controls + '</div></details>' : '') + '</div>').join('');

      document.querySelectorAll('.removeLine').forEach(button => {
        button.onclick = () => removeItem(button.dataset.kind, button.dataset.id);
      });
      document.querySelectorAll('.spr').forEach(input => {
        input.oninput = () => {
          const system = systems.find(item => item.id === input.dataset.sys);
          if (!system) return;
          const current = state.systemParts[system.id] || system.components.map(component => component.defaultParts == null ? 1 : component.defaultParts);
          const next = [...current];
          next[Number(input.dataset.i)] = Math.max(0, number(input.value));
          if (!next.some(value => value > 0)) {
            input.value = format(current[Number(input.dataset.i)], 3);
            notify('At least one system part must be greater than zero.', 'warn');
            return;
          }
          state.systemParts[system.id] = next;
          save();
          renderTables();
        };
      });
    }

    function selectedEntries() {
      const state = getState();
      return catalog.selectedCompareEntries(state.compare, state.systemCompare, state.systemParts).slice(0, 5);
    }

    function productDoseText(item, grams) {
      if (item.form === 'liquid' && number(item.densityGPerMl) > 0) return format(grams, 3) + ' g/gal (' + format(grams / item.densityGPerMl, 3) + ' mL/gal)';
      return format(grams, 3) + ' g/gal';
    }

    function systemStandardDoseText(entry, totalGrams) {
      const pieces = entry.mix.products.map((item, index) => {
        const grams = totalGrams * entry.mix.weights[index];
        if (item.form === 'liquid' && number(item.densityGPerMl) > 0) return escape(entry.system.components[index].label) + ' ' + format(grams / item.densityGPerMl, 3) + ' mL/gal';
        return escape(entry.system.components[index].label) + ' ' + format(grams, 3) + ' g/gal';
      });
      return format(totalGrams, 3) + ' g/gal total<br><small class="muted">' + pieces.join(' + ') + '</small>';
    }

    function systemRateResult(entry, rate) {
      const total = {};
      chemistry.ELEMENT_KEYS.forEach(key => { total[key] = 0; });
      const labels = [];
      let totalGrams = 0;
      (rate.components || []).forEach(component => {
        const item = product(component.productId);
        if (!item) return;
        const grams = chemistry.rateMassGPerGal(item, component);
        const ppm = chemistry.ppmAtDose(item, grams);
        totalGrams += grams;
        chemistry.ELEMENT_KEYS.forEach(key => { total[key] += ppm[key] || 0; });
        labels.push(component.gPerGal != null
          ? escape(displayFormula(item)) + ' ' + format(component.gPerGal, 3) + ' g/gal'
          : escape(displayFormula(item)) + ' ' + format(component.mLPerGal, 3) + ' mL/gal');
      });
      return {total, totalG: totalGrams, label: labels.join(' + ')};
    }

    function renderTables() {
      const state = getState();
      const entries = selectedEntries();

      if (state.compareMode === 'percent') {
        element('comparisonHeading').textContent = 'Guaranteed analysis (%)';
        const rows = entries.map(entry => ({entry, values: entry.analysis}));
        element('analysisCompare').innerHTML = '<thead><tr><th>Product / system</th>' + PERCENT_COLUMNS.map(column => '<th>' + column[1] + ' %</th>').join('') + '</tr></thead><tbody>' +
          rows.map((row, index) => '<tr><td>' + entryCell(row.entry) + (row.entry.kind === 'system' ? ' <small class="muted">(combined)</small>' : '') + '</td>' +
          PERCENT_COLUMNS.map(([key]) => '<td class="' + highlightClass(rows, key, index) + '">' + format(row.values[key], MICRO_KEYS.includes(key) ? (key === 'Mo' ? 4 : 3) : 2) + '</td>').join('') + '</tr>').join('') +
          '</tbody>';
      } else {
        element('comparisonHeading').textContent = 'Elemental ppm @ ' + state.n + ' ppm N';
        const rows = entries.map(entry => {
          const dose = chemistry.standardizedNitrogenDose(entry.analysis, state.n);
          const values = dose === null ? null : chemistry.ppmAtDose(entry.analysis, dose);
          return {entry, dose, values: values || {}};
        });
        element('analysisCompare').innerHTML = '<thead><tr><th>Product / system</th><th>Dose</th>' + PPM_COLUMNS.map(column => '<th>' + column[1] + ' ppm</th>').join('') + '</tr></thead><tbody>' +
          rows.map((row, index) => {
            const entry = row.entry;
            if (row.dose === null) return '<tr><td>' + entryCell(entry) + '</td><td>Cannot standardize</td>' + PPM_COLUMNS.map(() => '<td>—</td>').join('') + '</tr>';
            const doseText = entry.kind === 'system' ? systemStandardDoseText(entry, row.dose) : productDoseText(entry.product, row.dose);
            return '<tr><td>' + entryCell(entry) + '</td><td>' + doseText + '</td>' +
              PPM_COLUMNS.map(([key]) => '<td class="' + highlightClass(rows, key, index) + '">' + format(row.values[key], MICRO_KEYS.includes(key) ? (key === 'Mo' ? 4 : 3) : 1) + '</td>').join('') + '</tr>';
          }).join('') + '</tbody>';
      }

      const rateRows = entries.map(entry => {
        if (!entry.useRates.length) return {entry, label: 'No verified rate loaded', doseText: '—', values: null, rateIndex: 0};
        const key = entry.kind + ':' + entry.id;
        let index = Number.isInteger(state.rateChoice[key]) ? state.rateChoice[key] : 0;
        if (index < 0 || index >= entry.useRates.length) index = 0;
        const rate = entry.useRates[index];
        if (entry.kind === 'system') {
          const result = systemRateResult(entry, rate);
          return {entry, label: rate.label, doseText: result.label, values: result.total, rateIndex: index};
        }
        const grams = chemistry.rateMassGPerGal(entry.product, rate);
        const values = grams === null ? null : chemistry.ppmAtDose(entry.product, grams);
        const dose = rate.gPerGal != null ? format(rate.gPerGal, 3) + ' g/gal' : format(rate.mLPerGal, 3) + ' mL/gal';
        return {entry, label: rate.label, doseText: dose, values, rateIndex: index};
      });
      const rateCalculations = rateRows.map(row => ({values: row.values || {}}));
      element('ratesTable').innerHTML = '<thead><tr><th>Product / system</th><th>Manufacturer rate</th><th>Dose / components</th>' + PPM_COLUMNS.map(column => '<th>' + column[1] + ' ppm</th>').join('') + '</tr></thead><tbody>' +
        rateRows.map((row, index) => {
          const entry = row.entry;
          const key = entry.kind + ':' + entry.id;
          const rateCell = entry.useRates.length > 1
            ? '<select class="rateSelect" data-key="' + escape(key) + '">' + entry.useRates.map((rate, rateIndex) => '<option value="' + rateIndex + '" ' + (rateIndex === row.rateIndex ? 'selected' : '') + '>' + escape(rate.label) + '</option>').join('') + '</select>'
            : escape(row.label);
          return '<tr><td>' + entryCell(entry) + '</td><td>' + rateCell + '</td><td>' + row.doseText + '</td>' +
            PPM_COLUMNS.map(([column]) => row.values ? '<td class="' + highlightClass(rateCalculations, column, index) + '">' + format(row.values[column], MICRO_KEYS.includes(column) ? (column === 'Mo' ? 4 : 3) : 1) + '</td>' : '<td>—</td>').join('') + '</tr>';
        }).join('') + '</tbody>';
      document.querySelectorAll('.rateSelect').forEach(select => {
        select.onchange = () => {
          state.rateChoice[select.dataset.key] = Number(select.value);
          save();
          renderTables();
        };
      });
    }

    function render() {
      const state = getState();
      element('productPicker').onchange = event => {
        addItem(event.target.value);
        event.target.value = '';
      };
      element('nLevel').onchange = event => {
        state.n = Number(event.target.value);
        save();
        renderTables();
      };
      element('percentView').onclick = () => {
        state.compareMode = 'percent';
        save();
        render();
      };
      element('ppmView').onclick = () => {
        state.compareMode = 'ppm';
        save();
        render();
      };

      renderControls();
      element('nLevel').value = state.n;
      element('percentView').classList.toggle('active', state.compareMode === 'percent');
      element('ppmView').classList.toggle('active', state.compareMode === 'ppm');
      element('nControl').classList.toggle('hidden', state.compareMode !== 'ppm');
      renderTables();
    }

    return Object.freeze({render, renderControls, renderTables, selectedEntries, addItem, removeItem});
  }

  return Object.freeze({highlightClass, createComponent});
});
