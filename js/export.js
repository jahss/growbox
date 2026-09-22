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
    const nitrogenPercent = result.element.N;
    if (nitrogenPercent > 0) {
      levels.forEach(targetN => {
        const total = targetN / (chemistry.MG_PER_L_PER_G_PER_GAL * nitrogenPercent / 100);
        rows.push([
          targetN,
          ...result.w.map(weight => total * weight),
          total,
          ...ppmKeys.map(key => chemistry.MG_PER_L_PER_G_PER_GAL * total * (Number(result.element[key]) || 0) / 100)
        ]);
      });
    }
    return rows;
  }

  function comparisonRows(state, chemistry, entries, exportLabel) {
    const rows = [['Product / system', 'Total g/gal', ...ALL_KEYS]];
    const element = state.compareElement || 'N';
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
