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
  // Shown as placeholders only, so people see what to type without it counting as data.
  const EXAMPLE = {N: '12', P2O5: '4', K2O: '16', Ca: '7', Mg: '2', S: '0', Fe: '0.15', Mn: '0.05', Zn: '0.035', B: '0.02', Cu: '0.02', Mo: '0.001'};

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function inputsHtml(analysis, format) {
    return INPUT_FIELDS.map(([key, label]) => {
      return '<label>' + label + '<input class="gai" data-k="' + key + '" type="number" min="0" step=".001" placeholder="e.g. ' + EXAMPLE[key] + '" value="' + (number(analysis[key]) > 0 ? format(analysis[key], 6) : '') + '"></label>';
    }).join('') +
      '<label class="density-field">Density, g/mL (liquids only)<input class="gai" data-k="densityGPerMl" type="number" min="0" step=".001" placeholder="e.g. 1.2 · blank for dry" value="' + (number(analysis.densityGPerMl) > 0 ? format(analysis.densityGPerMl, 4) : '') + '"><small>From the SDS or bottle. Adds mL/gal to the feed charts.</small></label>';
  }

  const ELEMENT_KEYS = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const MICRO_KEYS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  function isEmpty(analysis) {
    return !INPUT_FIELDS.some(([key]) => number(analysis[key]) > 0);
  }

  function chip(label, value, note) {
    return '<span class="cmp-chip"><small>' + label + '</small><b>' + value + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</span>';
  }

  // One box per element, elemental %; P and K also show the label's oxide value.
  function elementalHtml(analysis, chemistry, format) {
    const elemental = chemistry.elementalAnalysis(analysis);
    const oxide = {P: [analysis.P2O5, 'P₂O₅'], K: [analysis.K2O, 'K₂O']};
    const empty = isEmpty(analysis);
    return ELEMENT_KEYS.map(key => chip(key, empty ? '—' : format(elemental[key], 3), oxide[key] && !empty ? format(number(oxide[key][0]), 3) + ' ' + oxide[key][1] : '')).join('');
  }

  function feedRows(analysis, levels, chemistry) {
    return levels.map(targetN => {
      const dose = chemistry.standardizedNitrogenDose(analysis, targetN);
      return {targetN, dose, ppm: dose === null ? null : chemistry.ppmAtDose(analysis, dose)};
    });
  }

  // N feed chart: one collapsible row per N target, like the Compare cards: dose on
  // top, macros below, micros on expand (inline from 800px up).
  function feedHtml(analysis, levels, chemistry, format, open) {
    if (isEmpty(analysis)) return '<p class="muted">Enter a label above to see its feed chart.</p>';
    const density = number(analysis.densityGPerMl);
    const rows = feedRows(analysis, levels, chemistry);
    if (rows.some(row => row.dose === null)) return '<p class="muted">N must be greater than 0% to build the N feed chart.</p>';
    const chips = (row, keys) => keys.map(key => chip(key, format(row.ppm[key], MICRO_KEYS.includes(key) ? 3 : 1))).join('');
    const macros = ELEMENT_KEYS.filter(key => !MICRO_KEYS.includes(key));
    return rows.map(row => '<details class="cmp-card feed-card"' + (open ? ' open' : '') + '><summary><div class="cmp-line1"><b class="cmp-name">' + row.targetN + ' ppm N</b><span class="cmp-dose">' +
      format(row.dose, 3) + ' g/gal' + (density > 0 ? ' · ' + format(row.dose / density, 3) + ' mL/gal' : '') + '</span><span class="cmp-arrow" aria-hidden="true"></span></div>' +
      '<div class="cmp-chips cmp-summary-chips">' + chips(row, macros) + '<span class="cmp-micros">' + chips(row, MICRO_KEYS) + '</span></div></summary>' +
      '<div class="cmp-body"><div class="cmp-chips cmp-micros">' + chips(row, MICRO_KEYS) + '</div></div></details>').join('');
  }

  function createComponent(options) {
    const document = options.document;
    const chemistry = options.chemistry;
    const levels = options.levels;
    const format = options.format;
    const getState = options.getState;
    const save = options.save || (() => {});
    const notify = options.notify || (() => {});
    const onCustomProducts = options.onCustomProducts || (() => {});
    const maxLines = options.maxCompareLines || 10;
    const maxCustom = options.maxCustomProducts || 20;
    const escape = options.escape || (value => String(value));
    const element = id => document.getElementById(id);

    function labelFormula(analysis) {
      return [analysis.N, analysis.P2O5, analysis.K2O].map(value => format(number(value), 3)).join('-');
    }

    function nextCustomId(saved) {
      const used = saved.map(item => parseInt(String(item.id).slice(7), 36)).filter(Number.isFinite);
      return 'custom-' + ((used.length ? Math.max(...used) : 0) + 1).toString(36);
    }

    // Save the label as a named custom product (same name updates it) and add it to Compare.
    function addToCompare(analysis) {
      const state = getState();
      if (!INPUT_FIELDS.some(([key]) => number(analysis[key]) > 0)) {
        notify('Enter the label analysis first.', 'warn');
        return;
      }
      const name = (element('gaName').value || '').trim().slice(0, 60) || labelFormula(analysis);
      const existing = state.customProducts.find(item => item.name.toLowerCase() === name.toLowerCase());
      if (!existing && state.customProducts.length >= maxCustom) {
        notify('You can save up to ' + maxCustom + ' custom products. Delete one first.', 'warn');
        return;
      }
      const record = {
        id: existing ? existing.id : nextCustomId(state.customProducts),
        name,
        analysis: Object.fromEntries(INPUT_FIELDS.map(([key]) => [key, number(analysis[key])])),
        densityGPerMl: number(analysis.densityGPerMl)
      };
      state.customProducts = existing
        ? state.customProducts.map(item => item.id === existing.id ? record : item)
        : [...state.customProducts, record];
      const inCompare = state.compare.includes(record.id);
      const room = state.compare.length + state.systemCompare.length < maxLines;
      if (!inCompare && room) state.compare.push(record.id);
      save();
      onCustomProducts();
      renderSaved();
      element('gaName').value = name;
      if (inCompare || room) notify(existing ? 'Updated “' + name + '” in Compare.' : 'Added “' + name + '” to Compare.');
      else notify('Saved “' + name + '”. Compare is full; remove a line there, then add it from the Custom group.', 'warn');
    }

    function renderSaved() {
      const box = element('gaSaved');
      if (!box || !getState) return;
      const saved = getState().customProducts;
      box.innerHTML = saved.length
        ? '<h3>Your custom products</h3>' + saved.map(item => '<div class="saved-row"><div><b>' + escape(item.name) + '</b> <small class="muted">' + escape(labelFormula(item.analysis)) + (item.densityGPerMl ? ' · ' + escape(format(item.densityGPerMl, 4)) + ' g/mL' : '') + '</small></div><div class="saved-actions"><button type="button" class="gaEdit" data-id="' + escape(item.id) + '">Edit</button><button type="button" class="gaDelete danger" data-id="' + escape(item.id) + '">Delete</button></div></div>').join('')
        : '';
      document.querySelectorAll('.gaEdit').forEach(button => {
        button.onclick = () => {
          const item = getState().customProducts.find(saved => saved.id === button.dataset.id);
          if (!item) return;
          const analysis = getState().manual;
          Object.assign(analysis, item.analysis, {densityGPerMl: item.densityGPerMl});
          save();
          element('gaName').value = item.name;
          render(analysis, lastOnChange);
          notify('Editing “' + item.name + '”. Change the label, then Add to Compare to update it.');
        };
      });
      document.querySelectorAll('.gaDelete').forEach(button => {
        button.onclick = () => {
          const state = getState();
          const item = state.customProducts.find(saved => saved.id === button.dataset.id);
          if (!item) return;
          state.customProducts = state.customProducts.filter(saved => saved.id !== item.id);
          state.compare = state.compare.filter(id => id !== item.id);
          save();
          onCustomProducts();
          renderSaved();
          notify('Deleted “' + item.name + '”.');
        };
      });
    }

    let lastOnChange = () => {};
    let feedOpen = false;

    function renderOutput(analysis) {
      document.getElementById('gaElemental').innerHTML = elementalHtml(analysis, chemistry, format);
      document.getElementById('gaFeed').innerHTML = feedHtml(analysis, levels, chemistry, format, feedOpen);
      // Rows open and close together, like the Compare cards.
      const cards = document.querySelectorAll('.feed-card');
      cards.forEach(card => {
        card.ontoggle = () => {
          if (card.open === feedOpen) return;
          feedOpen = card.open;
          cards.forEach(other => { other.open = feedOpen; });
        };
      });
    }

    function render(analysis, onChange) {
      lastOnChange = onChange;
      document.getElementById('gaInputs').innerHTML = inputsHtml(analysis, format);
      if (element('gaAdd') && getState) {
        element('gaAdd').onclick = () => addToCompare(analysis);
        renderSaved();
      }
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
    feedHtml,
    inputsHtml,
    elementalHtml,
    createComponent
  });
});
