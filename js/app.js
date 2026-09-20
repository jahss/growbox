(()=>{'use strict';
const CHEM=window.GrowboxChemistry;
if(!CHEM)throw new Error('Growbox chemistry engine failed to load.');
const STATE=window.GrowboxState;
if(!STATE)throw new Error('Growbox state module failed to load.');
const PRODUCTS=window.FERTILIZER_PRODUCTS||[],SYSTEMS=window.FERTILIZER_SYSTEMS||[],F=CHEM.MG_PER_L_PER_G_PER_GAL,LEVELS=[120,140,160,180,200];
const EK=CHEM.ELEMENT_KEYS;
const fresh=STATE.freshState;
let S=STATE.loadState(sessionStorage,PRODUCTS,SYSTEMS);
const $=id=>document.getElementById(id),num=v=>Number.isFinite(+v)?+v:0,fmt=(v,d=2)=>Number.isFinite(+v)?(+v).toFixed(d).replace(/(\.\d*?[1-9])0+$|\.0+$/,'$1'):'—',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),prod=id=>PRODUCTS.find(p=>p.id===id),save=()=>STATE.saveState(sessionStorage,S);
function displayProgram(x){return x.program||x.name||''}
function displayFormula(x){
  if(x.displayFormula)return x.displayFormula;
  if(x.analysis)return fmt(x.analysis.N)+'-'+fmt(x.analysis.P2O5)+'-'+fmt(x.analysis.K2O);
  return x.name||'';
}
function displayParts(x){return (x.partCount||1)+'-part'}
function entryTitle(x){return x.brand+' — '+displayProgram(x)}
function entryCell(x){return esc(entryTitle(x))+'<br><small class="muted">'+esc(displayFormula(x))+' · '+esc(displayParts(x))+'</small>'}
function exportLabel(x){return entryTitle(x)+' | '+displayFormula(x)+' | '+displayParts(x)}

const elem=CHEM.elementalAnalysis;
const ppm=CHEM.ppmAtDose;
const doseN=CHEM.standardizedNitrogenDose;
const rateMassGPerGal=CHEM.rateMassGPerGal;
function ppmAtRate(p,r){const g=rateMassGPerGal(p,r);return g==null?null:ppm(p,g)}
function productDoseText(p,g){if(p.form==='liquid'&&num(p.densityGPerMl)>0)return fmt(g,3)+' g/gal ('+fmt(g/p.densityGPerMl,3)+' mL/gal)';return fmt(g,3)+' g/gal'}
function systemMix(sys){
  const parts=(S.systemParts[sys.id]||sys.components.map(c=>c.defaultParts==null?1:c.defaultParts)).map(v=>Math.max(0,num(v)));
  const products=sys.components.map(c=>prod(c.productId));
  return{sys,products,...CHEM.mixSystem(sys,products,parts)};
}
function compareSelectionCount(){return S.compare.length+S.systemCompare.length}
function addCompareItem(value){
  if(!value)return;
  if(compareSelectionCount()>=5){flash('Comparison is limited to 5 product lines. Remove one before adding another.','warn');return}
  const [kind,id]=value.split(':');
  if(kind==='p'&&!S.compare.includes(id))S.compare.push(id);
  if(kind==='s'&&!S.systemCompare.includes(id))S.systemCompare.push(id);
  save();compareControls();compareTables();
}
function removeCompareItem(kind,id){
  const list=kind==='product'?S.compare:S.systemCompare;
  const i=list.indexOf(id);if(i>=0)list.splice(i,1);
  save();compareControls();compareTables();
}
function compareControls(){
  const one=PRODUCTS.filter(p=>p.compareGroup==='1-part'&&!S.compare.includes(p.id));
  const two=SYSTEMS.filter(x=>x.partCount===2&&!S.systemCompare.includes(x.id));
  const three=SYSTEMS.filter(x=>x.partCount===3&&!S.systemCompare.includes(x.id));
  const group=(label,items,prefix)=>items.length?'<optgroup label="'+label+'">'+items.map(x=>'<option value="'+prefix+':'+esc(x.id)+'">'+esc(x.brand+' — '+displayProgram(x)+' · '+displayFormula(x)+' · '+displayParts(x))+'</option>').join('')+'</optgroup>':'';
  $('productPicker').innerHTML='<option value="">Add product line…</option>'+group('1-Part',one,'p')+group('2-Part',two,'s')+group('3-Part',three,'s');
  $('productPicker').disabled=compareSelectionCount()>=5;
  $('compareCount').textContent=compareSelectionCount()+' / 5 selected';

  const selected=[];
  S.compare.map(prod).filter(Boolean).forEach(p=>selected.push({
    kind:'product',id:p.id,brand:p.brand,program:displayProgram(p),formula:displayFormula(p),parts:displayParts(p)
  }));
  S.systemCompare.map(id=>SYSTEMS.find(x=>x.id===id)).filter(Boolean).forEach(sys=>{
    const m=systemMix(sys),unit=sys.ratioBasis==='volume'?'volume':'mass';
    const controls=sys.components.map((c,i)=>'<label>'+esc(c.label)+' <input class="spr" data-sys="'+esc(sys.id)+'" data-i="'+i+'" type="number" min="0" step=".1" value="'+fmt(m.parts[i],3)+'"> '+unit+' parts</label>').join('');
    selected.push({kind:'system',id:sys.id,brand:sys.brand,program:displayProgram(sys),formula:displayFormula(sys),parts:displayParts(sys),controls});
  });

  $('selectedLines').innerHTML=selected.map(x=>'<div class="selected-line"><div class="selected-line-head"><div><b>'+esc(x.brand+' — '+x.program)+'</b><div>'+esc(x.formula)+'</div><div class="muted">'+esc(x.parts)+'</div></div><button class="removeLine" data-kind="'+x.kind+'" data-id="'+esc(x.id)+'" type="button">Remove</button></div>'+(x.controls?'<details><summary>Adjust part ratio</summary><div class="toolbar" style="margin-top:7px">'+x.controls+'</div></details>':'')+'</div>').join('');

  document.querySelectorAll('.removeLine').forEach(b=>b.onclick=()=>removeCompareItem(b.dataset.kind,b.dataset.id));
  document.querySelectorAll('.spr').forEach(x=>x.oninput=()=>{
    const sys=SYSTEMS.find(y=>y.id===x.dataset.sys);if(!sys)return;
    const current=S.systemParts[sys.id]||sys.components.map(c=>c.defaultParts==null?1:c.defaultParts);
    const next=[...current];next[+x.dataset.i]=Math.max(0,num(x.value));
    if(!next.some(value=>value>0)){x.value=fmt(current[+x.dataset.i],3);flash('At least one system part must be greater than zero.','warn');return}
    S.systemParts[sys.id]=next;save();compareTables();
  });
}
function selectedCompareEntries(){
  const items=S.compare.map(prod).filter(p=>p&&p.compareGroup==='1-part').map(p=>({
    kind:'product',id:p.id,brand:p.brand,program:displayProgram(p),displayFormula:displayFormula(p),partCount:p.partCount||1,
    name:p.name,analysis:p.analysis,product:p,useRates:p.useRates||[]
  }));
  S.systemCompare.map(id=>SYSTEMS.find(x=>x.id===id)).filter(Boolean).forEach(sys=>{
    const m=systemMix(sys);
    items.push({
      kind:'system',id:sys.id,brand:sys.brand,program:displayProgram(sys),displayFormula:displayFormula(sys),partCount:sys.partCount,
      name:sys.name,analysis:m.analysis,system:sys,mix:m,useRates:sys.useRates||[]
    });
  });
  return items.slice(0,5);
}
function flash(message,kind=''){
  const box=$('notice');box.textContent=message;box.className='notice'+(kind?' '+kind:'');box.classList.remove('hidden');
  clearTimeout(flash._t);flash._t=setTimeout(()=>box.classList.add('hidden'),3500);
}
function systemStandardDoseText(e,totalG){
  const pieces=e.mix.products.map((p,i)=>{
    const g=totalG*e.mix.weights[i];
    if(p.form==='liquid'&&num(p.densityGPerMl)>0)return esc(e.system.components[i].label)+' '+fmt(g/p.densityGPerMl,3)+' mL/gal';
    return esc(e.system.components[i].label)+' '+fmt(g,3)+' g/gal';
  });
  return fmt(totalG,3)+' g/gal total<br><small class="muted">'+pieces.join(' + ')+'</small>';
}
function systemRateResult(e,r){
  const total={};EK.forEach(k=>total[k]=0);
  const labels=[];let totalG=0;
  (r.components||[]).forEach(c=>{
    const p=prod(c.productId);if(!p)return;
    const g=rateMassGPerGal(p,c);
    const x=ppm(p,g);totalG+=g;EK.forEach(k=>total[k]+=x[k]||0);
    labels.push(c.gPerGal!=null?esc(displayFormula(p))+' '+fmt(c.gPerGal,3)+' g/gal':esc(displayFormula(p))+' '+fmt(c.mLPerGal,3)+' mL/gal');
  });
  return{total,totalG,label:labels.join(' + ')};
}
function highlightClass(entries,key,index){
  if(entries.length<2)return'';
  const vals=entries.map(e=>e.values[key]).filter(Number.isFinite);
  if(vals.length<2)return'';
  const hi=Math.max(...vals),lo=Math.min(...vals),v=entries[index].values[key];
  if(Math.abs(hi-lo)<1e-12)return'';
  if(Math.abs(v-hi)<1e-9)return'hi';
  if(Math.abs(v-lo)<1e-9)return'lo';
  return'';
}
function avg(ps,w,mode){const keys=mode==='label'?['N','P2O5','K2O','Ca','Mg','S']:['N','P','K','Ca','Mg','S'],o={};keys.forEach(k=>o[k]=0);ps.forEach((p,i)=>{const a=mode==='label'?p.analysis:elem(p.analysis);keys.forEach(k=>o[k]+=w[i]*num(a[k]))});return o}
function simplex(v){const u=[...v].sort((a,b)=>b-a);let s=0,r=-1;for(let i=0;i<u.length;i++){s+=u[i];if(u[i]*(i+1)>s-1)r=i}if(r<0)return v.map(()=>1/v.length);const t=(u.slice(0,r+1).reduce((a,b)=>a+b,0)-1)/(r+1);return v.map(x=>Math.max(0,x-t))}
function solveBlend(ps,target,mode){const keys=mode==='label'?['N','P2O5','K2O','Ca','Mg','S']:['N','P','K','Ca','Mg','S'],cols=ps.map(p=>mode==='label'?p.analysis:elem(p.analysis)),t=keys.map(k=>num(target[k])),sc=t.map(x=>Math.max(Math.abs(x),1));let w=ps.map(()=>1/ps.length),fro=0;keys.forEach((k,r)=>ps.forEach((p,c)=>fro+=(num(cols[c][k])/sc[r])**2));const step=1/Math.max(1e-9,2*fro);for(let it=0;it<30000;it++){const pred=keys.map(k=>ps.reduce((s,p,i)=>s+w[i]*num(cols[i][k]),0)),grad=w.map((_,c)=>keys.reduce((g,k,r)=>g+2*((pred[r]-t[r])/sc[r])*(num(cols[c][k])/sc[r]),0)),next=simplex(w.map((x,i)=>x-step*grad[i])),delta=Math.max(...next.map((x,i)=>Math.abs(x-w[i])));w=next;if(delta<1e-12)break}const la=avg(ps,w,'label'),el=avg(ps,w,'element'),basis=mode==='label'?la:el;let q=0;keys.forEach((k,i)=>q+=((basis[k]-t[i])/sc[i])**2);return{w,label:la,element:el,rms:Math.sqrt(q/keys.length)}}
function tabs(){document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{S.view=b.dataset.view;save();document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===S.view))});document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===S.view));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===S.view))}
function checks(box,cls,ids,onchange){
  const regular=PRODUCTS.filter(p=>p.compareGroup!=='salt'),salts=PRODUCTS.filter(p=>p.compareGroup==='salt');
  const row=p=>'<label class="check"><input class="'+cls+'" type="checkbox" value="'+esc(p.id)+'" '+(ids.includes(p.id)?'checked':'')+'><span><b>'+esc(p.brand+' — '+displayFormula(p))+'</b><small>'+fmt(p.analysis.N)+'-'+fmt(p.analysis.P2O5)+'-'+fmt(p.analysis.K2O)+' label · '+fmt(elem(p.analysis).N)+' / '+fmt(elem(p.analysis).P)+' / '+fmt(elem(p.analysis).K)+' elemental</small></span></label>';
  $(box).innerHTML='<div class="compare-group"><div class="group-title"><h3>Fertilizers & components</h3></div>'+regular.map(row).join('')+'</div><div class="compare-group"><div class="group-title"><h3>Ingredient salts</h3></div>'+salts.map(row).join('')+'</div>';
  document.querySelectorAll('.'+cls).forEach(x=>x.onchange=()=>onchange([...document.querySelectorAll('.'+cls+':checked')].map(y=>y.value)));
}
function compare(){
  compareControls();
  $('nLevel').value=S.n;
  $('percentView').classList.toggle('active',S.compareMode==='percent');
  $('ppmView').classList.toggle('active',S.compareMode==='ppm');
  $('nControl').classList.toggle('hidden',S.compareMode!=='ppm');
  compareTables();
}
function compareTables(){
  const entries=selectedCompareEntries();
  const percentCols=[
    ['N','N'],['P2O5','P₂O₅'],['K2O','K₂O'],['Ca','Ca'],['Mg','Mg'],['S','S'],
    ['Fe','Fe'],['Mn','Mn'],['Zn','Zn'],['B','B'],['Cu','Cu'],['Mo','Mo']
  ];
  const ppmCols=[['N','N'],['P','P'],['K','K'],['Ca','Ca'],['Mg','Mg'],['S','S'],['Fe','Fe'],['Mn','Mn'],['Zn','Zn'],['B','B'],['Cu','Cu'],['Mo','Mo']];

  if(S.compareMode==='percent'){
    $('comparisonHeading').textContent='Guaranteed analysis (%)';
    const rows=entries.map(e=>({entry:e,values:e.analysis}));
    $('analysisCompare').innerHTML='<thead><tr><th>Product / system</th>'+percentCols.map(c=>'<th>'+c[1]+' %</th>').join('')+'</tr></thead><tbody>'+
      rows.map((row,i)=>'<tr><td>'+entryCell(row.entry)+(row.entry.kind==='system'?' <small class="muted">(combined)</small>':'')+'</td>'+
      percentCols.map(([k])=>'<td class="'+highlightClass(rows,k,i)+'">'+fmt(row.values[k],['Fe','Mn','Zn','B','Cu','Mo'].includes(k)?(k==='Mo'?4:3):2)+'</td>').join('')+'</tr>').join('')+
      '</tbody>';
  }else{
    $('comparisonHeading').textContent='Elemental ppm @ '+S.n+' ppm N';
    const rows=entries.map(e=>{const d=doseN(e.analysis,S.n),x=d===null?null:ppm(e.analysis,d);return{entry:e,dose:d,values:x||{}}});
    $('analysisCompare').innerHTML='<thead><tr><th>Product / system</th><th>Dose</th>'+ppmCols.map(c=>'<th>'+c[1]+' ppm</th>').join('')+'</tr></thead><tbody>'+
      rows.map((row,i)=>{
        const e=row.entry;
        if(row.dose===null)return'<tr><td>'+entryCell(e)+'</td><td>Cannot standardize</td>'+ppmCols.map(()=>'<td>—</td>').join('')+'</tr>';
        const doseText=e.kind==='system'?systemStandardDoseText(e,row.dose):productDoseText(e.product,row.dose);
        return'<tr><td>'+entryCell(e)+'</td><td>'+doseText+'</td>'+
          ppmCols.map(([k])=>'<td class="'+highlightClass(rows,k,i)+'">'+fmt(row.values[k],['Fe','Mn','Zn','B','Cu','Mo'].includes(k)?(k==='Mo'?4:3):1)+'</td>').join('')+'</tr>';
      }).join('')+'</tbody>';
  }

  const rateRows=entries.map(e=>{
    if(!e.useRates.length)return{entry:e,label:'No verified rate loaded',doseText:'—',values:null,rateIndex:0};
    const key=e.kind+':'+e.id;
    let idx=Number.isInteger(S.rateChoice[key])?S.rateChoice[key]:0;
    if(idx<0||idx>=e.useRates.length)idx=0;
    const r=e.useRates[idx];
    if(e.kind==='system'){
      const q=systemRateResult(e,r);
      return{entry:e,label:r.label,doseText:q.label,values:q.total,rateIndex:idx};
    }
    const x=ppmAtRate(e.product,r),dose=r.gPerGal!=null?fmt(r.gPerGal,3)+' g/gal':fmt(r.mLPerGal,3)+' mL/gal';
    return{entry:e,label:r.label,doseText:dose,values:x,rateIndex:idx};
  });
  const rateCalc=rateRows.map(r=>({values:r.values||{}}));
  $('ratesTable').innerHTML='<thead><tr><th>Product / system</th><th>Manufacturer rate</th><th>Dose / components</th>'+ppmCols.map(c=>'<th>'+c[1]+' ppm</th>').join('')+'</tr></thead><tbody>'+
    rateRows.map((r,i)=>{
      const e=r.entry,key=e.kind+':'+e.id;
      const rateCell=e.useRates.length>1?'<select class="rateSelect" data-key="'+esc(key)+'">'+e.useRates.map((x,j)=>'<option value="'+j+'" '+(j===r.rateIndex?'selected':'')+'>'+esc(x.label)+'</option>').join('')+'</select>':esc(r.label);
      return'<tr><td>'+entryCell(e)+'</td><td>'+rateCell+'</td><td>'+r.doseText+'</td>'+
        ppmCols.map(([k])=>r.values?'<td class="'+highlightClass(rateCalc,k,i)+'">'+fmt(r.values[k],['Fe','Mn','Zn','B','Cu','Mo'].includes(k)?(k==='Mo'?4:3):1)+'</td>':'<td>—</td>').join('')+'</tr>';
    }).join('')+'</tbody>';
  document.querySelectorAll('.rateSelect').forEach(x=>x.onchange=()=>{S.rateChoice[x.dataset.key]=+x.value;save();compareTables()});
}
function manual(){const fs=[['N','N %'],['P2O5','P₂O₅ %'],['K2O','K₂O %'],['Ca','Ca %'],['Mg','Mg %'],['S','S %'],['Fe','Fe %'],['Mn','Mn %'],['Zn','Zn %'],['B','B %'],['Cu','Cu %'],['Mo','Mo %']];$('gaInputs').innerHTML=fs.map(([k,l])=>'<label>'+l+'<input class="gai" data-k="'+k+'" type="number" min="0" step=".001" value="'+fmt(S.manual[k],6)+'"></label>').join('');document.querySelectorAll('.gai').forEach(x=>x.oninput=()=>{S.manual[x.dataset.k]=Math.max(0,num(x.value));save();manualOut()});manualOut()}
function manualOut(){const e=elem(S.manual);$('gaElemental').innerHTML='<thead><tr><th>Basis</th><th>N</th><th>P / P₂O₅</th><th>K / K₂O</th><th>Ca</th><th>Mg</th><th>S</th></tr></thead><tbody><tr><td>Label</td><td>'+fmt(S.manual.N,3)+'</td><td>'+fmt(S.manual.P2O5,3)+' P₂O₅</td><td>'+fmt(S.manual.K2O,3)+' K₂O</td><td>'+fmt(S.manual.Ca,3)+'</td><td>'+fmt(S.manual.Mg,3)+'</td><td>'+fmt(S.manual.S,3)+'</td></tr><tr><td>Elemental</td><td>'+fmt(e.N,3)+'</td><td>'+fmt(e.P,3)+' P</td><td>'+fmt(e.K,3)+' K</td><td>'+fmt(e.Ca,3)+'</td><td>'+fmt(e.Mg,3)+'</td><td>'+fmt(e.S,3)+'</td></tr></tbody>';$('gaFeed').innerHTML='<thead><tr><th>N target</th><th>g/gal</th><th>N</th><th>P</th><th>K</th><th>Ca</th><th>Mg</th><th>S</th></tr></thead><tbody>'+LEVELS.map(N=>{const d=doseN(S.manual,N);if(d===null)return'<tr><td>'+N+'</td><td colspan="7">N must be greater than 0%</td></tr>';const x=ppm(S.manual,d);return'<tr><td>'+N+'</td><td>'+fmt(d,3)+'</td>'+['N','P','K','Ca','Mg','S'].map(k=>'<td>'+fmt(x[k],1)+'</td>').join('')+'</tr>'}).join('')+'</tbody>'}
function blend(){checks('blendChecks','bc',S.blend.ids,ids=>{S.blend.ids=ids;S.blend.result=null;save();$('blendResult').classList.add('hidden')});$('labelMode').classList.toggle('active',S.blend.mode==='label');$('elementMode').classList.toggle('active',S.blend.mode==='element');const fs=S.blend.mode==='label'?[['N','N'],['P2O5','P₂O₅'],['K2O','K₂O'],['Ca','Ca'],['Mg','Mg'],['S','S']]:[['N','N'],['P','P'],['K','K'],['Ca','Ca'],['Mg','Mg'],['S','S']];$('blendInputs').innerHTML=fs.map(([k,l])=>'<label>'+l+'<input class="bi" data-k="'+k+'" type="number" min="0" step=".01" value="'+fmt(S.blend.target[k]??0,4)+'"></label>').join('');document.querySelectorAll('.bi').forEach(x=>x.oninput=()=>{S.blend.target[x.dataset.k]=Math.max(0,num(x.value));S.blend.result=null;save()});renderBlendResult()}
function renderTable(id,a,mode){const ks=mode==='label'?[['N','N'],['P2O5','P₂O₅'],['K2O','K₂O'],['Ca','Ca'],['Mg','Mg'],['S','S']]:[['N','N'],['P','P'],['K','K'],['Ca','Ca'],['Mg','Mg'],['S','S']];$(id).innerHTML='<thead><tr>'+ks.map(x=>'<th>'+x[1]+'</th>').join('')+'</tr></thead><tbody><tr>'+ks.map(x=>'<td>'+fmt(a[x[0]],3)+'</td>').join('')+'</tr></tbody>'}
function renderBlendResult(){const r=S.blend.result;if(!r){$('blendResult').classList.add('hidden');return}const ps=r.ids.map(prod).filter(Boolean);$('blendResult').classList.remove('hidden');$('fit').textContent='Relative RMS error: '+fmt(r.rms*100,2)+'%. Lower is closer; 0% is exact.';$('weights').innerHTML=ps.map((p,i)=>'<div class="pill"><b>'+esc(displayFormula(p))+'</b><span>'+fmt(r.w[i]*100,2)+'% by mass</span></div>').join('');renderTable('labelResult',r.label,'label');renderTable('elementResult',r.element,'element');const nPct=r.element.N;$('feed').innerHTML='<thead><tr><th>N target</th>'+ps.map(p=>'<th>'+esc(displayFormula(p))+' g/gal</th>').join('')+'<th>Total</th><th>P</th><th>K</th><th>Ca</th><th>Mg</th><th>S</th></tr></thead><tbody>'+(nPct<=0?'<tr><td colspan="20">Blend contains no nitrogen.</td></tr>':LEVELS.map(N=>{const total=N/(F*nPct/100),ds=r.w.map(w=>total*w);return'<tr><td>'+N+'</td>'+ds.map(d=>'<td>'+fmt(d,3)+'</td>').join('')+'<td>'+fmt(total,3)+'</td>'+['P','K','Ca','Mg','S'].map(k=>'<td>'+fmt(F*total*r.element[k]/100,1)+'</td>').join('')+'</tr>'}).join(''))+'</tbody>'}
function dl(name,type,text){const u=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}
function exportJSON(){dl('growbox-fertilizer-results.json','application/json',JSON.stringify(S,null,2))}
function exportCSV(){let rows=[];if(S.view==='analysis'){rows.push(['Target N','g/gal','N','P','K','Ca','Mg','S']);LEVELS.forEach(N=>{const d=doseN(S.manual,N),x=d===null?null:ppm(S.manual,d);rows.push([N,d,...(x?['N','P','K','Ca','Mg','S'].map(k=>x[k]):['','','','','',''])])})}else if(S.view==='blend'&&S.blend.result){const r=S.blend.result,ps=r.ids.map(prod),nPct=r.element.N;rows.push(['Target N',...ps.map(p=>p.name+' g/gal'),'Total g/gal','P','K','Ca','Mg','S']);if(nPct>0)LEVELS.forEach(N=>{const total=N/(F*nPct/100);rows.push([N,...r.w.map(w=>total*w),total,...['P','K','Ca','Mg','S'].map(k=>F*total*r.element[k]/100)])})}else{const keys=['N','P','K','Ca','Mg','S','Fe','Mn','Zn','B','Cu','Mo'];rows.push(['Product / system','Total g/gal',...keys]);selectedCompareEntries().forEach(e=>{const d=doseN(e.analysis,S.n),x=d===null?null:ppm(e.analysis,d);rows.push([exportLabel(e),d,...(x?keys.map(k=>x[k]):keys.map(()=>''))])})}dl('growbox-fertilizer-results.csv','text/csv',rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n'))}
$('productPicker').onchange=e=>{addCompareItem(e.target.value);e.target.value=''};$('nLevel').onchange=e=>{S.n=+e.target.value;save();compareTables()};$('percentView').onclick=()=>{S.compareMode='percent';save();compare()};$('ppmView').onclick=()=>{S.compareMode='ppm';save();compare()};$('labelMode').onclick=()=>{S.blend.mode='label';S.blend.result=null;save();blend()};$('elementMode').onclick=()=>{S.blend.mode='element';S.blend.result=null;save();blend()};$('solve').onclick=()=>{const ps=S.blend.ids.map(prod).filter(Boolean);if(!ps.length){$('notice').textContent='Select at least one fertilizer.';$('notice').classList.remove('hidden');return}S.blend.result={ids:ps.map(p=>p.id),...solveBlend(ps,S.blend.target,S.blend.mode)};save();renderBlendResult()};$('csv').onclick=exportCSV;$('json').onclick=exportJSON;$('reset').onclick=()=>{if(confirm('Reset this browser session?')){S=fresh();save();render()}};
function render(){tabs();compare();manual();blend()}render();
})();
