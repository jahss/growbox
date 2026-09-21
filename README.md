# Growbox Fertilizer Toolbox

A static HTML/CSS/JavaScript toolbox for comparing commercial fertilizer programs, analyzing real use-rate recipes, converting guaranteed analyses to elemental ppm, and exploring fertilizer blends.

## Current structure

- `index.html` — application markup and asset loading
- `css/app.css` — application styles
- `data/products.js` — commercial products, multipart systems, ingredient salts, and source metadata
- `js/chemistry.js` — pure chemistry and multipart calculation engine
- `js/state.js` — session defaults, loading, normalization, and persistence
- `js/product-model.js` — product lookup, naming, multipart composition, and comparison entries
- `js/blend-solver.js` — nonnegative fertilizer blend optimization
- `js/export.js` — CSV/JSON result generation and browser downloads
- `js/analysis.js` — Guaranteed Analysis inputs, calculations, and rendering
- `js/compare.js` — commercial program selection and standardized comparison
- `js/use-rate.js` — editable product/program recipes, published rate presets, and elemental ppm results
- `js/blend.js` — Blend Finder selection, targets, results, and feed-chart UI
- `js/app.js` — page-level dependency setup, shared controls, exports, and rendering
- `tests/*.test.js` — chemistry, product-data, and session-state regression tests

## Chemistry conventions

- Internal solution concentrations are elemental mg/L (ppm).
- Fertilizer labels retain N-P2O5-K2O notation.
- P = P2O5 × 0.436426.
- K = K2O × 0.830151.
- 1 g/US gal = 264.172052 mg/L.
- Liquid volume calculations require a verified density; the engine does not assume 1 mL = 1 g.

Run all tests with:

```sh
node --test tests/*.test.js
```

## Product data policy

Prefer official manufacturer labels, technical sheets, and feed charts. Commercial records should eventually include a source URL, source type, date checked, original rate wording and units, formula/version or region when relevant, and liquid density provenance. Unverified ratios, rates, or densities should not be presented as manufacturer recommendations.

## Comparison profiles

Multipart programs may define named comparison profiles when an official recipe changes the component balance, such as Jack's Fast Track Veg and Flower. Programs that use the same component balance throughout the crop cycle remain a single profile instead of being duplicated by stage. Users can switch a profiled program to Custom to edit its component balance directly.
