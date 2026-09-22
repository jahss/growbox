'use strict';

// Part-ratio consistency for multi-part systems in data/products.js.
//
// Every published use rate must mix its parts in the ratio the app uses for
// that system: a rate tagged with a profileId must match that profile's parts,
// and an untagged rate must match the system's defaultParts. Compared as each
// part's share of the total, within SHARE_TOLERANCE, which absorbs labels
// rounding to 0.1 g (Athena Pro's 0.583–0.609 around 0.6 : 1).
// A mistyped rate or a stage-specific rate without its own profile fails here.

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const context = vm.createContext({window: {}});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'products.js'), 'utf8'), context);
const systems = context.window.FERTILIZER_SYSTEMS;

const SHARE_TOLERANCE = 0.02;

// Published rates that intentionally use a different ratio from the system's.
const KNOWN_EXCEPTIONS = new Set([
  'frontrow-3-2-2|Official clone DTR' // clone stage uses A + B only; 3:2:2 applies from veg on
]);

const shares = values => {
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map(value => value / total);
};

test('every system use rate mixes parts in its profile or default ratio', () => {
  let checked = 0;
  for (const system of systems) {
    for (const rate of system.useRates || []) {
      if (KNOWN_EXCEPTIONS.has(`${system.id}|${rate.label}`)) continue;
      const profile = rate.profileId && system.profiles.find(p => p.id === rate.profileId);
      if (rate.profileId) assert.ok(profile, `${system.id} "${rate.label}": unknown profileId ${rate.profileId}`);
      const expected = shares(profile ? profile.parts : system.components.map(c => c.defaultParts));
      const actual = shares(system.components.map(component => {
        const part = rate.components.find(c => c.productId === component.productId);
        return part ? (part.gPerGal ?? part.mLPerGal) : 0;
      }));
      actual.forEach((share, i) => assert.ok(
        Math.abs(share - expected[i]) <= SHARE_TOLERANCE,
        `${system.id} "${rate.label}": ${system.components[i].label} is ${(share * 100).toFixed(1)}% of the mix, expected ${(expected[i] * 100).toFixed(1)}%`
      ));
      checked++;
    }
  }
  assert.ok(checked > 50, `only ${checked} rates checked`);
});
