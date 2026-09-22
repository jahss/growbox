(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxExport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const MACRO_KEYS = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
  const ALL_KEYS = [...MACRO_KEYS, 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  function analysisRows(state, levels, chemistry) {
    const density = Number(state.manual.densityGPerMl) > 0 ? Number(state.manual.densityGPerMl) : 0;
    const rows = [['Target N', 'g/gal', ...(density ? ['mL/gal'] : []), ...ALL_KEYS]];
    levels.forEach(targetN => {
      const dose = chemistry.standardizedNitrogenDose(state.manual, targetN);
      const ppm = dose === null ? null : chemistry.ppmAtDose(state.manual, dose);
      const volume = density ? [dose === null ? '' : dose / density] : [];
      rows.push([targetN, dose, ...volume, ...(ppm ? ALL_KEYS.map(key => ppm[key]) : ALL_KEYS.map(() => ''))]);
    });
    return rows;
  }

  function blendRows(state, levels, chemistry, product) {
    const result = state.blend.result;
    const products = result.ids.map(product);
    const ppmKeys = ALL_KEYS.filter(key => key !== 'N');
    const rows = [['Target N', ...products.map(item => item.name + ' g/gal'), 'Total g/gal', ...ppmKeys]];
    // The solved recipe (g/gal per product) scaled so the tank, source water included, holds each N level.
    const nitrogen = Number(result.ppm.N) || 0;
    const water = result.water || {};
    const waterN = Number(water.N) || 0;
    if (nitrogen > 0) {
      levels.filter(targetN => targetN > waterN).forEach(targetN => {
        const factor = (targetN - waterN) / nitrogen;
        const doses = result.doses.map(dose => dose * factor);
        rows.push([
          targetN,
          ...doses,
          doses.reduce((sum, dose) => sum + dose, 0),
          ...ppmKeys.map(key => (Number(result.ppm[key]) || 0) * factor + (Number(water[key]) || 0))
        ]);
      });
    }
    return rows;
  }

  const LABEL_KEYS = ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  // Whatever Compare is showing: label % in Guaranteed %, else ppm at the chosen standard.
  function comparisonRows(state, chemistry, entries, exportLabel) {
    if (state.compareMode === 'percent') {
      return [['Product / system', ...LABEL_KEYS.map(key => key + ' %')],
        ...entries.map(entry => [exportLabel(entry), ...LABEL_KEYS.map(key => Number(entry.analysis[key]) || 0)])];
    }
    const element = state.compareElement || 'N';
    const rows = [['Product / system', 'Total g/gal @ ' + state.n + ' ppm ' + element, ...ALL_KEYS.map(key => key + ' ppm')]];
    entries.forEach(entry => {
      const dose = chemistry.standardizedDose(entry.analysis, element, state.n);
      const ppm = dose === null ? null : chemistry.ppmAtDose(entry.analysis, dose);
      rows.push([exportLabel(entry), dose, ...(ppm ? ALL_KEYS.map(key => ppm[key]) : ALL_KEYS.map(() => ''))]);
    });
    return rows;
  }

  function currentCsvRows(state, context) {
    if (state.view === 'analysis') return analysisRows(state, context.levels, context.chemistry);
    if (state.view === 'useRate') return context.useRateRows();
    if (state.view === 'blend' && state.blend.result) {
      return blendRows(state, context.levels, context.chemistry, context.product);
    }
    const entries = typeof context.entries === 'function' ? context.entries() : context.entries;
    return comparisonRows(state, context.chemistry, entries, context.exportLabel);
  }

  function csvText(rows) {
    return rows.map(row => row.map(value => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
  }

  function stateJson(state) {
    return JSON.stringify(state, null, 2);
  }

  function downloadFile(name, type, text) {
    const objectUrl = root.URL.createObjectURL(new root.Blob([text], {type}));
    const anchor = root.document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = name;
    anchor.click();
    root.setTimeout(() => root.URL.revokeObjectURL(objectUrl), 500);
  }

  return Object.freeze({
    analysisRows,
    blendRows,
    comparisonRows,
    currentCsvRows,
    csvText,
    stateJson,
    downloadFile
  });
});
