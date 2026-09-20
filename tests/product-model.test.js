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
