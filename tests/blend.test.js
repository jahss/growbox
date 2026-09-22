'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const chemistry = require('../js/chemistry.js');
const stateModule = require('../js/state.js');
const productModel = require('../js/product-model.js');
const solver = require('../js/blend-solver.js');
const blendModule = require('../js/blend.js');

function loadDatabase() {
  const context = vm.createContext({window: {}});
  const source = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.js'), 'utf8');
  vm.runInContext(source, context, {filename: 'data/products.js'});
  return {products: context.window.FERTILIZER_PRODUCTS, systems: context.window.FERTILIZER_SYSTEMS};
}

function fakeElement() {
  const classes = new Map();
  return {
    innerHTML: '', textContent: '', value: '', onchange: null, onclick: null,
    classList: {
      toggle(name, active) { classes.set(name, Boolean(active)); },
      contains(name) { return classes.get(name) || false; },
      add(name) { classes.set(name, true); },
      remove(name) { classes.set(name, false); }
    }
  };
}

function fixture() {
  const {products, systems} = loadDatabase();
  const ids = ['blendTarget', 'blendSourcePicker', 'blendSources', 'labelMode', 'elementMode', 'blendInputs', 'blendResult', 'fit', 'weights', 'blendBasisTitle', 'blendVsTarget', 'blendClosest', 'feed', 'solve'];
  const elements = Object.fromEntries(ids.map(id => [id, fakeElement()]));
  const document = {
    getElementById(id) { return elements[id]; },
    querySelectorAll() { return []; }
  };
  const format = (value, digits = 2) => Number.isFinite(Number(value))
    ? Number(value).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1')
    : '—';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
  const catalog = productModel.createCatalog(products, systems, chemistry, format);
  let state = stateModule.normalizeState(stateModule.freshState(), products, systems);
  let saves = 0;
  const notices = [];
  const component = blendModule.createComponent({
    document, products, systems, chemistry, solver, catalog, format, escape,
    getState: () => state,
    save: () => { saves += 1; },
    notify: (...args) => notices.push(args),
    levels: [120, 140, 160, 180, 200]
  });
  return {products, systems, catalog, elements, component, get state() { return state; }, set state(value) { state = value; }, get saves() { return saves; }, notices};
}

test('uses fertilizer-label fields or elemental fields for the selected mode', () => {
  assert.deepEqual(blendModule.fieldsForMode('label').map(field => field[0]), ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S']);
  assert.deepEqual(blendModule.fieldsForMode('element').map(field => field[0]), ['N', 'P', 'K', 'Ca', 'Mg', 'S']);
});

test('result vs target uses the chosen basis, shows differences, and includes micros', () => {
  const format = (value, digits = 2) => Number(value).toFixed(digits);
  const result = {label: {N: 12, P2O5: 4, K2O: 15, Ca: 7, Mg: 2, S: 1, Fe: 0.1}, element: {N: 12, P: 1.7, K: 13.3, Ca: 7, Mg: 2, S: 1, Fe: 0.1}};
  const label = blendModule.versusTargetHtml(result, {N: 12, P2O5: 5, K2O: 15, Ca: 7, Mg: 2, S: 1, Fe: 0.1}, 'label', format);
  assert.match(label, /<small>P₂O₅<\/small><b>4\.00<\/b><small>target 5\.00<br>−1\.00<\/small>/);
  assert.match(label, /cmp-chip diff-ok"><small>N<\/small>/);
  assert.match(label, /cmp-chip diff-off"><small>P₂O₅<\/small>/);
  assert.match(label, /<small>Fe<\/small><b>0\.100<\/b><small>target 0\.100<br>±0\.000/);
  assert.match(label, /<small>Mo<\/small><b>0\.000<\/b><small>no target<\/small>/);
  assert.doesNotMatch(label, /<small>P<\/small>/);
  const element = blendModule.versusTargetHtml(result, {N: 12, P: 1.7, K: 13.3}, 'element', format);
  assert.match(element, /<small>K<\/small><b>13\.30<\/b>/);
  assert.doesNotMatch(element, /P₂O₅/);
  assert.equal(blendModule.targetFields('element').length, 12);
});

test('source picker groups commercial products, system parts and salts; chosen sources are listed', () => {
  const view = fixture();
  view.component.render();
  const picker = view.elements.blendSourcePicker.innerHTML;
  assert.match(picker, /optgroup label="1-Part products"/);
  assert.match(picker, /optgroup label="System parts"/);
  assert.match(picker, /optgroup label="Ingredient salts"/);
  // Default sources are listed with Remove, not offered again in the picker.
  assert.match(view.elements.blendSources.innerHTML, /Jack&#39;s Nutrients — 12-4-16/);
  assert.match(view.elements.blendSources.innerHTML, /class="removeSource" data-id="mkp-0-52-34"/);
  assert.doesNotMatch(picker, /value="mkp-0-52-34"/);
  view.elements.blendSourcePicker.onchange({target: {value: 'jacks-epsom'}});
  assert.equal(view.state.blend.ids.filter(id => id === 'jacks-epsom').length, 1);
  assert.match(view.elements.blendInputs.innerHTML, /data-k="P2O5"/);
  assert.equal(view.elements.labelMode.classList.contains('active'), true);
});

test('mode controls clear a stale result and re-render elemental inputs', () => {
  const view = fixture();
  view.component.solve();
  assert.ok(view.state.blend.result);
  view.component.render();
  view.elements.elementMode.onclick();
  assert.equal(view.state.blend.mode, 'element');
  assert.equal(view.state.blend.result, null);
  assert.match(view.elements.blendInputs.innerHTML, /data-k="P"/);
  assert.doesNotMatch(view.elements.blendInputs.innerHTML, /data-k="P2O5"/);
  assert.equal(view.elements.elementMode.classList.contains('active'), true);
  assert.ok(view.saves >= 1);
});

test('solves selected products and renders blend weights plus standardized-N feed rows', () => {
  const view = fixture();
  view.component.render();
  view.elements.solve.onclick();
  assert.deepEqual(view.state.blend.result.ids, view.state.blend.ids);
  assert.equal(view.elements.blendResult.classList.contains('hidden'), false);
  assert.match(view.elements.fit.innerHTML, /Fit to target: <span class="fit-badge fit-(good|fair|poor)"><b>[\d.]+% match<\/b><small>[\d.]+% different<\/small>/);
  assert.match(view.elements.weights.innerHTML, /<div class="pill"><small class="muted">Jack&#39;s Nutrients<\/small><b>12-4-16<\/b>/);
  assert.match(view.elements.feed.innerHTML, /<li>Jack&#39;s Nutrients 12-4-16 — <b>/);
  assert.match(view.elements.weights.innerHTML, /% by mass/);
  assert.match(view.elements.feed.innerHTML, /<b class="cmp-name">120 ppm N<\/b>/);
  assert.match(view.elements.feed.innerHTML, /<b class="cmp-name">200 ppm N<\/b>/);
  assert.match(view.elements.feed.innerHTML, /<ul class="dose-list"><li>/);
  assert.match(view.elements.blendBasisTitle.textContent, /label N-P₂O₅-K₂O/);
  assert.equal((view.elements.blendVsTarget.innerHTML.match(/class="cmp-chip/g) || []).length, 12);
  assert.equal((view.elements.blendClosest.innerHTML.match(/class="selected-line"/g) || []).length, 3);
  assert.ok(view.saves >= 1);
});

test('requires a selection before solving', () => {
  const view = fixture();
  view.state.blend.ids = [];
  view.component.solve();
  assert.deepEqual(view.notices, [['Add at least one fertilizer or salt you have.', 'warn']]);
  assert.equal(view.state.blend.result, null);
});

test('reports when a solved blend cannot be scaled to a nitrogen target', () => {
  const view = fixture();
  view.state.blend.ids = ['mkp-0-52-34'];
  view.component.solve();
  assert.match(view.elements.feed.innerHTML, /Blend contains no nitrogen\./);
  assert.doesNotMatch(view.elements.feed.innerHTML, /120 ppm N/);
});

test('target dropdown lists commercial products and programs and fills the target', () => {
  const view = fixture();
  view.component.render();
  const options = view.elements.blendTarget.innerHTML;
  assert.match(options, /<option value="">Custom — enter values below<\/option>/);
  assert.match(options, /optgroup label="1-Part"/);
  assert.match(options, /value="s:athena-pro-bloom"/);
  assert.doesNotMatch(options, /mkp-0-52-34/, 'salts are sources, not targets');

  view.elements.blendTarget.onchange({target: {value: 's:athena-pro-bloom'}});
  const expected = view.catalog.mixSystem(view.catalog.system('athena-pro-bloom')).analysis;
  assert.equal(view.state.blend.targetId, 's:athena-pro-bloom');
  assert.ok(Math.abs(view.state.blend.target.N - expected.N) < 1e-12);
  assert.ok(Math.abs(view.state.blend.target.K - chemistry.elementalAnalysis(expected).K) < 1e-12);

  view.elements.blendTarget.onchange({target: {value: 'p:jacks-12-4-16'}});
  assert.equal(view.state.blend.target.P2O5, 4);

  view.elements.blendTarget.onchange({target: {value: ''}});
  assert.equal(view.state.blend.targetId, '');
  assert.equal(view.state.blend.target.P2O5, 4, 'switching to Custom keeps the current values');
});

test('closest products rank the target program first when the blend reproduces it', () => {
  const view = fixture();
  view.component.render();
  view.elements.blendTarget.onchange({target: {value: 's:athena-pro-bloom'}});
  const system = view.catalog.system('athena-pro-bloom');
  view.state.blend.ids = system.components.map(component => component.productId);
  view.component.solve();
  assert.ok(view.state.blend.result.rms < 0.01, 'its own parts reproduce the target');
  assert.match(view.elements.blendClosest.innerHTML, /^<div class="selected-line"><div class="selected-line-head"><div><b>Athena — Pro Bloom<\/b> <small class="cmp-only">your target<\/small>/);
});

test('fit badges show match and difference, coloured by closeness', () => {
  const format = (value, digits = 2) => Number(value).toFixed(digits);
  assert.equal(blendModule.fitClass(0.05), 'fit-good');
  assert.equal(blendModule.fitClass(0.10), 'fit-good');
  assert.equal(blendModule.fitClass(0.2), 'fit-fair');
  assert.equal(blendModule.fitClass(0.4), 'fit-poor');
  assert.equal(blendModule.fitBadgeHtml(0.37, format), '<span class="fit-badge fit-poor"><b>63.0% match</b><small>37.0% different</small></span>');
  assert.match(blendModule.fitBadgeHtml(1.8, format), /<b>0\.0% match<\/b><small>180\.0% different/);
});

test('a difference that rounds to zero shows as ±0, not −0', () => {
  const format = (value, digits = 2) => Number(value).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
  const result = {label: {N: 10, Mo: 0.0036}, element: {}};
  const html = blendModule.versusTargetHtml(result, {N: 10, Mo: 0.004}, 'label', format);
  assert.match(html, /<small>Mo<\/small><b>0\.004<\/b><small>target 0\.004<br>±0<\/small>/);
});
