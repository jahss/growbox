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
    useRates:[{label:'Part A label reference — 50 ppm N',gPerGal:3.685,note:'13 dry oz per 100 US gal.'}],
    source:{url:'https://www.griffins.com/images/pdf/cea/qr/Jacks%20Nutrients%20labels.pdf',checked:'2026-09-19'}
  },
  {
    id:'jacks-0-12-26-a', compareGroup:'component', manufacturer:'JR Peters', brand:"Jack's Nutrients", displayFormula:'0-12-26 (A)', componentName:'A', name:'0-12-26 Part A', form:'dry',
    analysis:{N:0,P2O5:12,K2O:26,Ca:0,Mg:6,S:13,Fe:.30,Mn:.05,Zn:.015,B:.05,Cu:.015,Mo:.009},
    useRates:[{label:'Part A label reference',gPerGal:3.7,note:'120 ppm P₂O₅ at 3.7 g/gal.'}],
    source:{url:'https://www.bfgsupply.com/img/product/documents/JRP79230/JRP79230_PRODUCT%20LABEL.pdf',checked:'2026-09-19'}
  },
  {
    id:'jacks-15-0-0-b', compareGroup:'component', manufacturer:'JR Peters', brand:"Jack's Nutrients", displayFormula:'15-0-0 (B)', componentName:'B', name:'15-0-0 Cal Nit Part B', form:'dry',
    analysis:{N:15,P2O5:0,K2O:0,Ca:18,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    nitrogenForms:{nitrateN:15},
    useRates:[{label:'Part B label reference — 100 ppm N',gPerGal:2.438,note:'8.6 dry oz per 100 US gal.'}],
    source:{url:'https://www.griffins.com/images/pdf/cea/qr/Jacks%20Nutrients%20labels.pdf',checked:'2026-09-19'}
  },
  {
    id:'jacks-epsom', compareGroup:'component', manufacturer:'JR Peters', brand:"Jack's Nutrients", displayFormula:'Magnesium Sulfate (C)', componentName:'C', name:'Magnesium Sulfate (Epsom) Part C', form:'dry',
    analysis:{N:0,P2O5:0,K2O:0,Ca:0,Mg:9.8,S:13,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0},
    useRates:[{label:"Jack's 3-2-1 Part C",gPerGal:1.1,note:'Manufacturer 3-2-1 mixing lesson.'}],
    source:{url:'https://www.jacksnutrients.com/post/how-do-i-mix-jack-s-321',checked:'2026-09-19'}
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

  {
    id:'mkp-0-52-34', compareGroup:'salt', brand:'Generic salt', name:'MKP 0-52-34', form:'dry',
    analysis:{N:0,P2O5:52,K2O:34,Ca:0,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[]
  },
  {
    id:'calcium-nitrate', compareGroup:'salt', brand:'Generic salt', name:'Calcium nitrate 15.5-0-0 + 19 Ca', form:'dry',
    analysis:{N:15.5,P2O5:0,K2O:0,Ca:19,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[],
    notes:'Generic reference kept separate from Jack’s 15-0-0 / 18% Ca Part B.'
  },
  {
    id:'potassium-nitrate', compareGroup:'salt', brand:'Generic salt', name:'Potassium nitrate 13-0-46', form:'dry',
    analysis:{N:13,P2O5:0,K2O:46,Ca:0,Mg:0,S:0,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[]
  },
  {
    id:'magnesium-sulfate', compareGroup:'salt', brand:'Generic salt', name:'Magnesium sulfate 9.8 Mg + 13 S', form:'dry',
    analysis:{N:0,P2O5:0,K2O:0,Ca:0,Mg:9.8,S:13,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[]
  },
  {
    id:'potassium-sulfate', compareGroup:'salt', brand:'Generic salt', name:'Potassium sulfate 0-0-50 + 18 S', form:'dry',
    analysis:{N:0,P2O5:0,K2O:50,Ca:0,Mg:0,S:18,Fe:0,Mn:0,Zn:0,B:0,Cu:0,Mo:0}, useRates:[]
  }
];

window.FERTILIZER_SYSTEMS = [
  {
    id:'megacrop-2part-uploaded', partCount:2, manufacturer:'Greenleaf Nutrients', brand:'Mega Crop', program:'2-Part', displayFormula:'8-12-28 (A) + 15.5-0-0 (B)', name:'Mega Crop 2-Part — uploaded 8-12-28 formula',
    ratioBasis:'mass', components:[
      {productId:'megacrop-2part-a-8-12-28',label:'Part A',defaultParts:1},
      {productId:'megacrop-2part-b-15-5-0-0',label:'Part B',defaultParts:1}
    ],
    ratioNote:'A:B is user-adjustable. The 1:1 default is only a neutral starting point, not a manufacturer recommendation.', useRates:[]
  },
  {
    id:'jacks-2part-5-12-26', partCount:2, manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'A/B Fast Track', displayFormula:'5-12-26 (A) + 15-0-0 (B)', name:'2-Part — 5-12-26 A + Cal Nit B',
    ratioBasis:'mass', components:[
      {productId:'jacks-5-12-26-a',label:'Part A',defaultParts:3.6},
      {productId:'jacks-15-0-0-b',label:'Part B',defaultParts:2.4}
    ],
    ratioNote:'Default 3.6:2.4 g/gal follows Jack’s published 3-2-1 base A:B relationship.',
    useRates:[{label:'A+B reference',components:[{productId:'jacks-5-12-26-a',gPerGal:3.6},{productId:'jacks-15-0-0-b',gPerGal:2.4}]}]
  },
  {
    id:'jacks-2part-0-12-26', partCount:2, manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'A/B 0-12-26', displayFormula:'0-12-26 (A) + 15-0-0 (B)', name:'2-Part — 0-12-26 A + Cal Nit B',
    ratioBasis:'mass', components:[
      {productId:'jacks-0-12-26-a',label:'Part A',defaultParts:3.7},
      {productId:'jacks-15-0-0-b',label:'Part B',defaultParts:2.438}
    ],
    ratioNote:'Defaults follow the current 0-12-26 label reference rates.',
    useRates:[{label:'Label reference',components:[{productId:'jacks-0-12-26-a',gPerGal:3.7},{productId:'jacks-15-0-0-b',gPerGal:2.438}]}]
  },
  {
    id:'jacks-321', partCount:3, manufacturer:'JR Peters', brand:"Jack's Nutrients", program:'3-2-1', displayFormula:'5-12-26 (A) + 15-0-0 (B) + Magnesium Sulfate (C)', name:'3-Part 3-2-1 — A + B + Magnesium Sulfate C',
    ratioBasis:'mass', components:[
      {productId:'jacks-5-12-26-a',label:'Part A',defaultParts:3.6},
      {productId:'jacks-15-0-0-b',label:'Part B',defaultParts:2.4},
      {productId:'jacks-epsom',label:'Part C',defaultParts:1.1}
    ],
    ratioNote:'Jack’s published mixing lesson uses 3.6 g/gal Part A, 1.1 g/gal Epsom, then 2.4 g/gal Part B; displayed as A/B/C here.',
    useRates:[{label:"Jack's 3-2-1",components:[{productId:'jacks-5-12-26-a',gPerGal:3.6},{productId:'jacks-15-0-0-b',gPerGal:2.4},{productId:'jacks-epsom',gPerGal:1.1}]}]
  },
  {
    id:'athena-pro-veg', partCount:2, manufacturer:'Athena Ag', brand:'Athena', program:'Pro Veg', displayFormula:'14-0-0 (Core) + 2-8-20 (Grow)', name:'Pro Line — Veg (Core + Grow)',
    ratioBasis:'mass', components:[
      {productId:'athena-pro-core',label:'Core',defaultParts:.6},
      {productId:'athena-pro-grow',label:'Grow',defaultParts:1}
    ],
    ratioNote:'Manufacturer dry-weight relationship is approximately 0.6 g Core for every 1 g Pro Grow across the dosage guide.', useRates:[{label:'EC 1.0',components:[{productId:'athena-pro-core',gPerGal:1.4},{productId:'athena-pro-grow',gPerGal:2.3}]},{label:'EC 1.5',components:[{productId:'athena-pro-core',gPerGal:2.1},{productId:'athena-pro-grow',gPerGal:3.6}]},{label:'EC 2.0',components:[{productId:'athena-pro-core',gPerGal:2.9},{productId:'athena-pro-grow',gPerGal:4.9}]},{label:'EC 2.5',components:[{productId:'athena-pro-core',gPerGal:3.8},{productId:'athena-pro-grow',gPerGal:6.3}]},{label:'EC 3.0',components:[{productId:'athena-pro-core',gPerGal:4.6},{productId:'athena-pro-grow',gPerGal:7.7}]},{label:'EC 3.5',components:[{productId:'athena-pro-core',gPerGal:5.5},{productId:'athena-pro-grow',gPerGal:9.1}]},{label:'EC 4.0',components:[{productId:'athena-pro-core',gPerGal:6.4},{productId:'athena-pro-grow',gPerGal:10.6}]}]
  },
  {
    id:'athena-pro-bloom', partCount:2, manufacturer:'Athena Ag', brand:'Athena', program:'Pro Bloom', displayFormula:'14-0-0 (Core) + 0-12-24 (Bloom)', name:'Pro Line — Flower (Core + Bloom)',
    ratioBasis:'mass', components:[
      {productId:'athena-pro-core',label:'Core',defaultParts:.6},
      {productId:'athena-pro-bloom-component',label:'Bloom',defaultParts:1}
    ],
    ratioNote:'Manufacturer dry-weight relationship is approximately 0.6 g Core for every 1 g Pro Bloom across the dosage guide.', useRates:[{label:'EC 1.0',components:[{productId:'athena-pro-core',gPerGal:1.4},{productId:'athena-pro-bloom-component',gPerGal:2.3}]},{label:'EC 1.5',components:[{productId:'athena-pro-core',gPerGal:2.1},{productId:'athena-pro-bloom-component',gPerGal:3.6}]},{label:'EC 2.0',components:[{productId:'athena-pro-core',gPerGal:2.9},{productId:'athena-pro-bloom-component',gPerGal:4.9}]},{label:'EC 2.5',components:[{productId:'athena-pro-core',gPerGal:3.8},{productId:'athena-pro-bloom-component',gPerGal:6.3}]},{label:'EC 3.0',components:[{productId:'athena-pro-core',gPerGal:4.6},{productId:'athena-pro-bloom-component',gPerGal:7.7}]},{label:'EC 3.5',components:[{productId:'athena-pro-core',gPerGal:5.5},{productId:'athena-pro-bloom-component',gPerGal:9.1}]},{label:'EC 4.0',components:[{productId:'athena-pro-core',gPerGal:6.4},{productId:'athena-pro-bloom-component',gPerGal:10.6}]}]
  },
  {
    id:'athena-blended-veg', partCount:2, manufacturer:'Athena Ag', brand:'Athena', program:'Blended Veg', displayFormula:'4-0-1 (Grow A) + 1-3-5 (Grow B)', name:'Blended Line — Veg (Grow A + Grow B)',
    ratioBasis:'volume', components:[
      {productId:'athena-grow-a',label:'Grow A',defaultParts:1},
      {productId:'athena-grow-b',label:'Grow B',defaultParts:1}
    ],
    ratioNote:'Manufacturer specifies equal parts Grow A and Grow B by volume. Full published program also uses CaMg; base-only comparison here excludes that component.', useRates:[{label:'Veg W1-W4 base',components:[{productId:'athena-grow-a',mLPerGal:11},{productId:'athena-grow-b',mLPerGal:11}]}]
  },
  {
    id:'athena-blended-bloom', partCount:2, manufacturer:'Athena Ag', brand:'Athena', program:'Blended Bloom', displayFormula:'4-0-5 (Bloom A) + 0.7-6-5 (Bloom B)', name:'Blended Line — Flower (Bloom A + Bloom B)',
    ratioBasis:'volume', components:[
      {productId:'athena-bloom-a',label:'Bloom A',defaultParts:1},
      {productId:'athena-bloom-b',label:'Bloom B',defaultParts:1}
    ],
    ratioNote:'Manufacturer specifies equal parts Bloom A and Bloom B by volume. Full published program also uses CaMg and later PK; base-only comparison here excludes those components.', useRates:[{label:'Flower W1-W4 base',components:[{productId:'athena-bloom-a',mLPerGal:12},{productId:'athena-bloom-b',mLPerGal:12}]},{label:'Flower W5 base',components:[{productId:'athena-bloom-a',mLPerGal:10},{productId:'athena-bloom-b',mLPerGal:10}]},{label:'Flower W6 base',components:[{productId:'athena-bloom-a',mLPerGal:9},{productId:'athena-bloom-b',mLPerGal:9}]},{label:'Flower W7 base',components:[{productId:'athena-bloom-a',mLPerGal:5},{productId:'athena-bloom-b',mLPerGal:5}]},{label:'Flower W8-W9 base',components:[{productId:'athena-bloom-a',mLPerGal:4},{productId:'athena-bloom-b',mLPerGal:4}]}]
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
