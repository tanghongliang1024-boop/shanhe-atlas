const $=s=>document.querySelector(s);
const icon=id=>`<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE='shanhe-atlas-v1';
let records={},features=[],provinces=[],selected=null,mode='flag',currentView='map',svg,layer,projection,zoom,cityShapes,markers,labels;
let storageAvailable=true,cloud=null,detailContext=null,detailBase={},detailBusy=false,detailOperation=0;
function readLocalRecords(){try{const value=JSON.parse(localStorage.getItem(STORAGE)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{storageAvailable=false;return {};}}
const legacyTaiwan=createLegacyTaiwanAdapter({getRecords:()=>records,getFeatures:()=>features,getContext:()=>cloud?.context(),canOpen:()=>{if(cloud?.canEdit())return true;toast('请先成功读取存档，再整理台湾足迹。');return false;},persist,onChange:renderAll,notify:toast});
const phoneLayout=window.matchMedia('(max-width:850px)');
let mapTouchActive=false;
function configurePhoneLayout(){
  const panel=$('#city-panel'),picker=$('#city-picker');
  if(phoneLayout.matches){picker.append(panel);}else{if(picker.open)picker.close();$('#map-view').append(panel);}
  setMapTouch(false);updateMapOverlays();
}
function setMapTouch(active){mapTouchActive=active;$('#map-stage').classList.toggle('touch-active',active);$('#map-touch-toggle').setAttribute('aria-pressed',String(active));$('#map-touch-toggle').textContent=active?'完成地图操作':'拖动地图';$('#mobile-map-hint').textContent=active?'单指拖动 · 双指缩放':'轻点城市标记 · 上下滑动浏览';}
$('#map-touch-toggle').onclick=()=>setMapTouch(!mapTouchActive);
$('#open-city-picker').onclick=()=>{$('#city-picker').showModal();$('#city-search').focus();};
$('#close-city-picker').onclick=()=>$('#city-picker').close();
$('#city-picker').addEventListener('click',e=>{if(e.target===$('#city-picker')){const r=e.target.getBoundingClientRect();if(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right)e.target.close();}});
phoneLayout.addEventListener('change',configurePhoneLayout);
configurePhoneLayout();
let mapResize;
window.addEventListener('resize',()=>{clearTimeout(mapResize);mapResize=setTimeout(updateMapOverlays,100);});
// Guest drafts and signed-in archives are selected by the storage controller.
// The legacy local-only archive is retained exclusively for explicit import.
const visited=f=>records[f.properties.adcode]?.visited===true;
const isTaiwan=f=>String(f.properties.provinceCode)==='710000';
const searchText=s=>String(s??'').toLowerCase().replaceAll('臺','台');
const shortName=s=>s.replace(/(壮族|回族|维吾尔)?自治区$|特别行政区$|省$|市$/g,'');
const dateString=s=>s?s.replaceAll('-','.'):'初见日期待补充';
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
async function persist(next,context){const result=await cloud.save(next,context);if(!result.ok&&result.code!=='STALE_REQUEST')toast(result.message);return result;}
function setDetailBusy(busy){detailBusy=busy;$('#city-form').querySelectorAll('button,input,textarea').forEach(el=>el.disabled=busy);}
function showSaveResult(result){$('#detail-save-status').textContent=result.ok?(result.guest?'已临时保存在此浏览器。':'已保存到云端。'):result.message;$('#detail-save-status').dataset.error=String(!result.ok);$('#detail-reload-cloud').hidden=result.ok||result.code!=='CONFLICT';$('#detail-reload-cloud').textContent=cloud.getState().guest?'读取最新临时足迹并重新编辑':'读取最新云端记录并重新编辑';}

function goView(view){currentView=view;document.body.dataset.activeView=view;['map','cities','stats'].forEach(v=>{$('#'+v+'-view').hidden=v!==view;const nav=document.querySelector(`[data-view="${v}"]`);nav.classList.toggle('active',v===view);nav.setAttribute('aria-current',v===view?'page':'false');});if(view==='cities')renderCollection();if(view==='stats')renderStats();if(phoneLayout.matches){window.scrollTo({top:0,behavior:'instant'});setMapTouch(false);}if(view==='map')updateMapOverlays();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>goView(b.dataset.view));
function renderSummary(){const v=features.filter(visited);const p=new Set(v.map(f=>f.properties.provinceCode));const progress=features.length?v.length/features.length*100:0;$('#city-count').textContent=v.length;$('#province-count').textContent=p.size;$('#progress-count').textContent=Number(progress.toFixed(1));$('#progress-ring').style.background=`conic-gradient(var(--green) ${progress}%,#edf0e8 0)`;}
function renderList(){const query=searchText($('#city-search').value.trim()),province=$('#province-filter').value,status=$('#status-filter').value;
let list=features.filter(f=>{const p=f.properties;return(!query||searchText([p.name,p.province,...(p.aliases||[])].join(' ')).includes(query))&&(province==='all'||String(p.provinceCode)===province)&&(status==='all'||(status==='visited'?visited(f):!visited(f)));});
const isDefault=!query&&province==='all'&&status==='all';
if(isDefault){const picks=['110000','310000','510100','330100','530100','440100','532900','610100','500000','350200'];list.sort((a,b)=>{let ai=picks.indexOf(String(a.properties.adcode)),bi=picks.indexOf(String(b.properties.adcode));return(ai<0?999:ai)-(bi<0?999:bi)||a.properties.name.localeCompare(b.properties.name,'zh-CN');});}
$('#list-heading').textContent=isDefault?'从这些城市开始':'探索结果';$('#result-count').textContent=`${list.length} 座`;
$('#city-list').innerHTML=list.length?list.map(f=>{const p=f.properties,r=records[p.adcode];return`<button class="city-row" data-city="${p.adcode}"><span class="city-row-icon ${visited(f)?'done':''}">${icon(visited(f)?'flag':'pin')}</span><span><span class="city-row-name">${esc(p.name)}</span><span class="city-row-meta">${esc(shortName(p.province))}${visited(f)?' · '+esc(dateString(r.date)):' · 等待你的故事'}</span></span>${icon(visited(f)?'check':'arrow')}</button>`;}).join(''):'<div class="empty-results">还没有找到这座城市<br>试试城市名或切换筛选条件</div>';
$('#city-list').querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>openCity(b.dataset.city));}
function openCity(id){if(detailBusy)return;if(!cloud?.canEdit()){toast(cloud?.getState().guest?'暂时无法读取本机足迹，请检查浏览器存储权限后重试。':'请先成功读取云端存档，再编辑城市。');return;}detailContext=cloud.context();detailBase=cloud.getState().records;$('#detail-save-status').textContent=cloud.getState().guest?'当前为临时足迹，保存在此浏览器。':'';$('#detail-reload-cloud').hidden=true;selected=features.find(f=>String(f.properties.adcode)===String(id));if(!selected)return;const p=selected.properties,r=records[p.adcode]||{};$('#detail-city').textContent=p.name;$('#detail-province').textContent=p.province;$('#detail-visited').checked=true;$('#detail-date').value=r.date||'';$('#detail-note').value=r.note||'';$('#remove-visit').hidden=!r.visited;if($('#city-picker').open)$('#city-picker').close();$('#city-dialog').showModal();$('#city-dialog').scrollTop=0;}
$('#close-dialog').onclick=()=>$('#city-dialog').close();
$('#city-dialog').addEventListener('click',e=>{if(detailBusy)return;if(e.target===$('#city-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#detail-date').onchange=()=>{if($('#detail-date').value)$('#detail-visited').checked=true;};
async function saveCity(remove){
  if(!selected||detailBusy)return;
  const id=String(selected.properties.adcode),cityName=selected.properties.name,v=!remove&&$('#detail-visited').checked;
  const next=structuredClone(detailBase);
  if(v)next[id]={visited:true,date:$('#detail-date').value,note:$('#detail-note').value.trim(),updatedAt:new Date().toISOString()};else delete next[id];
  const operation=++detailOperation;
  setDetailBusy(true);$('#detail-save-status').textContent=cloud.getState().guest?'正在临时保存…':'正在保存到云端…';
  try{const result=await persist(next,detailContext);if(operation!==detailOperation||result.code==='STALE_REQUEST')return;showSaveResult(result);if(result.ok){$('#city-dialog').close();toast(result.guest?(v?'已临时保存 '+cityName+' 的足迹':'已更新本机临时足迹'):(v?'已将 '+cityName+' 的足迹保存到云端':'已更新云端足迹'));}}
  finally{if(operation===detailOperation)setDetailBusy(false);}
}
$('#city-form').onsubmit=event=>{event.preventDefault();saveCity(false);};
$('#remove-visit').onclick=()=>saveCity(true);
$('#city-dialog').addEventListener('cancel',event=>{if(detailBusy)event.preventDefault();});
$('#detail-reload-cloud').onclick=async()=>{const id=selected?.properties.adcode;if(!id)return;const operation=++detailOperation;setDetailBusy(true);try{const result=await cloud.refresh();if(operation!==detailOperation)return;if(result.ok){setDetailBusy(false);openCity(id);}else showSaveResult(result);}finally{if(operation===detailOperation)setDetailBusy(false);}};
['city-search','province-filter','status-filter'].forEach(id=>$('#'+id).addEventListener(id==='city-search'?'input':'change',renderList));
function setMode(m){mode=m;$('#flag-mode').classList.toggle('active',m==='flag');$('#fill-mode').classList.toggle('active',m==='fill');$('#flag-mode').setAttribute('aria-pressed',m==='flag');$('#fill-mode').setAttribute('aria-pressed',m==='fill');$('#map-stage').classList.toggle('fill-mode',m==='fill');renderMapState();}
$('#flag-mode').onclick=()=>setMode('flag');$('#fill-mode').onclick=()=>setMode('fill');
function renderMapState(){if(!cityShapes)return;cityShapes.classed('visited',visited);const v=features.filter(visited);markers.selectAll('*').remove();if(mode==='flag'){
const flags=markers.selectAll('g').data(v).join('g').attr('class','city-marker').attr('transform',f=>`translate(${projection(f.properties.center)})`).attr('role','button').attr('tabindex',0).attr('aria-label',f=>`${f.properties.name}，已到访，查看详情`).on('click',(e,f)=>{e.stopPropagation();openCity(f.properties.adcode);}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCity(f.properties.adcode);}});
flags.append('ellipse').attr('cx',0).attr('cy',2).attr('rx',5).attr('ry',2).attr('fill','#9cae8270');flags.append('path').attr('d','M0,1 V-26').attr('stroke','#7c6246').attr('stroke-width',1.7);flags.append('path').attr('d','M1,-26 C8,-31 14,-20 23,-26 L23,-13 C14,-7 8,-19 1,-13 Z').attr('fill','#cf795e').attr('stroke','#fff9ed').attr('stroke-width',.8);
flags.append('title').text(f=>`${f.properties.name} · ${dateString(records[f.properties.adcode].date)}`);}
updateMapOverlays();}
function updateMapOverlays(){if(!svg||!markers||!labels)return;const width=svg.node().getBoundingClientRect().width;if(!width)return;const k=d3.zoomTransform(svg.node()).k,phone=phoneLayout.matches,flagScale=phone?Math.max(1,720/width):1,labelSize=phone?10000/width:10;
markers.selectAll('g').attr('transform',f=>`translate(${projection(f.properties.center)}) scale(${flagScale/k})`);
const visibleNames=['北京市','上海市','广州市','成都市','武汉市','西安市','拉萨市','乌鲁木齐市','哈尔滨市','昆明市'];
const occupied=[];
labels.style('font-size',labelSize/k+'px').style('stroke-width',(phone?5:2)/k+'px').each(function(f){const label=d3.select(this),hidden=isTaiwan(f)?k<5:phone&&k<2&&!visibleNames.includes(f.properties.name);if(hidden){label.style('display','none');return;}const [px,py]=projection(f.properties.center),x=px*k,y=py*k,w=shortName(f.properties.name).length*labelSize,h=labelSize,positions=isTaiwan(f)?[[6,3],[-w-6,3],[-w/2,-7],[-w/2,h+6]]:[[5,3]];const pos=positions.find(([dx,dy])=>{const box=[x+dx-2,y+dy-h-2,x+dx+w+2,y+dy+3];if(occupied.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]))return false;occupied.push(box);return true;});label.style('display',pos?null:'none');if(pos)label.attr('dx',pos[0]/k).attr('dy',pos[1]/k);});
}
function mainlandFeature(f){const coords=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];const polygons=coords.filter(p=>p[0].some(c=>c[1]>=17.5));return {...f,geometry:{type:'MultiPolygon',coordinates:polygons}};}
function drawMap(country){svg=d3.select('#china-map');const mainland={type:'FeatureCollection',features:country.features.filter(f=>/^\d{6}$/.test(String(f.properties.adcode))).map(mainlandFeature)};projection=d3.geoMercator().fitExtent([[50,75],[940,650]],mainland);const path=d3.geoPath(projection);layer=svg.append('g');const colors=['#e2e9d7','#e5eadb','#dce6d2','#e6ebdc','#dfe7d2','#e9ecdf'];
cityShapes=layer.append('g').selectAll('path').data(features).join('path').attr('d',path).attr('class','city-shape').attr('fill',f=>colors[Number(String(f.properties.provinceCode).slice(0,2))%colors.length]).attr('tabindex',0).attr('role','button').attr('aria-label',f=>f.properties.name+'，查看城市详情').on('click',(e,f)=>{openCity(f.properties.adcode);$('#map-tooltip').hidden=true;}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCity(f.properties.adcode);}}).on('pointermove',(e,f)=>{if(e.pointerType==='touch')return;const r=$('#map-stage').getBoundingClientRect(),t=$('#map-tooltip');t.textContent=f.properties.name+(visited(f)?' · 已经去过':' · 点击记录足迹');t.hidden=false;t.style.left=Math.min(e.clientX-r.left+14,r.width-175)+'px';t.style.top=Math.max(12,e.clientY-r.top-35)+'px';}).on('pointerleave',()=>$('#map-tooltip').hidden=true);
layer.append('g').selectAll('path').data(country.features).join('path').attr('d',path).attr('class','province-border');
const major=['北京市','天津市','上海市','重庆市','成都市','杭州市','西安市','广州市','武汉市','昆明市','长沙市','哈尔滨市','沈阳市','济南市','郑州市','乌鲁木齐市','拉萨市','兰州市','西宁市','呼和浩特市','南宁市','贵阳市','福州市','南昌市','南京市','合肥市','长春市','海口市','香港特别行政区','澳门特别行政区','台北市'];
labels=layer.append('g').selectAll('text').data(features.filter(f=>major.includes(f.properties.name)||isTaiwan(f))).join('text').attr('class','city-label').attr('x',f=>projection(f.properties.center)[0]).attr('y',f=>projection(f.properties.center)[1]).text(f=>shortName(f.properties.name));
layer.append('text').attr('x',projection([87,39])[0]).attr('y',projection([87,39])[1]).attr('class','region-label').attr('font-size',15).attr('letter-spacing',8).attr('fill','#a6b497').attr('pointer-events','none').text('新疆');
layer.append('text').attr('x',projection([87,31])[0]).attr('y',projection([87,31])[1]).attr('font-size',15).attr('letter-spacing',8).attr('fill','#a6b497').attr('pointer-events','none').text('西藏');
markers=layer.append('g');zoom=d3.zoom().scaleExtent([1,20]).clickDistance(8).tapDistance(12).filter(e=>{if(e.type.startsWith('touch')&&phoneLayout.matches&&!mapTouchActive)return false;return(!e.ctrlKey||e.type==='wheel')&&!e.button;}).translateExtent([[-100,-100],[1100,840]]).on('zoom',e=>{layer.attr('transform',e.transform);updateMapOverlays();$('#map-tooltip').hidden=true;});svg.call(zoom).on('dblclick.zoom',null);
// South China Sea inset keeps offshore islands visible without shrinking the main map.
const south={type:'FeatureCollection',features:country.features.filter(f=>String(f.properties.adcode)==='100000_JD'||String(f.properties.adcode)==='460000').map(f=>{const cs=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];return {...f,geometry:{type:'MultiPolygon',coordinates:cs.filter(p=>p[0].every(c=>c[1]<20))}};})};
const sp=d3.geoMercator().fitExtent([[859,536],[932,660]],south);const inset=svg.append('g').attr('pointer-events','none');inset.append('rect').attr('x',844).attr('y',519).attr('width',104).attr('height',165).attr('rx',3).attr('fill','#f5f8f2').attr('stroke','#c9d5be').attr('stroke-width',1);inset.selectAll('path').data(south.features).join('path').attr('d',d3.geoPath(sp)).attr('fill','#dae4cd').attr('stroke','#a1b393').attr('stroke-width',.8);inset.append('text').attr('x',896).attr('y',675).attr('text-anchor','middle').attr('font-size',9).attr('fill','#9aa98d').text('南海诸岛');
$('#zoom-in').onclick=()=>svg.transition().duration(250).call(zoom.scaleBy,1.5);$('#zoom-out').onclick=()=>svg.transition().duration(250).call(zoom.scaleBy,1/1.5);$('#zoom-reset').onclick=()=>svg.transition().duration(400).call(zoom.transform,d3.zoomIdentity);
$('#focus-taiwan').onclick=()=>{const [[x0,y0],[x1,y1]]=path.bounds({type:'MultiPoint',coordinates:[[119.3,21.8],[122.2,25.5]]}),k=Math.min(16,Math.min(820/(x1-x0),580/(y1-y0)));svg.transition().duration(450).call(zoom.transform,d3.zoomIdentity.translate(500-k*(x0+x1)/2,360-k*(y0+y1)/2).scale(k));$('#province-filter').value='710000';$('#city-search').value='';$('#status-filter').value='all';renderList();};
$('#map-loading').hidden=true;renderMapState();}
function renderCollection(){const list=features.filter(visited).sort((a,b)=>(records[b.properties.adcode].updatedAt||'').localeCompare(records[a.properties.adcode].updatedAt||''));$('#visited-grid').innerHTML=list.length?list.map(f=>{const p=f.properties,r=records[p.adcode];return`<button class="visited-city" data-city="${p.adcode}">${icon('flag')}<h3>${esc(p.name)}</h3><p>${esc(p.province)}</p><p>初次到访 · ${esc(dateString(r.date))}</p>${r.note?`<p class="memory">${esc(r.note)}</p>`:''}</button>`;}).join(''):`<div class="empty-collection">${icon('map')}<h3>你的旅行故事，正要开始。</h3><p>回到地图，找到去过的城市，插上第一面小旗。</p><button class="button primary" id="start-exploring">去地图记录足迹 ${icon('arrow')}</button></div>`;$('#visited-grid').querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>openCity(b.dataset.city));if($('#start-exploring'))$('#start-exploring').onclick=()=>goView('map');}
function renderStats(){const v=features.filter(visited),groups=d3.group(v,f=>f.properties.province);$('#province-stats').innerHTML=groups.size?[...groups].sort((a,b)=>b[1].length-a[1].length).map(([p,fs])=>{const total=features.filter(f=>f.properties.province===p).length;return`<div class="bar-row"><div class="bar-label"><span>${esc(p)}</span><span>${fs.length} / ${total} 座</span></div><div class="bar-track"><i style="width:${fs.length/total*100}%"></i></div></div>`;}).join(''):'<p class="empty-results">插下第一面旗后，这里会展示你的探索进度。</p>';
const timeline=[...v].sort((a,b)=>(records[a.properties.adcode].date||'9999').localeCompare(records[b.properties.adcode].date||'9999'));$('#timeline').innerHTML=timeline.length?timeline.map(f=>{const r=records[f.properties.adcode];return`<div class="timeline-item"><small>${esc(dateString(r.date))}</small><h4>${esc(f.properties.name)}</h4>${r.note?`<p>${esc(r.note)}</p>`:''}</div>`;}).join(''):'<p class="empty-results">记录首次到访日期，串起你的旅行时间线。</p>';}
function renderAll(){renderSummary();renderList();renderMapState();if(currentView==='cities')renderCollection();if(currentView==='stats')renderStats();legacyTaiwan.render();}
$('#export-btn').onclick=()=>{const list=features.filter(visited),legacyRows=legacyTaiwan.csvRows();if(!list.length&&!legacyRows.length){toast('先标记一座去过的城市，再导出你的足迹吧');return;}const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';const csv='\ufeff'+[['城市','省级地区','首次到访日期','城市记忆'],...list.map(f=>{const p=f.properties,r=records[p.adcode];return[p.name,p.province,r.date,r.note];}),...legacyRows].map(row=>row.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='山河足迹-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('足迹已导出，收藏好这份旅行记忆');};
function showInfo(html){$('#info-body').innerHTML=html;$('#info-dialog').showModal();}
$('#close-info').onclick=()=>$('#info-dialog').close();
$('#help-btn').onclick=()=>showInfo('<h2>欢迎来到山河足迹</h2><p>① 无需注册，先在地图上点击城市，或通过“搜索城市”入口查找。</p><p>② 勾选“我去过这座城市”，填写首次到访日期与旅行记忆，然后保存。</p><p>③ 切换“小旗”与“城市着色”，从不同角度回看足迹。城市足迹与旅行统计会同步更新。</p><p>未登录时，足迹临时保存在当前浏览器，刷新后仍可继续。清理浏览器数据可能会删除临时足迹。</p><p>想长期保存或换设备继续时，点击“保存到云端”，用邮箱注册或登录。注册时两次输入相同密码，完成邮箱验证后，临时足迹会转存到该账号。同一城市已有云端记录时以云端为准；转存失败会保留临时草稿，供你重试。</p><p>登录后新增或修改足迹会直接保存到云端，成功以页面“已保存到云端”提示为准。旧版本机足迹可在“我的存档”中手动导入，也可以导出 CSV 留存。</p>');
$('#coverage-btn').onclick=()=>showInfo(`<h2>地图数据与范围</h2><p>边界与坐标来自 <a href="https://datav.aliyun.com/portal/school/atlas/area_selector" target="_blank" rel="noopener">阿里云 DataV 地理数据</a>；台湾县市边界及来源见 <a href="assets/TAIWAN-DATA-SOURCES.md" target="_blank" rel="noopener">台湾县市数据说明</a>。地图数据已随应用打包。</p><p>当前包含 ${features.length} 个可标记地区：地级市、自治州、地区、盟及部分省直辖县级单位；直辖市、香港和澳门按整体标记。台湾细分为 22 个县市（含澎湖、金门、连江），每个县市可独立插旗、着色并记录初次到访日期。该计数是地图可标记地区数量，并非地级市行政数量。</p><p>地图用于个人旅行记录，行政边界以数据源版本为准。城市搜索支持完整名称、部分名称和省级地区名称。</p>`);
cloud=createShanheCloud({
  getLocalRecords:readLocalRecords,notify:toast,
  onRecords:next=>{records=next;renderAll();},
  onAccountChange:()=>{detailOperation++;setDetailBusy(false);selected=null;detailContext=null;detailBase={};legacyTaiwan.discard();document.querySelectorAll('#city-dialog,#city-picker').forEach(dialog=>{if(dialog.open)dialog.close();});},
  hasOpenEditor:()=>Boolean(document.querySelector('#city-dialog[open],#legacy-taiwan-dialog[open]'))
});
cloud.start();
async function init(){try{const [cr,pr,tr]=await Promise.all([fetch('assets/cities.json'),fetch('assets/provinces.json'),fetch('assets/taiwan-counties.json?v=1')]);if(!cr.ok||!pr.ok||!tr.ok)throw Error('地图资源暂不可用');const [cities,country,taiwan]=await Promise.all([cr.json(),pr.json(),tr.json()]);features=[...cities.features.filter(f=>String(f.properties.adcode)!=='710000'),...taiwan.features];if(taiwan.outline){country.features.find(f=>String(f.properties.adcode)==='710000').geometry=taiwan.outline;} provinces=country.features.filter(f=>/^\d{6}$/.test(String(f.properties.adcode)));provinces.sort((a,b)=>a.properties.name.localeCompare(b.properties.name,'zh-CN')).forEach(f=>{const o=document.createElement('option');o.value=f.properties.adcode;o.textContent=f.properties.name;$('#province-filter').append(o);});$('#total-badge').textContent=features.length+' 个地区';drawMap(country);renderAll();if(!storageAvailable)toast('本地记录暂不可用，请检查浏览器存储权限');}catch(e){$('#map-loading').textContent='地图加载失败，请刷新页面重试';$('#city-list').innerHTML='<div class="empty-results">地图资源加载失败<br>请刷新页面后重试</div>';console.error(e);}}
init();
