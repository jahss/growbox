(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxMix = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // "Mix it": a recipe (g per US gal of feed, per product) turned into what to weigh
  // out for a reservoir, or into injector stock tanks split so calcium never shares
  // a tank with sulfates or phosphates (they'd precipitate).
  const GAL_L = 3.785411784;
  const RATIOS = [100, 128, 200];
  // Tanks are named by what they hold, not A/B/C: brands use A/B for their own parts
  // (Jack's calcium part is "B"), which would clash.
  const TANK_TITLES = {calcium: 'Calcium tank', 'sulfates · phosphates': 'Sulfate / phosphate tank', 'mixed on its own': 'Separate tank', 'one tank': 'Stock tank'};

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function toGallons(size, unit) {
    return unit === 'L' ? number(size) / GAL_L : number(size);
  }

  function millilitres(product, grams) {
    return product && product.form === 'liquid' && number(product.densityGPerMl) > 0 ? grams / product.densityGPerMl : null;
  }

  function reservoirAmounts(lines, size, unit) {
    const gallons = toGallons(size, unit);
    const items = lines.map(line => {
      const grams = number(line.gPerGal) * gallons;
      return {product: line.product, label: line.label, grams, mL: millilitres(line.product, grams)};
    });
    return {items, totalGrams: items.reduce((sum, item) => sum + item.grams, 0)};
  }

  function has(product, key) {
    return number(product && product.analysis && product.analysis[key]) > 0;
  }

  // Stock strength against a salt's solubility (g per L of water at 20 °C). Liquids are
  // already concentrates; commercial dry products don't publish a limit.
  function strength(product, gPerL) {
    if (product.form === 'liquid') return 'liquid';
    const limit = number(product.solubilityGPerL);
    if (!limit) return 'unknown';
    return gPerL > limit ? 'over' : gPerL > 0.8 * limit ? 'close' : 'ok';
  }

  function stockPlan(lines, settings) {
    const ratio = number(settings.ratio);
    const stockGallons = toGallons(settings.stockSize, settings.stockUnit);
    const item = line => {
      const grams = number(line.gPerGal) * ratio * stockGallons;
      // g per L of stock depends only on g/gal × ratio, not on the tank size.
      const gPerL = number(line.gPerGal) * ratio / GAL_L;
      return {product: line.product, label: line.label, grams, mL: millilitres(line.product, grams), gPerL, strength: strength(line.product, gPerL)};
    };
    // Calcium apart from sulfates/phosphates. A product that already has both is made to be
    // stocked alone, so it gets its own tank. Nutrients with neither join the first tank.
    const calciumOrSP = line => has(line.product, 'S') || has(line.product, 'P2O5');
    const groups = [
      {role: 'calcium', lines: lines.filter(line => has(line.product, 'Ca') && !calciumOrSP(line))},
      {role: 'sulfates · phosphates', lines: lines.filter(line => !has(line.product, 'Ca') && calciumOrSP(line))},
      {role: 'mixed on its own', lines: lines.filter(line => has(line.product, 'Ca') && calciumOrSP(line))}
    ].filter(group => group.lines.length);
    const neither = lines.filter(line => !has(line.product, 'Ca') && !calciumOrSP(line));
    if (!groups.length) groups.push({role: 'one tank', lines: []});
    groups[0].lines = [...groups[0].lines, ...neither];
    const split = groups.length > 1;
    const tanks = split
      ? groups.map((group, index) => ({name: 'ABC'[index], role: group.role, items: group.lines.map(item)}))
      : [{name: 'Stock', role: 'one tank', items: groups[0].lines.map(item)}];
    return {tanks, split, conflict: tanks.length > Math.max(1, number(settings.heads)),
      feedVolume: number(settings.stockSize) * ratio, feedUnit: settings.stockUnit === 'L' ? 'L' : 'gal'};
  }

  // A tank already mixed with this recipe, read at `currentN` ppm N, brought to `targetN`.
  // `waterN` is the N the water (and acid) brings; it's in both readings. Raising adds more
  // of the recipe in its own proportions; lowering adds water, draining first if it won't fit.
  function adjustTank(lines, settings, waterN) {
    const volume = number(settings.tankSize);
    const current = number(settings.currentN);
    const target = number(settings.targetN);
    const water = number(waterN);
    const capacity = number(settings.capacity);
    // ppm N the recipe delivers at its g/gal (N % × g/gal × mg/L per g/gal).
    const recipeN = lines.reduce((sum, line) => sum + number(line.gPerGal) * number(line.product && line.product.analysis && line.product.analysis.N) * 10 / GAL_L, 0);
    if (!volume || !current || !target) return {status: 'missing'};
    if (!recipeN) return {status: 'no-n'};
    if (current <= water || target <= water) return {status: 'below-water'};
    if (Math.abs(target - current) < 1e-9) return {status: 'same'};
    const factor = (target - water) / (current - water);
    if (target > current) {
      // ponytail: a liquid's own volume is ignored when raising (under 1% at label rates).
      const items = lines.map(line => {
        const grams = number(line.gPerGal) * (target - current) / recipeN * toGallons(volume, settings.tankUnit);
        return {product: line.product, label: line.label, grams, mL: millilitres(line.product, grams)};
      });
      return {status: 'raise', factor, items, totalGrams: items.reduce((sum, item) => sum + item.grams, 0)};
    }
    const finalVolume = volume / factor;
    if (!capacity || finalVolume <= capacity) return {status: 'dilute', factor, finalVolume, addWater: finalVolume - volume};
    if (capacity < volume) return {status: 'capacity'};
    const drainTo = capacity * factor;
    return {status: 'drain', factor, drainTo, drain: volume - drainTo, addWater: capacity - drainTo, finalVolume: capacity};
  }

  function createComponent(options) {
    const document = options.document;
    const format = options.format;
    const escape = options.escape;
    const getState = options.getState;
    const save = options.save || (() => {});
    // Source water (acid included), ppm; only its N is used, by Adjust tank.
    const waterOf = options.waterOf || (() => ({}));

    const mass = grams => grams >= 1000 ? format(grams / 1000, 2) + ' kg' : format(grams, grams >= 100 ? 0 : 1) + ' g';
    const volume = mL => mL >= 1000 ? format(mL / 1000, 2) + ' L' : format(mL, mL >= 100 ? 0 : 1) + ' mL';
    const amount = entry => entry.mL != null ? volume(entry.mL) + ' <small class="muted">(' + mass(entry.grams) + ')</small>' : mass(entry.grams);
    // Each recipe line carries `label` (the caller's display formula), shown under the brand.
    const name = entry => '<small class="muted">' + escape(entry.product.custom ? 'Custom' : entry.product.brand) + '</small><br>' + escape(entry.label || entry.product.name);
    const unitSelect = (key, value) => '<select class="mixIn" data-k="' + key + '"><option value="gal"' + (value === 'gal' ? ' selected' : '') + '>gal</option><option value="L"' + (value === 'L' ? ' selected' : '') + '>L</option></select>';

    function strengthNote(entry) {
      const perL = format(entry.gPerL, entry.gPerL < 10 ? 1 : 0) + ' g/L in the stock';
      const limit = format(number(entry.product.solubilityGPerL), 0);
      if (entry.strength === 'liquid') return '';
      if (entry.strength === 'over') return '<div class="mix-poor">⚠ ' + perL + ': more than dissolves (about ' + limit + ' g/L at 20 °C). Use a lower injector ratio.</div>';
      if (entry.strength === 'close') return '<div class="mix-fair">⚠ ' + perL + ': close to its limit (about ' + limit + ' g/L at 20 °C). Cold water and other salts in the tank dissolve less.</div>';
      if (entry.strength === 'unknown') return '<div class="muted mix-note">' + perL + '. No published solubility: check the label’s maximum stock strength.</div>';
      return '<div class="muted mix-note">' + perL + ', well within its limit.</div>';
    }

    function adjustHtml(lines, mix) {
      const waterN = number(waterOf().N);
      const result = adjustTank(lines, mix, waterN);
      const unit = mix.tankUnit;
      const vol = value => format(value, 1) + ' ' + unit;
      const ppm = value => format(value, 1) + ' ppm N';
      const by = '×' + format(result.factor, 2);
      const waterNote = waterN ? '<p class="muted mix-note">Your water brings ' + format(waterN, 1) + ' ppm N. It’s in both readings, and in any water you add.</p>' : '';
      const caution = '<p class="mix-caution">This assumes the tank was mixed with this recipe, so every nutrient moves together. If the plants have drawn it down unevenly, test it or remix instead.</p>';
      let body;
      if (result.status === 'missing') return '<p class="muted">Enter the tank’s N now and the N you want, in ppm.</p>';
      if (result.status === 'no-n') return '<p class="muted">This recipe has no N, so N can’t tell how strong the tank is.</p>';
      if (result.status === 'same') return '<p class="muted">The tank is already at the N you want.</p>';
      if (result.status === 'capacity') return '<p class="mix-poor">The capacity is less than what’s in the tank now. Check both volumes.</p>';
      if (result.status === 'below-water') {
        return '<p class="mix-poor">' + (number(mix.currentN) <= waterN
          ? 'The N now is at or below what your water alone brings (' + ppm(waterN) + '). Check the reading.'
          : 'Your water alone brings ' + ppm(waterN) + ', so adding water can’t bring the tank down to ' + ppm(mix.targetN) + '.') + '</p>';
      }
      if (result.status === 'raise') {
        body = '<h3>Add to the ' + vol(number(mix.tankSize)) + ' tank</h3>' +
          result.items.map(entry => '<div class="mix-row"><span>' + name(entry) + '</span><b>' + amount(entry) + '</b></div>').join('') +
          (result.items.length > 1 ? '<div class="mix-row"><span>Total by weight</span><b>' + mass(result.totalGrams) + '</b></div>' : '') +
          '<p class="muted mix-note">Takes N from ' + format(number(mix.currentN), 1) + ' to ' + ppm(mix.targetN) + '. Everything else from the fertilizer rises by the same ' + by + '.</p>';
      } else if (result.status === 'dilute') {
        body = '<h3>Add ' + vol(result.addWater) + ' of water</h3>' +
          '<p class="muted mix-note">That makes ' + vol(result.finalVolume) + ' at ' + ppm(mix.targetN) + '. Everything from the fertilizer drops by the same ' + by + '.</p>';
      } else {
        body = '<h3>Drain to ' + vol(result.drainTo) + ', then add ' + vol(result.addWater) + ' of water</h3>' +
          '<p class="muted mix-note">The water won’t all fit, so ' + vol(result.drain) + ' of feed comes out first. That fills the tank to ' + vol(result.finalVolume) + ' at ' + ppm(mix.targetN) + '.</p>';
      }
      return body + waterNote + caution;
    }

    function outputHtml(lines, mix) {
      if (!lines.length) return '<p class="muted">Nothing in the recipe yet.</p>';
      if (mix.mode === 'adjust') return adjustHtml(lines, mix);
      if (mix.mode === 'reservoir') {
        const result = reservoirAmounts(lines, mix.tankSize, mix.tankUnit);
        return '<h3>Weigh out for ' + format(number(mix.tankSize), 1) + ' ' + mix.tankUnit + '</h3>' +
          result.items.map(entry => '<div class="mix-row"><span>' + name(entry) + '</span><b>' + amount(entry) + '</b></div>').join('') +
          (result.items.length > 1 ? '<div class="mix-row"><span>Total by weight</span><b>' + mass(result.totalGrams) + '</b></div>' : '');
      }
      const plan = stockPlan(lines, mix);
      const why = {calcium: 'Calcium, kept apart from sulfates and phosphates.', 'sulfates · phosphates': 'Sulfates and phosphates, kept apart from calcium.',
        'mixed on its own': 'Already has calcium with sulfate or phosphate, so it’s stocked on its own, within the label’s stock strength.', 'one tank': 'Nothing here needs keeping apart, so it all shares one tank.'};
      return '<p class="mix-caution">Only use products whose label allows stock solutions. Some are reservoir-only, have a maximum stock strength, or need their own injector head. Check each label before mixing a stock tank.</p>' +
        '<p class="muted mix-feed">Each ' + format(number(mix.stockSize), 1) + ' ' + mix.stockUnit + ' stock tank makes ' + Math.round(plan.feedVolume).toLocaleString('en-US') + ' ' + plan.feedUnit + ' of feed.</p>' +
        (plan.conflict ? '<p class="mix-poor">⚠ This recipe needs ' + plan.tanks.length + ' stock tanks (calcium and sulfates/phosphates would precipitate together), but you have ' + mix.heads + ' injector head' + (mix.heads > 1 ? 's' : '') + '. Add heads, or mix a reservoir instead.</p>' : '') +
        '<div class="mix-tanks">' + plan.tanks.map(tank => '<div class="mix-tank"><h3>' + TANK_TITLES[tank.role] + '</h3>' +
          tank.items.map(entry => '<div class="mix-row"><span>' + name(entry) + '</span><b>' + amount(entry) + '</b></div>' + strengthNote(entry) +
            '').join('') +
          '<div class="muted mix-note">' + why[tank.role] + '</div></div>').join('') + '</div>' +
        '<h3>How to mix each tank</h3><ol class="mix-steps"><li>Fill the tank about ⅔ with water.</li><li>Dissolve each product fully, one at a time, in the order listed.</li><li>Top up to ' + format(number(mix.stockSize), 1) + ' ' + mix.stockUnit + ' and stir.</li></ol>';
    }

    function settingsHtml(mix) {
      // Blank rather than 0 until something is entered.
      const reading = (key, label) => '<label>' + label + '<input class="mixIn" data-k="' + key + '" type="number" min="0" step="1" value="' + (number(mix[key]) ? format(number(mix[key]), 2) : '') + '"></label>';
      if (mix.mode === 'adjust') {
        return '<label>In the tank now<input class="mixIn" data-k="tankSize" type="number" min="0" step="1" value="' + format(number(mix.tankSize), 2) + '"></label><label>Unit' + unitSelect('tankUnit', mix.tankUnit) + '</label>' +
          reading('currentN', 'N now, ppm') + reading('targetN', 'N wanted, ppm') + reading('capacity', 'Tank holds, ' + mix.tankUnit + ' (optional)');
      }
      if (mix.mode === 'reservoir') {
        return '<label>Tank size<input class="mixIn" data-k="tankSize" type="number" min="0" step="1" value="' + format(number(mix.tankSize), 2) + '"></label><label>Unit' + unitSelect('tankUnit', mix.tankUnit) + '</label>';
      }
      return '<label>Injector ratio, 1:<input class="mixIn" data-k="ratio" type="number" min="1" step="1" list="mixRatios" value="' + format(number(mix.ratio), 0) + '"></label>' +
        '<label>Injector heads<select class="mixIn" data-k="heads">' + [1, 2, 3].map(count => '<option value="' + count + '"' + (mix.heads === count ? ' selected' : '') + '>' + count + '</option>').join('') + '</select></label>' +
        '<label>Stock tank size<input class="mixIn" data-k="stockSize" type="number" min="0" step="1" value="' + format(number(mix.stockSize), 2) + '"></label><label>Unit' + unitSelect('stockUnit', mix.stockUnit) + '</label>' +
        '<datalist id="mixRatios">' + RATIOS.map(value => '<option value="' + value + '">').join('') + '</datalist>';
    }

    // Renders the card into `containerId` for this recipe; settings are shared by every recipe.
    function render(containerId, lines) {
      const box = document.getElementById(containerId);
      if (!box) return;
      const mix = getState().mix;
      box.innerHTML = '<h2>Mix it</h2><p class="muted">Turn this recipe into what to weigh out.</p>' +
        '<div class="seg mix-seg"><button type="button" data-mode="reservoir"' + (mix.mode === 'reservoir' ? ' class="active"' : '') + '>Reservoir</button><button type="button" data-mode="stock"' + (mix.mode === 'stock' ? ' class="active"' : '') + '>Injector stock</button><button type="button" data-mode="adjust"' + (mix.mode === 'adjust' ? ' class="active"' : '') + '>Adjust tank</button></div>' +
        '<div class="mix-settings">' + settingsHtml(mix) + '</div><div class="mix-out">' + outputHtml(lines, mix) + '</div>';
      if (!box.querySelectorAll) return;
      box.querySelectorAll('[data-mode]').forEach(button => {
        button.onclick = () => { mix.mode = button.dataset.mode; save(); render(containerId, lines); };
      });
      box.querySelectorAll('.mixIn').forEach(input => {
        const update = () => {
          const key = input.dataset.k;
          mix[key] = /Unit$/.test(key) ? input.value : Math.max(0, number(input.value));
          save();
          // Typing keeps focus by redrawing only the result; a picked unit also relabels the settings.
          if (input.tagName === 'SELECT') render(containerId, lines);
          else box.querySelector('.mix-out').innerHTML = outputHtml(lines, mix);
        };
        input.oninput = update;
        input.onchange = update;
      });
    }

    return Object.freeze({render});
  }

  return Object.freeze({GAL_L, RATIOS, reservoirAmounts, stockPlan, adjustTank, createComponent});
});
