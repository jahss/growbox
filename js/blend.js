(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxBlend = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Everything here is elemental ppm delivered in solution.
  const FIELDS = [['N', 'N'], ['P', 'P'], ['K', 'K'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S'],
    ['Fe', 'Fe'], ['Mn', 'Mn'], ['Zn', 'Zn'], ['B', 'B'], ['Cu', 'Cu'], ['Mo', 'Mo']];
  const MICRO_KEYS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const MACRO_KEYS = FIELDS.map(field => field[0]).filter(key => !MICRO_KEYS.includes(key));
  const ELEMENT_LEVELS = {N: range(50, 300, 10), P: range(10, 150, 10), K: range(50, 300, 10)};
  // Label fields for entering a product that isn't in the list (as printed, % by weight).
  const LABEL_FIELDS = [['N', 'N'], ['P2O5', 'P₂O₅'], ['K2O', 'K₂O'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S'],
    ['Fe', 'Fe'], ['Mn', 'Mn'], ['Zn', 'Zn'], ['B', 'B'], ['Cu', 'Cu'], ['Mo', 'Mo']];

  function range(start, end, step) {
    const values = [];
    for (let value = start; value <= end; value += step) values.push(value);
    return values;
  }

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function digitsFor(key) {
    return MICRO_KEYS.includes(key) ? 3 : 1;
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

  // One box per element: delivered ppm, target ppm and the difference. Within 5%
  // of the target counts as on target; elements without a target aren't matched.
  function versusTargetHtml(ppm, target, format) {
    return FIELDS.map(([key, label]) => {
      const digits = digitsFor(key);
      const value = number(ppm[key]);
      const goal = number(target[key]);
      if (goal <= 0) return chip(label, format(value, digits), 'no target');
      const diff = value - goal;
      const rounded = format(Math.abs(diff), digits);
      const sign = rounded === format(0, digits) ? '±' : diff > 0 ? '+' : '−';
      return chip(label, format(value, digits), 'target ' + format(goal, digits) + '<br>' + sign + rounded, Math.abs(diff) <= 0.05 * goal ? 'diff-ok' : 'diff-off');
    }).join('');
  }

  // Planned: the Blend finder becomes account-only once a backend exists. See README.
  function createComponent(options) {
    const document = options.document;
    const products = options.products;
    const systems = options.systems || [];
    const chemistry = options.chemistry;
    const solver = options.solver;
    const catalog = options.catalog;
    const getState = options.getState;
    const save = options.save;
    const format = options.format;
    const escape = options.escape;
    const notify = options.notify;
    const levels = options.levels;
    const saveCustomProduct = options.saveCustomProduct;
    const onCustomProducts = options.onCustomProducts || (() => {});
    const element = id => document.getElementById(id);

    function productTitle(product) {
      if (product.custom) return 'Custom — ' + product.name;
      if (product.compareGroup === 'salt') return catalog.displayFormula(product);
      return product.brand + ' — ' + catalog.displayFormula(product);
    }

    // Short name for the feed chart ("Jack's Nutrients 12-4-16", or the salt's name).
    function shortName(product) {
      if (product.custom) return 'Custom — ' + product.name;
      if (product.compareGroup === 'salt') return catalog.displayFormula(product);
      return product.brand + ' ' + catalog.displayFormula(product);
    }

    // What a source contains: N-P-K for fertilizers; formula and nonzero elements for salts.
    function sourceDetail(product) {
      const elemental = chemistry.elementalAnalysis(product.analysis);
      if (product.compareGroup === 'salt') {
        const parts = FIELDS.filter(([key]) => elemental[key] > 0).map(([key, label]) => label + ' ' + format(elemental[key], 2) + '%');
        return (product.chemicalFormula ? product.chemicalFormula + ' · ' : '') + parts.join(', ');
      }
      return format(product.analysis.N) + '-' + format(product.analysis.P2O5) + '-' + format(product.analysis.K2O) + ' label · ' + format(elemental.N) + ' / ' + format(elemental.P) + ' / ' + format(elemental.K) + ' elemental';
    }

    function optionGroup(label, items, value, text) {
      return items.length ? '<optgroup label="' + label + '">' + items.map(item => '<option value="' + escape(value(item)) + '">' + escape(text(item)) + '</option>').join('') + '</optgroup>' : '';
    }

    function clearResult() {
      const state = getState();
      state.blend.result = null;
      save();
      renderResult();
    }

    // What the grower has on hand: pick from a dropdown, listed below with Remove.
    function renderSources() {
      const state = getState();
      const available = [...catalog.customProducts(), ...products].filter(product => !state.blend.ids.includes(product.id));
      const by = group => available.filter(product => product.compareGroup === group && !product.custom);
      element('blendSourcePicker').innerHTML = '<option value="">Add a fertilizer or salt you have…</option>' +
        optionGroup('Your custom products', available.filter(product => product.custom), product => product.id, product => productTitle(product) + ' · ' + catalog.displayFormula(product)) +
        optionGroup('1-Part products', by('1-part'), product => product.id, productTitle) +
        optionGroup('System parts', by('component'), product => product.id, productTitle) +
        optionGroup('Raw salts', by('salt'), product => product.id, productTitle);
      element('blendSourcePicker').onchange = event => {
        const id = event.target.value;
        if (!id || state.blend.ids.includes(id)) return;
        state.blend.ids.push(id);
        renderSources();
        clearResult();
      };
      const chosen = state.blend.ids.map(catalog.product).filter(Boolean);
      element('blendSources').innerHTML = chosen.length
        ? chosen.map(product => '<div class="selected-line"><div class="selected-line-head"><div><b>' + escape(productTitle(product)) + '</b><div class="muted">' + escape(sourceDetail(product)) + '</div></div><button class="removeSource" data-id="' + escape(product.id) + '" type="button">Remove</button></div></div>').join('')
        : '<p class="muted">Nothing added yet.</p>';
      document.querySelectorAll('.removeSource').forEach(button => {
        button.onclick = () => {
          state.blend.ids = state.blend.ids.filter(id => id !== button.dataset.id);
          renderSources();
          clearResult();
        };
      });
    }

    // "+ Enter your own product": a label form that saves a custom product and adds it to the sources.
    function renderCustomForm() {
      const form = element('blendCustomForm');
      const toggle = element('blendCustomToggle');
      if (!form || !toggle || !saveCustomProduct) return;
      form.innerHTML = '<label class="wide-control">Name<input id="blendCustomName" type="text" maxlength="60" placeholder="e.g. Local cal-mag"></label>' +
        '<div class="inputs">' + LABEL_FIELDS.map(([key, label]) => '<label>' + label + ' %<input class="bci" data-k="' + key + '" type="number" min="0" step=".001" placeholder="0"></label>').join('') +
        '<label class="density-field">Density, g/mL (liquids only)<input class="bci" data-k="densityGPerMl" type="number" min="0" step=".001" placeholder="blank for dry"></label></div>' +
        '<div class="actions"><button id="blendCustomAdd" class="primary" type="button">Add to what you have</button><button id="blendCustomCancel" type="button">Cancel</button></div>' +
        '<p class="muted session-note">Saved with your custom products for this browser session only.</p>';
      toggle.onclick = () => {
        form.classList.toggle('hidden');
        toggle.classList.toggle('hidden', !form.classList.contains('hidden'));
      };
      const bind = (id, handler) => { const button = element(id); if (button) button.onclick = handler; };
      bind('blendCustomCancel', () => {
        form.classList.add('hidden');
        toggle.classList.remove('hidden');
      });
      bind('blendCustomAdd', () => {
        const state = getState();
        const analysis = {};
        let densityGPerMl = 0;
        document.querySelectorAll('.bci').forEach(input => {
          const value = Math.max(0, number(input.value));
          if (input.dataset.k === 'densityGPerMl') densityGPerMl = value;
          else analysis[input.dataset.k] = value;
        });
        if (!LABEL_FIELDS.some(([key]) => analysis[key] > 0)) {
          notify('Enter the label analysis first.', 'warn');
          return;
        }
        const formula = ['N', 'P2O5', 'K2O'].map(key => format(number(analysis[key]), 3)).join('-');
        const name = (element('blendCustomName').value || '').trim() || formula;
        const saved = saveCustomProduct(state, {name, analysis, densityGPerMl});
        if (saved.error) {
          notify('You can save up to 20 custom products. Delete one on the Label → ppm tab first.', 'warn');
          return;
        }
        if (!state.blend.ids.includes(saved.record.id)) state.blend.ids.push(saved.record.id);
        onCustomProducts();
        form.classList.add('hidden');
        toggle.classList.remove('hidden');
        renderCustomForm();
        renderSources();
        clearResult();
        notify((saved.updated ? 'Updated “' : 'Added “') + saved.record.name + '” to what you have.');
      });
    }

    // Label analysis and name of a target choice ('p:<id>', or 's:<id>' at its default ratio).
    function targetChoice(value) {
      const [kind, id] = String(value || '').split(':');
      if (kind === 'p') { const item = catalog.product(id); return item ? {title: catalog.entryTitle(item), analysis: item.analysis} : null; }
      if (kind === 's') { const item = catalog.system(id); return item ? {title: catalog.entryTitle(item), analysis: catalog.mixSystem(item).analysis} : null; }
      return null;
    }

    // Target ppm = the chosen product dosed to the chosen level of N, P or K.
    function fillTargetFromProduct() {
      const state = getState();
      const choice = targetChoice(state.blend.targetId);
      if (!choice) return;
      const dose = chemistry.standardizedDose(choice.analysis, state.blend.targetElement, state.blend.targetLevel);
      if (dose === null) {
        notify(choice.title + ' contains no ' + state.blend.targetElement + '. Pick an element it contains.', 'warn');
        return;
      }
      const ppm = chemistry.ppmAtDose(choice.analysis, dose);
      FIELDS.forEach(([key]) => { state.blend.target[key] = number(ppm[key]); });
    }

    function renderTarget() {
      const state = getState();
      const text = item => item.brand + ' — ' + catalog.displayProgram(item) + ' · ' + catalog.displayFormula(item);
      element('blendTarget').innerHTML = '<option value="">Custom — enter ppm below</option>' +
        optionGroup('1-Part', products.filter(product => product.compareGroup === '1-part'), item => 'p:' + item.id, text) +
        optionGroup('2-Part', systems.filter(system => system.partCount === 2), item => 's:' + item.id, text) +
        optionGroup('3-Part', systems.filter(system => system.partCount === 3), item => 's:' + item.id, text);
      element('blendTarget').value = state.blend.targetId || '';
      element('blendElement').value = state.blend.targetElement;
      element('blendLevel').innerHTML = ELEMENT_LEVELS[state.blend.targetElement].map(level => '<option value="' + level + '"' + (level === state.blend.targetLevel ? ' selected' : '') + '>' + level + '</option>').join('');
      element('blendLevelControl').classList.toggle('hidden', !state.blend.targetId);

      const refill = () => {
        fillTargetFromProduct();
        state.blend.result = null;
        save();
        render();
      };
      element('blendTarget').onchange = event => {
        state.blend.targetId = targetChoice(event.target.value) ? event.target.value : '';
        refill();
      };
      element('blendElement').onchange = event => {
        state.blend.targetElement = event.target.value;
        const options = ELEMENT_LEVELS[state.blend.targetElement];
        state.blend.targetLevel = options.reduce((best, value) => Math.abs(value - state.blend.targetLevel) < Math.abs(best - state.blend.targetLevel) ? value : best, options[0]);
        refill();
      };
      element('blendLevel').onchange = event => {
        state.blend.targetLevel = Number(event.target.value);
        refill();
      };

      element('blendInputs').innerHTML = FIELDS.map(([key, label]) => {
        const value = number(state.blend.target[key]);
        return '<label>' + label + ' ppm<input class="bi" data-k="' + key + '" type="number" min="0" step="' + (MICRO_KEYS.includes(key) ? '.01' : '1') + '" placeholder="no target" value="' + (value > 0 ? format(value, digitsFor(key) + 1) : '') + '"></label>';
      }).join('');
      document.querySelectorAll('.bi').forEach(input => {
        input.oninput = () => {
          state.blend.target[input.dataset.k] = Math.max(0, number(input.value));
          // Hand-edited values no longer match the picked product.
          if (state.blend.targetId) {
            state.blend.targetId = '';
            element('blendTarget').value = '';
            element('blendLevelControl').classList.add('hidden');
          }
          clearResult();
        };
      });
    }

    // Element the blend is scaled and compared by: N if it delivers any, else K, else P.
    function referenceElement(ppm) {
      return ['N', 'K', 'P'].find(key => number(ppm[key]) > 0) || null;
    }

    // Commercial products and programs (plus custom ones) whose ppm profile is
    // nearest the blend when dosed to deliver the same amount of the reference element.
    function closestProducts(result) {
      const reference = referenceElement(result.ppm);
      if (!reference) return [];
      const candidates = [
        ...catalog.customProducts().map(item => ({value: 'p:' + item.id, title: 'Custom — ' + item.name, formula: catalog.displayFormula(item), analysis: item.analysis})),
        ...products.filter(item => item.compareGroup === '1-part').map(item => ({value: 'p:' + item.id, title: catalog.entryTitle(item), formula: catalog.displayFormula(item), analysis: item.analysis})),
        ...systems.map(item => ({value: 's:' + item.id, title: catalog.entryTitle(item), formula: catalog.displayFormula(item), analysis: catalog.mixSystem(item).analysis}))
      ];
      return candidates
        .map(item => {
          const dose = chemistry.standardizedDose(item.analysis, reference, result.ppm[reference]);
          return dose === null ? null : {...item, distance: solver.relativeError(chemistry.ppmAtDose(item.analysis, dose), result.ppm)};
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
    }

    function doseText(product, grams) {
      const volume = product.form === 'liquid' && number(product.densityGPerMl) > 0 ? ' (' + format(grams / product.densityGPerMl, 3) + ' mL/gal)' : '';
      return format(grams, 3) + ' g/gal' + volume;
    }

    let feedOpen = false;

    // The solved recipe scaled so it delivers each N level; ppm and doses scale with it.
    function feedHtml(result, selectedProducts) {
      const nitrogen = number(result.ppm.N);
      if (nitrogen <= 0) return '<p class="muted">Blend contains no nitrogen.</p>';
      return levels.map(targetN => {
        const factor = targetN / nitrogen;
        const total = result.doses.reduce((sum, dose) => sum + dose, 0) * factor;
        const chips = keys => keys.map(key => chip(key, format(result.ppm[key] * factor, digitsFor(key)))).join('');
        const doses = selectedProducts.map((product, index) => result.doses[index] > 0
          ? '<li>' + escape(shortName(product)) + ' — <b>' + doseText(product, result.doses[index] * factor) + '</b></li>'
          : '').join('');
        return '<details class="cmp-card blend-feed-card"' + (feedOpen ? ' open' : '') + '><summary><div class="cmp-line1"><b class="cmp-name">' + targetN + ' ppm N</b><span class="cmp-dose">' + format(total, 3) + ' g/gal total</span><span class="cmp-arrow" aria-hidden="true"></span></div>' +
          '<div class="cmp-chips cmp-summary-chips">' + chips(MACRO_KEYS) + '<span class="cmp-micros">' + chips(MICRO_KEYS) + '</span></div></summary>' +
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
      const selectedProducts = result.ids.map(catalog.product).filter(Boolean);
      const total = result.doses.reduce((sum, dose) => sum + dose, 0);
      element('blendResult').classList.remove('hidden');
      element('fit').innerHTML = 'Fit to target: ' + fitBadgeHtml(result.rms, format) + ' <small class="muted">Relative RMS difference in delivered ppm; 0% different is exact.</small>';
      // Products the recipe uses first, then the ones it doesn't need.
      const order = selectedProducts.map((product, index) => index).sort((a, b) => result.doses[b] - result.doses[a]);
      element('weights').innerHTML = order.map(index => {
        const product = selectedProducts[index];
        const grams = result.doses[index];
        return '<div class="pill' + (grams > 0 ? '' : ' unused') + '"><small class="muted">' + escape(product.custom ? 'Custom' : product.brand) + '</small><b>' + escape(product.custom ? product.name : catalog.displayFormula(product)) + '</b><span>' +
          (grams > 0 ? doseText(product, grams) + ' · ' + format(grams / total * 100, 1) + '% of mass' : 'Not needed') + '</span></div>';
      }).join('');
      element('blendVsTarget').innerHTML = versusTargetHtml(result.ppm, result.target, format);
      element('blendClosest').innerHTML = closestProducts(result).map(item => '<div class="selected-line"><div class="selected-line-head"><div><b>' + escape(item.title) + '</b>' + (item.value === state.blend.targetId ? ' <small class="cmp-only">your target</small>' : '') + '<div class="muted">' + escape(item.formula) + '</div></div>' + fitBadgeHtml(item.distance, format) + '</div></div>').join('');
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
      if (!solver.fitRows(state.blend.target).length) {
        notify('Enter at least one target ppm.', 'warn');
        return;
      }
      state.blend.result = {
        ids: selectedProducts.map(product => product.id),
        target: {...state.blend.target},
        ...solver.solveDoses(selectedProducts, state.blend.target, chemistry)
      };
      save();
      renderResult();
    }

    function render() {
      renderTarget();
      renderSources();
      renderCustomForm();
      element('solve').onclick = solve;
      renderResult();
    }

    return Object.freeze({render, renderSources, renderTarget, renderResult, solve});
  }

  return Object.freeze({FIELDS, ELEMENT_LEVELS, versusTargetHtml, fitClass, fitBadgeHtml, createComponent});
});
