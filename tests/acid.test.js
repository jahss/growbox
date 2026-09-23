'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const chemistry = require('../js/chemistry.js');
const stateModule = require('../js/state.js');
const useRate = require('../js/use-rate.js');

const closeTo = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' vs ' + expected);
const acid = id => chemistry.ACIDS.find(entry => entry.id === id);

// The anchor figures every horticultural extension sheet prints, for 100 ppm CaCO3
// removed: phosphoric adds about 62 ppm P, sulfuric about 32 ppm S, nitric about 28 ppm N.
test('what each acid adds per 100 ppm CaCO₃ removed', () => {
  closeTo(chemistry.acidDose(150, 50, acid('phosphoric75')).ppm.P, 61.9, 0.1);
  closeTo(chemistry.acidDose(150, 50, acid('phosphoric85')).ppm.P, 61.9, 0.1);
  closeTo(chemistry.acidDose(150, 50, acid('sulfuric93')).ppm.S, 32.0, 0.1);
  closeTo(chemistry.acidDose(150, 50, acid('sulfuric35')).ppm.S, 32.0, 0.1);
  closeTo(chemistry.acidDose(150, 50, acid('nitric67')).ppm.N, 28.0, 0.1);
  closeTo(chemistry.acidDose(150, 50, acid('nitric61')).ppm.N, 28.0, 0.1);
});

// What it adds depends only on the alkalinity removed; the volume depends on strength.
test('a weaker acid needs more volume for the same alkalinity', () => {
  const strong = chemistry.acidDose(150, 50, acid('sulfuric93'));
  const weak = chemistry.acidDose(150, 50, acid('sulfuric35'));
  assert.ok(weak.mLPerGal > strong.mLPerGal * 3, weak.mLPerGal + ' vs ' + strong.mLPerGal);
  closeTo(strong.mLPerGal, 0.218, 0.001);
  closeTo(weak.mLPerGal, 0.841, 0.001);
});

test('phosphoric counts one proton, sulfuric two', () => {
  // Same molarity of acid: sulfuric neutralizes twice the alkalinity, so it needs half the moles.
  const phosphoric = chemistry.acidDose(150, 50, acid('phosphoric75'));
  const sulfuric = chemistry.acidDose(150, 50, acid('sulfuric93'));
  closeTo(phosphoric.ppm.P / 30.973762, sulfuric.ppm.S / 32.06 * 2, 1e-6);
});

test('mL/gal and mL/L describe the same dose', () => {
  const dose = chemistry.acidDose(180, 40, acid('phosphoric75'));
  closeTo(dose.mLPerGal, dose.mLPerL * chemistry.US_GALLON_LITERS, 1e-9);
  closeTo(dose.removed, 140);
});

test('no dose when the water is already at or below the target', () => {
  assert.equal(chemistry.acidDose(40, 50, acid('phosphoric75')), null);
  assert.equal(chemistry.acidDose(50, 50, acid('phosphoric75')), null);
  assert.equal(chemistry.acidDose(0, 50, acid('phosphoric75')), null);
  assert.equal(chemistry.acidDose(150, 50, null), null);
});

test('a negative target is refused rather than over-dosing', () => {
  assert.throws(() => chemistry.acidDose(150, -10, acid('phosphoric75')), RangeError);
});

test('nitric acid adds nitrate N, not unsplit N', () => {
  const dose = chemistry.acidDose(150, 50, acid('nitric67'));
  closeTo(dose.ppm.nitrateN, dose.ppm.N);
  assert.equal('nitrateN' in chemistry.acidDose(150, 50, acid('sulfuric93')).ppm, false);
});

// The residual alkalinity is the buffer that holds the mixed feed's pH, so the target is
// flagged against the same UMass range as the water field itself.
test('the alkalinity target is flagged when it leaves too little or too much buffer', () => {
  const [low, high] = useRate.WATER_RANGES.alkalinity.target;
  assert.equal(useRate.acidTargetNote(0).cls, 'water-poor');
  assert.equal(useRate.acidTargetNote(low - 1).cls, 'water-fair');
  assert.equal(useRate.acidTargetNote(low).cls, '');
  assert.equal(useRate.acidTargetNote(50).cls, '');
  assert.equal(useRate.acidTargetNote(high).cls, '');
  assert.equal(useRate.acidTargetNote(high + 1).cls, 'water-fair');
  assert.match(useRate.acidTargetNote(0).text, /no buffer/);
});

function waterState(values, acidSettings) {
  const state = stateModule.normalizeState({...stateModule.freshState(), water: {ro: false, values, acid: acidSettings}}, [], []);
  return state.water;
}

test('acidPpm is empty without an acid, with RO water, or below the target', () => {
  assert.deepEqual(useRate.acidPpm(waterState({alkalinity: 150}, {id: '', target: 50})), {});
  assert.deepEqual(useRate.acidPpm(waterState({alkalinity: 30}, {id: 'phosphoric75', target: 50})), {});
  const ro = stateModule.normalizeState({...stateModule.freshState(), water: {ro: true, values: {alkalinity: 150}, acid: {id: 'phosphoric75', target: 50}}}, [], []);
  assert.deepEqual(useRate.acidPpm(ro.water), {});
});

test('the acid is part of what the tank holds before fertilizer', () => {
  const water = waterState({alkalinity: 150, P: 2, N: 10, nitrateN: 10}, {id: 'phosphoric75', target: 50});
  const plain = useRate.waterPpm(water);
  const withAcid = useRate.waterPpm(water, true);
  closeTo(plain.P, 2);
  closeTo(withAcid.P, 2 + useRate.acidPpm(water).P);
  closeTo(withAcid.N, 10, 1e-12);

  const nitric = waterState({alkalinity: 150, N: 10, nitrateN: 10}, {id: 'nitric67', target: 50});
  const total = useRate.waterPpm(nitric, true);
  closeTo(total.N, 10 + useRate.acidPpm(nitric).N);
  closeTo(total.nitrateN, total.N);
});

test('state keeps a known acid and target, and falls back to none', () => {
  // Chemistry owns the acid list, so state only shape-checks the id; an id it doesn't
  // know reaches acidPpm and doses nothing.
  assert.deepEqual(waterState({}, {id: 'not an acid!', target: 50}).acid, {id: '', target: 50});
  assert.deepEqual(useRate.acidPpm(waterState({alkalinity: 150}, {id: 'unknownacid', target: 50})), {});
  assert.deepEqual(waterState({}, {id: 'sulfuric93'}).acid, {id: 'sulfuric93', target: 50});
  assert.deepEqual(waterState({}, {id: 'sulfuric93', target: 0}).acid, {id: 'sulfuric93', target: 0});
  assert.deepEqual(waterState({}, {id: 'sulfuric93', target: -5}).acid, {id: 'sulfuric93', target: 0});
  assert.deepEqual(waterState({}, undefined).acid, {id: '', target: 50});
});
