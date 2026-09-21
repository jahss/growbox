'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const chemistry = require('../js/chemistry.js');

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

test('product and system identifiers are unique', () => {
  const ids = [...products.map(product => product.id), ...systems.map(system => system.id)];
  assert.equal(new Set(ids).size, ids.length);
});

test('all product analyses contain nonnegative numeric values', () => {
  products.forEach(product => {
    chemistry.ANALYSIS_KEYS.forEach(key => {
      const value = product.analysis[key];
      assert.equal(typeof value, 'number', `${product.id}.${key} must be numeric`);
      assert.ok(Number.isFinite(value) && value >= 0, `${product.id}.${key} must be nonnegative`);
    });
  });
});

test('commercial products and components retain source metadata', () => {
  products.filter(product => product.compareGroup !== 'salt').forEach(product => {
    assert.ok(product.source, `${product.id} is missing source metadata`);
    assert.ok(product.source.url || product.source.type, `${product.id} source needs a URL or source type`);
    assert.ok(product.source.checked, `${product.id} source needs a checked date`);
  });
});

test('every multipart system resolves and calculates with its default ratio', () => {
  const byId = new Map(products.map(product => [product.id, product]));
  systems.forEach(system => {
    assert.equal(system.partCount, system.components.length, `${system.id} partCount mismatch`);
    const componentProducts = system.components.map(component => {
      const product = byId.get(component.productId);
      assert.ok(product, `${system.id} references missing product ${component.productId}`);
      return product;
    });
    const mix = chemistry.mixSystem(system, componentProducts);
    assert.ok(Math.abs(mix.weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
  });
});

test('volume-ratio systems have verified positive component densities', () => {
  const byId = new Map(products.map(product => [product.id, product]));
  systems.filter(system => system.ratioBasis === 'volume').forEach(system => {
    system.components.forEach(component => {
      const product = byId.get(component.productId);
      assert.ok(product.densityGPerMl > 0, `${system.id}/${component.productId} needs densityGPerMl`);
    });
  });
});

test("affected Jack's records use official current sources without inventing a 0-12-26 preset", () => {
  const byId = new Map(products.map(product => [product.id, product]));
  const systemsById = new Map(systems.map(system => [system.id, system]));
  const zeroPartA = byId.get('jacks-0-12-26-a');
  const partB = byId.get('jacks-15-0-0-b');
  const fastTrack = systemsById.get('jacks-2part-5-12-26');
  const zeroSystem = systemsById.get('jacks-2part-0-12-26');

  assert.match(zeroPartA.source.url, /^https:\/\/www\.jacksnutrients\.com\//);
  assert.equal(zeroPartA.useRates.length, 0);
  assert.equal(partB.useRates[0].gPerGal, 2.5);
  assert.equal(partB.rateSource.type, 'official-feed-chart');
  assert.deepEqual(Array.from(fastTrack.components, component => component.defaultParts), [3.8, 2.5]);
  assert.deepEqual(Array.from(fastTrack.useRates, rate => Array.from(rate.components, component => component.gPerGal)), [[3.8, 2.5], [5.68, 2.5]]);
  assert.match(fastTrack.useRates[0].label, /Veg/);
  assert.match(fastTrack.useRates[1].label, /Flower/);
  assert.equal(fastTrack.source.type, 'official-feed-chart');
  assert.equal(zeroSystem.useRates.length, 0);
  assert.equal(zeroSystem.ratioSource.type, 'user-supplied-manufacturer-label');
});
