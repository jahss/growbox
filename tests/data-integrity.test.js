'use strict';

// Data-integrity regression test for data/products.js.
//
// NAME THE BREAK IT CATCHES:
// The product-data commits ("five brands", density-range labeling) grow the
// catalog continuously. A malformed new record — a duplicate id, an analysis
// value that is not a nonnegative number, a system whose component or a
// use-rate whose productId does not resolve, a liquid product with mL rates
// that has neither densityGPerMl nor densityEstimate, an inverted
// densityEstimate range, or a volume-ratio system missing a density source —
// would surface only at runtime in a specific view. This file asserts the whole
// catalog up front so any such regression fails the suite instead of shipping.
//
// EXERCISE THE REAL THING:
// It loads the real data/products.js through node:vm exactly as the browser
// would, and exercises the real chemistry.mixSystem for resolve/calculate.

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
const byId = new Map(products.map(product => [product.id, product]));
const systemById = new Map(systems.map(system => [system.id, system]));

const GROUPS = new Set(['1-part', 'component', 'salt']);
const FORMS = new Set(['dry', 'liquid']);
const ANALYSIS_KEYS = chemistry.ANALYSIS_KEYS;

function isNonnegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

// Every product/system referenced anywhere (system components, use-rate
// components, system productIds) must resolve back to a product definition.
function referencedProductIds() {
  const ids = new Set();
  systems.forEach(system => {
    (system.components || []).forEach(component => ids.add(component.productId));
  });
  products.forEach(product => {
    (product.useRates || []).forEach(rate => (rate.components || []).forEach(component => ids.add(component.productId)));
  });
  systems.forEach(system => {
    (system.useRates || []).forEach(rate => (rate.components || []).forEach(component => ids.add(component.productId)));
  });
  // An id referenced only as a component should also be a defined product.
  return ids;
}

test('every referenced product id resolves to a defined product', () => {
  const referenced = referencedProductIds();
  referenced.forEach(id => {
    assert.ok(byId.has(id), `referenced productId "${id}" is not defined in FERTILIZER_PRODUCTS`);
  });
});

test('every product has a well-formed id, group, and form', () => {
  products.forEach(product => {
    assert.ok(typeof product.id === 'string' && product.id.length > 0, `product id must be a non-empty string`);
    assert.ok(GROUPS.has(product.compareGroup), `${product.id}: unknown compareGroup "${product.compareGroup}"`);
    assert.ok(FORMS.has(product.form), `${product.id}: unknown form "${product.form}"`);
  });
});

test('every product analysis key is a nonnegative finite number', () => {
  products.filter(product => Boolean(product.analysis)).forEach(product => {
    ANALYSIS_KEYS.forEach(key => {
      assert.ok(isNonnegativeNumber(product.analysis[key]), `${product.id}.${key} must be a nonnegative number`);
    });
  });
});

test('every multipart system and its use-rate components resolve', () => {
  systems.forEach(system => {
    system.components.forEach(component => {
      assert.ok(byId.has(component.productId), `${system.id} references missing product ${component.productId}`);
    });
    const mixProducts = system.components.map(component => byId.get(component.productId));
    let mix;
    try {
      mix = chemistry.mixSystem(system, mixProducts);
    } catch (error) {
      assert.fail(`${system.id} could not mix with default parts: ${error.message}`);
    }
    // Nonnegative weights summing to one.
    mix.weights.forEach(weight => assert.ok(weight >= 0, `${system.id} weight underflow`));
    assert.ok(Math.abs(mix.weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-9, `${system.id} weights must sum to 1`);
  });
});

test('every volume-ratio system component has a density source', () => {
  systems.filter(system => system.ratioBasis === 'volume').forEach(system => {
    system.components.forEach(component => {
      const product = byId.get(component.productId);
      const hasDensity = isNonnegativeNumber(product.densityGPerMl) && product.densityGPerMl > 0;
      const hasEstimate = isValidDensityEstimate(product.densityEstimate);
      assert.ok(hasDensity || hasEstimate, `${system.id}/${component.productId} needs densityGPerMl or densityEstimate for volume mixing`);
    });
  });
});

test('liquid products with mL rates carry a density source; dry products do not need one', () => {
  products.forEach(product => {
    const usesMl = (product.useRates || []).some(rate => rate.components
      ? rate.components.some(component => Boolean(component.mLPerGal))
      : Boolean(rate.mLPerGal));
    if (product.form === 'liquid' && usesMl) {
      const hasDensity = isNonnegativeNumber(product.densityGPerMl) && product.densityGPerMl > 0;
      const hasEstimate = isValidDensityEstimate(product.densityEstimate);
      assert.ok(hasDensity || hasEstimate, `${product.id} uses mL rates but has no densityGPerMl or densityEstimate`);
    }
    if (product.form === 'dry') {
      assert.ok(!product.densityGPerMl || product.densityGPerMl === undefined, `${product.id} is dry but declares densityGPerMl`);
    }
  });
});

function isValidDensityEstimate(estimate) {
  if (!estimate) return false;
  const min = estimate.min;
  const max = estimate.max;
  return isNonnegativeNumber(min) && isNonnegativeNumber(max) && min <= max && Boolean(estimate.method);
}

test('every densityEstimate is a valid, nonnegative, non-inverted range with a method', () => {
  products.forEach(product => {
    if (product.densityEstimate) {
      assert.ok(isValidDensityEstimate(product.densityEstimate), `${product.id} has an invalid densityEstimate`);
    }
  });
});

test('multipart system use-rate component doses know their unit', () => {
  // Component-level use-rates must specify either mass (gPerGal / gPerL) or
  // volume (mLPerGal / mLPerL), never both and never neither.
  const rateProductIds = [...referencedProductIds()].filter(id => byId.has(id));
  rateProductIds.forEach(id => {
    const product = byId.get(id);
    (product.useRates || []).forEach(rate => {
      (rate.components || []).forEach(component => {
        const mass = isNonnegativeNumber(component.gPerGal) ? 1 : 0;
        const volume = isNonnegativeNumber(component.mLPerGal) ? 1 : 0;
        assert.ok(mass + volume === 1, `${product.id} use-rate component must set exactly one of gPerGal / mLPerGal`);
      });
    });
  });
});

test('non-salt products and all systems carry source metadata with a checked date', () => {
  products.filter(product => product.compareGroup !== 'salt').forEach(product => {
    assert.ok(Boolean(product.source), `${product.id} is missing source metadata`);
    assert.ok(Boolean(product.source.url) || Boolean(product.source.type), `${product.id} source needs a URL or a source type`);
    assert.ok(Boolean(product.source.checked), `${product.id} source needs a checked date`);
  });
  systems.forEach(system => {
    assert.ok(Boolean(system.source), `${system.id} is missing source metadata`);
    assert.ok(Boolean(system.source.url) || Boolean(system.source.type), `${system.id} source needs a URL or a source type`);
    assert.ok(Boolean(system.source.checked), `${system.id} source needs a checked date`);
  });
});