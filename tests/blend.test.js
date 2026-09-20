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
  const ids = ['blendChecks', 'labelMode', 'elementMode', 'blendInputs', 'blendResult', 'fit', 'weights', 'labelResult', 'elementResult', 'feed', 'solve'];
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
    document, products, chemistry, solver, catalog, format, escape,
    getState: () => state,
    save: () => { saves += 1; },
    notify: (...args) => notices.push(args),
    levels: [120, 140, 160, 180, 200]
  });
  return {products, elements, component, get state() { return state; }, set state(value) { state = value; }, get saves() { return saves; }, notices};
}

test('uses fertilizer-label fields or elemental fields for the selected mode', () => {
  assert.deepEqual(blendModule.fieldsForMode('label').map(field => field[0]), ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S']);
  assert.deepEqual(blendModule.fieldsForMode('element').map(field => field[0]), ['N', 'P', 'K', 'Ca', 'Mg', 'S']);
});

test('result table renders the correct nutrient convention', () => {
  const format = value => String(value);
  assert.match(blendModule.resultTableHtml({N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 1}, 'label', format), /P₂O₅/);
  assert.match(blendModule.resultTableHtml({N: 12, P: 1.7, K: 13.3, Ca: 7, Mg: 2, S: 1}, 'element', format), /<th>P<\/th><th>K<\/th>/);
});

test('renders commercial fertilizers and generic salts in separate groups', () => {
  const view = fixture();
  view.component.render();
  assert.match(view.elements.blendChecks.innerHTML, /Fertilizers &amp; components|Fertilizers & components/);
  assert.match(view.elements.blendChecks.innerHTML, /Ingredient salts/);
  assert.match(view.elements.blendChecks.innerHTML, /Jack&#39;s Nutrients — 12-4-16/);
  assert.match(view.elements.blendChecks.innerHTML, /Generic salt — 0-52-34/);
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
  assert.match(view.elements.fit.textContent, /Relative RMS error:/);
  assert.match(view.elements.weights.innerHTML, /% by mass/);
  assert.match(view.elements.feed.innerHTML, /<td>120<\/td>/);
  assert.match(view.elements.feed.innerHTML, /<td>200<\/td>/);
  assert.ok(view.saves >= 1);
});

test('requires a selection before solving', () => {
  const view = fixture();
  view.state.blend.ids = [];
  view.component.solve();
  assert.deepEqual(view.notices, [['Select at least one fertilizer.', 'warn']]);
  assert.equal(view.state.blend.result, null);
});

test('reports when a solved blend cannot be scaled to a nitrogen target', () => {
  const view = fixture();
  view.state.blend.ids = ['mkp-0-52-34'];
  view.component.solve();
  assert.match(view.elements.feed.innerHTML, /Blend contains no nitrogen\./);
  assert.doesNotMatch(view.elements.feed.innerHTML, /<td>120<\/td>/);
});
