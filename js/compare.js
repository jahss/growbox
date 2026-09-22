(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxCompare = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PERCENT_COLUMNS = [
    ['N', 'N'], ['P2O5', 'P₂O₅'], ['K2O', 'K₂O'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S'],
    ['Fe', 'Fe'], ['Mn', 'Mn'], ['Zn', 'Zn'], ['B', 'B'], ['Cu', 'Cu'], ['Mo', 'Mo']
  ];
  const PPM_COLUMNS = [
    ['N', 'N'], ['P', 'P'], ['K', 'K'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S'],
    ['Fe', 'Fe'], ['Mn', 'Mn'], ['Zn', 'Zn'], ['B', 'B'], ['Cu', 'Cu'], ['Mo', 'Mo']
  ];
  const MICRO_KEYS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const MAX_LINES = 10;
  const ELEMENT_LEVELS = {
    N: range(50, 300, 10),
    P: range(10, 150, 10),
    K: range(50, 300, 10)
  };

  // Inclusive arithmetic range: [start, end] step by `step`.
  function range(start, end, step) {
    const values = [];
    for (let value = start; value <= end; value += step) values.push(value);
    return values;
  }

  // Nearest value from `levels` to `target`, for snapping a persisted level
  // into the active element's range after the element changes.
  function nearestLevel(levels, target) {
    return levels.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best, levels[0]);
  }

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function highlightClass(entries, key, index) {
    if (entries.length < 2) return '';
    const values = entries.map(entry => entry.values[key]).filter(Number.isFinite);
    if (values.length < 2) return '';
    const high = Math.max(...values);
    const low = Math.min(...values);
    const value = entries[index].values[key];
    if (Math.abs(high - low) < 1e-12) return '';
    if (Math.abs(value - high) < 1e-9) return 'hi';
    if (Math.abs(value - low) < 1e-9) return 'lo';
    return '';
  }

  // Index of the only product supplying `analysisKey` (N, P2O5 or K2O), else -1.
  function soleSourceIndex(products, analysisKey) {
    const sources = products
      .map((product, index) => ({product, index}))
      .filter(item => number(item.product && item.product.analysis && item.product.analysis[analysisKey]) > 0);
    return sources.length === 1 ? sources[0].index : -1;
  }

  function soleNitrogenSourceIndex(products) {
    return soleSourceIndex(products, 'N');
  }

  function lineKey(kind, id) {
    return (kind === 'product' ? 'p:' : 's:') + id;
  }

  // Sorts lines by the saved card order; unlisted ones keep their place at the end (sort is stable).
  function byCardOrder(order) {
    const rank = key => { const index = order.indexOf(key); return index < 0 ? order.length : index; };
    return (a, b) => rank(lineKey(a.kind, a.id)) - rank(lineKey(b.kind, b.id));
  }

  // Hold a card ~0.3 s, then drag it up or down; Alt + ↑/↓ moves the focused card.
  // Controls inside a card (the ×, its settings) never start a drag. Binds once per container.
  function bindSortable(container, onOrder) {
    if (!container || typeof container.addEventListener !== 'function' || container.dataset.sortable) return;
    container.dataset.sortable = '1';
    const cards = () => Array.from(container.children).filter(child => child.classList.contains('selected-line'));
    let card = null;
    let timer = null;
    let startY = 0;
    let startTop = 0;
    let dragging = false;
    const still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // FLIP: after cards move in the page, slide each from where it was to where it is.
    const slide = (others, before) => others.forEach((other, index) => {
      const delta = before[index] - other.getBoundingClientRect().top;
      if (!delta) return;
      other.style.transition = 'none';
      other.style.transform = 'translateY(' + delta + 'px)';
      other.getBoundingClientRect();
      other.style.transition = 'transform .18s ease';
      other.style.transform = '';
    });
    const reset = () => {
      clearTimeout(timer);
      if (card) {
        card.classList.remove('dragging');
        card.style.transition = '';
        card.style.transform = '';
      }
      card = null;
      dragging = false;
    };
    container.addEventListener('pointerdown', event => {
      const target = event.target.closest('.selected-line');
      if (!target || event.button > 0 || event.target.closest('button, details, input, select, label')) return;
      card = target;
      startY = event.clientY;
      startTop = target.offsetTop;
      timer = setTimeout(() => {
        dragging = true;
        card.classList.add('dragging');
        if (!still()) card.style.transition = 'none';
        try { container.setPointerCapture(event.pointerId); } catch (error) { /* pointer already gone */ }
      }, 300);
    });
    container.addEventListener('pointermove', event => {
      if (!card) return;
      if (!dragging) {
        if (Math.abs(event.clientY - startY) > 8) reset();
        return;
      }
      const others = cards().filter(other => other !== card);
      const next = others.find(other => { const box = other.getBoundingClientRect(); return event.clientY < box.top + box.height / 2; });
      if ((next || null) !== card.nextElementSibling) {
        const before = others.map(other => other.getBoundingClientRect().top);
        container.insertBefore(card, next || null);
        if (!still()) slide(others, before);
      }
      // The held card follows the pointer from wherever its slot now is.
      if (!still()) card.style.transform = 'translateY(' + ((event.clientY - startY) - (card.offsetTop - startTop)) + 'px) scale(1.02)';
    });
    const drop = () => {
      if (!dragging) return reset();
      const moved = card;
      const order = cards().map(other => other.dataset.key);
      clearTimeout(timer);
      card = null;
      dragging = false;
      moved.classList.remove('dragging');
      if (still()) return onOrder(order);
      // Glide into the slot, then save (saving re-renders the list).
      moved.style.transition = 'transform .18s ease';
      moved.style.transform = '';
      setTimeout(() => onOrder(order), 190);
    };
    container.addEventListener('pointerup', drop);
    container.addEventListener('pointercancel', reset);
    // While dragging, the finger moves the card instead of scrolling the page.
    container.addEventListener('touchmove', event => { if (dragging) event.preventDefault(); }, {passive: false});
    container.addEventListener('contextmenu', event => { if (card) event.preventDefault(); });
    container.addEventListener('keydown', event => {
      const target = event.target;
      if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key) || !target.classList.contains('selected-line')) return;
      event.preventDefault();
      const order = cards().map(other => other.dataset.key);
      const from = order.indexOf(target.dataset.key);
      const to = from + (event.key === 'ArrowUp' ? -1 : 1);
      if (to < 0 || to >= order.length) return;
      order.splice(to, 0, order.splice(from, 1)[0]);
      onOrder(order, target.dataset.key);
    });
  }

  function createComponent(options) {
    const document = options.document;
    const products = options.products;
    const systems = options.systems;
    const chemistry = options.chemistry;
    const catalog = options.catalog;
    const format = options.format;
    const escape = options.escape;
    const getState = options.getState;
    const save = options.save;
    const notify = options.notify;

    const element = id => document.getElementById(id);
    const product = catalog.product;
    const displayProgram = catalog.displayProgram;
    const displayFormula = catalog.displayFormula;
    const displayParts = catalog.displayParts;

    // Mobile cards open and close together; kept across re-renders.
    let cardsOpen = false;

    function entrySubtitle(entry) {
      const profile = (entry.profileLabel ? ' · ' + entry.profileLabel + ' profile' : '') + (entry.includedLabel ? ' · ' + entry.includedLabel : '');
      const estimate = entry.kind === 'system' && entry.mix && entry.mix.approximateDensity ? ' · approx. density' : '';
      return escape(displayFormula(entry)) + ' · ' + escape(displayParts(entry)) + escape(profile + estimate);
    }

    function entryCell(entry) {
      return escape(catalog.entryTitle(entry)) + '<br><small class="muted">' + entrySubtitle(entry) + '</small>';
    }

    // Short dose for the card's first line; the full breakdown goes in the body.
    function shortDoseText(entry, grams) {
      if (grams === null) return 'Cannot standardize';
      if (entry.kind === 'system') return format(grams, 3) + ' g/gal';
      const item = entry.product;
      if (item.form === 'liquid' && number(item.densityGPerMl) > 0) return format(grams / item.densityGPerMl, 3) + ' mL/gal';
      return format(grams, 3) + ' g/gal';
    }

    // Mobile layout: one collapsible card per entry. Line 1 is name + dose,
    // line 2 the macro values; expanding shows micros and dose details. The
    // summary also carries the micros, which CSS shows only on tablet widths.
    function cardsHtml(rows, columns, unit, digits, doseHtml) {
      const chips = (row, index, cols) => cols.map(([key, label]) =>
        '<span class="cmp-chip ' + highlightClass(rows, key, index) + '"><small>' + label + '</small><b>' + format(row.values[key], digits(key)) + '</b></span>').join('');
      return rows.map((row, index) => {
        const entry = row.entry;
        const key = entry.kind + ':' + entry.id;
        const dose = doseHtml ? doseHtml(row) : null;
        return '<details class="cmp-card" data-key="' + escape(key) + '"' + (cardsOpen ? ' open' : '') + '><summary>' +
          '<div class="cmp-line1"><b class="cmp-name">' + escape(catalog.entryTitle(entry)) + (entry.includedLabel ? ' <small class="cmp-only">' + escape(entry.includedLabel) + '</small>' : '') + '</b>' +
          (dose ? '<span class="cmp-dose">' + escape(shortDoseText(entry, row.dose)) + '</span>' : '') +
          '<span class="cmp-arrow" aria-hidden="true"></span></div>' +
          '<div class="cmp-chips cmp-summary-chips">' + chips(row, index, columns.slice(0, 6)) + '<span class="cmp-micros">' + chips(row, index, columns.slice(6)) + '</span></div></summary>' +
          '<div class="cmp-body"><div class="cmp-chips cmp-micros">' + chips(row, index, columns.slice(6)) + '</div>' +
          '<small class="muted">' + unit + ' · ' + entrySubtitle(entry) + '</small>' +
          (dose ? '<div class="cmp-dose-detail">' + dose + '</div>' : '') + '</div></details>';
      }).join('');
    }

    function renderCards(html) {
      const container = element('analysisCompareCards');
      if (!container) return;
      container.innerHTML = html;
      const cards = document.querySelectorAll('.cmp-card');
      cards.forEach(card => {
        card.ontoggle = () => {
          if (card.open === cardsOpen) return;
          cardsOpen = card.open;
          cards.forEach(other => { other.open = cardsOpen; });
        };
      });
    }

    function selectionCount() {
      const state = getState();
      return state.compare.length + state.systemCompare.length;
    }

    // Planned: guests limited to 3 lines, accounts get MAX_LINES, once a backend exists. See README.
    function addItem(value) {
      if (!value) return;
      const state = getState();
      if (selectionCount() >= MAX_LINES) {
        notify('Comparison is limited to ' + MAX_LINES + ' product lines. Remove one before adding another.', 'warn');
        return;
      }
      const [kind, id] = value.split(':');
      if (kind === 'p' && !state.compare.includes(id)) state.compare.push(id);
      if (kind === 's' && !state.systemCompare.includes(id)) state.systemCompare.push(id);
      save();
      renderControls();
      renderTables();
    }

    function removeItem(kind, id) {
      const state = getState();
      const list = kind === 'product' ? state.compare : state.systemCompare;
      const index = list.indexOf(id);
      if (index >= 0) list.splice(index, 1);
      // Forget its place, so adding it back puts it at the end.
      state.compareOrder = (state.compareOrder || []).filter(key => key !== lineKey(kind, id));
      save();
      renderControls();
      renderTables();
      const item = kind === 'product' ? product(id) : catalog.system(id);
      if (item) notify('Removed “' + item.brand + ' — ' + displayProgram(item) + '”. Add it back from the list above.');
    }

    // Save a new card order; results follow it. `focusKey` keeps keyboard focus on the moved card.
    function setOrder(keys, focusKey) {
      getState().compareOrder = keys.slice();
      save();
      renderControls();
      renderTables();
      const moved = focusKey && document.querySelector && document.querySelector('.selected-line[data-key="' + focusKey + '"]');
      if (moved && moved.focus) moved.focus();
    }

    function systemMix(system) {
      const state = getState();
      return catalog.mixSystem(system, state.systemParts[system.id], state.systemProfiles[system.id], state.systemExcluded[system.id]);
    }

    function setSystemProfile(systemId, profileId) {
      const state = getState();
      const system = systems.find(item => item.id === systemId);
      if (!system) return false;
      const valid = profileId === 'custom' || (system.profiles || []).some(profile => profile.id === profileId);
      if (!valid) return false;
      if (profileId === 'custom' && !state.systemParts[system.id]) {
        state.systemParts[system.id] = [...systemMix(system).parts];
      }
      state.systemProfiles[system.id] = profileId;
      save();
      renderControls();
      renderTables();
      return true;
    }

    function renderControls() {
      const state = getState();
      const onePart = products.filter(item => item.compareGroup === '1-part' && !state.compare.includes(item.id));
      const custom = catalog.customProducts().filter(item => !state.compare.includes(item.id));
      const twoPart = systems.filter(item => item.partCount === 2 && !state.systemCompare.includes(item.id));
      const threePart = systems.filter(item => item.partCount === 3 && !state.systemCompare.includes(item.id));
      const group = (label, items, prefix) => items.length
        ? '<optgroup label="' + label + '">' + items.map(item => '<option value="' + prefix + ':' + escape(item.id) + '">' + escape(item.brand + ' — ' + displayProgram(item) + ' · ' + displayFormula(item) + ' · ' + displayParts(item)) + '</option>').join('') + '</optgroup>'
        : '';

      element('productPicker').innerHTML = '<option value="">Add product line…</option>' + group('Your custom products', custom, 'p') + group('1-Part', onePart, 'p') + group('2-Part', twoPart, 's') + group('3-Part', threePart, 's');
      element('productPicker').disabled = selectionCount() >= MAX_LINES;
      element('compareCount').textContent = selectionCount() + ' / ' + MAX_LINES + ' selected';

      const selected = [];
      state.compare.map(product).filter(Boolean).forEach(item => selected.push({
        kind: 'product', id: item.id, brand: item.brand, program: displayProgram(item), formula: displayFormula(item),
        parts: displayParts(item) + (item.custom ? ' · your label' + (item.densityGPerMl ? ' · ' + format(item.densityGPerMl, 4) + ' g/mL' : '') : '')
      }));
      state.systemCompare.map(catalog.system).filter(Boolean).forEach(system => {
        const mix = systemMix(system);
        const unit = system.ratioBasis === 'volume' ? 'volume' : 'mass';
        const profiles = system.profiles || [];
        const selectedProfile = state.systemProfiles[system.id] || system.defaultProfile || (profiles[0] && profiles[0].id) || 'custom';
        const profileControl = profiles.length
          ? '<label>Comparison profile <select class="sysProfile" data-sys="' + escape(system.id) + '">' + profiles.map(profile => '<option value="' + escape(profile.id) + '" ' + (profile.id === selectedProfile ? 'selected' : '') + '>' + escape(profile.label) + '</option>').join('') + '<option value="custom" ' + (selectedProfile === 'custom' ? 'selected' : '') + '>Custom</option></select></label>'
          : '';
        const partControls = (!profiles.length || selectedProfile === 'custom')
          ? system.components.map((component, index) => '<label>' + escape(catalog.partLabel(system, component.label)) + ' <input class="spr" data-sys="' + escape(system.id) + '" data-i="' + index + '" type="number" min="0" step=".1" value="' + format(mix.parts[index], 3) + '"> ' + unit + ' parts</label>').join('')
          : '';
        const includeControls = '<div class="toolbar part-toggles"><span class="muted">Compare:</span>' + system.components.map((component, index) => '<label class="check-inline"><input class="spx" data-sys="' + escape(system.id) + '" data-i="' + index + '" type="checkbox"' + (mix.excluded.includes(index) ? '' : ' checked') + '> ' + escape(catalog.partLabel(system, component.label)) + '</label>').join('') + '</div>' +
          (mix.excluded.length ? '<p class="muted ratio-note">Comparing ' + escape(mix.includedLabel) + '. A part on its own may have little N, so standardizing by P or K often compares it better.</p>' : '');
        const controls = profileControl + (partControls ? '<div class="toolbar" style="margin-top:7px">' + partControls + '</div>' : '') + includeControls;
        const nitrogenSourceIndex = soleNitrogenSourceIndex(includedProducts(mix));
        const constraintNote = nitrogenSourceIndex < 0 ? '' : 'In Elemental ppm mode, ' + displayFormula(mix.products[nitrogenSourceIndex]) + ' is the only nitrogen source. Its dose is fixed by the selected N target; changing the balance adjusts the other component doses. Use the Use Rate tool to set every dose independently.';
        const profileLabel = mix.profile ? mix.profile.label : (profiles.length && selectedProfile === 'custom' ? 'Custom' : '');
        const partsLabel = displayParts(system) + (profileLabel ? ' · ' + profileLabel + ' profile' : '') + (mix.includedLabel ? ' · ' + mix.includedLabel : '');
        selected.push({kind: 'system', id: system.id, brand: system.brand, program: displayProgram(system), formula: displayFormula(system), parts: partsLabel, controls, constraintNote, ratioNote: system.ratioNote || '', settingsLabel: profiles.length ? 'Comparison profile and balance' : 'Adjust component balance'});
      });

      // The × removes; holding the card drags it (see bindSortable).
      selected.sort(byCardOrder(state.compareOrder || []));
      element('selectedLines').innerHTML = selected.map(item => '<div class="selected-line" data-key="' + escape(lineKey(item.kind, item.id)) + '" tabindex="0"><div class="line-head"><div class="line-text"><b>' + escape(item.brand + ' — ' + item.program) + '</b><span>' + escape(item.formula) + '</span><span class="muted">' + escape(item.parts) + '</span></div><button type="button" class="line-x removeLine" data-kind="' + item.kind + '" data-id="' + escape(item.id) + '" aria-label="Remove ' + escape(item.brand + ' — ' + item.program) + '">×</button></div>' + (item.controls ? '<details><summary>' + escape(item.settingsLabel) + '</summary><div style="margin-top:7px">' + item.controls + '</div>' + (item.ratioNote ? '<p class="muted ratio-note">' + escape(item.ratioNote) + '</p>' : '') + (item.constraintNote ? '<p class="muted ratio-note"><b>Fixed-N behavior:</b> ' + escape(item.constraintNote) + '</p>' : '') + '</details>' : '') + '</div>').join('');

      document.querySelectorAll('.removeLine').forEach(button => {
        button.onclick = () => removeItem(button.dataset.kind, button.dataset.id);
      });
      bindSortable(element('selectedLines'), setOrder);
      if (element('sortHint')) element('sortHint').classList.toggle('hidden', selected.length < 2);
      document.querySelectorAll('.sysProfile').forEach(select => {
        select.onchange = () => setSystemProfile(select.dataset.sys, select.value);
      });
      document.querySelectorAll('.spx').forEach(input => {
        input.onchange = () => {
          const system = systems.find(item => item.id === input.dataset.sys);
          if (!system) return;
          const index = Number(input.dataset.i);
          const current = systemMix(system).excluded;
          const next = input.checked ? current.filter(value => value !== index) : [...current, index];
          if (catalog.excludedParts(system, next).length !== new Set(next).size) {
            input.checked = true;
            notify('Keep at least one part in the comparison.', 'warn');
            return;
          }
          if (next.length) state.systemExcluded[system.id] = next.sort((a, b) => a - b);
          else delete state.systemExcluded[system.id];
          save();
          renderControls();
          renderTables();
        };
      });
      document.querySelectorAll('.spr').forEach(input => {
        input.oninput = () => {
          const system = systems.find(item => item.id === input.dataset.sys);
          if (!system) return;
          const current = state.systemParts[system.id] || system.components.map(component => component.defaultParts == null ? 1 : component.defaultParts);
          const next = [...current];
          next[Number(input.dataset.i)] = Math.max(0, number(input.value));
          if (!next.some(value => value > 0)) {
            input.value = format(current[Number(input.dataset.i)], 3);
            notify('At least one system part must be greater than zero.', 'warn');
            return;
          }
          state.systemParts[system.id] = next;
          if ((system.profiles || []).length) state.systemProfiles[system.id] = 'custom';
          save();
          renderTables();
        };
      });
    }

    function selectedEntries() {
      const state = getState();
      return catalog.selectedCompareEntries(state.compare, state.systemCompare, state.systemParts, state.systemProfiles, state.systemExcluded)
        .sort(byCardOrder(state.compareOrder || [])).slice(0, MAX_LINES);
    }

    function productDoseText(item, grams) {
      if (item.form === 'liquid' && number(item.densityGPerMl) > 0) return format(grams, 3) + ' g/gal (' + format(grams / item.densityGPerMl, 3) + ' mL/gal)';
      return format(grams, 3) + ' g/gal';
    }

    // Parts left out of the comparison count as absent (null).
    function includedProducts(mix) {
      return mix.products.map((item, index) => mix.excluded.includes(index) ? null : item);
    }

    function systemStandardDoseText(entry, totalGrams) {
      const standardElement = getState().compareElement || 'N';
      const included = includedProducts(entry.mix);
      // Only worth saying when more than one part is dosed.
      const targetSourceIndex = included.filter(Boolean).length > 1
        ? soleSourceIndex(included, {N: 'N', P: 'P2O5', K: 'K2O'}[standardElement])
        : -1;
      const pieces = entry.mix.products.map((item, index) => {
        if (entry.mix.excluded.includes(index)) return null;
        const grams = totalGrams * entry.mix.weights[index];
        const constraint = index === targetSourceIndex ? ' (sets ' + standardElement + ' target)' : '';
        const label = escape(catalog.partLabel(entry.system, entry.system.components[index].label));
        if (item.form === 'liquid' && number(item.densityGPerMl) > 0) return label + ' ' + format(grams / item.densityGPerMl, 3) + ' mL/gal' + constraint;
        return label + ' ' + format(grams, 3) + ' g/gal' + constraint;
      });
      const estimate = entry.mix.approximateDensity ? '<br><small class="muted">Approximate: volume-to-mass conversion uses midpoint(s) of published SDS density range(s).</small>' : '';
      return format(totalGrams, 3) + ' g/gal total<br><small class="muted">' + pieces.filter(Boolean).join(' + ') + '</small>' + estimate;
    }

    function renderTables() {
      const state = getState();
      const entries = selectedEntries();

      if (state.compareMode === 'percent') {
        element('comparisonHeading').textContent = 'Guaranteed analysis (%)';
        const rows = entries.map(entry => ({entry, values: entry.analysis}));
        renderCards(cardsHtml(rows, PERCENT_COLUMNS, 'Guaranteed %', key => MICRO_KEYS.includes(key) ? (key === 'Mo' ? 4 : 3) : 2, null));
        element('analysisCompare').innerHTML = '<thead><tr><th>Product / system</th>' + PERCENT_COLUMNS.map(column => '<th>' + column[1] + ' %</th>').join('') + '</tr></thead><tbody>' +
          rows.map((row, index) => '<tr><td>' + entryCell(row.entry) + (row.entry.kind === 'system' ? ' <small class="muted">(combined)</small>' : '') + '</td>' +
          PERCENT_COLUMNS.map(([key]) => '<td class="' + highlightClass(rows, key, index) + '">' + format(row.values[key], MICRO_KEYS.includes(key) ? (key === 'Mo' ? 4 : 3) : 2) + '</td>').join('') + '</tr>').join('') +
          '</tbody>';
      } else {
        const standardElement = state.compareElement || 'N';
        element('comparisonHeading').textContent = 'Elemental ppm @ ' + state.n + ' ppm ' + standardElement;
        const rows = entries.map(entry => {
          const dose = chemistry.standardizedDose(entry.analysis, standardElement, state.n);
          const values = dose === null ? null : chemistry.ppmAtDose(entry.analysis, dose);
          return {entry, dose, values: values || {}};
        });
        renderCards(cardsHtml(rows, PPM_COLUMNS, 'Elemental ppm', key => MICRO_KEYS.includes(key) ? 3 : 1, row => row.dose === null ? 'Cannot standardize'
          : (row.entry.kind === 'system' ? systemStandardDoseText(row.entry, row.dose) : productDoseText(row.entry.product, row.dose))));
        element('analysisCompare').innerHTML = '<thead><tr><th>Product / system</th><th>Dose</th>' + PPM_COLUMNS.map(column => '<th>' + column[1] + ' ppm</th>').join('') + '</tr></thead><tbody>' +
          rows.map((row, index) => {
            const entry = row.entry;
            if (row.dose === null) return '<tr><td>' + entryCell(entry) + '</td><td>Cannot standardize</td>' + PPM_COLUMNS.map(() => '<td>—</td>').join('') + '</tr>';
            const doseText = entry.kind === 'system' ? systemStandardDoseText(entry, row.dose) : productDoseText(entry.product, row.dose);
            return '<tr><td>' + entryCell(entry) + '</td><td>' + doseText + '</td>' +
              PPM_COLUMNS.map(([key]) => '<td class="' + highlightClass(rows, key, index) + '">' + format(row.values[key], MICRO_KEYS.includes(key) ? (key === 'Mo' ? 4 : 3) : 1) + '</td>').join('') + '</tr>';
          }).join('') + '</tbody>';
      }

    }

    function render() {
      const state = getState();
      element('productPicker').onchange = event => {
        addItem(event.target.value);
        event.target.value = '';
      };
      element('nElement').onchange = event => {
        state.compareElement = event.target.value;
        const levels = ELEMENT_LEVELS[state.compareElement];
        state.n = nearestLevel(levels, state.n);
        save();
        render();
      };
      element('nLevel').onchange = event => {
        state.n = Number(event.target.value);
        save();
        renderTables();
      };
      element('percentView').onclick = () => {
        state.compareMode = 'percent';
        save();
        render();
      };
      element('ppmView').onclick = () => {
        state.compareMode = 'ppm';
        save();
        render();
      };

      renderControls();
      // Rebuild the level options so the visible range matches the element.
      element('nElement').value = state.compareElement || 'N';
      const levels = ELEMENT_LEVELS[state.compareElement || 'N'];
      element('nLevel').innerHTML = levels.map(level => '<option value="' + level + '"' + (level === state.n ? ' selected' : '') + '>' + level + '</option>').join('');
      element('nLevel').value = state.n;
      element('nLevel').disabled = false;
      element('percentView').classList.toggle('active', state.compareMode === 'percent');
      element('ppmView').classList.toggle('active', state.compareMode === 'ppm');
      element('nControl').classList.toggle('hidden', state.compareMode !== 'ppm');
      renderTables();
    }

    return Object.freeze({render, renderControls, renderTables, selectedEntries, addItem, removeItem, setSystemProfile, setOrder});
  }

  return Object.freeze({range, nearestLevel, ELEMENT_LEVELS: Object.freeze({
    N: Object.freeze([...ELEMENT_LEVELS.N]),
    P: Object.freeze([...ELEMENT_LEVELS.P]),
    K: Object.freeze([...ELEMENT_LEVELS.K])
  }), highlightClass, soleNitrogenSourceIndex, createComponent});
});
