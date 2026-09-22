window.FERTILIZER_PRODUCTS = [
  {
    id:'megacrop-11-5-14', compareGroup:'1-part', manufacturer:'Greenleaf Nutrients', brand:'Mega Crop', program:'1-Part', displayFormula:'11-5-14', partCount:1, name:'Mega Crop 1-Part 11-5-14', form:'dry',
    analysis:{N:11,P2O5:5,K2O:14,Ca:7.5,Mg:1.4,S:2,Fe:.10,Mn:.08,Zn:.017,B:.019,Cu:.020,Mo:0},
    nitrogenForms:{nitrateN:8.5,ammoniacalN:.5,waterSolubleN:2}, useRates:[],
    source:{type:'uploaded-label',checked:'2026-09-19'},
    notes:'Uploaded guaranteed-analysis label. 2% kelp and 2% humic acids are intentionally outside fertilizer prototype v1.'
  },
  {
    id:'jacks-12-4-16', compareGroup:'1-part', manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'RO', displayFormula:'12-4-16', partCount:1, name:'12-4-16 RO', form:'dry',
    analysis:{N:12,P2O5:4,K2O:16,Ca:7,Mg:2,S:0,Fe:.15,Mn:.05,Zn:.035,B:.020,Cu:.020,Mo:.001},
    nitrogenForms:{nitrateN:11.8,ammoniacalN:.2},
    useRates:[{label:'RO schedule — 200 ppm N',gPerGal:6.309,note:'630.90 g per 100 US gal.'}],
    source:{type:'uploaded-label',checked:'2026-09-19'}, notes:'Uploaded Jack’s 12-4-16 guaranteed-analysis label.'
  },
  {
    id:'jacks-15-5-20-tap', compareGroup:'1-part', manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'Tap', displayFormula:'15-5-20', partCount:1, name:'15-5-20 Tap', form:'dry',
    analysis:{N:15,P2O5:5,K2O:20,Ca:3,Mg:1.5,S:0,Fe:.15,Mn:.08,Zn:.050,B:.020,Cu:.020,Mo:.001},
    nitrogenForms:{nitrateN:12,ammoniacalN:3},
    useRates:[{label:'Label reference — 150 ppm N',gPerGal:3.827,note:'13.5 dry oz per 100 US gal.'}],
    source:{url:'https://www.griffins.com/images/pdf/cea/qr/Jacks%20Nutrients%20labels.pdf',checked:'2026-09-19'}
  },
  {
    id:'jacks-18-8-23-outdoor', compareGroup:'1-part', manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'Outdoor', displayFormula:'18-8-23', partCount:1, name:'18-8-23 Outdoor', form:'dry',
    analysis:{N:18,P2O5:8,K2O:23,Ca:0,Mg:.5,S:1.59,Fe:.15,Mn:.05,Zn:.050,B:.020,Cu:.011,Mo:.010},
    nitrogenForms:{nitrateN:11.52,ammoniacalN:6.48},
    useRates:[{label:'Label reference — 100 ppm N',gPerGal:2.126,note:'7.5 dry oz per 100 US gal.'}],
    source:{url:'https://www.griffins.com/images/pdf/cea/qr/Jacks%20Nutrients%20labels.pdf',checked:'2026-09-19'}
  },
  {
    id:'jacks-5-12-26-a', compareGroup:'component', manufacturer:'JR Peters', brand:"Jack's Nutrients", displayFormula:'5-12-26 (A)', componentName:'A', name:'5-12-26 Part A', form:'dry',
    analysis:{N:5,P2O5:12,K2O:26,Ca:0,Mg:6.3,S:8.5,Fe:.30,Mn:.05,Zn:.015,B:.05,Cu:.015,Mo:.019},
    nitrogenForms:{nitrateN:5},
    useRates:[
      {label:'Official Fast Track — Veg · 50 ppm N',gPerGal:3.8,note:'Jack’s A + B Fast Track Veg rate: 3.80 g/US gal.'},
      {label:'Official Fast Track — Flower · 75 ppm N',gPerGal:5.68,note:'Jack’s A + B Fast Track Flower rate: 5.68 g/US gal.'}
    ],
    source:{url:'https://www.jacksnutrients.com/online-store/5-12-26-Part-A-p101272607',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{type:'user-supplied-manufacturer-label',checked:'2026-09-19'},
    rateSource:{url:'https://www.jacksnutrients.com/_files/ugd/3230c0_2c6597e4cf9349dbafb03283e8db4a2d.pdf',type:'official-feed-chart',checked:'2026-09-21',original:'Veg: 3.80 g/US gal, 50 ppm N; Flower: 5.68 g/US gal, 75 ppm N'}
  },
  {
    id:'jacks-0-12-26-a', compareGroup:'component', manufacturer:'JR Peters', brand:"Jack's Nutrients", displayFormula:'0-12-26 (A)', componentName:'A', name:'0-12-26 Part A', form:'dry',
    analysis:{N:0,P2O5:12,K2O:26,Ca:0,Mg:6,S:13,Fe:.30,Mn:.05,Zn:.015,B:.05,Cu:.015,Mo:.009},
    useRates:[],
    source:{url:'https://www.jacksnutrients.com/online-store/0-12-26-Part-A-p571478747',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{type:'user-supplied-manufacturer-label',checked:'2026-09-19'},
    notes:'Jack’s identifies this as a zero-nitrogen Part A paired with Cal Nit Part B. No product-specific rate is published on the official product page, so no manufacturer preset is loaded.'
  },
  {
    id:'jacks-15-0-0-b', compareGroup:'component', manufacturer:'JR Peters', brand:"Jack's Nutrients", displayFormula:'15-0-0 (B)', componentName:'B', name:'15-0-0 Cal Nit Part B', form:'dry',
    analysis:{N:15,P2O5:0,K2O:0,Ca:18,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:15},
    useRates:[{label:'Official schedule — 100 ppm N',gPerGal:2.5,note:'Current Jack’s A + B Fast Track schedule: 2.50 g/US gal.'}],
    source:{url:'https://www.jacksnutrients.com/online-store/Cal-Nit-Part-B-p101272606',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{type:'user-supplied-manufacturer-label',checked:'2026-09-19'},
    rateSource:{url:'https://www.jacksnutrients.com/_files/ugd/3230c0_2c6597e4cf9349dbafb03283e8db4a2d.pdf',type:'official-feed-chart',checked:'2026-09-21',original:'2.50 g/US gal; 100 ppm N'}
  },

  {
    id:'athena-pro-core', compareGroup:'component', manufacturer:'Athena Ag', brand:'Athena', displayFormula:'14-0-0 (Core)', componentName:'Core', name:'Pro Core 14-0-0', form:'dry',
    analysis:{N:14,P2O5:0,K2O:0,Ca:17,Mg:0,S:0,Fe:.1,Mn:.04,Zn:.013,B:.015,Cu:.01,Mo:.01},
    nitrogenForms:{nitrateN:14}, useRates:[],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Pro-Core-Product-Label.pdf',checked:'2026-09-19'}
  },
  {
    id:'athena-pro-grow', compareGroup:'component', manufacturer:'Athena Ag', brand:'Athena', displayFormula:'2-8-20 (Grow)', componentName:'Grow', name:'Pro Grow 2-8-20', form:'dry',
    analysis:{N:2,P2O5:8,K2O:20,Ca:0,Mg:3,S:8,Fe:.1,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:2},
    useRates:[],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Pro-Grow-Product-Label.pdf',checked:'2026-09-19'}
  },
  {
    id:'athena-pro-bloom-component', compareGroup:'component', manufacturer:'Athena Ag', brand:'Athena', displayFormula:'0-12-24 (Bloom)', componentName:'Bloom', name:'Pro Bloom 0-12-24', form:'dry',
    analysis:{N:0,P2O5:12,K2O:24,Ca:0,Mg:3,S:9,Fe:.1,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[],
    source:{url:'https://www.athenaag.com/',checked:'2026-09-19'}
  },
  {
    id:'athena-grow-a', compareGroup:'component', manufacturer:'Athena Ag', brand:'Athena', displayFormula:'4-0-1 (Grow A)', componentName:'Grow A', name:'Blended Grow A 4-0-1', form:'liquid', densityGPerMl:1.179092,
    analysis:{N:4,P2O5:0,K2O:1,Ca:4.2,Mg:.19,S:0,Fe:.06,Mn:.013,Zn:.0045,B:.01,Cu:0,Mo:.0007},
    nitrogenForms:{nitrateN:3.8,ammoniacalN:.2},
    useRates:[{label:'Application range — low',mLPerGal:2},{label:'Application range — high',mLPerGal:15}],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Grow-A-Product-Label.pdf',checked:'2026-09-19'}
  },
  {
    id:'athena-grow-b', compareGroup:'component', manufacturer:'Athena Ag', brand:'Athena', displayFormula:'1-3-5 (Grow B)', componentName:'Grow B', name:'Blended Grow B 1-3-5', form:'liquid', densityGPerMl:1.126368,
    analysis:{N:1,P2O5:3,K2O:5,Ca:0,Mg:.89,S:1.3,Fe:0,Mn:0,Zn:0,B:0,Cu:.005,Mo:0},
    nitrogenForms:{nitrateN:.8,ammoniacalN:.2},
    useRates:[{label:'Application range — low',mLPerGal:2},{label:'Application range — high',mLPerGal:15}],
    source:{url:'https://www.athenaag.com/blended-line',checked:'2026-09-19'}
  },
  {
    id:'athena-bloom-a', compareGroup:'component', manufacturer:'Athena Ag', brand:'Athena', displayFormula:'4-0-5 (Bloom A)', componentName:'Bloom A', name:'Blended Bloom A 4-0-5', form:'liquid', densityGPerMl:1.195868,
    analysis:{N:4,P2O5:0,K2O:5,Ca:3.2,Mg:.17,S:0,Fe:.06,Mn:.013,Zn:.0045,B:.01,Cu:0,Mo:.0007},
    nitrogenForms:{nitrateN:3.8,ammoniacalN:.2},
    useRates:[{label:'Application range — low',mLPerGal:2},{label:'Application range — high',mLPerGal:7}],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Bloom-A-Product-Label.pdf',checked:'2026-09-19'}
  },
  {
    id:'athena-bloom-b', compareGroup:'component', manufacturer:'Athena Ag', brand:'Athena', displayFormula:'0.7-6-5 (Bloom B)', componentName:'Bloom B', name:'Blended Bloom B 0.7-6-5', form:'liquid', densityGPerMl:1.155127,
    analysis:{N:.7,P2O5:6,K2O:5,Ca:0,Mg:.94,S:1.3,Fe:0,Mn:0,Zn:0,B:0,Cu:.005,Mo:0},
    nitrogenForms:{nitrateN:.5,ammoniacalN:.2},
    useRates:[{label:'Application range — low',mLPerGal:2},{label:'Application range — high',mLPerGal:7}],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Bloom-B-Product-Label.pdf',checked:'2026-09-19'}
  },


  // Advanced Nutrients — current base system. NPK/rates are official; secondary/micro
  // guarantees use current/recent label copies where the official product page exposes NPK only.
  {
    id:'advanced-ph-perfect-grow', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'1-0-4 (Grow)', componentName:'Grow', name:'pH Perfect Grow 1-0-4', form:'liquid', densityGPerMl:1.096,
    analysis:{N:1,P2O5:0,K2O:4,Ca:0,Mg:.3,S:.5,Fe:0,Mn:0,Zn:0,B:.01,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:1}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-grow-micro-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-grow-4-litre',type:'distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Grow_001D_North_America_2025_01_21.pdf',type:'official-sds',checked:'2026-09-21'}
  },
  {
    id:'advanced-ph-perfect-micro', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'2-0-0 (Micro)', componentName:'Micro', name:'pH Perfect Micro 2-0-0', form:'liquid', densityGPerMl:1.134,
    analysis:{N:2,P2O5:0,K2O:0,Ca:2.4,Mg:.1,S:0,Fe:.05,Mn:.05,Zn:.02,B:.02,Cu:.001,Mo:.0002},
    nitrogenForms:{nitrateN:2}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-grow-micro-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://www.progressive-growth.com/products/ph-perfect-micro',type:'distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Micro_001D_North_America_2026_4_3.pdf',type:'official-sds',checked:'2026-09-21'}
  },
  {
    id:'advanced-ph-perfect-bloom', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'1-3-4 (Bloom)', componentName:'Bloom', name:'pH Perfect Bloom 1-3-4', form:'liquid', densityGPerMl:1.11,
    analysis:{N:1,P2O5:3,K2O:4,Ca:0,Mg:0,S:.2,Fe:0,Mn:0,Zn:0,B:.02,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:.4,ammoniacalN:.05,ureaN:.55}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-grow-micro-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://www.progressive-growth.com/products/ph-perfect-bloom',type:'distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Bloom_001D_North_Amercia_2025_01_21.pdf',type:'official-sds',checked:'2026-09-21'},
    notes:'Official current page confirms 1-3-4. A 2021 Washington State fertilizer sample lists the sulfur guarantee at 0.2%; some retailer copies show 0.5%, so the secondary analysis remains flagged for current-label verification.'
  },

  // CropSalt — guaranteed analyses transcribed from the current official package labels.
  {
    id:'cropsalt-veg-a', compareGroup:'component', manufacturer:'CS Consulting', brand:'CropSalt', displayFormula:'3-7-16 (Veg A)', componentName:'Veg A', name:'CropSalt Veg A 3-7-16', form:'dry',
    analysis:{N:3,P2O5:7,K2O:16,Ca:0,Mg:6,S:8,Fe:.15,Mn:0,Zn:0,B:.03,Cu:0,Mo:.005},
    nitrogenForms:{nitrateN:2.7,ammoniacalN:.3}, useRates:[],
    source:{url:'https://cropsalt.com/products/veg-a-1',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://cropsalt.com/cdn/shop/products/veg-a-257184.png?v=1687379668&width=1946',type:'official-package-label',checked:'2026-09-21'}
  },
  {
    id:'cropsalt-veg-b', compareGroup:'component', manufacturer:'CS Consulting', brand:'CropSalt', displayFormula:'14-0-0 (Veg B)', componentName:'Veg B', name:'CropSalt Veg B 14-0-0', form:'dry',
    analysis:{N:14,P2O5:0,K2O:0,Ca:19,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:13.1,ammoniacalN:.9}, useRates:[],
    source:{url:'https://cropsalt.com/products/veg-b-1',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://cropsalt.com/cdn/shop/products/veg-b-980830.png?v=1687379668&width=1946',type:'official-package-label',checked:'2026-09-21'}
  },
  {
    id:'cropsalt-bloom-a', compareGroup:'component', manufacturer:'CS Consulting', brand:'CropSalt', displayFormula:'3-12-22 (Bloom A)', componentName:'Bloom A', name:'CropSalt Bloom A 3-12-22', form:'dry',
    analysis:{N:3,P2O5:12,K2O:22,Ca:0,Mg:5,S:9,Fe:.15,Mn:0,Zn:0,B:.02,Cu:0,Mo:.005},
    nitrogenForms:{nitrateN:2.7,ammoniacalN:.3}, useRates:[],
    source:{url:'https://cropsalt.com/products/bloom-a-1',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://cropsalt.com/cdn/shop/products/bloom-a-640016.png?v=1687379662&width=1946',type:'official-package-label',checked:'2026-09-21'}
  },
  {
    id:'cropsalt-bloom-b', compareGroup:'component', manufacturer:'CS Consulting', brand:'CropSalt', displayFormula:'13-0-0 (Bloom B)', componentName:'Bloom B', name:'CropSalt Bloom B 13-0-0', form:'dry',
    analysis:{N:13,P2O5:0,K2O:0,Ca:18,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:12.1,ammoniacalN:.9}, useRates:[],
    source:{url:'https://cropsalt.com/products/bloom-b-1',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://cropsalt.com/cdn/shop/products/bloom-b-940824.png?v=1687379663&width=1946',type:'official-package-label',checked:'2026-09-21'}
  },

  {
    id:'greenplanet-dual-fuel-1', compareGroup:'component', manufacturer:'GreenPlanet Nutrients', brand:'GreenPlanet Nutrients', displayFormula:'5-0-1 (Dual Fuel 1)', componentName:'Dual Fuel 1', name:'Dual Fuel 1 5-0-1', form:'liquid', densityGPerMl:1.24,
    analysis:{N:5,P2O5:0,K2O:1,Ca:5,Mg:0,S:0,Fe:.11,Mn:.04,Zn:.01,B:.02,Cu:.007,Mo:.0005},
    nitrogenForms:{nitrateN:4.85,ammoniacalN:.15}, useRates:[],
    source:{url:'https://greenplanetnutrients.com/product/greenplanet-nutrients-dual-fuel-1-2',type:'official-product-page',checked:'2026-09-21'},
    densitySource:{url:'https://www.greenplanetnutrients.ca/wp-content/uploads/2020/12/Dual-Fuel-1-SDS-18_07_16.pdf',type:'official-sds',checked:'2026-09-21'}
  },
  {
    id:'greenplanet-dual-fuel-2', compareGroup:'component', manufacturer:'GreenPlanet Nutrients', brand:'GreenPlanet Nutrients', displayFormula:'0-3-6 (Dual Fuel 2)', componentName:'Dual Fuel 2', name:'Dual Fuel 2 0-3-6', form:'liquid', densityGPerMl:1.2,
    analysis:{N:0,P2O5:3,K2O:6,Ca:0,Mg:1.5,S:2.5,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[],
    source:{url:'https://greenplanetnutrients.com/product/greenplanet-nutrients-dual-fuel-1-2',type:'official-product-page',checked:'2026-09-21'},
    densitySource:{url:'https://greenplanetnutrients.com/wp-content/uploads/2020/12/Dual-Fuel-2-SDS-18_07_16.pdf',type:'official-sds',checked:'2026-09-21'}
  },

  {
    id:'house-garden-bio-1-component-soil', compareGroup:'1-part', manufacturer:'House & Garden', brand:'House & Garden', program:'Bio 1-Component Soil', displayFormula:'0.2-0.2-0.5', partCount:1, name:'Bio 1-Component Soil 0.2-0.2-0.5', form:'liquid',
    analysis:{N:.2,P2O5:.2,K2O:.5,Ca:0,Mg:.5,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:.001},
    nitrogenForms:{nitrateN:.16,ammoniacalN:.04}, useRates:[],
    recommendedRates:[{label:'Manufacturer application range',original:'2–18 mL/US gal / 0.5–5 mL/L'}],
    source:{url:'https://house-garden.us/products/bio-1-component-soil/',type:'official-product-page',checked:'2026-09-21'},
    notes:'One-part base nutrient specifically for soil amended with lime. The official page says it contains no added calcium. Manufacturer volume rates are retained as metadata but are not loaded as ppm presets until product density is verified.'
  },

  // Emerald Harvest Cali Pro — current official analyses, 1:1 A:B program, and SDS densities.
  {
    id:'emerald-cali-pro-grow-a', compareGroup:'component', manufacturer:'Emerald Harvest', brand:'Emerald Harvest', displayFormula:'3-0-0 (Grow A)', componentName:'Grow A', name:'Cali Pro Grow A 3-0-0', form:'liquid', densityGPerMl:1.08,
    analysis:{N:3,P2O5:0,K2O:0,Ca:2,Mg:0,S:0,Fe:.1,Mn:.04,Zn:.02,B:.02,Cu:.005,Mo:.002},
    nitrogenForms:{nitrateN:2,ammoniacalN:.5,ureaN:.5}, useRates:[],
    source:{url:'https://emeraldharvest.co/product/cali-pro/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH_Product_Guide_LR_2023_02_24.pdf',type:'official-product-guide',checked:'2026-09-21'},
    densitySource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/Cali-Pro-Grow-A-SDS-2019-10-22.pdf',type:'official-sds',checked:'2026-09-21'}
  },
  {
    id:'emerald-cali-pro-grow-b', compareGroup:'component', manufacturer:'Emerald Harvest', brand:'Emerald Harvest', displayFormula:'2-2-5 (Grow B)', componentName:'Grow B', name:'Cali Pro Grow B 2-2-5', form:'liquid', densityGPerMl:1.10,
    analysis:{N:2,P2O5:2,K2O:5,Ca:0,Mg:.5,S:.5,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:1.7,ammoniacalN:.3}, useRates:[],
    source:{url:'https://emeraldharvest.co/product/cali-pro/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH_Product_Guide_LR_2023_02_24.pdf',type:'official-product-guide',checked:'2026-09-21'},
    densitySource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/Cali-Pro-Grow-B-SDS-2019-10-22.pdf',type:'official-sds',checked:'2026-09-21'}
  },
  {
    id:'emerald-cali-pro-bloom-a', compareGroup:'component', manufacturer:'Emerald Harvest', brand:'Emerald Harvest', displayFormula:'3-0-3 (Bloom A)', componentName:'Bloom A', name:'Cali Pro Bloom A 3-0-3', form:'liquid', densityGPerMl:1.11,
    analysis:{N:3,P2O5:0,K2O:3,Ca:2,Mg:0,S:0,Fe:.1,Mn:.04,Zn:.02,B:.02,Cu:.005,Mo:.002},
    nitrogenForms:{nitrateN:2.5,ureaN:.5}, useRates:[],
    source:{url:'https://emeraldharvest.co/product/cali-pro/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH_Product_Guide_LR_2023_02_24.pdf',type:'official-product-guide',checked:'2026-09-21'},
    densitySource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/Cali-Pro-Bloom-A-SDS-2019-10-22.pdf',type:'official-sds',checked:'2026-09-21'}
  },
  {
    id:'emerald-cali-pro-bloom-b', compareGroup:'component', manufacturer:'Emerald Harvest', brand:'Emerald Harvest', displayFormula:'1-4-6 (Bloom B)', componentName:'Bloom B', name:'Cali Pro Bloom B 1-4-6', form:'liquid', densityGPerMl:1.15,
    analysis:{N:1,P2O5:4,K2O:6,Ca:0,Mg:1,S:.5,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:1}, useRates:[],
    source:{url:'https://emeraldharvest.co/product/cali-pro/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH_Product_Guide_LR_2023_02_24.pdf',type:'official-product-guide',checked:'2026-09-21'},
    densitySource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/Cali-Pro-Bloom-B-SDS-2019-10-22.pdf',type:'official-sds',checked:'2026-09-21'}
  },

  // Advanced Nutrients — two-part base families. Official product pages establish current NPK,
  // equal-volume A:B use, stage rates, and regional availability. Secondary/micro guarantees use
  // current retailer copies of manufacturer labels where the official page only exposes headline NPK.
  // Current official SDS files publish density ranges for several parts; densityGPerMl stores the
  // midpoint solely to make volume-based chemistry calculable, and densityEstimate keeps that
  // approximation explicit for the UI.
  {
    id:'advanced-sensi-grow-a', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'3-0-0 (Grow A)', componentName:'Grow A', name:'pH Perfect Sensi Grow A 3-0-0', form:'liquid', densityGPerMl:1.155,
    analysis:{N:3,P2O5:0,K2O:0,Ca:3,Mg:.5,S:0,Fe:.03,Mn:.05,Zn:.02,B:.03,Cu:.001,Mo:.0001},
    useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-sensi-grow-a-4-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Sensi_Grow_A_Base_001C_North_America_2026_04_16.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.146–1.164'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.146,max:1.164},
    notes:'Zeros represent nutrients without a guaranteed percentage in the cited label copy, not necessarily chemical absence.'
  },
  {
    id:'advanced-sensi-grow-b', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'1-2-6 (Grow B)', componentName:'Grow B', name:'pH Perfect Sensi Grow B 1-2-6', form:'liquid', densityGPerMl:1.1665,
    analysis:{N:1,P2O5:2,K2O:6,Ca:0,Mg:0,S:1.3,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:.94,ammoniacalN:.03,ureaN:.03}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-sensi-grow-b-10-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Sensi_Grow_B_002B_North_America_2026_05_25.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.143–1.190'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.143,max:1.190},
    notes:'Zeros represent nutrients without a guaranteed percentage in the cited label copy, not necessarily chemical absence.'
  },
  {
    id:'advanced-sensi-bloom-a', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'3-0-0 (Bloom A)', componentName:'Bloom A', name:'pH Perfect Sensi Bloom A 3-0-0', form:'liquid', densityGPerMl:1.138,
    analysis:{N:3,P2O5:0,K2O:0,Ca:2.1,Mg:.6,S:0,Fe:.04,Mn:.05,Zn:.02,B:0,Cu:.001,Mo:.0002},
    nitrogenForms:{nitrateN:2.2,ureaN:.8}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-sensi-bloom-a-500-ml',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Sensi_Bloom_A_Base_001C_North_America_2026_04_14.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.134–1.142'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.134,max:1.142},
    notes:'Zeros represent nutrients without a guaranteed percentage in the cited label copy, not necessarily chemical absence.'
  },
  {
    id:'advanced-sensi-bloom-b', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'2-4-8 (Bloom B)', componentName:'Bloom B', name:'pH Perfect Sensi Bloom B 2-4-8', form:'liquid', densityGPerMl:1.161,
    analysis:{N:2,P2O5:4,K2O:8,Ca:0,Mg:0,S:.4,Fe:0,Mn:0,Zn:0,B:.01,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:1.7,ammoniacalN:.03,ureaN:.27}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-sensi-bloom-b-10-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Sensi_Bloom_B_001C_North_America_2026_05_25.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.120–1.202'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.120,max:1.202},
    notes:'Zeros represent nutrients without a guaranteed percentage in the cited label copy, not necessarily chemical absence.'
  },

  {
    id:'advanced-sensi-coco-grow-a', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'3-0-0 (Grow A)', componentName:'Grow A', name:'pH Perfect Sensi Coco Grow A 3-0-0', form:'liquid', densityGPerMl:1.18,
    analysis:{N:3,P2O5:0,K2O:0,Ca:3,Mg:.5,S:0,Fe:.17,Mn:.05,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:3}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-coco-grow-bloom/',type:'official-product-page',checked:'2026-09-21',region:'Europe and Canada'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-sensi-coco-grow-a-1-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Sensi_Coco_Grow_A_001F_North_America_4_17_2026.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.174–1.186'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.174,max:1.186},
    notes:'Current official product page lists this line for Europe and Canada. Zeros mean no guaranteed percentage located in the cited label copy.'
  },
  {
    id:'advanced-sensi-coco-grow-b', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'1-2-4 (Grow B)', componentName:'Grow B', name:'pH Perfect Sensi Coco Grow B 1-2-4', form:'liquid', densityGPerMl:1.085,
    analysis:{N:1,P2O5:2,K2O:4,Ca:0,Mg:0,S:.8,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:.5,ureaN:.5}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-coco-grow-bloom/',type:'official-product-page',checked:'2026-09-21',region:'Europe and Canada'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-sensi-coco-grow-b-1-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Sensi_Coco_Grow_Part_B_Base_Nutrient_005B_North_America_2025_01_21.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.080–1.090'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.080,max:1.090},
    notes:'Current official product page lists this line for Europe and Canada. Zeros mean no guaranteed percentage located in the cited label copy.'
  },
  {
    id:'advanced-sensi-coco-bloom-a', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'4-0-0 (Bloom A)', componentName:'Bloom A', name:'pH Perfect Sensi Coco Bloom A 4-0-0', form:'liquid', densityGPerMl:1.18,
    analysis:{N:4,P2O5:0,K2O:0,Ca:3,Mg:.9,S:0,Fe:.17,Mn:.05,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:3.4,ureaN:.6}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-coco-grow-bloom/',type:'official-product-page',checked:'2026-09-21',region:'Europe and Canada'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-sensi-coco-bloom-a-1-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Sensi_Coco_Bloom_Part_A_Base_Nutrient_002D_North_America_2025_01_21.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.174–1.186'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.174,max:1.186},
    notes:'Current official product page lists this line for Europe and Canada. Zeros mean no guaranteed percentage located in the cited label copy.'
  },
  {
    id:'advanced-sensi-coco-bloom-b', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'0-4-5 (Bloom B)', componentName:'Bloom B', name:'pH Perfect Sensi Coco Bloom B 0-4-5', form:'liquid', densityGPerMl:1.114,
    analysis:{N:0,P2O5:4,K2O:5,Ca:0,Mg:0,S:.9,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-coco-grow-bloom/',type:'official-product-page',checked:'2026-09-21',region:'Europe and Canada'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-sensi-coco-bloom-b-1-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Sensi_Coco_Bloom_Part_B_Base_Nutrient_002C_North_America_2025_01_21.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.110–1.118'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.110,max:1.118},
    notes:'Current official product page lists this line for Europe and Canada. Zeros mean no guaranteed percentage located in the cited label copy.'
  },

  {
    id:'advanced-connoisseur-grow-a', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'4-0-0 (Grow A)', componentName:'Grow A', name:'pH Perfect Connoisseur Grow A 4-0-0', form:'liquid', densityGPerMl:1.187,
    analysis:{N:4,P2O5:0,K2O:0,Ca:3.5,Mg:.9,S:0,Fe:.05,Mn:.05,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:4}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-connoisseur-grow-bloom/',type:'official-product-page',checked:'2026-09-21',region:'Europe, Canada and Brazil'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-connoisseur-grow-a-4-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Connoisseur_Grow_Part_A_Base_Nutrient_004A_North_America_2025_01_21.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.187 g/mL'},
    notes:'Current official product page lists this line for Europe, Canada and Brazil. Zeros mean no guaranteed percentage located in the cited label copy.'
  },
  {
    id:'advanced-connoisseur-grow-b', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'1-2-7 (Grow B)', componentName:'Grow B', name:'pH Perfect Connoisseur Grow B 1-2-7', form:'liquid', densityGPerMl:1.149,
    analysis:{N:1,P2O5:2,K2O:7,Ca:0,Mg:0,S:1.5,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:.9,ammoniacalN:.1}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-connoisseur-grow-bloom/',type:'official-product-page',checked:'2026-09-21',region:'Europe, Canada and Brazil'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-connoisseur-grow-b-4-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Connoisseur_Grow_Part_B_Base_Nutrient_006B_North_America_2025_01_21.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.142–1.156'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.142,max:1.156},
    notes:'Current official product page lists this line for Europe, Canada and Brazil. Zeros mean no guaranteed percentage located in the cited label copy.'
  },
  {
    id:'advanced-connoisseur-bloom-a', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'3-0-0 (Bloom A)', componentName:'Bloom A', name:'pH Perfect Connoisseur Bloom A 3-0-0', form:'liquid', densityGPerMl:1.149,
    analysis:{N:3,P2O5:0,K2O:0,Ca:2.2,Mg:.7,S:0,Fe:.05,Mn:.05,Zn:.02,B:.039,Cu:.001,Mo:.0002},
    nitrogenForms:{nitrateN:2.5,ureaN:.5}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-connoisseur-grow-bloom/',type:'official-product-page',checked:'2026-09-21',region:'Europe, Canada and Brazil'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-connoisseur-bloom-a-1-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Conn_Bloom_A_001C_North_America_4_7_2026.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.149 g/mL'},
    notes:'Current official product page lists this line for Europe, Canada and Brazil.'
  },
  {
    id:'advanced-connoisseur-bloom-b', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'2-4-10 (Bloom B)', componentName:'Bloom B', name:'pH Perfect Connoisseur Bloom B 2-4-10', form:'liquid', densityGPerMl:1.2085,
    analysis:{N:2,P2O5:4,K2O:10,Ca:0,Mg:0,S:.4,Fe:0,Mn:0,Zn:0,B:.04,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:1.95,ammoniacalN:.05}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-connoisseur-grow-bloom/',type:'official-product-page',checked:'2026-09-21',region:'Europe, Canada and Brazil'},
    analysisSource:{url:'https://provisiongardens.com/products/advanced-nutrients-ph-perfect-connoisseur-bloom-b-4-litre',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    densitySource:{url:'https://www.advancednutrients.com/safety-data-sheets/na-eu/Advanced_Nutrients_pH_Perfect_Connoisseur_Bloom_Part_B_Base_Nutrient_001C_North_America_2025_01_21.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.197–1.220'},
    densityEstimate:{method:'midpoint-of-official-sds-range',min:1.197,max:1.220},
    notes:'Current official product page lists this line for Europe, Canada and Brazil. Zeros mean no guaranteed percentage located in the cited label copy.'
  },

  // Advanced Nutrients Sensi Professional Series water-soluble powder.
  // Advanced Nutrients announced global discontinuation in April 2026; retained here as a
  // legacy commercial program because existing users may still have inventory and compare recipes.
  {
    id:'advanced-sensi-wsp-grow-a', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'9-10-28 (Grow A)', componentName:'Grow A', name:'Sensi Professional WSP Grow A 9-10-28', form:'dry', lifecycle:'discontinued-2026',
    analysis:{N:9,P2O5:10,K2O:28,Ca:0,Mg:3,S:4.8,Fe:.2,Mn:.2,Zn:.03,B:.04,Cu:.002,Mo:.0005},
    nitrogenForms:{nitrateN:6.23,ammoniacalN:.3,ureaN:2.17}, useRates:[],
    source:{url:'https://www.advancednutrients.com/articles/sensi-wsp-discontinued/',type:'official-discontinuation-notice',checked:'2026-09-21'},
    analysisSource:{url:'https://hydrobuilder.com/products/advanced-nutrients-sensi-professional-series-grow-a-soluble',type:'reputable-distributor-label-copy',checked:'2026-09-21'}
  },
  {
    id:'advanced-sensi-wsp-grow-b', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'15-0-0 (Grow B)', componentName:'Grow B', name:'Sensi Professional WSP Grow B 15-0-0', form:'dry', lifecycle:'discontinued-2026',
    analysis:{N:15,P2O5:0,K2O:0,Ca:18.5,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:14,ammoniacalN:1}, useRates:[],
    source:{url:'https://www.advancednutrients.com/articles/sensi-wsp-discontinued/',type:'official-discontinuation-notice',checked:'2026-09-21'},
    analysisSource:{url:'https://hydrobuilder.com/products/advanced-nutrients-sensi-professional-series-grow-b-soluble',type:'reputable-distributor-label-copy',checked:'2026-09-21'}
  },
  {
    id:'advanced-sensi-wsp-bloom-a', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'10-14-26 (Bloom A)', componentName:'Bloom A', name:'Sensi Professional WSP Bloom A 10-14-26', form:'dry', lifecycle:'discontinued-2026',
    analysis:{N:10,P2O5:14,K2O:26,Ca:0,Mg:2.85,S:3.78,Fe:.15,Mn:.15,Zn:.04,B:.04,Cu:.002,Mo:.0005},
    nitrogenForms:{nitrateN:5.86,ammoniacalN:.69,ureaN:3.45}, useRates:[],
    source:{url:'https://www.advancednutrients.com/articles/sensi-wsp-discontinued/',type:'official-discontinuation-notice',checked:'2026-09-21'},
    analysisSource:{url:'https://hydrobuilder.com/products/advanced-nutrients-sensi-professional-series-bloom-a-soluble',type:'reputable-distributor-label-copy',checked:'2026-09-21'}
  },
  {
    id:'advanced-sensi-wsp-bloom-b', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'17-0-6 (Bloom B)', componentName:'Bloom B', name:'Sensi Professional WSP Bloom B 17-0-6', form:'dry', lifecycle:'discontinued-2026',
    analysis:{N:17,P2O5:0,K2O:6,Ca:14,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:14.2,ammoniacalN:2.8}, useRates:[],
    source:{url:'https://www.advancednutrients.com/articles/sensi-wsp-discontinued/',type:'official-discontinuation-notice',checked:'2026-09-21'},
    analysisSource:{url:'https://hydrobuilder.com/products/advanced-nutrients-sensi-professional-series-bloom-b-soluble',type:'reputable-distributor-label-copy',checked:'2026-09-21'}
  },

  // Advanced Nutrients Cultivator Series — current three-part professional WSP.
  {
    id:'advanced-cultivator-base', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'14-0-0 (Base)', componentName:'Base', name:'Cultivator Series Base 14-0-0', form:'dry',
    analysis:{N:14,P2O5:0,K2O:0,Ca:17,Mg:0,S:0,Fe:.32,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:13.1,ammoniacalN:.9}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/cultivator-series/',type:'official-product-page-and-feed-chart',checked:'2026-09-21'},
    analysisSource:{url:'https://hydrobuilder.com/products/advanced-nutrients-cultivator-series-base',type:'reputable-distributor-label-copy',checked:'2026-09-21'},
    notes:'Current Base formula reflects the 2025 pharmaceutical-grade chelated-iron update.'
  },
  {
    id:'advanced-cultivator-grow', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'2-9-24 (Grow)', componentName:'Grow', name:'Cultivator Series Grow 2-9-24', form:'dry',
    analysis:{N:2,P2O5:9,K2O:24,Ca:0,Mg:3.8,S:8,Fe:.199,Mn:.256,Zn:.042,B:.051,Cu:.004,Mo:.0007},
    nitrogenForms:{nitrateN:1.96,ureaN:.04}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/cultivator-series/',type:'official-product-page-and-feed-chart',checked:'2026-09-21'},
    analysisSource:{url:'https://hydrobuilder.com/products/advanced-nutrients-cultivator-series-grow',type:'reputable-distributor-label-copy',checked:'2026-09-21'}
  },
  {
    id:'advanced-cultivator-bloom', compareGroup:'component', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', displayFormula:'3-13-26 (Bloom)', componentName:'Bloom', name:'Cultivator Series Bloom 3-13-26', form:'dry',
    analysis:{N:3,P2O5:13,K2O:26,Ca:0,Mg:3,S:7,Fe:.124,Mn:.174,Zn:.059,B:.051,Cu:.004,Mo:.0007},
    nitrogenForms:{nitrateN:2.64,ureaN:.36}, useRates:[],
    source:{url:'https://www.advancednutrients.com/products/cultivator-series/',type:'official-product-page-and-feed-chart',checked:'2026-09-21'},
    analysisSource:{url:'https://hydrobuilder.com/products/advanced-nutrients-cultivator-series-bloom',type:'reputable-distributor-label-copy',checked:'2026-09-21'}
  },

  // Front Row Ag — current 3-part dry program.
  {
    id:'frontrow-part-a', compareGroup:'component', manufacturer:'Front Row Ag LLC', brand:'Front Row Ag', displayFormula:'14-0-8 (Part A)', componentName:'Part A', name:'Front Row Ag Part A 14-0-8', form:'dry',
    analysis:{N:14,P2O5:0,K2O:8,Ca:14,Mg:0,S:0,Fe:.35,Mn:.10,Zn:.05,B:.05,Cu:.05,Mo:.003},
    nitrogenForms:{nitrateN:14}, useRates:[],
    source:{url:'https://www.frontrowag.com/pages/resources',type:'official-product-label-index',checked:'2026-09-21'},
    analysisSource:{url:'https://hydrobuilder.com/products/front-row-ag-part-a-14-0-8-25-lb',type:'reputable-distributor-copy-of-official-label',checked:'2026-09-21'}
  },
  {
    id:'frontrow-part-b', compareGroup:'component', manufacturer:'Front Row Ag LLC', brand:'Front Row Ag', displayFormula:'2-13-17 (Part B)', componentName:'Part B', name:'Front Row Ag Part B 2-13-17', form:'dry',
    analysis:{N:2,P2O5:13,K2O:17,Ca:0,Mg:5,S:7,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:2}, useRates:[],
    source:{url:'https://cdn.shopify.com/s/files/1/0049/3987/4378/files/FrontRowAg-5lbBag-PartB-ForReading.pdf?v=1698102765',type:'official-product-label',checked:'2026-09-21'}
  },
  {
    id:'frontrow-bloom', compareGroup:'component', manufacturer:'Front Row Ag LLC', brand:'Front Row Ag', displayFormula:'0-35-29 (Bloom)', componentName:'Bloom', name:'Front Row Ag Bloom 0-35-29', form:'dry',
    analysis:{N:0,P2O5:35,K2O:29,Ca:0,Mg:1.5,S:4,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[],
    source:{url:'https://cdn.shopify.com/s/files/1/0049/3987/4378/files/FrontRowAg-5lbBag-BLOOM-ForReading.pdf?v=1698102765',type:'official-product-label',checked:'2026-09-21'}
  },

  // General Hydroponics FloraPro Powders — current commercial two-part dry base program.
  {
    id:'gh-florapro-calcium-micros', compareGroup:'component', manufacturer:'General Hydroponics', brand:'General Hydroponics', displayFormula:'14-0-0 (Calcium + Micros)', componentName:'Calcium + Micros', name:'FloraPro Calcium + Micros 14-0-0 + 17% Ca', form:'dry',
    analysis:{N:14,P2O5:0,K2O:0,Ca:17,Mg:0,S:0,Fe:.30,Mn:.09,Zn:.02,B:.06,Cu:.02,Mo:.007},
    nitrogenForms:{nitrateN:13.1,ammoniacalN:.9}, useRates:[],
    source:{url:'https://generalhydroponics.com/products/gh-florapro-calcium-plus-micros',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://generalhydroponics.com/wp-content/uploads/assets/GH-FloraPro-CA-Micros-5-lb-CFL.pdf',type:'official-product-label',checked:'2026-09-21'}
  },
  {
    id:'gh-florapro-grow', compareGroup:'component', manufacturer:'General Hydroponics', brand:'General Hydroponics', displayFormula:'10-12-22 (Grow)', componentName:'Grow', name:'FloraPro Grow 10-12-22', form:'dry',
    analysis:{N:10,P2O5:12,K2O:22,Ca:0,Mg:3.5,S:4.5,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[],
    source:{url:'https://generalhydroponics.com/products/gh-florapro-grow',type:'official-product-page',checked:'2026-09-21'},
    notes:'Official current page publishes total N but not the guaranteed nitrate/ammoniacal split, so nitrogenForms is intentionally omitted.'
  },
  {
    id:'gh-florapro-bloom', compareGroup:'component', manufacturer:'General Hydroponics', brand:'General Hydroponics', displayFormula:'7-12-27 (Bloom)', componentName:'Bloom', name:'FloraPro Bloom 7-12-27', form:'dry',
    analysis:{N:7,P2O5:12,K2O:27,Ca:0,Mg:5,S:6.5,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:6.5,ammoniacalN:.5}, useRates:[],
    source:{url:'https://generalhydroponics.com/products/gh-florapro-bloom',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://generalhydroponics.com/wp-content/uploads/assets/GH-FloraPro-Bloom-5-lb-CFL.pdf',type:'official-product-label',checked:'2026-09-21'}
  },

  // General Hydroponics FloraSeries — current true 3-part liquid base system.
  {
    id:'gh-floraseries-micro', compareGroup:'component', manufacturer:'General Hydroponics', brand:'General Hydroponics', displayFormula:'5-0-1 (FloraMicro)', componentName:'FloraMicro', name:'FloraMicro 5-0-1', form:'liquid', densityGPerMl:1.25,
    analysis:{N:5,P2O5:0,K2O:1,Ca:5,Mg:0,S:0,Fe:.1,Mn:.05,Zn:.015,B:.01,Cu:.01,Mo:.0008},
    nitrogenForms:{nitrateN:4.7,ammoniacalN:.3}, useRates:[],
    source:{url:'https://generalhydroponics.com/products/gh-flora-micro',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://generalhydroponics.com/wp-content/uploads/assets/HGC718014-01-GENERAL-HYDROPONICS-FLORASERIES-PERFORMANCE-PACK-71OZ-LIQIUD-BASE-NUTRIENT-3-16OZ-LIQUID-SUPPLEMENTS-2-8OZ-1-4OZ-3-1OZ052620SSL.pdf',type:'official-label',checked:'2026-09-21'},
    densitySource:{type:'official-sds',checked:'2026-09-21',original:'Relative density 1.25'}
  },
  {
    id:'gh-floraseries-gro', compareGroup:'component', manufacturer:'General Hydroponics', brand:'General Hydroponics', displayFormula:'2-1-6 (FloraGro)', componentName:'FloraGro', name:'FloraGro 2-1-6', form:'liquid', densityGPerMl:1.138,
    analysis:{N:2,P2O5:1,K2O:6,Ca:0,Mg:.5,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:1.75,ammoniacalN:.25}, useRates:[],
    source:{url:'https://generalhydroponics.com/products/gh-flora-gro',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://generalhydroponics.com/wp-content/uploads/General-Hydroponics_label_floragro.pdf',type:'official-label',checked:'2026-09-21'},
    densitySource:{type:'official-sds',checked:'2026-09-21',original:'Density 1.138 g/cm3'}
  },
  {
    id:'gh-floraseries-bloom', compareGroup:'component', manufacturer:'General Hydroponics', brand:'General Hydroponics', displayFormula:'0-5-4 (FloraBloom)', componentName:'FloraBloom', name:'FloraBloom 0-5-4', form:'liquid', densityGPerMl:1.17,
    analysis:{N:0,P2O5:5,K2O:4,Ca:0,Mg:1.5,S:1,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[],
    source:{url:'https://generalhydroponics.com/products/gh-flora-bloom',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://generalhydroponics.com/wp-content/uploads/assets/florabloom.pdf',type:'official-label',checked:'2026-09-21'},
    densitySource:{type:'manufacturer-sds',checked:'2026-09-21',original:'Relative density 1.170'}
  },

  // GreenPlanet GP3 — current true 3-part liquid base system.
  {
    id:'greenplanet-gp3-grow', compareGroup:'component', manufacturer:'GreenPlanet Nutrients', brand:'GreenPlanet Nutrients', displayFormula:'2-1-6 (GP3 Grow)', componentName:'GP3 Grow', name:'GP3 Grow 2-1-6', form:'liquid', densityGPerMl:1.148,
    analysis:{N:2,P2O5:1,K2O:6,Ca:0,Mg:.5,S:.7,Fe:0,Mn:0,Zn:0,B:0,Cu:.006,Mo:.0008},
    nitrogenForms:{nitrateN:1.75,ammoniacalN:.25}, useRates:[],
    source:{url:'https://greenplanetnutrients.com/product/greenplanet-nutrients-3-part-gp3-grow',type:'official-product-page',checked:'2026-09-21'},
    densitySource:{url:'https://greenplanetnutrients.ca/wp-content/uploads/2022/07/1657293029_CoA-GP3-Grow-35960622.pdf',type:'official-coa',checked:'2026-09-21',original:'Specific gravity result 1.148 g/mL; product specification 1.143 ± 0.01 g/mL'},
    notes:'Density is a manufacturer COA lot result rather than a fixed SDS value; formulation specification allows small lot variation.'
  },
  {
    id:'greenplanet-gp3-micro', compareGroup:'component', manufacturer:'GreenPlanet Nutrients', brand:'GreenPlanet Nutrients', displayFormula:'5-0-1 (GP3 Micro)', componentName:'GP3 Micro', name:'GP3 Micro 5-0-1', form:'liquid', densityGPerMl:1.23,
    analysis:{N:5,P2O5:0,K2O:1,Ca:6,Mg:0,S:0,Fe:.1,Mn:.05,Zn:.025,B:.01,Cu:.004,Mo:.0008},
    nitrogenForms:{nitrateN:4.5,ammoniacalN:.5}, useRates:[],
    source:{url:'https://greenplanetnutrients.com/product/greenplanet-nutrients-3-part-gp3-micro',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://greenplanetnutrients.ca/blog/all/why-growers-should-read-the-guaranteed-analysis-on-fertilizer/',type:'official-guaranteed-analysis',checked:'2026-09-21'},
    densitySource:{url:'https://greenplanetnutrients.ca/wp-content/uploads/2020/12/GP3-Micro-SDS-08_03_16.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.23 g/mL'}
  },
  {
    id:'greenplanet-gp3-bloom', compareGroup:'component', manufacturer:'GreenPlanet Nutrients', brand:'GreenPlanet Nutrients', displayFormula:'0-5-4 (GP3 Bloom)', componentName:'GP3 Bloom', name:'GP3 Bloom 0-5-4', form:'liquid', densityGPerMl:1.17,
    analysis:{N:0,P2O5:5,K2O:4,Ca:0,Mg:1.5,S:2,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[],
    source:{url:'https://greenplanetnutrients.com/product/greenplanet-nutrients-3-part-gp3-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://greenplanetnutrients.com/wp-content/uploads/2021/03/1614792538_02_21_GPN_WEB_Booklet_Interactive_WithFeedchart_compressed.pdf',type:'official-product-guide',checked:'2026-09-21'},
    densitySource:{url:'https://www.greenplanetnutrients.ca/wp-content/uploads/2020/12/GP3-Bloom-SDS-08_03_16.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.17 g/mL'}
  },

  // Emerald Harvest Professional 3-Part — Grow / Micro / Bloom.
  {
    id:'emerald-3part-grow', compareGroup:'component', manufacturer:'Emerald Harvest', brand:'Emerald Harvest', displayFormula:'2-1-6 (Grow)', componentName:'Grow', name:'Emerald Harvest Grow 2-1-6', form:'liquid', densityGPerMl:1.14,
    analysis:{N:2,P2O5:1,K2O:6,Ca:0,Mg:.2,S:.5,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:1.5,ammoniacalN:.5}, useRates:[],
    source:{url:'https://emeraldharvest.co/product/grow-micro-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH_Product_Guide_LR_2023_02_24.pdf',type:'official-product-guide',checked:'2026-09-21'},
    densitySource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/Grow-SDS-2019-10-22.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.14 kg/L'}
  },
  {
    id:'emerald-3part-micro', compareGroup:'component', manufacturer:'Emerald Harvest', brand:'Emerald Harvest', displayFormula:'5-0-1 (Micro)', componentName:'Micro', name:'Emerald Harvest Micro 5-0-1', form:'liquid', densityGPerMl:1.16,
    analysis:{N:5,P2O5:0,K2O:1,Ca:4,Mg:0,S:0,Fe:.1,Mn:.04,Zn:.03,B:.02,Cu:.005,Mo:.002},
    nitrogenForms:{nitrateN:4,ammoniacalN:.5,ureaN:.5}, useRates:[],
    source:{url:'https://emeraldharvest.co/product/grow-micro-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH_Product_Guide_LR_2023_02_24.pdf',type:'official-product-guide',checked:'2026-09-21'},
    densitySource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/Micro-SDS-2019-10-22.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.16 kg/L'}
  },
  {
    id:'emerald-3part-bloom', compareGroup:'component', manufacturer:'Emerald Harvest', brand:'Emerald Harvest', displayFormula:'0-5-4 (Bloom)', componentName:'Bloom', name:'Emerald Harvest Bloom 0-5-4', form:'liquid', densityGPerMl:1.12,
    analysis:{N:0,P2O5:5,K2O:4,Ca:0,Mg:.5,S:1,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[],
    source:{url:'https://emeraldharvest.co/product/grow-micro-bloom/',type:'official-product-page',checked:'2026-09-21'},
    analysisSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH_Product_Guide_LR_2023_02_24.pdf',type:'official-product-guide',checked:'2026-09-21'},
    densitySource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/Bloom-SDS-2019-10-22.pdf',type:'official-sds',checked:'2026-09-21',original:'Relative density 1.12 kg/L'}
  },
  // Raw salts: solubilityGPerL is g per L of water at 20 °C (standard handbook values; Epsom uses the
  // practical fertilizer-supplier figure, 710). Used by "Mix it" to check injector stock strength.
  {
    id:'calcium-nitrate', compareGroup:'salt', brand:'Raw salt', name:'Calcium nitrate', chemicalFormula:'5Ca(NO₃)₂·NH₄NO₃·10H₂O', form:'dry',
    analysis:{N:15.5,P2O5:0,K2O:0,Ca:19,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, nitrogenForms:{nitrateN:14.4,ammoniacalN:1.1}, useRates:[], solubilityGPerL:1200,
    source:{type:'fertilizer-grade',checked:'2026-09-22'},
    notes:'Standard fertilizer-grade analysis of the calcium ammonium nitrate double salt (about 14.4% nitrate-N, 1.1% ammonium-N).'
  },
  {
    id:'calcium-nitrate-tetrahydrate', compareGroup:'salt', brand:'Raw salt', name:'Calcium nitrate — no ammonium', chemicalFormula:'Ca(NO₃)₂·4H₂O', form:'dry',
    analysis:{N:11.86,P2O5:0,K2O:0,Ca:16.97,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, nitrogenForms:{nitrateN:11.86}, useRates:[], solubilityGPerL:1290,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Pure calcium nitrate with no ammonium. Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'potassium-nitrate', compareGroup:'salt', brand:'Raw salt', name:'Potassium nitrate — Saltpeter', chemicalFormula:'KNO₃', form:'dry',
    analysis:{N:13.85,P2O5:0,K2O:46.58,Ca:0,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, nitrogenForms:{nitrateN:13.85}, useRates:[], solubilityGPerL:316,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'mkp-0-52-34', compareGroup:'salt', brand:'Raw salt', name:'Monopotassium phosphate — MKP', chemicalFormula:'KH₂PO₄', form:'dry',
    analysis:{N:0,P2O5:52.15,K2O:34.61,Ca:0,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[], solubilityGPerL:226,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'monoammonium-phosphate', compareGroup:'salt', brand:'Raw salt', name:'Monoammonium phosphate — MAP', chemicalFormula:'NH₄H₂PO₄', form:'dry',
    analysis:{N:12.18,P2O5:61.7,K2O:0,Ca:0,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, nitrogenForms:{ammoniacalN:12.18}, useRates:[], solubilityGPerL:368,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'dipotassium-phosphate', compareGroup:'salt', brand:'Raw salt', name:'Dipotassium phosphate — DKP', chemicalFormula:'K₂HPO₄', form:'dry',
    analysis:{N:0,P2O5:40.75,K2O:54.08,Ca:0,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[], solubilityGPerL:1490,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'potassium-sulfate', compareGroup:'salt', brand:'Raw salt', name:'Potassium sulfate — SOP', chemicalFormula:'K₂SO₄', form:'dry',
    analysis:{N:0,P2O5:0,K2O:54.06,Ca:0,Mg:0,S:18.4,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[], solubilityGPerL:111,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'magnesium-sulfate', compareGroup:'salt', brand:'Raw salt', name:'Magnesium sulfate — Epsom salt', chemicalFormula:'MgSO₄·7H₂O', form:'dry',
    analysis:{N:0,P2O5:0,K2O:0,Ca:0,Mg:9.86,S:13.01,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[], solubilityGPerL:710,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'magnesium-sulfate-monohydrate', compareGroup:'salt', brand:'Raw salt', name:'Magnesium sulfate — Kieserite', chemicalFormula:'MgSO₄·H₂O', form:'dry',
    analysis:{N:0,P2O5:0,K2O:0,Ca:0,Mg:17.56,S:23.17,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[], solubilityGPerL:400,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'magnesium-nitrate', compareGroup:'salt', brand:'Raw salt', name:'Magnesium nitrate', chemicalFormula:'Mg(NO₃)₂·6H₂O', form:'dry',
    analysis:{N:10.93,P2O5:0,K2O:0,Ca:0,Mg:9.48,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, nitrogenForms:{nitrateN:10.93}, useRates:[], solubilityGPerL:1250,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'ammonium-sulfate', compareGroup:'salt', brand:'Raw salt', name:'Ammonium sulfate — AMS', chemicalFormula:'(NH₄)₂SO₄', form:'dry',
    analysis:{N:21.2,P2O5:0,K2O:0,Ca:0,Mg:0,S:24.26,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, nitrogenForms:{ammoniacalN:21.2}, useRates:[], solubilityGPerL:744,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  },
  {
    id:'urea', compareGroup:'salt', brand:'Raw salt', name:'Urea', chemicalFormula:'CO(NH₂)₂', form:'dry',
    analysis:{N:46.65,P2O5:0,K2O:0,Ca:0,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, nitrogenForms:{ureaN:46.65}, useRates:[], solubilityGPerL:1079,
    source:{type:'stoichiometry',checked:'2026-09-22'},
    notes:'All nitrogen is urea-N, which converts to ammonium and then nitrate. Theoretical analysis from the chemical formula (standard atomic weights); fertilizer grades can run slightly lower.'
  }
];

window.FERTILIZER_SYSTEMS = [
  {
    id:'megacrop-2part-uploaded', partCount:2, manufacturer:'Greenleaf Nutrients', brand:'Mega Crop', program:'2-Part', displayFormula:'8-12-28 (A) + 15.5-0-0 (B)', name:'Mega Crop 2-Part — uploaded 8-12-28 formula',
    ratioBasis:'mass', components:[
      {productId:'megacrop-2part-a-8-12-28',label:'Part A',defaultParts:1},
      {productId:'megacrop-2part-b-15-5-0-0',label:'Part B',defaultParts:1}
    ],
    ratioNote:'A:B is user-adjustable. The 1:1 default is only a neutral starting point, not a manufacturer recommendation.', useRates:[],
    source:{type:'uploaded-label',checked:'2026-09-19'}, notes:'Derived from the uploaded Mega Crop 2-Part A and B guaranteed-analysis labels; no system-level feed chart is published.'
  },
  {
    id:'jacks-2part-5-12-26', partCount:2, manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'A/B Fast Track', displayFormula:'5-12-26 (A) + 15-0-0 (B)', name:'2-Part — 5-12-26 A + Cal Nit B',
    ratioBasis:'mass', components:[
      {productId:'jacks-5-12-26-a',label:'Part A',defaultParts:3.8},
      {productId:'jacks-15-0-0-b',label:'Part B',defaultParts:2.5}
    ],
    defaultProfile:'veg', profiles:[
      {id:'veg',label:'Veg',parts:[3.8,2.5]},
      {id:'flower',label:'Flower',parts:[5.68,2.5]}
    ],
    ratioNote:'Default comparison profile is Jack’s Fast Track Veg rate, 3.80:2.50 g/gal. Choose Flower for the official 5.68:2.50 g/gal profile; both are also available as Use Rate presets.',
    useRates:[
      {profileId:'veg',label:'Official Fast Track — Veg',components:[{productId:'jacks-5-12-26-a',gPerGal:3.8},{productId:'jacks-15-0-0-b',gPerGal:2.5}]},
      {profileId:'flower',label:'Official Fast Track — Flower',components:[{productId:'jacks-5-12-26-a',gPerGal:5.68},{productId:'jacks-15-0-0-b',gPerGal:2.5}]}
    ],
    source:{url:'https://www.jacksnutrients.com/_files/ugd/3230c0_2c6597e4cf9349dbafb03283e8db4a2d.pdf',type:'official-feed-chart',checked:'2026-09-21',original:'Veg: Part A 3.80 + Part B 2.50 g/US gal; Flower: Part A 5.68 + Part B 2.50 g/US gal'}
  },
  {
    id:'jacks-2part-0-12-26', partCount:2, manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'A/B 0-12-26', displayFormula:'0-12-26 (A) + 15-0-0 (B)', name:'2-Part — 0-12-26 A + Cal Nit B',
    ratioBasis:'mass', components:[
      {productId:'jacks-0-12-26-a',label:'Part A',defaultParts:3.7},
      {productId:'jacks-15-0-0-b',label:'Part B',defaultParts:2.438}
    ],
    ratioNote:'Starting balance comes from the supplied label references. Jack’s confirms 0-12-26 is paired with Part B but does not publish a product-specific A:B rate on the official product page.',
    useRates:[],
    source:{url:'https://www.jacksnutrients.com/online-store/0-12-26-Part-A-p571478747',type:'official-product-page',checked:'2026-09-21'},
    ratioSource:{type:'user-supplied-manufacturer-label',checked:'2026-09-19'}
  },
  {
    id:'jacks-321', partCount:3, manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'3-2-1', displayFormula:'5-12-26 (A) + 15-0-0 (B) + Magnesium Sulfate (C)', name:'3-Part 3-2-1 — A + B + Magnesium Sulfate C',
    ratioBasis:'mass', components:[
      {productId:'jacks-5-12-26-a',label:'Part A',defaultParts:3.6},
      {productId:'jacks-15-0-0-b',label:'Part B',defaultParts:2.4},
      {productId:'magnesium-sulfate',label:'Part C',defaultParts:1.1}
    ],
    defaultProfile:'all-stages', profiles:[
      {id:'all-stages',label:'All stages',parts:[3.6,2.4,1.1]}
    ],
    ratioNote:'Jack’s published mixing lesson uses 3.6 g/gal Part A, 1.1 g/gal Epsom, then 2.4 g/gal Part B; displayed as A/B/C here.',
    useRates:[{profileId:'all-stages',label:"Jack's 3-2-1 — All stages",components:[{productId:'jacks-5-12-26-a',gPerGal:3.6},{productId:'jacks-15-0-0-b',gPerGal:2.4},{productId:'magnesium-sulfate',gPerGal:1.1}]}],
    source:{url:'https://www.jacksnutrients.com/post/how-do-i-mix-jack-s-321',type:'official-mixing-guide',checked:'2026-09-21',original:'3.6 g/gal Part A + 1.1 g/gal Epsom + 2.4 g/gal Part B'}
  },
  {
    id:'athena-pro-veg', partCount:2, manufacturer:'Athena Ag', brand:'Athena', program:'Pro Veg', displayFormula:'14-0-0 (Core) + 2-8-20 (Grow)', name:'Pro Line — Veg (Core + Grow)',
    ratioBasis:'mass', components:[
      {productId:'athena-pro-core',label:'Core',defaultParts:.6},
      {productId:'athena-pro-grow',label:'Grow',defaultParts:1}
    ],
    ratioNote:'Manufacturer dry-weight relationship is approximately 0.6 g Core for every 1 g Pro Grow across the dosage guide.', 
    useRates:[{label:'EC 1.0',components:[{productId:'athena-pro-core',gPerGal:1.4},{productId:'athena-pro-grow',gPerGal:2.3}]},{label:'EC 1.5',components:[{productId:'athena-pro-core',gPerGal:2.1},{productId:'athena-pro-grow',gPerGal:3.6}]},{label:'EC 2.0',components:[{productId:'athena-pro-core',gPerGal:2.9},{productId:'athena-pro-grow',gPerGal:4.9}]},{label:'EC 2.5',components:[{productId:'athena-pro-core',gPerGal:3.8},{productId:'athena-pro-grow',gPerGal:6.3}]},{label:'EC 3.0',components:[{productId:'athena-pro-core',gPerGal:4.6},{productId:'athena-pro-grow',gPerGal:7.7}]},{label:'EC 3.5',components:[{productId:'athena-pro-core',gPerGal:5.5},{productId:'athena-pro-grow',gPerGal:9.1}]},{label:'EC 4.0',components:[{productId:'athena-pro-core',gPerGal:6.4},{productId:'athena-pro-grow',gPerGal:10.6}]}],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Pro-Core-Product-Label.pdf',checked:'2026-09-19'}, notes:'Program composed from the Athena Pro Core and Pro Grow component labels; dosage guide in the EC use-rates.'
  },
  {
    id:'athena-pro-bloom', partCount:2, manufacturer:'Athena Ag', brand:'Athena', program:'Pro Bloom', displayFormula:'14-0-0 (Core) + 0-12-24 (Bloom)', name:'Pro Line — Flower (Core + Bloom)',
    ratioBasis:'mass', components:[
      {productId:'athena-pro-core',label:'Core',defaultParts:.6},
      {productId:'athena-pro-bloom-component',label:'Bloom',defaultParts:1}
    ],
    ratioNote:'Manufacturer dry-weight relationship is approximately 0.6 g Core for every 1 g Pro Bloom across the dosage guide.', 
    useRates:[{label:'EC 1.0',components:[{productId:'athena-pro-core',gPerGal:1.4},{productId:'athena-pro-bloom-component',gPerGal:2.3}]},{label:'EC 1.5',components:[{productId:'athena-pro-core',gPerGal:2.1},{productId:'athena-pro-bloom-component',gPerGal:3.6}]},{label:'EC 2.0',components:[{productId:'athena-pro-core',gPerGal:2.9},{productId:'athena-pro-bloom-component',gPerGal:4.9}]},{label:'EC 2.5',components:[{productId:'athena-pro-core',gPerGal:3.8},{productId:'athena-pro-bloom-component',gPerGal:6.3}]},{label:'EC 3.0',components:[{productId:'athena-pro-core',gPerGal:4.6},{productId:'athena-pro-bloom-component',gPerGal:7.7}]},{label:'EC 3.5',components:[{productId:'athena-pro-core',gPerGal:5.5},{productId:'athena-pro-bloom-component',gPerGal:9.1}]},{label:'EC 4.0',components:[{productId:'athena-pro-core',gPerGal:6.4},{productId:'athena-pro-bloom-component',gPerGal:10.6}]}],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Pro-Core-Product-Label.pdf',checked:'2026-09-19'}, notes:'Program composed from the Athena Pro Core and Pro Bloom component labels; dosage guide in the EC use-rates.'
  },
  {
    id:'athena-blended-veg', partCount:2, manufacturer:'Athena Ag', brand:'Athena', program:'Blended Veg', displayFormula:'4-0-1 (Grow A) + 1-3-5 (Grow B)', name:'Blended Line — Veg (Grow A + Grow B)',
    ratioBasis:'volume', components:[
      {productId:'athena-grow-a',label:'Grow A',defaultParts:1},
      {productId:'athena-grow-b',label:'Grow B',defaultParts:1}
    ],
    ratioNote:'Manufacturer specifies equal parts Grow A and Grow B by volume. Full published program also uses CaMg; base-only comparison here excludes that component.', 
    useRates:[{label:'Veg W1-W4 base',components:[{productId:'athena-grow-a',mLPerGal:11},{productId:'athena-grow-b',mLPerGal:11}]}],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Grow-A-Product-Label.pdf',checked:'2026-09-19'}, notes:'Program composed from the Athena Blended Grow A and Grow B component labels; base-only, excludes CaMg.'
  },
  {
    id:'athena-blended-bloom', partCount:2, manufacturer:'Athena Ag', brand:'Athena', program:'Blended Bloom', displayFormula:'4-0-5 (Bloom A) + 0.7-6-5 (Bloom B)', name:'Blended Line — Flower (Bloom A + Bloom B)',
    ratioBasis:'volume', components:[
      {productId:'athena-bloom-a',label:'Bloom A',defaultParts:1},
      {productId:'athena-bloom-b',label:'Bloom B',defaultParts:1}
    ],
    ratioNote:'Manufacturer specifies equal parts Bloom A and Bloom B by volume. Full published program also uses CaMg and later PK; base-only comparison here excludes those components.', 
    useRates:[{label:'Flower W1-W4 base',components:[{productId:'athena-bloom-a',mLPerGal:12},{productId:'athena-bloom-b',mLPerGal:12}]},{label:'Flower W5 base',components:[{productId:'athena-bloom-a',mLPerGal:10},{productId:'athena-bloom-b',mLPerGal:10}]},{label:'Flower W6 base',components:[{productId:'athena-bloom-a',mLPerGal:9},{productId:'athena-bloom-b',mLPerGal:9}]},{label:'Flower W7 base',components:[{productId:'athena-bloom-a',mLPerGal:5},{productId:'athena-bloom-b',mLPerGal:5}]},{label:'Flower W8-W9 base',components:[{productId:'athena-bloom-a',mLPerGal:4},{productId:'athena-bloom-b',mLPerGal:4}]}],
    source:{url:'https://hydrobuilder.com/media/pdf/specs/Athena-Grow-A-Product-Label.pdf',checked:'2026-09-19'}, notes:'Program composed from the Athena Blended Bloom A and Bloom B component labels; base-only, excludes CaMg and later PK.'
  },
  {
    id:'advanced-ph-perfect-gmb', partCount:3, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'pH Perfect Grow Micro Bloom', displayFormula:'1-0-4 (Grow) + 2-0-0 (Micro) + 1-3-4 (Bloom)', name:'pH Perfect Grow Micro Bloom',
    ratioBasis:'volume', components:[
      {productId:'advanced-ph-perfect-grow',label:'Grow',defaultParts:1},
      {productId:'advanced-ph-perfect-micro',label:'Micro',defaultParts:1},
      {productId:'advanced-ph-perfect-bloom',label:'Bloom',defaultParts:1}
    ],
    defaultProfile:'all-stages', profiles:[{id:'all-stages',label:'All stages · 1:1:1',parts:[1,1,1]}],
    ratioNote:'Advanced Nutrients specifies a 1:1:1 Grow:Micro:Bloom ratio by volume. Feed strength rises through vegetative growth, then remains 4 mL/L of each part through bloom until flush.',
    useRates:[
      {profileId:'all-stages',label:'Grow W1 — 1 mL/L each',components:[{productId:'advanced-ph-perfect-grow',mLPerGal:3.785411784},{productId:'advanced-ph-perfect-micro',mLPerGal:3.785411784},{productId:'advanced-ph-perfect-bloom',mLPerGal:3.785411784}]},
      {profileId:'all-stages',label:'Grow W2 — 2 mL/L each',components:[{productId:'advanced-ph-perfect-grow',mLPerGal:7.570823568},{productId:'advanced-ph-perfect-micro',mLPerGal:7.570823568},{productId:'advanced-ph-perfect-bloom',mLPerGal:7.570823568}]},
      {profileId:'all-stages',label:'Grow W3 — 3 mL/L each',components:[{productId:'advanced-ph-perfect-grow',mLPerGal:11.356235352},{productId:'advanced-ph-perfect-micro',mLPerGal:11.356235352},{productId:'advanced-ph-perfect-bloom',mLPerGal:11.356235352}]},
      {profileId:'all-stages',label:'Grow W4 / Bloom — 4 mL/L each',components:[{productId:'advanced-ph-perfect-grow',mLPerGal:15.141647136},{productId:'advanced-ph-perfect-micro',mLPerGal:15.141647136},{productId:'advanced-ph-perfect-bloom',mLPerGal:15.141647136}]}
    ],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-grow-micro-bloom/',type:'official-product-page',checked:'2026-09-21',original:'1:1:1 by volume; Grow W1-W4 = 1/2/3/4 mL/L each; Bloom W1-W7 = 4 mL/L each'}
  },

  {
    id:'advanced-sensi-grow', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'pH Perfect Sensi Grow', displayFormula:'3-0-0 (Grow A) + 1-2-6 (Grow B)', name:'pH Perfect Sensi Grow',
    ratioBasis:'volume', components:[
      {productId:'advanced-sensi-grow-a',label:'Grow A',defaultParts:1},
      {productId:'advanced-sensi-grow-b',label:'Grow B',defaultParts:1}
    ],
    defaultProfile:'1to1', profiles:[{id:'1to1',label:'1:1 by volume',parts:[1,1]}],
    ratioNote:'Manufacturer uses equal volumes of A and B. Combined chemistry is approximate because current official SDS files give density ranges; Growbox uses each range midpoint for volume-to-mass conversion.',
    useRates:[
      {profileId:'1to1',label:'Grow W1 — 1 mL/L each',components:[{productId:'advanced-sensi-grow-a',mLPerGal:3.785411784},{productId:'advanced-sensi-grow-b',mLPerGal:3.785411784}]},
      {profileId:'1to1',label:'Grow W2 — 2 mL/L each',components:[{productId:'advanced-sensi-grow-a',mLPerGal:7.570823568},{productId:'advanced-sensi-grow-b',mLPerGal:7.570823568}]},
      {profileId:'1to1',label:'Grow W3 — 3 mL/L each',components:[{productId:'advanced-sensi-grow-a',mLPerGal:11.356235351999999},{productId:'advanced-sensi-grow-b',mLPerGal:11.356235351999999}]},
      {profileId:'1to1',label:'Grow W4 — 4 mL/L each',components:[{productId:'advanced-sensi-grow-a',mLPerGal:15.141647136},{productId:'advanced-sensi-grow-b',mLPerGal:15.141647136}]}
    ],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/',type:'official-product-page-feed-chart',checked:'2026-09-21',original:'1:1 by volume; Grow W1-W4 = 1/2/3/4 mL/L each'}
  },
  {
    id:'advanced-sensi-bloom', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'pH Perfect Sensi Bloom', displayFormula:'3-0-0 (Bloom A) + 2-4-8 (Bloom B)', name:'pH Perfect Sensi Bloom',
    ratioBasis:'volume', components:[
      {productId:'advanced-sensi-bloom-a',label:'Bloom A',defaultParts:1},
      {productId:'advanced-sensi-bloom-b',label:'Bloom B',defaultParts:1}
    ],
    defaultProfile:'1to1', profiles:[{id:'1to1',label:'1:1 by volume',parts:[1,1]}],
    ratioNote:'Manufacturer uses equal volumes of A and B. Combined chemistry is approximate because current official SDS files give density ranges; Growbox uses each range midpoint for volume-to-mass conversion.',
    useRates:[{profileId:'1to1',label:'Bloom W1-W7 — 4 mL/L each',components:[{productId:'advanced-sensi-bloom-a',mLPerGal:15.141647136},{productId:'advanced-sensi-bloom-b',mLPerGal:15.141647136}]}],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/',type:'official-product-page-feed-chart',checked:'2026-09-21',original:'1:1 by volume; Bloom W1-W7 = 4 mL/L each'}
  },
  {
    id:'advanced-sensi-coco-grow', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'pH Perfect Sensi Coco Grow', displayFormula:'3-0-0 (Grow A) + 1-2-4 (Grow B)', name:'pH Perfect Sensi Coco Grow', region:'Europe and Canada',
    ratioBasis:'volume', components:[
      {productId:'advanced-sensi-coco-grow-a',label:'Grow A',defaultParts:1},
      {productId:'advanced-sensi-coco-grow-b',label:'Grow B',defaultParts:1}
    ],
    defaultProfile:'1to1', profiles:[{id:'1to1',label:'1:1 by volume',parts:[1,1]}],
    ratioNote:'Manufacturer uses equal volumes of A and B. Current official page lists this line for Europe and Canada. Combined chemistry is approximate because SDS densities are ranges and Growbox uses their midpoints.',
    useRates:[
      {profileId:'1to1',label:'Grow W1 — 1 mL/L each',components:[{productId:'advanced-sensi-coco-grow-a',mLPerGal:3.785411784},{productId:'advanced-sensi-coco-grow-b',mLPerGal:3.785411784}]},
      {profileId:'1to1',label:'Grow W2 — 2 mL/L each',components:[{productId:'advanced-sensi-coco-grow-a',mLPerGal:7.570823568},{productId:'advanced-sensi-coco-grow-b',mLPerGal:7.570823568}]},
      {profileId:'1to1',label:'Grow W3 — 3 mL/L each',components:[{productId:'advanced-sensi-coco-grow-a',mLPerGal:11.356235351999999},{productId:'advanced-sensi-coco-grow-b',mLPerGal:11.356235351999999}]},
      {profileId:'1to1',label:'Grow W4 — 4 mL/L each',components:[{productId:'advanced-sensi-coco-grow-a',mLPerGal:15.141647136},{productId:'advanced-sensi-coco-grow-b',mLPerGal:15.141647136}]}
    ],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-coco-grow-bloom/',type:'official-product-page-feed-chart',checked:'2026-09-21',original:'Europe/Canada; 1:1 by volume; Grow W1-W4 = 1/2/3/4 mL/L each'}
  },
  {
    id:'advanced-sensi-coco-bloom', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'pH Perfect Sensi Coco Bloom', displayFormula:'4-0-0 (Bloom A) + 0-4-5 (Bloom B)', name:'pH Perfect Sensi Coco Bloom', region:'Europe and Canada',
    ratioBasis:'volume', components:[
      {productId:'advanced-sensi-coco-bloom-a',label:'Bloom A',defaultParts:1},
      {productId:'advanced-sensi-coco-bloom-b',label:'Bloom B',defaultParts:1}
    ],
    defaultProfile:'1to1', profiles:[{id:'1to1',label:'1:1 by volume',parts:[1,1]}],
    ratioNote:'Manufacturer uses equal volumes of A and B. Current official page lists this line for Europe and Canada. Combined chemistry is approximate because SDS densities are ranges and Growbox uses their midpoints.',
    useRates:[{profileId:'1to1',label:'Bloom W1-W7 — 4 mL/L each',components:[{productId:'advanced-sensi-coco-bloom-a',mLPerGal:15.141647136},{productId:'advanced-sensi-coco-bloom-b',mLPerGal:15.141647136}]}],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-sensi-coco-grow-bloom/',type:'official-product-page-feed-chart',checked:'2026-09-21',original:'Europe/Canada; 1:1 by volume; Bloom W1-W7 = 4 mL/L each'}
  },
  {
    id:'advanced-connoisseur-grow', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'pH Perfect Connoisseur Grow', displayFormula:'4-0-0 (Grow A) + 1-2-7 (Grow B)', name:'pH Perfect Connoisseur Grow', region:'Europe, Canada and Brazil',
    ratioBasis:'volume', components:[
      {productId:'advanced-connoisseur-grow-a',label:'Grow A',defaultParts:1},
      {productId:'advanced-connoisseur-grow-b',label:'Grow B',defaultParts:1}
    ],
    defaultProfile:'1to1', profiles:[{id:'1to1',label:'1:1 by volume',parts:[1,1]}],
    ratioNote:'Manufacturer uses equal volumes of A and B. Current official page lists this line for Europe, Canada and Brazil. Grow B uses the midpoint of its official SDS density range, so combined chemistry is approximate.',
    useRates:[
      {profileId:'1to1',label:'Grow W1 — 1 mL/L each',components:[{productId:'advanced-connoisseur-grow-a',mLPerGal:3.785411784},{productId:'advanced-connoisseur-grow-b',mLPerGal:3.785411784}]},
      {profileId:'1to1',label:'Grow W2 — 2 mL/L each',components:[{productId:'advanced-connoisseur-grow-a',mLPerGal:7.570823568},{productId:'advanced-connoisseur-grow-b',mLPerGal:7.570823568}]},
      {profileId:'1to1',label:'Grow W3 — 3 mL/L each',components:[{productId:'advanced-connoisseur-grow-a',mLPerGal:11.356235351999999},{productId:'advanced-connoisseur-grow-b',mLPerGal:11.356235351999999}]},
      {profileId:'1to1',label:'Grow W4 — 4 mL/L each',components:[{productId:'advanced-connoisseur-grow-a',mLPerGal:15.141647136},{productId:'advanced-connoisseur-grow-b',mLPerGal:15.141647136}]}
    ],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-connoisseur-grow-bloom/',type:'official-product-page-feed-chart',checked:'2026-09-21',original:'Europe/Canada/Brazil; 1:1 by volume; Grow W1-W4 = 1/2/3/4 mL/L each'}
  },
  {
    id:'advanced-connoisseur-bloom', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'pH Perfect Connoisseur Bloom', displayFormula:'3-0-0 (Bloom A) + 2-4-10 (Bloom B)', name:'pH Perfect Connoisseur Bloom', region:'Europe, Canada and Brazil',
    ratioBasis:'volume', components:[
      {productId:'advanced-connoisseur-bloom-a',label:'Bloom A',defaultParts:1},
      {productId:'advanced-connoisseur-bloom-b',label:'Bloom B',defaultParts:1}
    ],
    defaultProfile:'1to1', profiles:[{id:'1to1',label:'1:1 by volume',parts:[1,1]}],
    ratioNote:'Manufacturer uses equal volumes of A and B. Current official page lists this line for Europe, Canada and Brazil. Bloom B uses the midpoint of its official SDS density range, so combined chemistry is approximate.',
    useRates:[{profileId:'1to1',label:'Bloom W1-W7 — 4 mL/L each',components:[{productId:'advanced-connoisseur-bloom-a',mLPerGal:15.141647136},{productId:'advanced-connoisseur-bloom-b',mLPerGal:15.141647136}]}],
    source:{url:'https://www.advancednutrients.com/products/ph-perfect-connoisseur-grow-bloom/',type:'official-product-page-feed-chart',checked:'2026-09-21',original:'Europe/Canada/Brazil; 1:1 by volume; Bloom W1-W7 = 4 mL/L each'}
  },

  {
    id:'advanced-sensi-wsp-grow', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'Sensi Professional WSP Grow', displayFormula:'9-10-28 (Grow A) + 15-0-0 (Grow B)', name:'Sensi Professional WSP Grow', lifecycle:'discontinued-2026',
    ratioBasis:'mass', components:[
      {productId:'advanced-sensi-wsp-grow-a',label:'Grow A',defaultParts:1},
      {productId:'advanced-sensi-wsp-grow-b',label:'Grow B',defaultParts:1}
    ],
    defaultProfile:'1to1', profiles:[{id:'1to1',label:'Legacy 1:1',parts:[1,1]}],
    ratioNote:'Legacy Sensi Professional WSP powder system, discontinued globally by Advanced Nutrients in April 2026. Historical directions used equal Grow A and Grow B dry weights.',
    useRates:[
      {profileId:'1to1',label:'Legacy published range — low',components:[{productId:'advanced-sensi-wsp-grow-a',gPerGal:2},{productId:'advanced-sensi-wsp-grow-b',gPerGal:2}]},
      {profileId:'1to1',label:'Legacy published range — high',components:[{productId:'advanced-sensi-wsp-grow-a',gPerGal:2.7},{productId:'advanced-sensi-wsp-grow-b',gPerGal:2.7}]}
    ],
    source:{url:'https://www.advancednutrients.com/articles/sensi-wsp-discontinued/',type:'official-discontinuation-notice',checked:'2026-09-21'},
    rateSource:{type:'reputable-distributor-label-copy',checked:'2026-09-21',original:'Grow A and B equal parts; 2–2.7 g/US gal each'}
  },
  {
    id:'advanced-sensi-wsp-bloom', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'Sensi Professional WSP Bloom', displayFormula:'10-14-26 (Bloom A) + 17-0-6 (Bloom B)', name:'Sensi Professional WSP Bloom', lifecycle:'discontinued-2026',
    ratioBasis:'mass', components:[
      {productId:'advanced-sensi-wsp-bloom-a',label:'Bloom A',defaultParts:1},
      {productId:'advanced-sensi-wsp-bloom-b',label:'Bloom B',defaultParts:1}
    ],
    defaultProfile:'1to1', profiles:[{id:'1to1',label:'Legacy 1:1',parts:[1,1]}],
    ratioNote:'Legacy Sensi Professional WSP powder system, discontinued globally by Advanced Nutrients in April 2026. Historical directions used equal Bloom A and Bloom B dry weights.',
    useRates:[
      {profileId:'1to1',label:'Legacy published range — low',components:[{productId:'advanced-sensi-wsp-bloom-a',gPerGal:3.1},{productId:'advanced-sensi-wsp-bloom-b',gPerGal:3.1}]},
      {profileId:'1to1',label:'Legacy published range — high',components:[{productId:'advanced-sensi-wsp-bloom-a',gPerGal:4.1},{productId:'advanced-sensi-wsp-bloom-b',gPerGal:4.1}]}
    ],
    source:{url:'https://www.advancednutrients.com/articles/sensi-wsp-discontinued/',type:'official-discontinuation-notice',checked:'2026-09-21'},
    rateSource:{type:'reputable-distributor-label-copy',checked:'2026-09-21',original:'Bloom A and B equal parts; 3.1–4.1 g/US gal each'}
  },
  {
    id:'advanced-cultivator-veg', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'Cultivator Veg', displayFormula:'14-0-0 (Base) + 2-9-24 (Grow)', name:'Cultivator Series — Veg',
    ratioBasis:'mass', components:[
      {productId:'advanced-cultivator-base',label:'Base',defaultParts:4},
      {productId:'advanced-cultivator-grow',label:'Grow',defaultParts:4}
    ],
    defaultProfile:'veg', profiles:[
      {id:'veg',label:'Veg W1-W4',parts:[4,4]}
    ],
    ratioNote:'Cultivator is sold as a three-bag family, but the vegetative recipe is a two-component program: Base + Grow. Bloom is not used during this phase.',
    useRates:[
      {profileId:'veg',label:'Official — Veg W1-W4',components:[{productId:'advanced-cultivator-base',gPerGal:4},{productId:'advanced-cultivator-grow',gPerGal:4}]}
    ],
    source:{url:'https://www.advancednutrients.com/products/cultivator-series/',type:'official-product-page-and-feed-chart',checked:'2026-09-21',original:'Grow W1-W4: Base 4 + Grow 4 g/US gal; Bloom not used'}
  },
  {
    id:'advanced-cultivator-bloom-system', partCount:2, manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'Cultivator Bloom', displayFormula:'14-0-0 (Base) + 3-13-26 (Bloom)', name:'Cultivator Series — Bloom',
    ratioBasis:'mass', components:[
      {productId:'advanced-cultivator-base',label:'Base',defaultParts:4},
      {productId:'advanced-cultivator-bloom',label:'Bloom',defaultParts:4}
    ],
    defaultProfile:'bloom-early', profiles:[
      {id:'bloom-early',label:'Bloom W1-W3',parts:[4,4]},
      {id:'bloom-mid',label:'Bloom W4-W7',parts:[3,6]},
      {id:'bloom-late',label:'Bloom W8',parts:[2,4]},
      {id:'bloom-finish',label:'Bloom W9',parts:[0,4]}
    ],
    ratioNote:'Cultivator is sold as a three-bag family, but the flowering recipe is a two-component program: Base + Bloom. Grow is not used during this phase; Base tapers and is removed in week 9.',
    useRates:[
      {profileId:'bloom-early',label:'Official — Bloom W1-W3',components:[{productId:'advanced-cultivator-base',gPerGal:4},{productId:'advanced-cultivator-bloom',gPerGal:4}]},
      {profileId:'bloom-mid',label:'Official — Bloom W4-W7',components:[{productId:'advanced-cultivator-base',gPerGal:3},{productId:'advanced-cultivator-bloom',gPerGal:6}]},
      {profileId:'bloom-late',label:'Official — Bloom W8',components:[{productId:'advanced-cultivator-base',gPerGal:2},{productId:'advanced-cultivator-bloom',gPerGal:4}]},
      {profileId:'bloom-finish',label:'Official — Bloom W9',components:[{productId:'advanced-cultivator-bloom',gPerGal:4}]}
    ],
    source:{url:'https://www.advancednutrients.com/products/cultivator-series/',type:'official-product-page-and-feed-chart',checked:'2026-09-21',original:'Bloom W1-W3 Base 4 + Bloom 4 g/gal; W4-W7 3 + 6; W8 2 + 4; W9 Bloom 4 only'}
  },
  {
    id:'frontrow-3-2-2', partCount:3, manufacturer:'Front Row Ag LLC', brand:'Front Row Ag', program:'3-2-2', displayFormula:'14-0-8 (Part A) + 2-13-17 (Part B) + 0-35-29 (Bloom)', name:'Front Row Ag 3-2-2',
    ratioBasis:'mass', components:[
      {productId:'frontrow-part-a',label:'Part A',defaultParts:3},
      {productId:'frontrow-part-b',label:'Part B',defaultParts:2},
      {productId:'frontrow-bloom',label:'Bloom',defaultParts:2}
    ],
    defaultProfile:'3-2-2', profiles:[{id:'3-2-2',label:'3-2-2',parts:[3,2,2]}],
    ratioNote:'Front Row Ag identifies 3:2:2 as the dry-to-reservoir product ratio for Part A:Part B:Bloom. Total dose is adjusted to the crop/EC target rather than fixed to one universal g/gal.',
    useRates:[
      {label:'Official clone DTR',components:[{productId:'frontrow-part-a',gPerGal:2},{productId:'frontrow-part-b',gPerGal:1.4}]}
    ],
    source:{url:'https://www.frontrowag.com/pages/resources',type:'official-labels-and-faq',checked:'2026-09-21',original:'3:2:2 relative dry ratio; clone DTR 2.0 g/gal Part A + 1.4 g/gal Part B'}
  },

  {
    id:'gh-florapro-veg', partCount:2, manufacturer:'General Hydroponics', brand:'General Hydroponics', program:'FloraPro Veg', displayFormula:'14-0-0 (Calcium + Micros) + 10-12-22 (Grow)', name:'FloraPro Powder — Veg',
    ratioBasis:'mass', components:[
      {productId:'gh-florapro-calcium-micros',label:'Calcium + Micros',defaultParts:2.2},
      {productId:'gh-florapro-grow',label:'Grow',defaultParts:2.9}
    ],
    defaultProfile:'expert-160', profiles:[
      {id:'seedling',label:'Seedling / Clone · 60 ppm N',parts:[.83,1.1]},
      {id:'early-110',label:'Early Growth · 110 ppm N',parts:[1.6,2]},
      {id:'expert-160',label:'Early Growth · 160 ppm N',parts:[2.2,2.9]},
      {id:'late-190',label:'Late Growth · 190 ppm N',parts:[2.6,3.6]}
    ],
    ratioNote:'General Hydroponics FloraPro expert base-only chart. Profiles preserve the manufacturer g/gal relationship at each vegetative strength; standardized comparison scales the selected profile to the requested total N.',
    useRates:[
      {profileId:'seedling',label:'Official Expert — Seedling / Clone',components:[{productId:'gh-florapro-calcium-micros',gPerGal:.83},{productId:'gh-florapro-grow',gPerGal:1.1}]},
      {profileId:'early-110',label:'Official Expert — Early Growth · 110 ppm N',components:[{productId:'gh-florapro-calcium-micros',gPerGal:1.6},{productId:'gh-florapro-grow',gPerGal:2}]},
      {profileId:'expert-160',label:'Official Expert — Early Growth · 160 ppm N',components:[{productId:'gh-florapro-calcium-micros',gPerGal:2.2},{productId:'gh-florapro-grow',gPerGal:2.9}]},
      {profileId:'late-190',label:'Official Expert — Late Growth · 190 ppm N',components:[{productId:'gh-florapro-calcium-micros',gPerGal:2.6},{productId:'gh-florapro-grow',gPerGal:3.6}]}
    ],
    source:{url:'https://generalhydroponics.com/wp-content/uploads/assets/FloraPro-Expert-FeedCharts.pdf',type:'official-feed-chart',checked:'2026-09-21'}
  },
  {
    id:'gh-florapro-bloom-system', partCount:2, manufacturer:'General Hydroponics', brand:'General Hydroponics', program:'FloraPro Bloom', displayFormula:'14-0-0 (Calcium + Micros) + 7-12-27 (Bloom)', name:'FloraPro Powder — Bloom',
    ratioBasis:'mass', components:[
      {productId:'gh-florapro-calcium-micros',label:'Calcium + Micros',defaultParts:3},
      {productId:'gh-florapro-bloom',label:'Bloom',defaultParts:4}
    ],
    defaultProfile:'early-180', profiles:[
      {id:'early-180',label:'Early Bloom · 180 ppm N',parts:[3,4]},
      {id:'mid-150',label:'Mid-Bloom · 150 ppm N',parts:[2.1,4]},
      {id:'late-130',label:'Late Bloom · 130 ppm N',parts:[1.8,3.5]},
      {id:'ripen-110',label:'Ripen · 110 ppm N',parts:[1.8,2.8]}
    ],
    ratioNote:'General Hydroponics FloraPro expert base-only chart. Late Bloom 0-24-26 is an optional finishing component and is intentionally excluded from this base two-part comparison.',
    useRates:[
      {profileId:'early-180',label:'Official Expert — Early Bloom · 180 ppm N',components:[{productId:'gh-florapro-calcium-micros',gPerGal:3},{productId:'gh-florapro-bloom',gPerGal:4}]},
      {profileId:'mid-150',label:'Official Expert — Mid-Bloom · 150 ppm N',components:[{productId:'gh-florapro-calcium-micros',gPerGal:2.1},{productId:'gh-florapro-bloom',gPerGal:4}]},
      {profileId:'late-130',label:'Official Expert — Late Bloom · 130 ppm N',components:[{productId:'gh-florapro-calcium-micros',gPerGal:1.8},{productId:'gh-florapro-bloom',gPerGal:3.5}]},
      {profileId:'ripen-110',label:'Official Expert — Ripen · 110 ppm N',components:[{productId:'gh-florapro-calcium-micros',gPerGal:1.8},{productId:'gh-florapro-bloom',gPerGal:2.8}]}
    ],
    source:{url:'https://generalhydroponics.com/wp-content/uploads/assets/FloraPro-Expert-FeedCharts.pdf',type:'official-feed-chart',checked:'2026-09-21'}
  },

  {
    id:'gh-floraseries-3part', partCount:3, manufacturer:'General Hydroponics', brand:'General Hydroponics', program:'FloraSeries 3-Part', displayFormula:'5-0-1 (FloraMicro) + 2-1-6 (FloraGro) + 0-5-4 (FloraBloom)', name:'FloraSeries 3-Part',
    ratioBasis:'volume', components:[
      {productId:'gh-floraseries-micro',label:'FloraMicro',defaultParts:4.2},
      {productId:'gh-floraseries-gro',label:'FloraGro',defaultParts:3.8},
      {productId:'gh-floraseries-bloom',label:'FloraBloom',defaultParts:3}
    ],
    defaultProfile:'medium-early-growth', profiles:[
      {id:'medium-early-growth',label:'Medium · Early Growth',parts:[4.2,3.8,3]},
      {id:'medium-late-growth',label:'Medium · Late Growth',parts:[6.8,6.4,4.8]},
      {id:'medium-early-bloom',label:'Medium · Early Bloom',parts:[6.1,5.3,6.6]},
      {id:'medium-mid-late-bloom',label:'Medium · Mid-Late Bloom',parts:[5.3,5.3,7.6]}
    ],
    ratioNote:'Current 2026 core FloraSeries 3-Part chart. Comparison profiles use the manufacturer Medium Feed growth-stage ratios; all three base components remain active and their balance changes by stage.',
    useRates:[
      {profileId:'medium-early-growth',label:'Official Medium — Early Growth',components:[{productId:'gh-floraseries-micro',mLPerGal:4.2},{productId:'gh-floraseries-gro',mLPerGal:3.8},{productId:'gh-floraseries-bloom',mLPerGal:3}]},
      {profileId:'medium-late-growth',label:'Official Medium — Late Growth',components:[{productId:'gh-floraseries-micro',mLPerGal:6.8},{productId:'gh-floraseries-gro',mLPerGal:6.4},{productId:'gh-floraseries-bloom',mLPerGal:4.8}]},
      {profileId:'medium-early-bloom',label:'Official Medium — Early Bloom',components:[{productId:'gh-floraseries-micro',mLPerGal:6.1},{productId:'gh-floraseries-gro',mLPerGal:5.3},{productId:'gh-floraseries-bloom',mLPerGal:6.6}]},
      {profileId:'medium-mid-late-bloom',label:'Official Medium — Mid-Late Bloom',components:[{productId:'gh-floraseries-micro',mLPerGal:5.3},{productId:'gh-floraseries-gro',mLPerGal:5.3},{productId:'gh-floraseries-bloom',mLPerGal:7.6}]}
    ],
    source:{url:'https://generalhydroponics.com/cdn/shop/files/FloraSeries-Basic-Feed-Charts.pdf',type:'official-feed-chart',checked:'2026-09-21',original:'2026 Professional 3-Part Medium Feed: Early Growth 4.2/3.8/3.0; Late Growth 6.8/6.4/4.8; Early Bloom 6.1/5.3/6.6; Mid-Late Bloom 5.3/5.3/7.6 mL/US gal Micro/Gro/Bloom'}
  },

  {
    id:'greenplanet-gp3', partCount:3, manufacturer:'GreenPlanet Nutrients', brand:'GreenPlanet Nutrients', program:'GP3', displayFormula:'2-1-6 (Grow) + 5-0-1 (Micro) + 0-5-4 (Bloom)', name:'GP3 3-Part',
    ratioBasis:'volume', components:[
      {productId:'greenplanet-gp3-grow',label:'GP3 Grow',defaultParts:5},
      {productId:'greenplanet-gp3-micro',label:'GP3 Micro',defaultParts:5},
      {productId:'greenplanet-gp3-bloom',label:'GP3 Bloom',defaultParts:4}
    ],
    defaultProfile:'veg-w3', profiles:[
      {id:'veg-w1',label:'Veg W1',parts:[1,2,1]},
      {id:'veg-w2',label:'Veg W2',parts:[5,4,1]},
      {id:'veg-w3',label:'Veg W3',parts:[5,5,4]},
      {id:'flower-w1',label:'Flower W1',parts:[6,6,6]},
      {id:'flower-w2-5',label:'Flower W2-W5',parts:[1,4,6]},
      {id:'flower-w6',label:'Flower W6',parts:[0,4,8]},
      {id:'flower-w7',label:'Flower W7',parts:[0,3,8]}
    ],
    ratioNote:'Official drain-to-waste GP3 chart. Grow, Micro and Bloom are all used together through veg and most of flower; Grow is removed only in the final flowering weeks.',
    useRates:[
      {profileId:'veg-w1',label:'Official — Veg W1',components:[{productId:'greenplanet-gp3-grow',mLPerGal:1},{productId:'greenplanet-gp3-micro',mLPerGal:2},{productId:'greenplanet-gp3-bloom',mLPerGal:1}]},
      {profileId:'veg-w2',label:'Official — Veg W2',components:[{productId:'greenplanet-gp3-grow',mLPerGal:5},{productId:'greenplanet-gp3-micro',mLPerGal:4},{productId:'greenplanet-gp3-bloom',mLPerGal:1}]},
      {profileId:'veg-w3',label:'Official — Veg W3',components:[{productId:'greenplanet-gp3-grow',mLPerGal:5},{productId:'greenplanet-gp3-micro',mLPerGal:5},{productId:'greenplanet-gp3-bloom',mLPerGal:4}]},
      {profileId:'flower-w1',label:'Official — Flower W1',components:[{productId:'greenplanet-gp3-grow',mLPerGal:6},{productId:'greenplanet-gp3-micro',mLPerGal:6},{productId:'greenplanet-gp3-bloom',mLPerGal:6}]},
      {profileId:'flower-w2-5',label:'Official — Flower W2-W5',components:[{productId:'greenplanet-gp3-grow',mLPerGal:1},{productId:'greenplanet-gp3-micro',mLPerGal:4},{productId:'greenplanet-gp3-bloom',mLPerGal:6}]},
      {profileId:'flower-w6',label:'Official — Flower W6',components:[{productId:'greenplanet-gp3-micro',mLPerGal:4},{productId:'greenplanet-gp3-bloom',mLPerGal:8}]},
      {profileId:'flower-w7',label:'Official — Flower W7',components:[{productId:'greenplanet-gp3-micro',mLPerGal:3},{productId:'greenplanet-gp3-bloom',mLPerGal:8}]}
    ],
    source:{url:'https://k6n9c8k4.delivery.rocketcdn.me/wp-content/uploads/2021/01/06_20_GPN_WEB_Feedchart_3part-GP3_USA.pdf',type:'official-feed-chart',checked:'2026-09-21',original:'Drain-to-waste GP3 base rows transcribed directly from manufacturer chart; additives excluded'}
  },

  {
    id:'emerald-harvest-3part', partCount:3, manufacturer:'Emerald Harvest', brand:'Emerald Harvest', program:'3-Part', displayFormula:'2-1-6 (Grow) + 5-0-1 (Micro) + 0-5-4 (Bloom)', name:'Professional 3-Part Nutrient Series',
    ratioBasis:'volume', components:[
      {productId:'emerald-3part-grow',label:'Grow',defaultParts:6},
      {productId:'emerald-3part-micro',label:'Micro',defaultParts:3},
      {productId:'emerald-3part-bloom',label:'Bloom',defaultParts:2}
    ],
    defaultProfile:'early-veg', profiles:[
      {id:'seedling',label:'Seedlings & Cuttings',parts:[2,2,2]},
      {id:'transplant',label:'Transplants',parts:[4,2,1]},
      {id:'early-veg',label:'Early Vegetative',parts:[6,3,2]},
      {id:'late-veg',label:'Late Vegetative',parts:[8,4,2]},
      {id:'transition',label:'Transition',parts:[4,4,4]},
      {id:'early-flower',label:'Early Flower W2-W3',parts:[2,4,8]},
      {id:'mid-flower',label:'Mid Flower W4-W5',parts:[2,5,10]},
      {id:'late-flower',label:'Late Flower W6-W7',parts:[0,6,11]},
      {id:'ripen-w8',label:'Ripening W8',parts:[0,4,11]},
      {id:'ripen-w9',label:'Ripening W9',parts:[2,2,2]}
    ],
    ratioNote:'Official 3-Part gallon feed chart. Only Grow, Micro and Bloom are represented here; all optional boosters and supplements shown on the full chart are intentionally excluded.',
    useRates:[
      {profileId:'seedling',label:'Official — Seedlings & Cuttings',components:[{productId:'emerald-3part-grow',mLPerGal:2},{productId:'emerald-3part-micro',mLPerGal:2},{productId:'emerald-3part-bloom',mLPerGal:2}]},
      {profileId:'transplant',label:'Official — Transplants',components:[{productId:'emerald-3part-grow',mLPerGal:4},{productId:'emerald-3part-micro',mLPerGal:2},{productId:'emerald-3part-bloom',mLPerGal:1}]},
      {profileId:'early-veg',label:'Official — Early Vegetative',components:[{productId:'emerald-3part-grow',mLPerGal:6},{productId:'emerald-3part-micro',mLPerGal:3},{productId:'emerald-3part-bloom',mLPerGal:2}]},
      {profileId:'late-veg',label:'Official — Late Vegetative',components:[{productId:'emerald-3part-grow',mLPerGal:8},{productId:'emerald-3part-micro',mLPerGal:4},{productId:'emerald-3part-bloom',mLPerGal:2}]},
      {profileId:'transition',label:'Official — Transition',components:[{productId:'emerald-3part-grow',mLPerGal:4},{productId:'emerald-3part-micro',mLPerGal:4},{productId:'emerald-3part-bloom',mLPerGal:4}]},
      {profileId:'early-flower',label:'Official — Early Flower W2-W3',components:[{productId:'emerald-3part-grow',mLPerGal:2},{productId:'emerald-3part-micro',mLPerGal:4},{productId:'emerald-3part-bloom',mLPerGal:8}]},
      {profileId:'mid-flower',label:'Official — Mid Flower W4-W5',components:[{productId:'emerald-3part-grow',mLPerGal:2},{productId:'emerald-3part-micro',mLPerGal:5},{productId:'emerald-3part-bloom',mLPerGal:10}]},
      {profileId:'late-flower',label:'Official — Late Flower W6-W7',components:[{productId:'emerald-3part-micro',mLPerGal:6},{productId:'emerald-3part-bloom',mLPerGal:11}]},
      {profileId:'ripen-w8',label:'Official — Ripening W8',components:[{productId:'emerald-3part-micro',mLPerGal:4},{productId:'emerald-3part-bloom',mLPerGal:11}]},
      {profileId:'ripen-w9',label:'Official — Ripening W9',components:[{productId:'emerald-3part-grow',mLPerGal:2},{productId:'emerald-3part-micro',mLPerGal:2},{productId:'emerald-3part-bloom',mLPerGal:2}]}
    ],
    source:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH-Feed-Chart-2-3-pt-ENG-gal.pdf',type:'official-feed-chart',checked:'2026-09-21',original:'3-Part Grow/Micro/Bloom rows transcribed directly from manufacturer gallon chart; additives excluded'}
  },
  {
    id:'cropsalt-veg', partCount:2, manufacturer:'CS Consulting', brand:'CropSalt', program:'Veg', displayFormula:'3-7-16 (Veg A) + 14-0-0 (Veg B)', name:'CropSalt Veg',
    ratioBasis:'mass', components:[
      {productId:'cropsalt-veg-a',label:'Veg A',defaultParts:4.6},
      {productId:'cropsalt-veg-b',label:'Veg B',defaultParts:3.1}
    ],
    ratioNote:'Official standard strength is 4.6 g/gal Veg A + 3.1 g/gal Veg B from clone through day 21 of flower. The seedling label row is retained as a separate use-rate preset.',
    useRates:[
      {label:'Seedlings — label top row',components:[{productId:'cropsalt-veg-a',gPerGal:1.53},{productId:'cropsalt-veg-b',gPerGal:1.03}]},
      {label:'Official standard — clone to flower day 21',components:[{productId:'cropsalt-veg-a',gPerGal:4.6},{productId:'cropsalt-veg-b',gPerGal:3.1}]}
    ],
    source:{url:'https://cropsalt.com/apps/help-center',type:'official-faq',checked:'2026-09-21',original:'Veg A/B 4.6/3.1 g per US gal; seedlings 1.53/1.03 g per US gal'}
  },
  {
    id:'cropsalt-bloom', partCount:2, manufacturer:'CS Consulting', brand:'CropSalt', program:'Bloom', displayFormula:'3-12-22 (Bloom A) + 13-0-0 (Bloom B)', name:'CropSalt Bloom',
    ratioBasis:'mass', components:[
      {productId:'cropsalt-bloom-a',label:'Bloom A',defaultParts:5.1},
      {productId:'cropsalt-bloom-b',label:'Bloom B',defaultParts:2.6}
    ],
    ratioNote:'Official Bloom strength is 5.1 g/gal Bloom A + 2.6 g/gal Bloom B from day 22 of flower until the line switches to its finishing product. Finishers are intentionally outside Growbox base-fertilizer scope.',
    useRates:[{label:'Official standard — flower day 22 to finish transition',components:[{productId:'cropsalt-bloom-a',gPerGal:5.1},{productId:'cropsalt-bloom-b',gPerGal:2.6}]}],
    source:{url:'https://cropsalt.com/apps/help-center',type:'official-faq',checked:'2026-09-21',original:'Bloom A/B 5.1/2.6 g per US gal'}
  },
  {
    id:'greenplanet-dual-fuel', partCount:2, manufacturer:'GreenPlanet Nutrients', brand:'GreenPlanet Nutrients', program:'Dual Fuel', displayFormula:'5-0-1 (Dual Fuel 1) + 0-3-6 (Dual Fuel 2)', name:'Dual Fuel',
    ratioBasis:'volume', components:[
      {productId:'greenplanet-dual-fuel-1',label:'Dual Fuel 1',defaultParts:1},
      {productId:'greenplanet-dual-fuel-2',label:'Dual Fuel 2',defaultParts:1}
    ],
    ratioNote:'GreenPlanet specifies equal parts Dual Fuel 1 and 2 by volume throughout vegetative and flowering growth.',
    useRates:[
      {label:'Application range — low · 0.5 mL/L each',components:[{productId:'greenplanet-dual-fuel-1',mLPerGal:1.892705892},{productId:'greenplanet-dual-fuel-2',mLPerGal:1.892705892}]},
      {label:'Application range — high · 2.5 mL/L each',components:[{productId:'greenplanet-dual-fuel-1',mLPerGal:9.46352946},{productId:'greenplanet-dual-fuel-2',mLPerGal:9.46352946}]}
    ],
    source:{url:'https://greenplanetnutrients.com/product/greenplanet-nutrients-dual-fuel-1-2',type:'official-product-page',checked:'2026-09-21',original:'1:1 by volume; 0.5–2.5 mL/L each'}
  },
  {
    id:'emerald-cali-pro-grow', partCount:2, manufacturer:'Emerald Harvest', brand:'Emerald Harvest', program:'Cali Pro Grow', displayFormula:'3-0-0 (Grow A) + 2-2-5 (Grow B)', name:'Cali Pro Grow',
    ratioBasis:'volume', components:[
      {productId:'emerald-cali-pro-grow-a',label:'Grow A',defaultParts:1},
      {productId:'emerald-cali-pro-grow-b',label:'Grow B',defaultParts:1}
    ],
    ratioNote:'Emerald Harvest specifies equal parts A and B. The official gallon feed chart uses Grow A+B from seedlings through transition.',
    useRates:[
      {label:'Seedlings & cuttings',components:[{productId:'emerald-cali-pro-grow-a',mLPerGal:2},{productId:'emerald-cali-pro-grow-b',mLPerGal:2}]},
      {label:'Transplants',components:[{productId:'emerald-cali-pro-grow-a',mLPerGal:3},{productId:'emerald-cali-pro-grow-b',mLPerGal:3}]},
      {label:'Early vegetative',components:[{productId:'emerald-cali-pro-grow-a',mLPerGal:4},{productId:'emerald-cali-pro-grow-b',mLPerGal:4}]},
      {label:'Late vegetative / transition',components:[{productId:'emerald-cali-pro-grow-a',mLPerGal:5},{productId:'emerald-cali-pro-grow-b',mLPerGal:5}]}
    ],
    source:{url:'https://emeraldharvest.co/cali-pro-feature-information/',type:'official-product-page',checked:'2026-09-21',original:'Equal parts A and B'},
    rateSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH-Feed-Chart-2-3-pt-ENG-gal.pdf',type:'official-feed-chart',checked:'2026-09-21'}
  },
  {
    id:'emerald-cali-pro-bloom', partCount:2, manufacturer:'Emerald Harvest', brand:'Emerald Harvest', program:'Cali Pro Bloom', displayFormula:'3-0-3 (Bloom A) + 1-4-6 (Bloom B)', name:'Cali Pro Bloom',
    ratioBasis:'volume', components:[
      {productId:'emerald-cali-pro-bloom-a',label:'Bloom A',defaultParts:1},
      {productId:'emerald-cali-pro-bloom-b',label:'Bloom B',defaultParts:1}
    ],
    ratioNote:'Emerald Harvest specifies equal parts A and B. The official gallon feed chart starts Bloom A+B after transition.',
    useRates:[
      {label:'Early flowering',components:[{productId:'emerald-cali-pro-bloom-a',mLPerGal:5},{productId:'emerald-cali-pro-bloom-b',mLPerGal:5}]},
      {label:'Mid / late flowering',components:[{productId:'emerald-cali-pro-bloom-a',mLPerGal:6},{productId:'emerald-cali-pro-bloom-b',mLPerGal:6}]},
      {label:'Ripening — first week',components:[{productId:'emerald-cali-pro-bloom-a',mLPerGal:6},{productId:'emerald-cali-pro-bloom-b',mLPerGal:6}]},
      {label:'Ripening — final week',components:[{productId:'emerald-cali-pro-bloom-a',mLPerGal:1},{productId:'emerald-cali-pro-bloom-b',mLPerGal:1}]}
    ],
    source:{url:'https://emeraldharvest.co/cali-pro-feature-information/',type:'official-product-page',checked:'2026-09-21',original:'Equal parts A and B'},
    rateSource:{url:'https://emeraldharvest.co/wp-content/uploads/2019/06/EH-Feed-Chart-2-3-pt-ENG-gal.pdf',type:'official-feed-chart',checked:'2026-09-21'}
  }
];

// Uploaded sample-data products that are not current Jack's/Athena records.
window.FERTILIZER_PRODUCTS.push(
  {
    id:'megacrop-2part-a-8-12-28', compareGroup:'component', manufacturer:'Greenleaf Nutrients', brand:'Mega Crop', displayFormula:'8-12-28 (A)', componentName:'A', name:'Mega Crop 2-Part A 8-12-28', form:'dry',
    analysis:{N:8,P2O5:12,K2O:28,Ca:0,Mg:3,S:4,Fe:.16,Mn:.22,Zn:.05,B:.04,Cu:.003,Mo:.001},
    nitrogenForms:{nitrateN:6,ureaN:2}, useRates:[], source:{type:'uploaded-label',checked:'2026-09-19'}
  },
  {
    id:'megacrop-2part-b-15-5-0-0', compareGroup:'component', manufacturer:'Greenleaf Nutrients', brand:'Mega Crop', displayFormula:'15.5-0-0 (B)', componentName:'B', name:'Mega Crop 2-Part B 15.5-0-0', form:'dry',
    analysis:{N:15.5,P2O5:0,K2O:0,Ca:19,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:14.5,ammoniacalN:1}, useRates:[], source:{type:'uploaded-label',checked:'2026-09-19'}
  }
);


/*
  Pending verified-data records are intentionally excluded from FERTILIZER_PRODUCTS/SYSTEMS.
  Missing guaranteed percentages must be resolved before these can enter chemistry calculations.
*/
window.FERTILIZER_PENDING_PRODUCTS = [
  {
    id:'advanced-cs2-prime', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'CS2', displayFormula:'13-0-0 (Prime)', componentName:'Prime', name:'CS2 Prime 13-0-0', form:'dry',
    knownAnalysis:{N:13,Ca:17},
    knownContents:['calcium nitrate','chelated micronutrients','Tetraplex Iron'],
    missingGuaranteedAnalysis:['nitrogen forms','Fe','Mn','Zn','B','Cu','Mo'],
    source:{url:'https://8thgeneration.advancednutrients.com/products/cs2/',type:'official-product-page',checked:'2026-09-21'},
    notes:'Official Advanced Nutrients article confirms 13% N and 17% Ca. Full public guaranteed-analysis percentages were not located, so this record is not used in ppm calculations.'
  },
  {
    id:'advanced-cs2-push', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'CS2', displayFormula:'0-11-24 (Push)', componentName:'Push', name:'CS2 Push 0-11-24', form:'dry',
    knownAnalysis:{N:0,P2O5:11,K2O:24},
    knownContents:['magnesium','sulfur','targeted micronutrients'],
    missingGuaranteedAnalysis:['Mg','S','Fe','Mn','Zn','B','Cu','Mo'],
    source:{url:'https://8thgeneration.advancednutrients.com/products/cs2/',type:'official-product-page',checked:'2026-09-21'},
    notes:'Official page confirms 0-11-24 and that Push supplies Mg and S, but not their guaranteed percentages. Excluded from ppm calculations until the complete label is sourced.'
  }
];

window.FERTILIZER_PENDING_SYSTEMS = [
  {
    id:'advanced-cs2-prime-push', manufacturer:'Advanced Nutrients', brand:'Advanced Nutrients', program:'CS2 Prime & Push', partCount:2,
    components:['advanced-cs2-prime','advanced-cs2-push'],
    regularEcRates:[
      {label:'Clone',primeGPerGal:3,pushGPerGal:3},
      {label:'Veg W1-W4',primeGPerGal:4,pushGPerGal:4},
      {label:'Bloom W1-W3',primeGPerGal:4,pushGPerGal:4},
      {label:'Bloom W4-W6',primeGPerGal:4,pushGPerGal:6},
      {label:'Bloom W7-W8',primeGPerGal:0,pushGPerGal:4}
    ],
    highEcRates:[
      {label:'Clone',primeGPerGal:4,pushGPerGal:4},
      {label:'Veg W1-W4',primeGPerGal:6,pushGPerGal:6},
      {label:'Bloom W1-W3',primeGPerGal:6,pushGPerGal:6},
      {label:'Bloom W4-W6',primeGPerGal:6,pushGPerGal:8},
      {label:'Bloom W7-W8',primeGPerGal:0,pushGPerGal:6}
    ],
    source:{url:'https://8thgeneration.advancednutrients.com/products/cs2/',type:'official-product-page-and-feeding-guide',checked:'2026-09-21'},
    notes:'Rates are captured, but system remains pending because the public complete guaranteed analyses for Prime/Push are not yet available.'
  }
];


window.FERTILIZER_PENDING_PRODUCTS.push(
  {
    id:'ces-grow', manufacturer:'Cutting Edge Solutions', brand:'Cutting Edge Solutions', program:'Base Family', displayFormula:'2-1-6 (Grow)', componentName:'Grow', name:'Grow 2-1-6', form:'liquid',
    knownAnalysis:{N:2,P2O5:1,K2O:6,Ca:0,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:1.8,ammoniacalN:.2},
    missingData:['densityGPerMl'],
    source:{url:'https://www.cuttingedgesolutions.com/products/grow',type:'official-product-page',checked:'2026-09-21'}
  },
  {
    id:'ces-micro', manufacturer:'Cutting Edge Solutions', brand:'Cutting Edge Solutions', program:'Base Family', displayFormula:'6-0-0 (Micro)', componentName:'Micro', name:'Micro 6-0-0', form:'liquid',
    knownAnalysis:{N:6,P2O5:0,K2O:0,Ca:5,Mg:0,S:0,Fe:.1,Mn:.05,Zn:0,B:.02,Cu:0,Mo:.0008},
    nitrogenForms:{nitrateN:5.7,ammoniacalN:.3},
    missingData:['densityGPerMl'],
    source:{url:'https://www.cuttingedgesolutions.com/products/micro',type:'official-product-page',checked:'2026-09-21'},
    notes:'Zinc nitrate appears in the derived-from list but no zinc percentage is guaranteed on the current product page; Growbox does not infer one.'
  },
  {
    id:'ces-bloom', manufacturer:'Cutting Edge Solutions', brand:'Cutting Edge Solutions', program:'Base Family', displayFormula:'0-6-5 (Bloom)', componentName:'Bloom', name:'Bloom 0-6-5', form:'liquid',
    knownAnalysis:{N:0,P2O5:6,K2O:5,Ca:0,Mg:1,S:2,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    missingData:['densityGPerMl'],
    source:{url:'https://www.cuttingedgesolutions.com/products/bloom',type:'official-product-page',checked:'2026-09-21'}
  }
);

window.FERTILIZER_PENDING_SYSTEMS.push(
  {
    id:'ces-3part-base', manufacturer:'Cutting Edge Solutions', brand:'Cutting Edge Solutions', program:'Base Family 3-Part', partCount:3,
    components:['ces-grow','ces-micro','ces-bloom'],
    knownRates:[
      {label:'Vegetative',growMlPerGal:15,microMlPerGal:6,bloomMlPerGal:5},
      {label:'Transition',growMlPerGal:5,microMlPerGal:6,bloomMlPerGal:15},
      {label:'Flower',growMlPerGal:0,microMlPerGal:6,bloomMlPerGal:20}
    ],
    missingData:['densityGPerMl for Grow','densityGPerMl for Micro','densityGPerMl for Bloom'],
    source:{url:'https://www.cuttingedgesolutions.com/collections/base-family',type:'official-product-family',checked:'2026-09-21'},
    notes:'Current manufacturer pages verify the 3-part base chemistry and reservoir rates. System remains pending because exact liquid densities have not yet been verified.'
  }
);
