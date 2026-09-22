(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxBlend = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LABEL_FIELDS = [['N', 'N'], ['P2O5', 'P₂O₅'], ['K2O', 'K₂O'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S']];
  const ELEMENT_FIELDS = [['N', 'N'], ['P', 'P'], ['K', 'K'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S']];
  const MICRO_FIELDS = [['Fe', 'Fe'], ['Mn', 'Mn'], ['Zn', 'Zn'], ['B', 'B'], ['Cu', 'Cu'], ['Mo', 'Mo']];
  const MICRO_KEYS = MICRO_FIELDS.map(field => field[0]);
  const ALL_KEYS = ['N', 'P', 'K', 'Ca', 'Mg', 'S', ...MICRO_KEYS];

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function fieldsForMode(mode) {
    return mode === 'label' ? LABEL_FIELDS : ELEMENT_FIELDS;
  }

  // Macros for the chosen basis, then the six micros.
  function targetFields(mode) {
    return [...fieldsForMode(mode), ...MICRO_FIELDS];
  }

  // Colour band for a relative difference: within 10% good, within 25% fair, else poor.
  function fitClass(difference) {
    return difference <= 0.10 ? 'fit-good' : difference <= 0.25 ? 'fit-fair' : 'fit-poor';
  }

  // "61% match · 39% different", coloured by how close it is.
  function fitBadgeHtml(difference, format) {
    const percent = Math.max(0, difference * 100);
    return '<span class="fit-badge ' + fitClass(difference) + '"><b>' + format(Math.max(0, 100 - percent), 1) + '% match</b><small>' + format(percent, 1) + '% different</small></span>';
  }

  function chip(label, value, note, className) {
    return '<span class="cmp-chip ' + (className || '') + '"><small>' + label + '</small><b>' + value + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</span>';
  }

  // One box per nutrient in the chosen basis: blend value, target and difference.
  // Within 5% of the target (1 point for small macros) counts as on target.
  function versusTargetHtml(result, target, mode, format) {
    const basis = mode === 'label' ? result.label : result.element;
    return targetFields(mode).map(([key, label]) => {
      const micro = MICRO_KEYS.includes(key);
      const digits = micro ? 3 : 2;
      const value = number(basis[key]);
      const goal = number(target[key]);
      if (micro && goal <= 0) return chip(label, format(value, digits), 'no target');
      const diff = value - goal;
      const close = Math.abs(diff) <= 0.05 * Math.max(goal, micro ? 0.01 : 1);
      const rounded = format(Math.abs(diff), digits);
      const sign = rounded === format(0, digits) ? '±' : diff > 0 ? '+' : '−';
      return chip(label, format(value, digits), 'target ' + format(goal, digits) + '<br>' + sign + rounded, close ? 'diff-ok' : 'diff-off');
    }).join('');
  }

  // Planned: the Blend finder becomes account-only once a backend exists. See README.
  function createComponent(options) {
    const document = options.document;
    const products = options.products;
    const chemistry = options.chemistry;
    const solver = options.solver;
    const catalog = options.catalog;
    const getState = options.getState;
    const save = options.save;
    const format = options.format;
    const escape = options.escape;
    const notify = options.notify;
    const levels = options.levels;
    const element = id => document.getElementById(id);

    function sourceLabel(product) {
      const elemental = chemistry.elementalAnalysis(product.analysis);
      return {
        title: product.brand + ' — ' + catalog.displayFormula(product),
        detail: format(product.analysis.N) + '-' + format(product.analysis.P2O5) + '-' + format(product.analysis.K2O) + ' label · ' + format(elemental.N) + ' / ' + format(elemental.P) + ' / ' + format(elemental.K) + ' elemental'
      };
    }

    function optionGroup(label, items, value, text) {
      return items.length ? '<optgroup label="' + label + '">' + items.map(item => '<option value="' + escape(value(item)) + '">' + escape(text(item)) + '</option>').join('') + '</optgroup>' : '';
    }

    // What the grower has on hand: pick from a dropdown, listed below with Remove.
    function renderSources() {
      const state = getState();
      const available = [...catalog.customProducts(), ...products].filter(product => !state.blend.ids.includes(product.id));
      const by = group => available.filter(product => product.compareGroup === group && !(group === '1-part' && product.custom));
      const text = product => sourceLabel(product).title;
      element('blendSourcePicker').innerHTML = '<option value="">Add a fertilizer or salt you have…</option>' +
        optionGroup('Your custom products', available.filter(product => product.custom), product => product.id, product => 'Custom — ' + product.name + ' · ' + catalog.displayFormula(product)) +
        optionGroup('1-Part products', by('1-part'), product => product.id, text) +
        optionGroup('System parts', by('component'), product => product.id, text) +
        optionGroup('Ingredient salts', by('salt'), product => product.id, text);
      element('blendSourcePicker').onchange = event => {
        const id = event.target.value;
        if (!id || state.blend.ids.includes(id)) return;
        state.blend.ids.push(id);
        state.blend.result = null;
        save();
        renderSources();
        renderResult();
      };
      const chosen = state.blend.ids.map(catalog.product).filter(Boolean);
      element('blendSources').innerHTML = chosen.length
        ? chosen.map(product => {
          const label = sourceLabel(product);
          return '<div class="selected-line"><div class="selected-line-head"><div><b>' + escape(product.custom ? 'Custom — ' + product.name : label.title) + '</b><div class="muted">' + escape(label.detail) + '</div></div><button class="removeSource" data-id="' + escape(product.id) + '" type="button">Remove</button></div></div>';
        }).join('')
        : '<p class="muted">Nothing added yet.</p>';
      document.querySelectorAll('.removeSource').forEach(button => {
        button.onclick = () => {
          state.blend.ids = state.blend.ids.filter(id => id !== button.dataset.id);
          state.blend.result = null;
          save();
          renderSources();
          renderResult();
        };
      });
    }

    // Label analysis of a target choice ('p:<id>' or 's:<id>' at its default ratio).
    function targetAnalysis(value) {
      const [kind, id] = String(value || '').split(':');
      if (kind === 'p') { const item = catalog.product(id); return item ? item.analysis : null; }
      if (kind === 's') { const item = catalog.system(id); return item ? catalog.mixSystem(item).analysis : null; }
      return null;
    }

    function renderTarget() {
      const state = getState();
      const onePart = products.filter(product => product.compareGroup === '1-part');
      const programs = count => (options.systems || []).filter(system => system.partCount === count);
      const text = item => item.brand + ' — ' + catalog.displayProgram(item) + ' · ' + catalog.displayFormula(item);
      element('blendTarget').innerHTML = '<option value="">Custom — enter values below</option>' +
        optionGroup('1-Part', onePart, item => 'p:' + item.id, text) +
        optionGroup('2-Part', programs(2), item => 's:' + item.id, text) +
        optionGroup('3-Part', programs(3), item => 's:' + item.id, text);
      element('blendTarget').value = state.blend.targetId || '';
      element('blendTarget').onchange = event => {
        const analysis = targetAnalysis(event.target.value);
        state.blend.targetId = analysis ? event.target.value : '';
        if (analysis) {
          const elemental = chemistry.elementalAnalysis(analysis);
          ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S', ...MICRO_KEYS].forEach(key => { state.blend.target[key] = number(analysis[key]); });
          state.blend.target.P = elemental.P;
          state.blend.target.K = elemental.K;
        }
        state.blend.result = null;
        save();
        render();
      };
    }

    // Commercial products and programs (plus custom ones) nearest the solved blend.
    function closestProducts(result, mode) {
      const basis = mode === 'label' ? result.label : result.element;
      const inBasis = analysis => mode === 'label' ? analysis : chemistry.elementalAnalysis(analysis);
      const candidates = [
        ...catalog.customProducts().map(item => ({value: 'p:' + item.id, title: 'Custom — ' + item.name, formula: catalog.displayFormula(item), analysis: item.analysis})),
        ...products.filter(item => item.compareGroup === '1-part').map(item => ({value: 'p:' + item.id, title: catalog.entryTitle(item), formula: catalog.displayFormula(item), analysis: item.analysis})),
        ...(options.systems || []).map(item => ({value: 's:' + item.id, title: catalog.entryTitle(item), formula: catalog.displayFormula(item), analysis: catalog.mixSystem(item).analysis}))
      ];
      return candidates
        .map(item => ({...item, distance: solver.relativeError(inBasis(item.analysis), basis, mode)}))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
    }

    let feedOpen = false;

    function feedHtml(result, selectedProducts) {
      const nitrogenPercent = result.element.N;
      if (nitrogenPercent <= 0) return '<p class="muted">Blend contains no nitrogen.</p>';
      const macros = ALL_KEYS.filter(key => !MICRO_KEYS.includes(key));
      return levels.map(targetN => {
        const total = targetN / (chemistry.MG_PER_L_PER_G_PER_GAL * nitrogenPercent / 100);
        const ppm = key => chemistry.MG_PER_L_PER_G_PER_GAL * total * number(result.element[key]) / 100;
        const chips = keys => keys.map(key => chip(key, format(ppm(key), MICRO_KEYS.includes(key) ? 3 : 1))).join('');
        const doses = selectedProducts.map((product, index) => {
          const grams = total * result.w[index];
          if (grams <= 0) return '';
          const volume = product.form === 'liquid' && number(product.densityGPerMl) > 0 ? ' (' + format(grams / product.densityGPerMl, 3) + ' mL/gal)' : '';
          return '<li>' + escape(product.custom ? 'Custom — ' + product.name : product.brand + ' ' + catalog.displayFormula(product)) + ' — <b>' + format(grams, 3) + ' g/gal</b>' + volume + '</li>';
        }).join('');
        return '<details class="cmp-card blend-feed-card"' + (feedOpen ? ' open' : '') + '><summary><div class="cmp-line1"><b class="cmp-name">' + targetN + ' ppm N</b><span class="cmp-dose">' + format(total, 3) + ' g/gal total</span><span class="cmp-arrow" aria-hidden="true"></span></div>' +
          '<div class="cmp-chips cmp-summary-chips">' + chips(macros) + '<span class="cmp-micros">' + chips(MICRO_KEYS) + '</span></div></summary>' +
          '<div class="cmp-body"><div class="cmp-chips cmp-micros">' + chips(MICRO_KEYS) + '</div><ul class="dose-list">' + doses + '</ul></div></details>';
      }).join('');
    }

    function renderResult() {
      const state = getState();
      const result = state.blend.result;
      if (!result) {
        element('blendResult').classList.add('hidden');
        return;
      }
      const mode = result.mode || state.blend.mode;
      const selectedProducts = result.ids.map(catalog.product).filter(Boolean);
      element('blendResult').classList.remove('hidden');
      element('fit').innerHTML = 'Fit to target: ' + fitBadgeHtml(result.rms, format) + ' <small class="muted">Relative RMS difference; 0% different is exact.</small>';
      element('weights').innerHTML = selectedProducts.map((product, index) => '<div class="pill"><small class="muted">' + escape(product.custom ? 'Custom' : product.brand) + '</small><b>' + escape(product.custom ? product.name : catalog.displayFormula(product)) + '</b><span>' + format(result.w[index] * 100, 2) + '% by mass</span></div>').join('');
      element('blendBasisTitle').textContent = mode === 'label' ? 'Result vs target — label N-P₂O₅-K₂O %' : 'Result vs target — elemental N-P-K %';
      element('blendVsTarget').innerHTML = versusTargetHtml(result, result.target || state.blend.target, mode, format);
      element('blendClosest').innerHTML = closestProducts(result, mode).map(item => '<div class="selected-line"><div class="selected-line-head"><div><b>' + escape(item.title) + '</b>' + (item.value === state.blend.targetId ? ' <small class="cmp-only">your target</small>' : '') + '<div class="muted">' + escape(item.formula) + '</div></div>' + fitBadgeHtml(item.distance, format) + '</div></div>').join('');
      element('feed').innerHTML = feedHtml(result, selectedProducts);
      const cards = document.querySelectorAll('.blend-feed-card');
      cards.forEach(card => {
        card.ontoggle = () => {
          if (card.open === feedOpen) return;
          feedOpen = card.open;
          cards.forEach(other => { other.open = feedOpen; });
        };
      });
    }

    function solve() {
      const state = getState();
      const selectedProducts = state.blend.ids.map(catalog.product).filter(Boolean);
      if (!selectedProducts.length) {
        notify('Add at least one fertilizer or salt you have.', 'warn');
        return;
      }
      state.blend.result = {
        ids: selectedProducts.map(product => product.id),
        mode: state.blend.mode,
        target: {...state.blend.target},
        ...solver.solveBlend(selectedProducts, state.blend.target, state.blend.mode, chemistry)
      };
      save();
      renderResult();
    }

    function render() {
      const state = getState();
      renderTarget();
      renderSources();
      element('labelMode').classList.toggle('active', state.blend.mode === 'label');
      element('elementMode').classList.toggle('active', state.blend.mode === 'element');
      const fields = targetFields(state.blend.mode);
      element('blendInputs').innerHTML = fields.map(([key, label]) => '<label>' + label + ' %<input class="bi" data-k="' + key + '" type="number" min="0" step="' + (MICRO_KEYS.includes(key) ? '.001' : '.01') + '" value="' + format(state.blend.target[key] ?? 0, MICRO_KEYS.includes(key) ? 4 : 4) + '"></label>').join('');
      document.querySelectorAll('.bi').forEach(input => {
        input.oninput = () => {
          state.blend.target[input.dataset.k] = Math.max(0, number(input.value));
          state.blend.result = null;
          // Hand-edited values no longer match the picked product.
          if (state.blend.targetId) {
            state.blend.targetId = '';
            element('blendTarget').value = '';
          }
          save();
        };
      });
      element('labelMode').onclick = () => {
        state.blend.mode = 'label';
        state.blend.result = null;
        save();
        render();
      };
      element('elementMode').onclick = () => {
        state.blend.mode = 'element';
        state.blend.result = null;
        save();
        render();
      };
      element('solve').onclick = solve;
      renderResult();
    }

    return Object.freeze({render, renderSources, renderTarget, renderResult, solve});
  }

  return Object.freeze({fieldsForMode, targetFields, versusTargetHtml, fitClass, fitBadgeHtml, createComponent});
});
