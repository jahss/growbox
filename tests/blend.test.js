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
  const ids = ['blendTarget', 'blendLevel', 'blendElement', 'blendLevelControl', 'blendSourcePicker', 'blendSources', 'blendInputs', 'blendResult', 'fit', 'weights', 'blendVsTarget', 'blendClosest', 'feed', 'solve'];
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

const fmt = (value, digits = 2) => Number.isFinite(Number(value))
  ? Number(value).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1')
  : '—';

test('target fields are elemental ppm for all twelve elements', () => {
  assert.deepEqual(blendModule.FIELDS.map(field => field[0]), ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo']);
  const view = fixture();
  view.component.render();
  assert.match(view.elements.blendInputs.innerHTML, /N ppm<input class="bi" data-k="N"/);
  assert.match(view.elements.blendInputs.innerHTML, /data-k="Fe"[^>]*placeholder="no target" value=""/);
  assert.doesNotMatch(view.elements.blendInputs.innerHTML, /P2O5|K2O/);
});

test('delivered vs target boxes show ppm, target and difference; untargeted elements are marked', () => {
  const html = blendModule.versusTargetHtml({N: 160, P: 40, K: 200, Fe: 1.5, Mo: 0.0004}, {N: 160, P: 50, K: 200, Fe: 1.5, Mo: 0}, fmt);
  assert.match(html, /cmp-chip diff-ok"><small>N<\/small><b>160<\/b><small>target 160<br>±0<\/small>/);
  assert.match(html, /cmp-chip diff-off"><small>P<\/small><b>40<\/b><small>target 50<br>−10<\/small>/);
  assert.match(html, /<small>Fe<\/small><b>1\.5<\/b><small>target 1\.5<br>±0/);
  assert.match(html, /<small>Mo<\/small><b>0<\/b><small>no target<\/small>/);
  assert.match(blendModule.versusTargetHtml({Mo: 0.0036}, {Mo: 0.004}, fmt), /target 0\.004<br>±0/);
});

test('source picker groups commercial products, system parts and salts; chosen sources are listed', () => {
  const view = fixture();
  view.component.render();
  const picker = view.elements.blendSourcePicker.innerHTML;
  assert.match(picker, /optgroup label="1-Part products"/);
  assert.match(picker, /optgroup label="System parts"/);
  assert.match(picker, /optgroup label="Salts"/);
  assert.match(view.elements.blendSources.innerHTML, /Jack&#39;s Nutrients — 12-4-16/);
  assert.match(view.elements.blendSources.innerHTML, /class="removeSource" data-id="mkp-0-52-34"/);
  assert.doesNotMatch(picker, /value="mkp-0-52-34"/);
  view.elements.blendSourcePicker.onchange({target: {value: 'magnesium-sulfate'}});
  assert.equal(view.state.blend.ids.filter(id => id === 'magnesium-sulfate').length, 1);
});

test('target product fills its ppm at the chosen level of N, P or K', () => {
  const view = fixture();
  view.component.render();
  const options = view.elements.blendTarget.innerHTML;
  assert.match(options, /<option value="">Custom — enter ppm below<\/option>/);
  assert.match(options, /value="s:athena-pro-bloom"/);
  assert.doesNotMatch(options, /mkp-0-52-34/, 'salts are sources, not targets');
  assert.equal(view.elements.blendLevelControl.classList.contains('hidden'), true);

  view.elements.blendTarget.onchange({target: {value: 's:athena-pro-bloom'}});
  const analysis = view.catalog.mixSystem(view.catalog.system('athena-pro-bloom')).analysis;
  const expected = chemistry.ppmAtDose(analysis, chemistry.standardizedDose(analysis, 'N', 160));
  assert.equal(view.state.blend.targetId, 's:athena-pro-bloom');
  assert.ok(Math.abs(view.state.blend.target.N - 160) < 1e-9);
  assert.ok(Math.abs(view.state.blend.target.K - expected.K) < 1e-9);
  assert.ok(Math.abs(view.state.blend.target.Fe - expected.Fe) < 1e-9);
  assert.equal(view.elements.blendLevelControl.classList.contains('hidden'), false);

  view.elements.blendElement.onchange({target: {value: 'K'}});
  assert.equal(view.state.blend.targetElement, 'K');
  assert.ok(Math.abs(view.state.blend.target.K - 160) < 1e-9);
  view.elements.blendLevel.onchange({target: {value: '200'}});
  assert.ok(Math.abs(view.state.blend.target.K - 200) < 1e-9);

  view.elements.blendTarget.onchange({target: {value: ''}});
  assert.equal(view.state.blend.targetId, '');
  assert.ok(Math.abs(view.state.blend.target.K - 200) < 1e-9, 'switching to Custom keeps the current values');
});

test('solves g/gal per source, lists the recipe, and scales the feed chart', () => {
  const view = fixture();
  view.component.render();
  view.elements.solve.onclick();
  const result = view.state.blend.result;
  assert.deepEqual(result.ids, view.state.blend.ids);
  assert.equal(result.doses.length, result.ids.length);
  result.doses.forEach(dose => assert.ok(dose >= 0));
  assert.equal(view.elements.blendResult.classList.contains('hidden'), false);
  assert.match(view.elements.fit.innerHTML, /Fit to target: <span class="fit-badge fit-(good|fair|poor)"><b>[\d.]+% match<\/b><small>[\d.]+% different<\/small>/);
  assert.match(view.elements.weights.innerHTML, /<small class="muted">Jack&#39;s Nutrients<\/small><b>[^<]+<\/b><span>[\d.]+ g\/gal/);
  assert.match(view.elements.feed.innerHTML, /<b class="cmp-name">120 ppm N<\/b>/);
  assert.match(view.elements.feed.innerHTML, /<li>Jack&#39;s Nutrients [^—]+ — <b>[\d.]+ g\/gal/);
  assert.equal((view.elements.blendVsTarget.innerHTML.match(/class="cmp-chip/g) || []).length, 12);
  assert.equal((view.elements.blendClosest.innerHTML.match(/class="selected-line"/g) || []).length, 3);
  assert.ok(view.saves >= 1);
});

test('requires sources and at least one target ppm before solving', () => {
  const view = fixture();
  view.state.blend.ids = [];
  view.component.solve();
  assert.deepEqual(view.notices, [['Add at least one fertilizer or salt you have.', 'warn']]);
  assert.equal(view.state.blend.result, null);
  const empty = fixture();
  Object.keys(empty.state.blend.target).forEach(key => { empty.state.blend.target[key] = 0; });
  empty.component.solve();
  assert.deepEqual(empty.notices, [['Enter at least one target ppm.', 'warn']]);
});

test('reports when a solved blend cannot be scaled to a nitrogen target', () => {
  const view = fixture();
  view.state.blend.ids = ['mkp-0-52-34'];
  view.component.solve();
  assert.match(view.elements.feed.innerHTML, /Blend contains no nitrogen\./);
  assert.doesNotMatch(view.elements.feed.innerHTML, /120 ppm N/);
});

test('a program reproduced from its own parts matches exactly and ranks first', () => {
  const view = fixture();
  view.component.render();
  view.elements.blendTarget.onchange({target: {value: 's:athena-pro-bloom'}});
  view.state.blend.ids = view.catalog.system('athena-pro-bloom').components.map(component => component.productId);
  view.component.solve();
  assert.ok(view.state.blend.result.rms < 1e-6, 'its own parts reproduce the target ppm');
  assert.match(view.elements.fit.innerHTML, /fit-good"><b>100% match/);
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

test('"Enter your own product" saves a custom product and adds it to the sources', () => {
  const {products, systems} = loadDatabase();
  const ids = ['blendTarget', 'blendLevel', 'blendElement', 'blendLevelControl', 'blendSourcePicker', 'blendSources', 'blendInputs', 'blendResult', 'fit', 'weights', 'blendVsTarget', 'blendClosest', 'feed', 'solve', 'blendCustomToggle', 'blendCustomForm', 'blendCustomName', 'blendCustomAdd', 'blendCustomCancel'];
  const elements = Object.fromEntries(ids.map(id => [id, fakeElement()]));
  elements.blendCustomForm.classList.add('hidden');
  const inputs = [['N', '3'], ['P2O5', '1'], ['K2O', '5'], ['Ca', ''], ['densityGPerMl', '1.2']].map(([k, value]) => ({dataset: {k}, value}));
  const document = {getElementById: id => elements[id], querySelectorAll: selector => selector === '.bci' ? inputs : []};
  const format = (value, digits = 2) => Number(value).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
  const catalog = productModel.createCatalog(products, systems, chemistry, format);
  const state = stateModule.normalizeState(stateModule.freshState(), products, systems);
  const notices = [];
  let refreshed = 0;
  const component = blendModule.createComponent({
    document, products, systems, chemistry, solver, catalog, format, escape: String, levels: [160],
    getState: () => state, save() {}, notify: (...args) => notices.push(args),
    saveCustomProduct: stateModule.saveCustomProduct,
    onCustomProducts: () => { refreshed += 1; catalog.setCustomProducts(state.customProducts); }
  });
  component.render();
  elements.blendCustomToggle.onclick();
  assert.equal(elements.blendCustomForm.classList.contains('hidden'), false);
  assert.match(elements.blendCustomForm.innerHTML, /class="bci" data-k="P2O5"/);
  elements.blendCustomName.value = 'Local cal-mag';
  elements.blendCustomAdd.onclick();
  assert.equal(state.customProducts.length, 1);
  assert.equal(state.customProducts[0].name, 'Local cal-mag');
  assert.equal(state.customProducts[0].densityGPerMl, 1.2);
  assert.ok(state.blend.ids.includes(state.customProducts[0].id));
  assert.equal(refreshed, 1);
  assert.equal(elements.blendCustomForm.classList.contains('hidden'), true);
  assert.match(elements.blendSources.innerHTML, /Custom — Local cal-mag/);
  assert.match(notices.at(-1)[0], /Added “Local cal-mag” to what you have/);

  inputs.forEach(input => { input.value = ''; });
  elements.blendCustomAdd.onclick();
  assert.match(notices.at(-1)[0], /Enter the label analysis first/);
});
