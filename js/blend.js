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
  const FORM_LABELS = {nitrateN: 'nitrate N', ammoniacalN: 'ammonium N', ureaN: 'urea N'};
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
    const nitrogenFieldHtml = options.nitrogenFieldHtml;
    // Source water entered on Use rate ({} for RO).
    const waterOf = options.waterOf || (() => ({}));
    const renderMix = options.renderMix || (() => {});
    const bindNitrogenField = options.bindNitrogenField || (() => {});
    const labelStep = options.labelStep || (() => '.1');
    const nitrogenFormsHtml = options.nitrogenFormsHtml;
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

    // "Subtract my water": shown once water is entered on Use rate.
    function renderWaterToggle() {
      const state = getState();
      const toggle = element('blendWaterToggle');
      if (!toggle) return;
      const water = waterOf();
      toggle.classList.toggle('hidden', !Object.keys(water).length);
      element('blendUseWater').checked = state.blend.useWater;
      element('blendUseWater').onchange = () => {
        state.blend.useWater = element('blendUseWater').checked;
        clearResult();
      };
      const summary = ['Ca', 'Mg', 'S', 'N', 'K'].filter(key => water[key]).map(key => key + ' ' + format(water[key], 1)).join(' · ');
      if (element('blendWaterSummary')) element('blendWaterSummary').textContent = summary ? '(' + summary + ' ppm, from Use rate)' : '(from Use rate)';
    }

    // Use rate's water changed: show or hide the switch; a result solved with the old water is out of date.
    function waterChanged() {
      renderWaterToggle();
      if (getState().blend.result && getState().blend.useWater) clearResult();
    }

    function clearResult() {
      const state = getState();
      state.blend.result = null;
      save();
      renderResult();
    }

    // What the grower has on hand: pick from a dropdown, listed below; tap a card to remove it.
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
        ? chosen.map(product => '<button type="button" class="source-card removeSource" data-id="' + escape(product.id) + '" aria-label="Remove ' + escape(productTitle(product)) + '"><span class="source-x" aria-hidden="true">×</span><b>' + escape(productTitle(product)) + '</b><span class="muted">' + escape(sourceDetail(product)) + '</span></button>').join('')
        : '<p class="muted">Nothing added yet.</p>';
      document.querySelectorAll('.removeSource').forEach(button => {
        button.onclick = () => {
          const product = catalog.product(button.dataset.id);
          state.blend.ids = state.blend.ids.filter(id => id !== button.dataset.id);
          renderSources();
          clearResult();
          if (product) notify('Removed “' + productTitle(product) + '”. Add it back from the list above.');
        };
      });
    }

    // "+ Enter your own product": a label form that saves a custom product and adds it to the sources.
    function renderCustomForm() {
      const form = element('blendCustomForm');
      const toggle = element('blendCustomToggle');
      if (!form || !toggle || !saveCustomProduct) return;
      form.innerHTML = '<label class="wide-control">Name<input id="blendCustomName" type="text" maxlength="60" placeholder="e.g. Local cal-mag"></label>' +
        '<div class="inputs">' + LABEL_FIELDS.map(([key, label]) => {
          const input = '<input' + (key === 'N' ? ' id="bcN"' : '') + ' class="bci" data-k="' + key + '" type="number" min="0" step="' + labelStep(key) + '" placeholder="0">';
          return key === 'N'
            ? nitrogenFieldHtml('bc', label + ' %', input, 'bci', null, '%', 'From the label\'s Total Nitrogen breakdown. With N blank, these fill it in; they can\'t add up to more than N.', format)
            : '<label>' + label + ' %' + input + '</label>';
        }).join('') +
        '<label class="density-field">Density, g/mL (liquids only)<input class="bci" data-k="densityGPerMl" type="number" min="0" step=".01" placeholder="blank for dry"></label></div>' +
        '<div class="actions"><button id="blendCustomAdd" class="primary" type="button">Add to what you have</button><button id="blendCustomCancel" type="button">Cancel</button></div>' +
        '<p class="muted session-note">Saved with your custom products for this browser session only.</p>';
      bindNitrogenField(document, 'bc', format);
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
        const nitrogenForms = {};
        let densityGPerMl = 0;
        document.querySelectorAll('.bci').forEach(input => {
          const value = Math.max(0, number(input.value));
          if (input.dataset.k === 'densityGPerMl') densityGPerMl = value;
          else if (input.dataset.k.endsWith('N') && input.dataset.k !== 'N') nitrogenForms[input.dataset.k] = value;
          else analysis[input.dataset.k] = value;
        });
        if (!LABEL_FIELDS.some(([key]) => analysis[key] > 0)) {
          notify('Enter the label analysis first.', 'warn');
          return;
        }
        const formula = ['N', 'P2O5', 'K2O'].map(key => format(number(analysis[key]), 3)).join('-');
        const name = (element('blendCustomName').value || '').trim() || formula;
        const saved = saveCustomProduct(state, {name, analysis, nitrogenForms, densityGPerMl});
        if (saved.error === 'nitrogen') {
          notify('Nitrogen forms add up to more than total N (' + format(number(analysis.N), 3) + '%).', 'warn');
          return;
        }
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
      if (kind === 'p') { const item = catalog.product(id); return item ? {title: catalog.entryTitle(item), analysis: item.analysis, nitrogenForms: item.nitrogenForms} : null; }
      if (kind === 's') { const item = catalog.system(id); if (!item) return null; const mix = catalog.mixSystem(item); return {title: catalog.entryTitle(item), analysis: mix.analysis, nitrogenForms: mix.nitrogenForms}; }
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
      // Form targets only when the label accounts for all of its N.
      const split = chemistry.fullNitrogenSplit(choice.nitrogenForms, choice.analysis.N);
      solver.FORM_KEYS.forEach(key => { state.blend.target[key] = split ? number(ppm.N) * number(split[key]) / number(choice.analysis.N) : 0; });
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
      renderWaterToggle();

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
        const input = '<input' + (key === 'N' ? ' id="btN"' : '') + ' class="bi" data-k="' + key + '" type="number" min="0" step="' + (MICRO_KEYS.includes(key) ? '.01' : '1') + '" placeholder="no target" value="' + (value > 0 ? format(value, digitsFor(key) + 1) : '') + '">';
        return key === 'N'
          ? nitrogenFieldHtml('bt', label + ' ppm', input, 'bi', state.blend.target, 'ppm', 'Blank means not matched. Only sources with a published N split can help match these.', format)
          : '<label>' + label + ' ppm' + input + '</label>';
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
      bindNitrogenField(document, 'bt', format);
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
      // The 12 elements only: products don't carry N-form ppm, so those rows would count against every one.
      const elements = Object.fromEntries(solver.PPM_KEYS.map(key => [key, result.ppm[key]]));
      const candidates = [
        ...catalog.customProducts().map(item => ({value: 'p:' + item.id, title: 'Custom — ' + item.name, formula: catalog.displayFormula(item), analysis: item.analysis})),
        ...products.filter(item => item.compareGroup === '1-part').map(item => ({value: 'p:' + item.id, title: catalog.entryTitle(item), formula: catalog.displayFormula(item), analysis: item.analysis})),
        ...systems.map(item => ({value: 's:' + item.id, title: catalog.entryTitle(item), formula: catalog.displayFormula(item), analysis: catalog.mixSystem(item).analysis}))
      ];
      return candidates
        .map(item => {
          const dose = chemistry.standardizedDose(item.analysis, reference, result.ppm[reference]);
          return dose === null ? null : {...item, distance: solver.relativeError(chemistry.ppmAtDose(item.analysis, dose), elements)};
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

    // The solved recipe scaled so the tank (recipe plus any source water) holds each N level.
    function feedHtml(result, selectedProducts) {
      const nitrogen = number(result.ppm.N);
      if (nitrogen <= 0) return '<p class="muted">Blend contains no nitrogen.</p>';
      const water = result.water || {};
      return levels.filter(targetN => targetN > number(water.N)).map(targetN => {
        const factor = (targetN - number(water.N)) / nitrogen;
        const total = result.doses.reduce((sum, dose) => sum + dose, 0) * factor;
        const chips = keys => keys.map(key => chip(key, format(result.ppm[key] * factor + number(water[key]), digitsFor(key)))).join('');
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
      // A result whose products no longer all exist (a deleted custom product) is out of date:
      // its doses would line up with the wrong products.
      if (state.blend.result && state.blend.result.ids.some(id => !catalog.product(id))) {
        state.blend.result = null;
        save();
      }
      const result = state.blend.result;
      if (element('blMix')) element('blMix').classList.toggle('hidden', !result);
      if (!result) {
        element('blendResult').classList.add('hidden');
        return;
      }
      const selectedProducts = result.ids.map(catalog.product).filter(Boolean);
      const total = result.doses.reduce((sum, dose) => sum + dose, 0);
      element('blendResult').classList.remove('hidden');
      const water = result.water || {};
      const hasWater = Object.keys(water).length > 0;
      // What's in the tank: the recipe plus the water it was solved with.
      const inTank = result.total || result.ppm;
      element('fit').innerHTML = 'Fit to target: ' + fitBadgeHtml(result.rms, format) + '<small class="muted fit-note">How close the blend gets across the elements you set' + (hasWater ? ', counting your water' : '') + '. Under 100% means your sources can\'t make the target exactly; the boxes below show where it falls short.</small>';
      // Products the recipe uses first, then the ones it doesn't need.
      const order = selectedProducts.map((product, index) => index).sort((a, b) => result.doses[b] - result.doses[a]);
      element('weights').innerHTML = order.map(index => {
        const product = selectedProducts[index];
        const grams = result.doses[index];
        return '<div class="pill' + (grams > 0 ? '' : ' unused') + '"><small class="muted">' + escape(product.custom ? 'Custom' : product.brand) + '</small><b>' + escape(product.custom ? product.name : catalog.displayFormula(product)) + '</b><span>' +
          (grams > 0 ? doseText(product, grams) + ' · ' + format(grams / total * 100, 1) + '% of mass' : 'Not needed') + '</span></div>';
      }).join('');
      element('blendVsTarget').innerHTML = versusTargetHtml(inTank, result.target, format);
      const lines = selectedProducts.map((product, index) => ({product, gramsPerLiter: result.doses[index] / chemistry.US_GALLON_LITERS}));
      const forms = chemistry.recipeAtDoses(lines).nitrogenForms;
      solver.FORM_KEYS.forEach(key => { if (water[key]) forms[key] = number(forms[key]) + water[key]; });
      element('blendNitrogen').innerHTML = nitrogenFormsHtml(forms, inTank.N, format, escape, result.target);
      element('blendClosest').innerHTML = closestProducts(result).map(item => '<div class="selected-line"><div class="selected-line-head"><div><b>' + escape(item.title) + '</b>' + (item.value === state.blend.targetId ? ' <small class="cmp-only">your target</small>' : '') + '<div class="muted">' + escape(item.formula) + '</div></div>' + fitBadgeHtml(item.distance, format) + '</div></div>').join('');
      element('feed').innerHTML = feedHtml(result, selectedProducts);
      renderMix('blMix', selectedProducts.map((product, index) => ({product, gPerGal: result.doses[index], label: product.custom ? product.name : catalog.displayFormula(product)}))
        .filter(line => line.gPerGal > 0));
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
      const formsTotal = solver.FORM_KEYS.reduce((sum, key) => sum + number(state.blend.target[key]), 0);
      if (number(state.blend.target.N) > 0 && formsTotal > number(state.blend.target.N) + 1e-9) {
        notify('N form targets add up to ' + format(formsTotal, 1) + ' ppm, more than the N target (' + format(number(state.blend.target.N), 1) + ' ppm).', 'warn');
        return;
      }
      const water = state.blend.useWater ? waterOf() : {};
      state.blend.result = {
        ids: selectedProducts.map(product => product.id),
        target: {...state.blend.target},
        ...solver.solveWithWater(selectedProducts, state.blend.target, water, chemistry)
      };
      save();
      renderResult();
      const covered = state.blend.result.covered.map(key => (FORM_LABELS[key] || key) + ' (' + format(water[key], digitsFor(key)) + ' ppm, target ' + format(state.blend.target[key], digitsFor(key)) + ')');
      if (covered.length) notify('Your water already supplies ' + covered.join(', ') + ', so nothing is added for ' + (covered.length > 1 ? 'them' : 'it') + '.', 'warn');
    }

    function render() {
      renderTarget();
      renderSources();
      renderCustomForm();
      element('solve').onclick = solve;
      renderResult();
    }

    return Object.freeze({render, renderSources, renderTarget, renderResult, solve, waterChanged});
  }

  return Object.freeze({FIELDS, ELEMENT_LEVELS, versusTargetHtml, fitClass, fitBadgeHtml, createComponent});
});
