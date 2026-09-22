(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'growbox-fert-tool-v08';
  const MAX_COMPARE_LINES = 10;
  const MAX_CUSTOM_PRODUCTS = 20;
  const CUSTOM_ANALYSIS_KEYS = ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  // Optional label split of total N, % by weight; blank (0) means not given.
  const NITROGEN_FORM_KEYS = ['nitrateN', 'ammoniacalN', 'ureaN'];
  const WATER_KEYS = ['pH', 'ec', 'alkalinity', 'N', ...NITROGEN_FORM_KEYS, 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Cu', 'B', 'Zn', 'Mo', 'Na', 'Cl'];

  function freshState() {
    return {
      view: 'compare',
      compare: [],
      // Card order on Compare, as 'p:<id>' / 's:<id>'; lines not listed go last.
      compareOrder: [],
      systemCompare: ['athena-pro-bloom', 'cropsalt-bloom', 'jacks-2part-0-12-26'],
      systemParts: {},
      systemProfiles: {},
      systemExcluded: {},
      // Source water from a water report, ppm (alkalinity as CaCO3, ec in mS/cm). RO adds nothing.
      water: {ro: true, values: {}},
      // "Mix it" settings, shared by Use rate and Blend finder.
      mix: {mode: 'reservoir', tankSize: 100, tankUnit: 'gal', ratio: 100, heads: 2, stockSize: 50, stockUnit: 'gal'},
      customProducts: [],
      compareMode: 'ppm',
      n: 160,
      compareElement: 'N',
      manual: {
        N: 0, P2O5: 0, K2O: 0, Ca: 0, Mg: 0, S: 0,
        Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0
      },
      useRate: {
        selection: 'p:jacks-12-4-16',
        preset: '0',
        doses: {'jacks-12-4-16': {amount: 6.309, unit: 'g/gal'}}
      },
      blend: {
        ids: ['jacks-12-4-16', 'jacks-5-12-26-a', 'jacks-15-0-0-b', 'magnesium-sulfate', 'mkp-0-52-34'],
        // Elemental ppm delivered in solution; 0 means "no target".
        target: {N: 160, P: 50, K: 200, Ca: 120, Mg: 50, S: 60, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0, nitrateN: 0, ammoniacalN: 0, ureaN: 0},
        targetId: '',
        targetElement: 'N',
        targetLevel: 160,
        // Subtract the source water (from Use rate) before solving.
        useWater: true,
        result: null
      }
    };
  }

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  // Given forms only; null when they add up to more than total N.
  function customNitrogenForms(forms, totalN) {
    const clean = {};
    NITROGEN_FORM_KEYS.forEach(key => {
      const value = Math.max(0, number(forms && forms[key]));
      if (value > 0) clean[key] = value;
    });
    const sum = Object.values(clean).reduce((total, value) => total + value, 0);
    return sum > number(totalN) + 1e-9 ? null : clean;
  }

  function normalizeState(input, products, systems) {
    const defaults = freshState();
    const candidate = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const state = {...defaults, ...candidate};
    const availableProducts = Array.isArray(products) ? products : [];
    const availableSystems = Array.isArray(systems) ? systems : [];

    state.manual = candidate.manual && typeof candidate.manual === 'object' && !Array.isArray(candidate.manual)
      ? {...defaults.manual, ...candidate.manual}
      : defaults.manual;
    state.blend = candidate.blend && typeof candidate.blend === 'object' && !Array.isArray(candidate.blend)
      ? {...defaults.blend, ...candidate.blend}
      : defaults.blend;
    // Sessions from before the ppm Blend finder (they carry `mode`) held label %
    // targets, which would read as tiny ppm values, so they start from the defaults.
    const legacyBlend = 'mode' in state.blend;
    delete state.blend.mode;
    const candidateTarget = !legacyBlend && state.blend.target && typeof state.blend.target === 'object' && !Array.isArray(state.blend.target) ? state.blend.target : {};
    state.blend.target = Object.fromEntries(Object.keys(defaults.blend.target).map(key => [key, key in candidateTarget ? Math.max(0, number(candidateTarget[key])) : defaults.blend.target[key]]));
    if (legacyBlend) state.blend.targetId = '';
    if (!Array.isArray(state.blend.ids)) state.blend.ids = defaults.blend.ids;
    if (!['N', 'P', 'K'].includes(state.blend.targetElement)) state.blend.targetElement = defaults.blend.targetElement;
    state.blend.targetLevel = number(state.blend.targetLevel) > 0 ? number(state.blend.targetLevel) : defaults.blend.targetLevel;
    const result = state.blend.result;
    if (!result || !Array.isArray(result.doses) || !Array.isArray(result.ids) || !result.ppm || !result.target) state.blend.result = null;
    if (!['compare', 'useRate', 'analysis', 'blend'].includes(state.view)) state.view = defaults.view;

    const water = candidate.water && typeof candidate.water === 'object' && !Array.isArray(candidate.water) ? candidate.water : defaults.water;
    const rawValues = water.values && typeof water.values === 'object' ? water.values : {};
    const values = {};
    WATER_KEYS.forEach(key => { if (key in rawValues) values[key] = Math.max(0, number(rawValues[key])); });
    // The forms can add up to N but never exceed it.
    const formsSum = NITROGEN_FORM_KEYS.reduce((sum, key) => sum + number(values[key]), 0);
    if (formsSum > number(values.N)) values.N = formsSum;
    state.water = {ro: water.ro !== false, values};
    state.blend.useWater = state.blend.useWater !== false;
    const mix = candidate.mix && typeof candidate.mix === 'object' && !Array.isArray(candidate.mix) ? candidate.mix : {};
    const size = (value, fallback) => number(value) > 0 ? number(value) : fallback;
    state.mix = {
      mode: mix.mode === 'stock' ? 'stock' : 'reservoir',
      tankSize: size(mix.tankSize, defaults.mix.tankSize), tankUnit: mix.tankUnit === 'L' ? 'L' : 'gal',
      ratio: size(mix.ratio, defaults.mix.ratio), heads: [1, 2, 3].includes(number(mix.heads)) ? number(mix.heads) : 2,
      stockSize: size(mix.stockSize, defaults.mix.stockSize), stockUnit: mix.stockUnit === 'L' ? 'L' : 'gal'
    };

    state.useRate = candidate.useRate && typeof candidate.useRate === 'object' && !Array.isArray(candidate.useRate)
      ? {...defaults.useRate, ...candidate.useRate}
      : defaults.useRate;
    const [useRateKind, useRateId] = String(state.useRate.selection || '').split(':');
    const useRateSelectionExists = useRateKind === 'p'
      ? availableProducts.some(product => product.id === useRateId && product.compareGroup === '1-part')
      : useRateKind === 's' && availableSystems.some(system => system.id === useRateId);
    if (!useRateSelectionExists) state.useRate.selection = defaults.useRate.selection;
    state.useRate.preset = state.useRate.preset === 'custom' || /^\d+$/.test(String(state.useRate.preset))
      ? String(state.useRate.preset)
      : 'custom';
    const supportedUnits = new Set(['g/gal', 'g/L', 'mL/gal', 'mL/L']);
    const candidateDoses = state.useRate.doses && typeof state.useRate.doses === 'object' && !Array.isArray(state.useRate.doses)
      ? state.useRate.doses
      : {};
    state.useRate.doses = {};
    Object.keys(candidateDoses).forEach(id => {
      const dose = candidateDoses[id];
      if (!dose || typeof dose !== 'object' || Array.isArray(dose)) return;
      const amount = Math.max(0, number(dose.amount));
      const unit = supportedUnits.has(dose.unit) ? dose.unit : 'g/gal';
      state.useRate.doses[id] = {amount, unit};
    });

    if (!Array.isArray(state.systemCompare)) state.systemCompare = [];
    delete state.rateChoice;
    if (!state.systemParts || typeof state.systemParts !== 'object' || Array.isArray(state.systemParts)) state.systemParts = {};
    else state.systemParts = {...state.systemParts};
    if (!state.systemProfiles || typeof state.systemProfiles !== 'object' || Array.isArray(state.systemProfiles)) state.systemProfiles = {};
    else state.systemProfiles = {...state.systemProfiles};
    if (!state.systemExcluded || typeof state.systemExcluded !== 'object' || Array.isArray(state.systemExcluded)) state.systemExcluded = {};
    else state.systemExcluded = {...state.systemExcluded};
    if (!['percent', 'ppm'].includes(state.compareMode)) state.compareMode = 'ppm';
    if (!['N', 'P', 'K'].includes(state.compareElement)) state.compareElement = 'N';

    const customIds = new Set();
    state.customProducts = (Array.isArray(state.customProducts) ? state.customProducts : [])
      .filter(item => item && typeof item === 'object' && /^custom-[a-z0-9]+$/.test(String(item.id)) && !customIds.has(item.id) && customIds.add(item.id))
      .slice(0, MAX_CUSTOM_PRODUCTS)
      .map(item => {
        const analysis = {};
        CUSTOM_ANALYSIS_KEYS.forEach(key => { analysis[key] = Math.max(0, number(item.analysis && item.analysis[key])); });
        const name = String(item.name == null ? '' : item.name).trim().slice(0, 60);
        return {
          id: item.id,
          name: name || [analysis.N, analysis.P2O5, analysis.K2O].join('-'),
          analysis,
          nitrogenForms: customNitrogenForms(item.nitrogenForms, analysis.N) || {},
          densityGPerMl: Math.max(0, number(item.densityGPerMl))
        };
      });
    const keptCustomIds = new Set(state.customProducts.map(item => item.id));
    state.blend.ids = [...new Set(state.blend.ids)].filter(id => keptCustomIds.has(id) || availableProducts.some(product => product.id === id));
    const [targetKind, targetId] = String(state.blend.targetId || '').split(':');
    const targetExists = targetKind === 'p'
      ? availableProducts.some(product => product.id === targetId && product.compareGroup === '1-part')
      : targetKind === 's' && availableSystems.some(system => system.id === targetId);
    if (!targetExists) state.blend.targetId = '';

    state.compare = (Array.isArray(state.compare) ? state.compare : []).filter(id => {
      if (keptCustomIds.has(id)) return true;
      const product = availableProducts.find(candidate => candidate.id === id);
      return product && product.compareGroup === '1-part';
    });
    state.systemCompare = state.systemCompare.filter(id => availableSystems.some(system => system.id === id));

    while (state.compare.length + state.systemCompare.length > MAX_COMPARE_LINES) {
      if (state.systemCompare.length) state.systemCompare.pop();
      else state.compare.pop();
    }
    const selectedKeys = new Set([...state.compare.map(id => 'p:' + id), ...state.systemCompare.map(id => 's:' + id)]);
    state.compareOrder = [...new Set(Array.isArray(state.compareOrder) ? state.compareOrder : [])].filter(key => selectedKeys.has(key));

    Object.keys(state.systemParts).forEach(id => {
      const parts = state.systemParts[id];
      if (!Array.isArray(parts) || !parts.some(value => number(value) > 0)) delete state.systemParts[id];
    });
    Object.keys(state.systemExcluded).forEach(id => {
      const system = availableSystems.find(item => item.id === id);
      const count = system && Array.isArray(system.components) ? system.components.length : 0;
      const excluded = [...new Set(Array.isArray(state.systemExcluded[id]) ? state.systemExcluded[id] : [])]
        .filter(index => Number.isInteger(index) && index >= 0 && index < count)
        .sort((a, b) => a - b);
      if (!excluded.length || excluded.length >= count) delete state.systemExcluded[id];
      else state.systemExcluded[id] = excluded;
    });
    Object.keys(state.systemProfiles).forEach(id => {
      const system = availableSystems.find(item => item.id === id);
      const profileId = state.systemProfiles[id];
      if (!system || (profileId !== 'custom' && !(system.profiles || []).some(profile => profile.id === profileId))) {
        delete state.systemProfiles[id];
      }
    });
    availableSystems.forEach(system => {
      if ((system.profiles || []).length && state.systemParts[system.id] && !state.systemProfiles[system.id]) {
        state.systemProfiles[system.id] = 'custom';
      }
    });

    return state;
  }

  function loadState(storage, products, systems) {
    let parsed;
    try {
      parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    } catch {
      parsed = null;
    }
    return normalizeState(parsed, products, systems);
  }

  function saveState(storage, state) {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Save a custom product into `state.customProducts`; the same name (any case)
  // updates the existing one. Returns {record, updated}, {error: 'limit'} when full, or
  // {error: 'nitrogen'} when the N forms add up to more than total N.
  function saveCustomProduct(state, input) {
    const name = String(input.name || '').trim().slice(0, 60);
    const nitrogenForms = customNitrogenForms(input.nitrogenForms, input.analysis && input.analysis.N);
    if (!nitrogenForms) return {error: 'nitrogen'};
    const existing = state.customProducts.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (!existing && state.customProducts.length >= MAX_CUSTOM_PRODUCTS) return {error: 'limit'};
    const used = state.customProducts.map(item => parseInt(String(item.id).slice(7), 36)).filter(Number.isFinite);
    const record = {
      id: existing ? existing.id : 'custom-' + ((used.length ? Math.max(...used) : 0) + 1).toString(36),
      name,
      analysis: Object.fromEntries(CUSTOM_ANALYSIS_KEYS.map(key => [key, Math.max(0, number(input.analysis && input.analysis[key]))])),
      nitrogenForms,
      densityGPerMl: Math.max(0, number(input.densityGPerMl))
    };
    state.customProducts = existing
      ? state.customProducts.map(item => item.id === existing.id ? record : item)
      : [...state.customProducts, record];
    return {record, updated: Boolean(existing)};
  }

  return Object.freeze({
    STORAGE_KEY,
    MAX_COMPARE_LINES,
    MAX_CUSTOM_PRODUCTS,
    NITROGEN_FORM_KEYS,
    WATER_KEYS,
    freshState,
    normalizeState,
    loadState,
    saveState,
    saveCustomProduct
  });
});
