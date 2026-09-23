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

// Jack's 12-4-16 at 6.309 g/gal delivers 200 ppm N.
const jacks = [{product: byId.get('jacks-12-4-16'), gPerGal: 6.309}];
const tank = (extra) => ({tankSize: 500, tankUnit: 'gal', capacity: 0, ...extra});

test('adjust: raising N adds more of the recipe, in its own proportions; the water’s N cancels out', () => {
  const raise = mix.adjustTank(jacks, tank({currentN: 120, targetN: 160}), 0);
  assert.equal(raise.status, 'raise');
  // 40 ppm more N from a recipe giving 200 ppm at 6.309 g/gal: 6.309 × 40/200 g/gal × 500 gal.
  closeTo(raise.items[0].grams, 630.9, 0.05);
  closeTo(raise.factor, 160 / 120);
  const withWater = mix.adjustTank(jacks, tank({currentN: 120, targetN: 160}), 20);
  closeTo(withWater.items[0].grams, 630.9, 0.05);
  // Everything else in the fertilizer rises with its N: 100 → 140 ppm from fertilizer.
  closeTo(withWater.factor, 1.4);
  const litres = mix.adjustTank(jacks, tank({tankSize: 1892.705892, tankUnit: 'L', currentN: 120, targetN: 160}), 0);
  closeTo(litres.items[0].grams, 630.9, 0.05);
  const two = mix.adjustTank([{product: core, gPerGal: 4.6}, {product: bloom, gPerGal: 7.7}], tank({currentN: 100, targetN: 150}), 0);
  closeTo(two.items[1].grams / two.items[0].grams, 7.7 / 4.6);
});

test('adjust: lowering N adds water, and drains first when it won’t fit', () => {
  const dilute = mix.adjustTank(jacks, tank({currentN: 160, targetN: 120}), 0);
  assert.equal(dilute.status, 'dilute');
  closeTo(dilute.finalVolume, 500 * 160 / 120);
  closeTo(dilute.addWater, 500 * 160 / 120 - 500);
  // Water with N dilutes less: fertilizer N goes 140 → 100.
  closeTo(mix.adjustTank(jacks, tank({currentN: 160, targetN: 120}), 20).finalVolume, 700);
  const drain = mix.adjustTank(jacks, tank({currentN: 160, targetN: 120, capacity: 600}), 0);
  assert.equal(drain.status, 'drain');
  closeTo(drain.drainTo, 450);
  closeTo(drain.drain, 50);
  closeTo(drain.addWater, 150);
  closeTo(drain.finalVolume, 600);
  assert.equal(mix.adjustTank(jacks, tank({currentN: 160, targetN: 120, capacity: 700}), 0).status, 'dilute');
});

test('adjust: blanks, no N, unreachable targets and a too-small capacity say so instead of answering', () => {
  assert.equal(mix.adjustTank(jacks, tank({currentN: 0, targetN: 160}), 0).status, 'missing');
  assert.equal(mix.adjustTank(jacks, tank({currentN: 120, targetN: 0}), 0).status, 'missing');
  assert.equal(mix.adjustTank(jacks, tank({currentN: 150, targetN: 150}), 0).status, 'same');
  assert.equal(mix.adjustTank([{product: byId.get('magnesium-sulfate'), gPerGal: 2}], tank({currentN: 120, targetN: 160}), 0).status, 'no-n');
  assert.equal(mix.adjustTank(jacks, tank({currentN: 160, targetN: 20}), 20).status, 'below-water');
  assert.equal(mix.adjustTank(jacks, tank({currentN: 15, targetN: 160}), 20).status, 'below-water');
  assert.equal(mix.adjustTank(jacks, tank({currentN: 160, targetN: 120, capacity: 400}), 0).status, 'capacity');
});

test('the card’s Adjust tank mode asks for readings, then says what to add, or what to drain and top up', () => {
  const box = {innerHTML: ''};
  const state = {mix: {mode: 'adjust', tankSize: 500, tankUnit: 'gal', ratio: 100, heads: 2, stockSize: 50, stockUnit: 'gal', currentN: 0, targetN: 0, capacity: 0}};
  const format = (value, digits = 2) => Number(value).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
  let water = {};
  const card = mix.createComponent({document: {getElementById: () => box}, format, escape: String, getState: () => state, waterOf: () => water});
  const lines = [{product: byId.get('jacks-12-4-16'), gPerGal: 6.309, label: '12-4-16'}];
  card.render('urMix', lines);
  assert.match(box.innerHTML, /Enter the tank’s N now and the N you want/);
  Object.assign(state.mix, {currentN: 120, targetN: 160});
  card.render('urMix', lines);
  assert.match(box.innerHTML, /Add to the 500 gal tank/);
  assert.match(box.innerHTML, /12-4-16<\/span><b>631 g<\/b>/);
  assert.match(box.innerHTML, /assumes the tank was mixed with this recipe/i);
  Object.assign(state.mix, {currentN: 160, targetN: 120, capacity: 600});
  card.render('urMix', lines);
  assert.match(box.innerHTML, /Drain to 450 gal/);
  assert.match(box.innerHTML, /add 150 gal of water/);
  water = {N: 20};
  state.mix.capacity = 0;
  card.render('urMix', lines);
  assert.match(box.innerHTML, /Add 200 gal of water/);
  assert.match(box.innerHTML, /Your water brings 20 ppm N/);
});
