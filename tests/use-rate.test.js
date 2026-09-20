'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const chemistry = require('../js/chemistry.js');
const stateModule = require('../js/state.js');
const productModel = require('../js/product-model.js');
const useRateModule = require('../js/use-rate.js');

function loadDatabase() {
  const context = vm.createContext({window: {}});
  const source = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.js'), 'utf8');
  vm.runInContext(source, context, {filename: 'data/products.js'});
  return {products: context.window.FERTILIZER_PRODUCTS, systems: context.window.FERTILIZER_SYSTEMS};
}

function fakeElement() {
  return {innerHTML: '', textContent: '', value: '', disabled: false, onchange: null, oninput: null};
}

function fixture() {
  const {products, systems} = loadDatabase();
  const ids = ['useRateProduct', 'useRatePreset', 'useRatePresetNote', 'useRateIdentity', 'useRateInputs', 'useRateSummary', 'useRateResult', 'useRateNitrogen'];
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
  const component = useRateModule.createComponent({
    document, products, systems, chemistry, catalog, format, escape,
    getState: () => state,
    save: () => { saves += 1; }
  });
  return {products, systems, catalog, elements, component, get state() { return state; }, get saves() { return saves; }};
}

test('offers volume units only when a liquid density is available', () => {
  assert.deepEqual(useRateModule.doseUnits({form: 'dry'}), ['g/gal', 'g/L']);
  assert.deepEqual(useRateModule.doseUnits({form: 'liquid'}), ['g/gal', 'g/L']);
  assert.deepEqual(useRateModule.doseUnits({form: 'liquid', densityGPerMl: 1.2}), ['g/gal', 'g/L', 'mL/gal', 'mL/L']);
});

test('resolves only complete one-part products and multipart systems', () => {
  const view = fixture();
  const product = useRateModule.resolveEntry('p:jacks-12-4-16', view.catalog);
  const system = useRateModule.resolveEntry('s:jacks-321', view.catalog);
  assert.equal(product.products.length, 1);
  assert.equal(system.products.length, 3);
  assert.equal(useRateModule.resolveEntry('p:jacks-5-12-26-a', view.catalog), null);
});

test('turns published system rates into editable component doses', () => {
  const view = fixture();
  const entry = useRateModule.resolveEntry('s:jacks-321', view.catalog);
  assert.deepEqual(useRateModule.presetDoses(entry, entry.useRates[0]), {
    'jacks-5-12-26-a': {amount: 3.6, unit: 'g/gal'},
    'jacks-15-0-0-b': {amount: 2.4, unit: 'g/gal'},
    'jacks-epsom': {amount: 1.1, unit: 'g/gal'}
  });
});

test('calculates multipart recipes from actual component doses', () => {
  const view = fixture();
  const entry = useRateModule.resolveEntry('s:jacks-321', view.catalog);
  const doses = useRateModule.presetDoses(entry, entry.useRates[0]);
  const result = useRateModule.calculateRecipe(entry, doses, chemistry);
  assert.ok(Math.abs(result.ppm.N - 142.6529) < 0.001);
  assert.ok(result.ppm.P > 49);
  assert.ok(result.ppm.K > 200);
  assert.ok(result.nitrogenForms.nitrateN > 142);
  assert.equal(result.lines.length, 3);
});

test('renders a one-program calculator without generic salts or loose components', () => {
  const view = fixture();
  view.component.render();
  assert.match(view.elements.useRateProduct.innerHTML, /optgroup label="1-Part"/);
  assert.match(view.elements.useRateProduct.innerHTML, /optgroup label="2-Part"/);
  assert.doesNotMatch(view.elements.useRateProduct.innerHTML, /mkp-0-52-34/);
  assert.doesNotMatch(view.elements.useRateProduct.innerHTML, /jacks-5-12-26-a/);
  assert.match(view.elements.useRateIdentity.innerHTML, /Jack&#39;s Nutrients — RO/);
  assert.match(view.elements.useRateInputs.innerHTML, /g\/gal/);
  assert.match(view.elements.useRateResult.innerHTML, /N ppm/);
});

test('applies a liquid manufacturer preset using density-aware volume doses', () => {
  const view = fixture();
  view.state.useRate.selection = 's:athena-blended-veg';
  view.state.useRate.preset = 'custom';
  view.component.render();
  assert.equal(view.component.applyPreset(0), true);
  view.component.render();
  assert.deepEqual(view.state.useRate.doses['athena-grow-a'], {amount: 11, unit: 'mL/gal'});
  assert.deepEqual(view.state.useRate.doses['athena-grow-b'], {amount: 11, unit: 'mL/gal'});
  assert.match(view.elements.useRateInputs.innerHTML, /mL\/gal/);
  assert.ok(view.component.currentResult().totalGPerLiter > 6);
  assert.ok(view.saves >= 1);
});

test('applying a preset clears stale doses for omitted components', () => {
  const view = fixture();
  view.state.useRate.selection = 's:jacks-321';
  view.component.render();
  view.state.useRate.doses['jacks-epsom'] = {amount: 9, unit: 'g/gal'};
  const entry = view.component.currentEntry();
  entry.useRates.push({label: 'Two components', components: [
    {productId: 'jacks-5-12-26-a', gPerGal: 3},
    {productId: 'jacks-15-0-0-b', gPerGal: 2}
  ]});
  view.component.applyPreset(entry.useRates.length - 1);
  assert.deepEqual(view.state.useRate.doses['jacks-epsom'], {amount: 0, unit: 'g/gal'});
});

test('exports the calculated recipe and its normalized component doses', () => {
  const view = fixture();
  const rows = view.component.csvRows();
  assert.equal(rows[0][0], 'Program');
  assert.match(rows[1][0], /Jack's Nutrients — RO/);
  assert.deepEqual(rows[3], ['Component', 'Entered rate', 'Unit', 'Normalized g/L']);
  assert.equal(rows[4][2], 'g/gal');
});
