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
  const classes = new Set();
  return {innerHTML: '', textContent: '', value: '', disabled: false, checked: false, onchange: null, oninput: null,
    classList: {toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }, contains: name => classes.has(name)}};
}

function fixture() {
  const {products, systems} = loadDatabase();
  const ids = ['useRateProduct', 'useRatePreset', 'useRatePresetNote', 'useRateIdentity', 'useRateInputs', 'useRateSummary', 'useRateResult', 'useRateNitrogen', 'useRateCopy', 'useRateWaterNote', 'waterInputs', 'waterSummary', 'waterRo'];
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
    'magnesium-sulfate': {amount: 1.1, unit: 'g/gal'}
  });
});

test('provides distinct official Fast Track Veg and Flower presets', () => {
  const view = fixture();
  const entry = useRateModule.resolveEntry('s:jacks-2part-5-12-26', view.catalog);
  assert.deepEqual(useRateModule.presetDoses(entry, entry.useRates[0]), {
    'jacks-5-12-26-a': {amount: 3.8, unit: 'g/gal'},
    'jacks-15-0-0-b': {amount: 2.5, unit: 'g/gal'}
  });
  assert.deepEqual(useRateModule.presetDoses(entry, entry.useRates[1]), {
    'jacks-5-12-26-a': {amount: 5.68, unit: 'g/gal'},
    'jacks-15-0-0-b': {amount: 2.5, unit: 'g/gal'}
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
  assert.equal(view.elements.useRateIdentity.textContent, '12-4-16 · 1-part');
  assert.match(view.elements.useRateInputs.innerHTML, /g\/gal/);
  assert.match(view.elements.useRateResult.innerHTML, /<small>N<\/small><b>200<\/b>/);
  assert.match(view.elements.useRateResult.innerHTML, /<small>Mo<\/small>/);
});

test('choosing a program loads its first published rate', () => {
  const view = fixture();
  view.component.render();
  view.elements.useRateProduct.onchange({target: {value: 's:athena-pro-bloom'}});
  assert.equal(view.state.useRate.preset, '0');
  assert.deepEqual(view.state.useRate.doses['athena-pro-core'], {amount: 1.4, unit: 'g/gal'});
  assert.match(view.elements.useRateIdentity.textContent, /parts mixed by weight/);
  view.elements.useRateProduct.onchange({target: {value: 'p:megacrop-11-5-14'}});
  assert.equal(view.state.useRate.preset, 'custom');
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
  view.state.useRate.doses['magnesium-sulfate'] = {amount: 9, unit: 'g/gal'};
  const entry = view.component.currentEntry();
  entry.useRates.push({label: 'Two components', components: [
    {productId: 'jacks-5-12-26-a', gPerGal: 3},
    {productId: 'jacks-15-0-0-b', gPerGal: 2}
  ]});
  view.component.applyPreset(entry.useRates.length - 1);
  assert.deepEqual(view.state.useRate.doses['magnesium-sulfate'], {amount: 0, unit: 'g/gal'});
});

test('copies the delivered ppm to the Blend finder as a custom target', () => {
  const view = fixture();
  view.component.render();
  view.state.blend.targetId = 's:athena-pro-bloom';
  view.state.blend.result = {stale: true};
  view.elements.useRateCopy.onclick();
  const ppm = view.component.currentResult().ppm;
  assert.equal(view.state.blend.target.N, ppm.N);
  assert.equal(view.state.blend.target.Mo, ppm.Mo);
  const forms = view.component.currentResult().nitrogenForms;
  assert.ok(view.state.blend.target.nitrateN > 0);
  assert.equal(view.state.blend.target.nitrateN, forms.nitrateN);
  assert.equal(view.state.blend.target.ammoniacalN, forms.ammoniacalN);
  assert.equal(view.state.blend.targetId, '');
  assert.equal(view.state.blend.result, null);
});

test('N-form cards show unpublished N and the ammonium share', () => {
  const html = useRateModule.nitrogenFormsHtml({nitrateN: 90, ammoniacalN: 10}, 150, (v, d) => String(+Number(v).toFixed(d)), v => v);
  assert.match(html, /<b>50 ppm<\/b><span>Form not published/);
  assert.match(html, /Ammonium is 6\.7% of N \(some N has no published form\)\. Most hydro recipes keep ammonium under about 10–15% of N\./);
  assert.match(useRateModule.nitrogenFormsHtml({}, 150, String, v => v), /No N-form breakdown/);
});

test('exports the calculated recipe and its normalized component doses', () => {
  const view = fixture();
  const rows = view.component.csvRows();
  assert.equal(rows[0][0], 'Program');
  assert.match(rows[1][0], /Jack's Nutrients — RO/);
  assert.deepEqual(rows[3], ['Component', 'Entered rate', 'Unit', 'Normalized g/L']);
  assert.equal(rows[4][2], 'g/gal');
});

test('source water: RO adds nothing; entered values add to the totals and carry to Blend', () => {
  assert.deepEqual(useRateModule.waterPpm({ro: true, values: {Ca: 40}}), {});
  assert.deepEqual(useRateModule.waterPpm({ro: false, values: {Ca: 40, Na: 25, alkalinity: 120}}), {Ca: 40, Na: 25, alkalinity: 120});
  const view = fixture();
  view.state.water = {ro: false, values: {Ca: 40, Mg: 10, nitrateN: 5, N: 5, Na: 25, alkalinity: 120, ec: 0.4}};
  view.component.render();
  const nutrients = view.component.currentResult().ppm;
  assert.match(view.elements.useRateResult.innerHTML, new RegExp('<small>Ca</small><b>' + (Math.round((nutrients.Ca + 40) * 10) / 10) + '</b><small>\\+40 water</small>'));
  assert.match(view.elements.useRateWaterNote.textContent, /Na 25 ppm · alkalinity 120 ppm CaCO₃ · EC 0\.4 mS\/cm/);
  view.elements.useRateCopy.onclick();
  assert.equal(view.state.blend.target.Ca, nutrients.Ca + 40, 'Blend target is the total in solution');
  assert.equal(view.state.blend.target.nitrateN, view.component.currentResult().nitrogenForms.nitrateN + 5);
});
