'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const chemistry = require('../js/chemistry.js');
const productModel = require('../js/product-model.js');

function loadDatabase() {
  const context = vm.createContext({window: {}});
  const source = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.js'), 'utf8');
  vm.runInContext(source, context, {filename: 'data/products.js'});
  return {
    products: context.window.FERTILIZER_PRODUCTS,
    systems: context.window.FERTILIZER_SYSTEMS
  };
}

const {products, systems} = loadDatabase();
const format = (value, digits = 2) => Number(value).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
const catalog = productModel.createCatalog(products, systems, chemistry, format);

test('looks up products and systems by their distinct identifiers', () => {
  assert.equal(catalog.product('athena-pro-bloom-component').componentName, 'Bloom');
  assert.equal(catalog.system('athena-pro-bloom').program, 'Pro Bloom');
  assert.equal(catalog.product('missing'), undefined);
});

test('formats the agreed brand, program, formula, and part labels', () => {
  const system = catalog.system('jacks-321');
  assert.equal(catalog.entryTitle(system), "Jack's Nutrients — 3-2-1");
  assert.equal(catalog.displayFormula(system), '5-12-26 (A) + 15-0-0 (B) + Magnesium Sulfate (C)');
  assert.equal(catalog.displayParts(system), '3-part');
  assert.equal(
    catalog.exportLabel(system),
    "Jack's Nutrients — 3-2-1 | 5-12-26 (A) + 15-0-0 (B) + Magnesium Sulfate (C) | 3-part"
  );
});

test('falls back to label analysis when displayFormula is absent', () => {
  assert.equal(catalog.displayFormula({analysis: {N: 12, P2O5: 4, K2O: 16}}), '12-4-16');
});

test('resolves and combines multipart systems using default or custom parts', () => {
  const system = catalog.system('jacks-321');
  const defaults = catalog.mixSystem(system);
  const custom = catalog.mixSystem(system, [1, 1, 0]);
  assert.deepEqual(Array.from(defaults.parts), [3.6, 2.4, 1.1]);
  assert.equal(defaults.products.length, 3);
  assert.ok(Math.abs(defaults.analysis.N - 54 / 7.1) < 1e-12);
  assert.equal(custom.analysis.N, 10);
});

test('resolves optional comparison profiles separately from custom balances', () => {
  const system = catalog.system('jacks-2part-5-12-26');
  const veg = catalog.mixSystem(system, undefined, 'veg');
  const flower = catalog.mixSystem(system, undefined, 'flower');
  const custom = catalog.mixSystem(system, [1, 1], 'custom');
  assert.deepEqual(Array.from(veg.parts), [3.8, 2.5]);
  assert.deepEqual(Array.from(flower.parts), [5.68, 2.5]);
  assert.deepEqual(Array.from(custom.parts), [1, 1]);
  assert.equal(veg.profile.label, 'Veg');
  assert.equal(flower.profile.label, 'Flower');
  assert.equal(custom.profile, null);
  assert.notEqual(veg.analysis.P2O5, flower.analysis.P2O5);
});

test('volume-ratio systems retain density-based mass weighting', () => {
  const mix = catalog.mixSystem(catalog.system('athena-blended-veg'));
  assert.deepEqual(Array.from(mix.parts), [1, 1]);
  assert.ok(Math.abs(mix.massParts[0] - 1.179092) < 1e-12);
  assert.ok(Math.abs(mix.massParts[1] - 1.126368) < 1e-12);
  assert.notEqual(mix.weights[0], 0.5);
});

test('builds comparison entries in selected product-then-system order', () => {
  const entries = catalog.selectedCompareEntries(
    ['megacrop-11-5-14', 'jacks-5-12-26-a'],
    ['athena-pro-veg'],
    {}
  );
  assert.deepEqual(entries.map(entry => entry.id), ['megacrop-11-5-14', 'athena-pro-veg']);
  assert.equal(entries[0].kind, 'product');
  assert.equal(entries[1].kind, 'system');
  assert.equal(entries[1].mix.products.length, 2);
});

test('comparison entries retain the selected system profile identity', () => {
  const entries = catalog.selectedCompareEntries([], ['jacks-2part-5-12-26'], {}, {'jacks-2part-5-12-26': 'flower'});
  assert.equal(entries[0].profileId, 'flower');
  assert.equal(entries[0].profileLabel, 'Flower');
  assert.deepEqual(Array.from(entries[0].mix.parts), [5.68, 2.5]);
});

test('shortens part labels the line name already implies', () => {
  const {products, systems} = loadDatabase();
  const catalog = productModel.createCatalog(products, systems, chemistry, String);
  const bySystem = id => systems.find(system => system.id === id);
  assert.equal(catalog.displayFormula(bySystem('advanced-sensi-coco-bloom')), '4-0-0 (A) + 0-4-5 (B)');
  assert.equal(catalog.partLabel(bySystem('advanced-sensi-coco-bloom'), 'Bloom A'), 'A');
  assert.equal(catalog.partLabel({program: 'Blended Veg'}, 'Grow A'), 'Grow A');
  assert.equal(catalog.partLabel({program: 'Anything'}, 'Part B'), 'B');
  assert.equal(catalog.partLabel({program: 'Dual Fuel'}, 'Dual Fuel 2'), '2');
  assert.equal(catalog.partLabel({program: 'Pro Veg'}, 'Core'), 'Core');
});

test('leaves excluded parts out of a system mix and labels what is compared', () => {
  const {products, systems} = loadDatabase();
  const catalog = productModel.createCatalog(products, systems, chemistry, String);
  const system = systems.find(item => item.id === 'jacks-2part-5-12-26');
  const partA = products.find(item => item.id === system.components[0].productId);
  const mix = catalog.mixSystem(system, null, null, [1]);
  assert.deepEqual(mix.excluded, [1]);
  assert.equal(mix.weights[1], 0);
  assert.equal(mix.analysis.K2O, partA.analysis.K2O);
  assert.equal(mix.includedLabel, catalog.partLabel(system, system.components[0].label) + ' only');
  assert.equal(mix.parts.length, system.components.length, 'saved ratio is kept for the inputs');
  assert.deepEqual(catalog.mixSystem(system, null, null, [0, 1]).excluded, [], 'cannot exclude every part');
  assert.deepEqual(catalog.mixSystem(system, null, null, [7, -1, 'x']).excluded, []);
  const [entry] = catalog.selectedCompareEntries([], [system.id], {}, {}, {[system.id]: [1]});
  assert.match(catalog.exportLabel(entry), / only$/);
});
