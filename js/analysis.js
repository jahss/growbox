(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxAnalysis = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const INPUT_FIELDS = [
    ['N', 'N %'], ['P2O5', 'P₂O₅ %'], ['K2O', 'K₂O %'],
    ['Ca', 'Ca %'], ['Mg', 'Mg %'], ['S', 'S %'],
    ['Fe', 'Fe %'], ['Mn', 'Mn %'], ['Zn', 'Zn %'],
    ['B', 'B %'], ['Cu', 'Cu %'], ['Mo', 'Mo %']
  ];
  const FEED_KEYS = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function inputsHtml(analysis, format) {
    return INPUT_FIELDS.map(([key, label]) => {
      return '<label>' + label + '<input class="gai" data-k="' + key + '" type="number" min="0" step=".001" value="' + format(analysis[key], 6) + '"></label>';
    }).join('');
  }

  function elementalTableHtml(analysis, chemistry, format) {
    const elemental = chemistry.elementalAnalysis(analysis);
    return '<thead><tr><th>Basis</th><th>N</th><th>P / P₂O₅</th><th>K / K₂O</th><th>Ca</th><th>Mg</th><th>S</th></tr></thead><tbody>' +
      '<tr><td>Label</td><td>' + format(analysis.N, 3) + '</td><td>' + format(analysis.P2O5, 3) + ' P₂O₅</td><td>' + format(analysis.K2O, 3) + ' K₂O</td><td>' + format(analysis.Ca, 3) + '</td><td>' + format(analysis.Mg, 3) + '</td><td>' + format(analysis.S, 3) + '</td></tr>' +
      '<tr><td>Elemental</td><td>' + format(elemental.N, 3) + '</td><td>' + format(elemental.P, 3) + ' P</td><td>' + format(elemental.K, 3) + ' K</td><td>' + format(elemental.Ca, 3) + '</td><td>' + format(elemental.Mg, 3) + '</td><td>' + format(elemental.S, 3) + '</td></tr></tbody>';
  }

  function feedRows(analysis, levels, chemistry) {
    return levels.map(targetN => {
      const dose = chemistry.standardizedNitrogenDose(analysis, targetN);
      return {targetN, dose, ppm: dose === null ? null : chemistry.ppmAtDose(analysis, dose)};
    });
  }

  // Same as feedRows but anchored to an elemental key (e.g. 'P' or 'K') so the
  // dose is chosen to reach `target` ppm of that element instead of nitrogen.
  function feedRowsFor(analysis, key, levels, chemistry) {
    return levels.map(target => {
      const dose = chemistry.standardizedDose(analysis, key, target);
      return {target, dose, ppm: dose === null ? null : chemistry.ppmAtDose(analysis, dose)};
    });
  }

  function feedTableHtml(analysis, levels, chemistry, format) {
    return feedTableHtmlFor(analysis, 'N', levels, chemistry, format);
  }

  function feedTableHtmlFor(analysis, key, levels, chemistry, format) {
    const title = {N: 'N target', P: 'P target', K: 'K target'}[key] || key + ' target';
    return '<thead><tr><th>' + title + '</th><th>g/gal</th><th>N</th><th>P</th><th>K</th><th>Ca</th><th>Mg</th><th>S</th></tr></thead><tbody>' +
      feedRowsFor(analysis, key, levels, chemistry).map(row => {
        if (row.dose === null) return '<tr><td>' + row.target + '</td><td colspan="7">' + key + ' must be greater than 0%</td></tr>';
        return '<tr><td>' + row.target + '</td><td>' + format(row.dose, 3) + '</td>' + FEED_KEYS.map(feedKey => '<td>' + format(row.ppm[feedKey], 1) + '</td>').join('') + '</tr>';
      }).join('') + '</tbody>';
  }

  function createComponent(options) {
    const document = options.document;
    const chemistry = options.chemistry;
    const levels = options.levels;
    const pLevels = options.pLevels;
    const kLevels = options.kLevels;
    const format = options.format;

    function renderOutput(analysis) {
      document.getElementById('gaElemental').innerHTML = elementalTableHtml(analysis, chemistry, format);
      document.getElementById('gaFeed').innerHTML = feedTableHtml(analysis, levels, chemistry, format);
      if (document.getElementById('gaFeedP')) document.getElementById('gaFeedP').innerHTML = feedTableHtmlFor(analysis, 'P', pLevels, chemistry, format);
      if (document.getElementById('gaFeedK')) document.getElementById('gaFeedK').innerHTML = feedTableHtmlFor(analysis, 'K', kLevels, chemistry, format);
    }

    function render(analysis, onChange) {
      document.getElementById('gaInputs').innerHTML = inputsHtml(analysis, format);
      document.querySelectorAll('.gai').forEach(input => {
        input.oninput = () => {
          onChange(input.dataset.k, Math.max(0, number(input.value)));
          renderOutput(analysis);
        };
      });
      renderOutput(analysis);
    }

    return Object.freeze({render, renderOutput});
  }

  return Object.freeze({
    INPUT_FIELDS: Object.freeze(INPUT_FIELDS.map(field => Object.freeze([...field]))),
    feedRows,
    feedRowsFor,
    feedTableHtml,
    feedTableHtmlFor,
    inputsHtml,
    elementalTableHtml,
    createComponent
  });
});
