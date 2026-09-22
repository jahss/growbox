'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const mix = require('../js/mix.js');

const closeTo = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' vs ' + expected);
const context = vm.createContext({window: {}});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'products.js'), 'utf8'), context);
const byId = new Map(context.window.FERTILIZER_PRODUCTS.map(product => [product.id, product]));

const core = byId.get('athena-pro-core');
const bloom = byId.get('athena-pro-bloom-component');

test('reservoir: g/gal × tank size, in gal or L; liquids also in mL', () => {
  const amounts = mix.reservoirAmounts([{product: core, gPerGal: 4.6}, {product: bloom, gPerGal: 7.7}], 100, 'gal');
  closeTo(amounts.items[0].grams, 460);
  closeTo(amounts.items[1].grams, 770);
  closeTo(amounts.totalGrams, 1230);
  const litres = mix.reservoirAmounts([{product: core, gPerGal: 4.6}], 378.5411784, 'L');
  closeTo(litres.items[0].grams, 460, 1e-6);
  const liquid = mix.reservoirAmounts([{product: {analysis: {N: 4}, form: 'liquid', densityGPerMl: 1.25}, gPerGal: 12.5}], 10, 'gal');
  closeTo(liquid.items[0].mL, 100);
});

test('stock: calcium in A, sulfates and phosphates in B, the rest with calcium', () => {
  const plan = mix.stockPlan([
    {product: byId.get('calcium-nitrate'), gPerGal: 3},
    {product: byId.get('potassium-nitrate'), gPerGal: 1},
    {product: byId.get('magnesium-sulfate'), gPerGal: 2},
    {product: byId.get('mkp-0-52-34'), gPerGal: 0.5}
  ], {ratio: 100, stockSize: 50, stockUnit: 'gal', heads: 2});
  assert.deepEqual(plan.tanks.map(tank => [tank.name, tank.items.map(item => item.product.id)]), [
    ['A', ['calcium-nitrate', 'potassium-nitrate']],
    ['B', ['magnesium-sulfate', 'mkp-0-52-34']]
  ]);
  closeTo(plan.tanks[0].items[0].grams, 3 * 100 * 50);
  closeTo(plan.feedVolume, 5000);
  assert.equal(plan.conflict, false);
});

test('stock: no calcium or no sulfate/phosphate means one tank; one head with a split is a conflict', () => {
  const single = mix.stockPlan([{product: byId.get('mkp-0-52-34'), gPerGal: 1}, {product: byId.get('potassium-nitrate'), gPerGal: 1}], {ratio: 100, stockSize: 50, stockUnit: 'gal', heads: 1});
  assert.deepEqual(single.tanks.map(tank => tank.name), ['Stock']);
  assert.equal(single.conflict, false);
  const clash = mix.stockPlan([{product: byId.get('calcium-nitrate'), gPerGal: 3}, {product: byId.get('magnesium-sulfate'), gPerGal: 2}], {ratio: 100, stockSize: 50, stockUnit: 'gal', heads: 1});
  assert.equal(clash.conflict, true);
});

test('stock strength: over a salt’s solubility is too strong, over 80% is close, unknown for products without data', () => {
  const plan = mix.stockPlan([
    {product: byId.get('mkp-0-52-34'), gPerGal: 7.2},
    {product: byId.get('potassium-sulfate'), gPerGal: 5},
    {product: byId.get('potassium-nitrate'), gPerGal: 1},
    {product: bloom, gPerGal: 7.7}
  ], {ratio: 100, stockSize: 189.2705892, stockUnit: 'L', heads: 2});
  const item = id => plan.tanks.flatMap(tank => tank.items).find(entry => entry.product.id === id);
  // Stock strength is g/gal × ratio per gallon of stock, whatever the tank size.
  closeTo(item('mkp-0-52-34').gPerL, 7.2 * 100 / 3.785411784);
  assert.equal(item('mkp-0-52-34').strength, 'close', '190 g/L against about 226');
  assert.equal(item('potassium-sulfate').strength, 'over', '132 g/L against about 111');
  assert.equal(item('potassium-nitrate').strength, 'ok');
  assert.equal(item('athena-pro-bloom-component').strength, 'unknown');
  closeTo(plan.feedVolume, 18927.05892, 1e-6);
  assert.equal(plan.feedUnit, 'L');
});

test('every raw salt has a solubility for stock-strength checks', () => {
  context.window.FERTILIZER_PRODUCTS.filter(product => product.compareGroup === 'salt').forEach(salt => {
    assert.ok(salt.solubilityGPerL > 0, salt.id + ' needs solubilityGPerL');
  });
});

test('the card renders reservoir amounts, then A/B stock tanks with strength notes', () => {
  const box = {innerHTML: ''};
  const state = {mix: {mode: 'reservoir', tankSize: 100, tankUnit: 'gal', ratio: 100, heads: 2, stockSize: 50, stockUnit: 'gal'}};
  const format = (value, digits = 2) => Number(value).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
  const card = mix.createComponent({document: {getElementById: () => box}, format, escape: String, getState: () => state});
  const lines = [{product: core, gPerGal: 4.6, label: '14-0-0 (Core)'}, {product: bloom, gPerGal: 7.7, label: '0-12-24 (Bloom)'}];
  card.render('urMix', lines);
  assert.match(box.innerHTML, /Weigh out for 100 gal/);
  assert.match(box.innerHTML, /Athena<\/small><br>14-0-0 \(Core\)<\/span><b>460 g<\/b>/);
  assert.match(box.innerHTML, /Total by weight<\/span><b>1\.23 kg<\/b>/);
  state.mix.mode = 'stock';
  card.render('urMix', lines);
  assert.match(box.innerHTML, /makes 5,000 gal of feed/);
  assert.match(box.innerHTML, /Only use products whose label allows stock solutions/);
  assert.match(box.innerHTML, /<h3>Calcium tank<\/h3>[^]*23 kg[^]*<h3>Sulfate \/ phosphate tank<\/h3>[^]*38\.5 kg/);
  assert.match(box.innerHTML, /203 g\/L in the stock\. No published solubility/);
  state.mix.heads = 1;
  card.render('urMix', lines);
  assert.match(box.innerHTML, /needs 2 stock tanks[^<]*you have 1 injector head\./);
});

test('a product with calcium and sulfate/phosphate gets its own tank; more tanks than heads is a conflict', () => {
  const lines = ['jacks-12-4-16', 'jacks-15-0-0-b', 'mkp-0-52-34'].map(id => ({product: byId.get(id), gPerGal: 1}));
  const plan = mix.stockPlan(lines, {ratio: 100, stockSize: 50, stockUnit: 'gal', heads: 3});
  assert.deepEqual(plan.tanks.map(tank => [tank.name, tank.role, tank.items.map(item => item.product.id)]), [
    ['A', 'calcium', ['jacks-15-0-0-b']],
    ['B', 'sulfates · phosphates', ['mkp-0-52-34']],
    ['C', 'mixed on its own', ['jacks-12-4-16']]
  ]);
  assert.equal(plan.conflict, false);
  assert.equal(mix.stockPlan(lines, {ratio: 100, stockSize: 50, stockUnit: 'gal', heads: 2}).conflict, true);
  // A one-part product alone needs one tank.
  const alone = mix.stockPlan([{product: byId.get('jacks-12-4-16'), gPerGal: 1}], {ratio: 100, stockSize: 50, stockUnit: 'gal', heads: 1});
  assert.deepEqual(alone.tanks.map(tank => tank.name), ['Stock']);
  assert.equal(alone.conflict, false);
});
