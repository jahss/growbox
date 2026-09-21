'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const chemistry = require('../js/chemistry.js');
const stateModule = require('../js/state.js');
const productModel = require('../js/product-model.js');
const compareModule = require('../js/compare.js');

function loadDatabase() {
  const context = vm.createContext({window: {}});
  const source = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.js'), 'utf8');
  vm.runInContext(source, context, {filename: 'data/products.js'});
  return {products: context.window.FERTILIZER_PRODUCTS, systems: context.window.FERTILIZER_SYSTEMS};
}

function fakeElement() {
  const classes = new Map();
  return {
    innerHTML: '', textContent: '', value: '', disabled: false, onchange: null, onclick: null,
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
  const ids = ['productPicker', 'compareCount', 'selectedLines', 'nLevel', 'percentView', 'ppmView', 'nControl', 'comparisonHeading', 'analysisCompare'];
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
  const component = compareModule.createComponent({
    document, products, systems, chemistry, catalog, format, escape,
    getState: () => state,
    save: () => { saves += 1; },
    notify: (...args) => notices.push(args)
  });
  return {products, systems, catalog, elements, component, get state() { return state; }, set state(value) { state = value; }, get saves() { return saves; }, notices};
}

test('highlights unequal extrema but not an all-equal column', () => {
  const rows = [{values: {N: 1}}, {values: {N: 2}}, {values: {N: 2}}];
  assert.equal(compareModule.highlightClass(rows, 'N', 0), 'lo');
  assert.equal(compareModule.highlightClass(rows, 'N', 1), 'hi');
  assert.equal(compareModule.highlightClass([{values: {N: 2}}, {values: {N: 2}}], 'N', 0), '');
});

test('identifies a sole nitrogen-bearing component', () => {
  assert.equal(compareModule.soleNitrogenSourceIndex([
    {analysis: {N: 0}}, {analysis: {N: 15}}
  ]), 1);
  assert.equal(compareModule.soleNitrogenSourceIndex([
    {analysis: {N: 5}}, {analysis: {N: 15}}
  ]), -1);
});

test('renders grouped complete-line choices and the three default selections', () => {
  const view = fixture();
  view.component.render();
  assert.equal(view.elements.compareCount.textContent, '3 / 5 selected');
  assert.match(view.elements.productPicker.innerHTML, /optgroup label="1-Part"/);
  assert.match(view.elements.productPicker.innerHTML, /optgroup label="2-Part"/);
  assert.doesNotMatch(view.elements.productPicker.innerHTML, /MKP 0-52-34/);
  assert.match(view.elements.selectedLines.innerHTML, /Mega Crop — 1-Part/);
  assert.match(view.elements.selectedLines.innerHTML, /Athena — Pro Veg/);
});

test('renders standardized elemental ppm for each selected line', () => {
  const view = fixture();
  view.component.render();
  assert.equal(view.elements.comparisonHeading.textContent, 'Elemental ppm @ 160 ppm N');
  assert.match(view.elements.analysisCompare.innerHTML, /N ppm/);
  assert.match(view.elements.analysisCompare.innerHTML, /Core [\d.]+ g\/gal/);
});

test('comparison controls update mode, nitrogen target, and selection state', () => {
  const view = fixture();
  view.component.render();
  view.elements.percentView.onclick();
  assert.equal(view.state.compareMode, 'percent');
  assert.equal(view.elements.comparisonHeading.textContent, 'Guaranteed analysis (%)');

  view.elements.ppmView.onclick();
  view.elements.nLevel.onchange({target: {value: '180'}});
  assert.equal(view.state.n, 180);
  assert.equal(view.elements.comparisonHeading.textContent, 'Elemental ppm @ 180 ppm N');

  view.elements.productPicker.onchange({target: {value: 'p:jacks-15-5-20-tap'}});
  assert.ok(view.state.compare.includes('jacks-15-5-20-tap'));
  assert.equal(view.elements.compareCount.textContent, '4 / 5 selected');
  assert.ok(view.saves >= 4);
});

test('selectedEntries exposes complete programs for exports', () => {
  const view = fixture();
  const entries = view.component.selectedEntries();
  assert.deepEqual(entries.map(entry => entry.id), ['megacrop-11-5-14', 'jacks-12-4-16', 'athena-pro-veg']);
  assert.equal(entries[2].mix.products.length, 2);
});

test('explains why Part B stays fixed for zero-nitrogen Part A systems', () => {
  const view = fixture();
  view.state.compare = [];
  view.state.systemCompare = ['jacks-2part-0-12-26'];
  view.component.render();
  assert.match(view.elements.selectedLines.innerHTML, /only nitrogen source/);
  assert.match(view.elements.selectedLines.innerHTML, /fixed by the selected N target/);
  assert.match(view.elements.analysisCompare.innerHTML, /Part B [\d.]+ g\/gal \(sets N target\)/);
});

test('Part B dose is invariant when a zero-nitrogen Part A balance changes at fixed N', () => {
  const view = fixture();
  const system = view.systems.find(item => item.id === 'jacks-2part-0-12-26');
  const partBDoses = [[3.7, 1], [3.7, 5]].map(parts => {
    const mix = view.catalog.mixSystem(system, parts);
    const totalDose = chemistry.standardizedNitrogenDose(mix.analysis, 160);
    return totalDose * mix.weights[1];
  });
  assert.ok(Math.abs(partBDoses[0] - partBDoses[1]) < 1e-12);
});

test('switches Fast Track between Veg, Flower, and Custom comparison profiles', () => {
  const view = fixture();
  view.state.compare = [];
  view.state.systemCompare = ['jacks-2part-5-12-26'];
  view.component.render();
  assert.match(view.elements.selectedLines.innerHTML, /Comparison profile/);
  assert.match(view.elements.selectedLines.innerHTML, /2-part · Veg profile/);
  assert.match(view.elements.selectedLines.innerHTML, />Veg<\/option>/);
  assert.match(view.elements.selectedLines.innerHTML, />Flower<\/option>/);
  assert.equal(view.component.selectedEntries()[0].profileLabel, 'Veg');

  assert.equal(view.component.setSystemProfile('jacks-2part-5-12-26', 'flower'), true);
  assert.equal(view.state.systemProfiles['jacks-2part-5-12-26'], 'flower');
  assert.deepEqual(Array.from(view.component.selectedEntries()[0].mix.parts), [5.68, 2.5]);
  assert.match(view.elements.selectedLines.innerHTML, /2-part · Flower profile/);
  assert.match(view.elements.analysisCompare.innerHTML, /Flower profile/);

  assert.equal(view.component.setSystemProfile('jacks-2part-5-12-26', 'custom'), true);
  assert.equal(view.state.systemProfiles['jacks-2part-5-12-26'], 'custom');
  assert.deepEqual(view.state.systemParts['jacks-2part-5-12-26'], [5.68, 2.5]);
  assert.match(view.elements.selectedLines.innerHTML, /class="spr"/);
});

test('labels the unchanged 3-2-1 recipe as an All stages profile', () => {
  const view = fixture();
  view.state.compare = [];
  view.state.systemCompare = ['jacks-321'];
  view.component.render();
  assert.match(view.elements.selectedLines.innerHTML, />All stages<\/option>/);
  assert.equal(view.component.selectedEntries()[0].profileLabel, 'All stages');
});
