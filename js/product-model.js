(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxProductModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function defaultFormat(value) {
    return Number.isFinite(Number(value)) ? String(Number(value)) : '—';
  }

  function createCatalog(products, systems, chemistry, formatter) {
    const productList = Array.isArray(products) ? products : [];
    const systemList = Array.isArray(systems) ? systems : [];
    const format = typeof formatter === 'function' ? formatter : defaultFormat;
    if (!chemistry || typeof chemistry.mixSystem !== 'function') {
      throw new TypeError('A chemistry engine with mixSystem is required.');
    }

    const productById = new Map(productList.map(product => [product.id, product]));
    const systemById = new Map(systemList.map(system => [system.id, system]));

    function product(id) {
      return productById.get(id);
    }

    function system(id) {
      return systemById.get(id);
    }

    function displayProgram(item) {
      return item.program || item.name || '';
    }

    // Drop part-label words the line name already says: "Part A" -> "A", and
    // "Bloom A" -> "A" inside "Sensi Coco Bloom". Other labels stay as written.
    function partLabel(item, label) {
      const match = /^(.+) ([A-Z0-9])$/.exec(String(label || ''));
      if (!match) return label;
      const prefix = match[1].toLowerCase();
      const name = ' ' + String(displayProgram(item)).toLowerCase() + ' ';
      return prefix === 'part' || name.includes(' ' + prefix + ' ') ? match[2] : label;
    }

    function displayFormula(item) {
      if (item.displayFormula && item.partCount > 1) return item.displayFormula.replace(/\(([^()]+)\)/g, (all, label) => '(' + partLabel(item, label) + ')');
      if (item.displayFormula) return item.displayFormula;
      if (item.analysis) return format(item.analysis.N) + '-' + format(item.analysis.P2O5) + '-' + format(item.analysis.K2O);
      return item.name || '';
    }

    function displayParts(item) {
      return (item.partCount || 1) + '-part';
    }

    function entryTitle(item) {
      return item.brand + ' — ' + displayProgram(item);
    }

    function exportLabel(item) {
      return entryTitle(item) + ' | ' + displayFormula(item) + ' | ' + displayParts(item) + (item.includedLabel ? ' | ' + item.includedLabel : '');
    }

    // Valid excluded part indexes for a system; never all parts.
    function excludedParts(systemRecord, excluded) {
      const count = systemRecord.components.length;
      const valid = [...new Set(Array.isArray(excluded) ? excluded : [])]
        .filter(index => Number.isInteger(index) && index >= 0 && index < count)
        .sort((a, b) => a - b);
      return valid.length < count ? valid : [];
    }

    // "B only" / "Grow + Bloom only" when some parts are left out of the comparison.
    function includedLabel(systemRecord, excluded) {
      if (!excluded.length) return '';
      return systemRecord.components
        .map((component, index) => excluded.includes(index) ? null : partLabel(systemRecord, component.label))
        .filter(Boolean).join(' + ') + ' only';
    }

    function systemProfile(systemRecord, profileId) {
      if (!systemRecord || profileId === 'custom') return null;
      const profiles = Array.isArray(systemRecord.profiles) ? systemRecord.profiles : [];
      const selectedId = profileId || systemRecord.defaultProfile;
      return profiles.find(profile => profile.id === selectedId) || (!profileId ? profiles[0] : null) || null;
    }

    function mixSystem(systemRecord, customParts, profileId, excluded) {
      const profile = systemProfile(systemRecord, profileId);
      const useCustomParts = profileId === 'custom' || (!profileId && Array.isArray(customParts));
      const chosenParts = useCustomParts && Array.isArray(customParts)
        ? customParts
        : (profile ? profile.parts : systemRecord.components.map(component => component.defaultParts == null ? 1 : component.defaultParts));
      const parts = chosenParts
        .map(value => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0));
      const componentProducts = systemRecord.components.map(component => product(component.productId));
      let skip = excludedParts(systemRecord, excluded);
      // Left-out parts weigh nothing; if nothing with a ratio would remain, compare every part.
      if (!parts.some((value, index) => value > 0 && !skip.includes(index))) skip = [];
      const compareParts = parts.map((value, index) => skip.includes(index) ? 0 : value);
      const approximateDensity = systemRecord.ratioBasis === 'volume'
        && componentProducts.some(item => item && item.densityEstimate);
      return {
        sys: systemRecord,
        profile,
        products: componentProducts,
        approximateDensity,
        ...chemistry.mixSystem(systemRecord, componentProducts, compareParts),
        parts,
        excluded: skip,
        includedLabel: includedLabel(systemRecord, skip)
      };
    }

    function selectedCompareEntries(productIds, systemIds, systemParts, systemProfiles, systemExcluded) {
      const entries = (Array.isArray(productIds) ? productIds : [])
        .map(product)
        .filter(item => item && item.compareGroup === '1-part')
        .map(item => ({
          kind: 'product',
          id: item.id,
          brand: item.brand,
          program: displayProgram(item),
          displayFormula: displayFormula(item),
          partCount: item.partCount || 1,
          name: item.name,
          analysis: item.analysis,
          product: item
        }));

      (Array.isArray(systemIds) ? systemIds : []).map(system).filter(Boolean).forEach(systemRecord => {
        const profileId = systemProfiles && systemProfiles[systemRecord.id];
        const mix = mixSystem(systemRecord, systemParts && systemParts[systemRecord.id], profileId, systemExcluded && systemExcluded[systemRecord.id]);
        entries.push({
          kind: 'system',
          id: systemRecord.id,
          brand: systemRecord.brand,
          program: displayProgram(systemRecord),
          displayFormula: displayFormula(systemRecord),
          partCount: systemRecord.partCount,
          name: systemRecord.name,
          analysis: mix.analysis,
          system: systemRecord,
          mix,
          includedLabel: mix.includedLabel,
          profileId: mix.profile ? mix.profile.id : (profileId === 'custom' ? 'custom' : null),
          profileLabel: mix.profile ? mix.profile.label : (profileId === 'custom' ? 'Custom' : '')
        });
      });

      return entries;
    }

    return Object.freeze({
      product,
      system,
      displayProgram,
      displayFormula,
      displayParts,
      partLabel,
      excludedParts,
      entryTitle,
      exportLabel,
      systemProfile,
      mixSystem,
      selectedCompareEntries
    });
  }

  return Object.freeze({createCatalog});
});
