const $=s=>document.querySelector(s);
const icon=id=>'<svg aria-hidden="true"><use href="#i-'+id+'"/></svg>';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=ShanheRegions,STORAGE='shanhe-atlas-v1';
let records={},features=[],provinces=[],world=[],model,chinaIndex,countyIndex,worldIndex,migration,reversal,worldCities,cityMigration,prefectureMigration,usCities;
let selected=null,mode='flag',currentView='map',scope={kind:'world'},shapes=[],contextShapes=[];
let svg,layer,projection,zoom,cityShapes,markers,labels,cloud=null,mapHeight=740,cityPoints,cityPointLabels,countryLocators,southProjection,southMarkers;
let landmarkCatalog,landmarkStore,landmarkUI,landmarkMap,landmarkFocus=0;
let familyStore,familyUI,primaryCloud,primaryLandmarkStore,selectionVersion=0,primaryRecords={};
let detailContext=null,detailBase={},detailBusy=false,detailOperation=0,listLimit=60,mapRequest=0;
let citySearch=null,regionSelection=null,cityPointLayer,cityLabelLayer,citySpatial=null,cityMapPriority=new Set(),cityFocusId=null,mapCityVisited=new Set(),overlayFrame=0;
const geometryCache=new Map();
const visited=f=>records[R.id(f)]?.visited===true;
const allVisits=()=>model?R.recordsWithFeatures(records,model):[];
const visits=()=>allVisits().filter(f=>!f.properties.prefectureTarget);
const shortName=s=>String(s||'').replace(/(壮族|回族|维吾尔)?自治区$|特别行政区$|省$|市$/g,'');
const dateString=s=>s?s.replaceAll('-','.'):'初见日期待补充';
const phoneLayout=window.matchMedia('(max-width:850px)');
let mapTouchActive=false;
function readLocalRecords(){try{return JSON.parse(localStorage.getItem(STORAGE)||'{}');}catch{return {};}}
const activeMemberId=()=>familyUI?.activeId()||'self';
function closeRecordEditors(){detailOperation++;setDetailBusy(false);selected=null;detailContext=null;detailBase={};document.querySelectorAll('#city-dialog,#city-picker,#region-dialog').forEach(dialog=>{if(dialog.open)dialog.close();});landmarkUI?.closeEditor();}
function changeRecordMember(){selectionVersion++;closeRecordEditors();syncMemberRecords();}
function resetFamilyAccount(){selectionVersion++;closeRecordEditors();familyUI?.reset();syncMemberRecords();}
function syncMemberRecords(){familyUI?.render();records=cloud?.getState().records||primaryRecords;renderAll();landmarkUI?.render();}
function mapMemberEntries(kind){
  const s=familyStore?.getState(),visible=new Set(familyUI?.visibleIds()||['self']),primary=kind==='regions'?primaryCloud:primaryLandmarkStore,ps=primary?.getState();
  const sameAccount=s?.userId===ps?.userId;
  const members=sameAccount?s.document.members:[{id:'self',name:'我',color:'terracotta'}];
  return members.filter(m=>visible.has(m.id)&&(m.id==='self'||s.ready&&!s.guest)).map(m=>({member:{...m,hex:ShanheFamily.COLORS.find(c=>c.id===m.color).hex},records:m.id==='self'?(ps?.records||{}):s.document[kind][m.id]}));
}
function mapVisits(){return [...new Map(mapMemberEntries('regions').flatMap(entry=>R.recordsWithFeatures(entry.records,model)).map(f=>[R.id(f),f])).values()];}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function configurePhoneLayout(){
  const panel=$('#city-panel'),picker=$('#city-picker');
  if(phoneLayout.matches)picker.append(panel);else{if(picker.open)picker.close();$('#map-view').append(panel);}
  setMapTouch(false);if(model&&shapes.length)drawMap();else updateMapOverlays();
}
function setMapTouch(active){mapTouchActive=active;$('#map-stage').classList.toggle('touch-active',active);$('#map-touch-toggle').setAttribute('aria-pressed',String(active));$('#map-touch-toggle').textContent=active?'完成地图操作':'拖动地图';$('#mobile-map-hint').textContent=active?'单指拖动 · 双指缩放':'轻点地区探索 · 上下滑动浏览';}
$('#map-touch-toggle').onclick=()=>setMapTouch(!mapTouchActive);
$('#open-city-picker').onclick=()=>{$('#city-picker').showModal();$('#city-search').focus();};
$('#close-city-picker').onclick=()=>$('#city-picker').close();
$('#city-picker').addEventListener('click',e=>{if(e.target===$('#city-picker')){const r=e.target.getBoundingClientRect();if(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right)e.target.close();}});
phoneLayout.addEventListener('change',configurePhoneLayout);
configurePhoneLayout();
window.addEventListener('resize',()=>{clearTimeout(window.mapResize);window.mapResize=setTimeout(updateMapOverlays,100);});
async function persist(next,context){const result=await cloud.save(next,context);if(!result.ok&&result.code!=='STALE_REQUEST')toast(result.message);return result;}
const isWorldLegacy=f=>f?.properties.legacyKind==='world-region';
const isCountryLegacy=f=>f?.properties.legacyKind==='world-country';
function setDetailBusy(busy){detailBusy=busy;$('#city-form').querySelectorAll('button,input,textarea,select').forEach(el=>el.disabled=busy);}
function showSaveResult(result){$('#detail-save-status').textContent=result.ok?(result.guest?'已临时保存在此浏览器。':'已保存到云端。'):result.message;$('#detail-save-status').dataset.error=String(!result.ok);$('#detail-reload-cloud').hidden=result.ok||result.code!=='CONFLICT';$('#detail-reload-cloud').textContent=cloud.getState().guest?'读取最新临时足迹并重新编辑':'读取最新云端记录并重新编辑';}
function goView(view){if(view!=='map')landmarkFocus++;currentView=view;document.body.dataset.activeView=view;['map','cities','stats','landmarks','passport'].forEach(v=>{$('#'+v+'-view').hidden=v!==view;});document.querySelectorAll('.nav-item[data-view]').forEach(nav=>{const active=nav.dataset.view===(view==='cities'?'passport':view);nav.classList.toggle('active',active);nav.setAttribute('aria-current',active?'page':'false');});if(view==='cities')renderCollection();if(view==='stats')renderStats();if(['landmarks','passport'].includes(view))landmarkUI?.render();if(phoneLayout.matches){window.scrollTo({top:0,behavior:'instant'});setMapTouch(false);}if(view==='map')updateMapOverlays();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>goView(b.dataset.view));
function renderSummary(){
  const v=visits(),cn=v.filter(f=>R.countryOf(f)==='CHN'&&f.properties.level!=='legacy');
  const count=new Set(v.map(R.countryOf)).size;
  const progress=chinaIndex?cn.length/chinaIndex.features.length*100:0;
  $('#city-count').textContent=v.length;$('#province-count').textContent=count;
  $('#progress-count').textContent=Number(progress.toFixed(1));$('#progress-ring').style.background='conic-gradient(var(--green) '+progress+'%,#edf0e8 0)';
}
function renderList(){
  if(!model)return;
  const query=$('#city-search').value.trim(),country=$('#country-filter').value,province=$('#province-filter').value,status=$('#status-filter').value;
  let list=citySearch.query({query,country,province,status,visited});
  if(status!=='unvisited')list.push(...visits().filter(f=>f.properties.level==='legacy'&&R.matches(f,query,country,province)));
  const recommended=new Map(['110000','310000','330100','440100','tw-63000',...(model.citiesByRegion.get('world:JPN:JP-13')||[]).map(R.id),...(model.citiesByRegion.get('world:USA:US-CA')||[]).slice(0,4).map(R.id)].map((id,index)=>[id,index]));
  if(!query&&country==='all'&&status==='all')list=[...list.filter(f=>recommended.has(R.id(f))).sort((a,b)=>recommended.get(R.id(a))-recommended.get(R.id(b))),...list.filter(f=>!recommended.has(R.id(f)))];
  $('#list-heading').textContent=query?'搜索结果':country==='all'?'从这里开始':'探索地区';
  const landmarkRecords=landmarkStore?.getState().records||{};
  const places=query&&landmarkCatalog?landmarkCatalog.places.filter(p=>ShanheLandmarks.matches(p,query,country)&&(province==='all'||p.provinceCodes.includes(province)||p.regionIds.includes(province))&&(status==='all'||(status==='visited'?ShanheLandmarks.status(landmarkRecords,p.id)==='visited':ShanheLandmarks.status(landmarkRecords,p.id)!=='visited'))):[];
  const results=[...places.map(place=>({place})),...list.map(feature=>({feature}))];
  $('#result-count').textContent=results.length+' 个';
  const rows=results.slice(0,listLimit).map(({place,feature})=>{
    if(place){const state=ShanheLandmarks.status(landmarkRecords,place.id),done=state==='visited';return '<button class="city-row" data-landmark="'+esc(place.id)+'"><span class="city-row-icon '+(done?'done':'')+'">'+icon(done?'flag':'pin')+'</span><span><span class="city-row-name">'+esc(place.name)+' · 景点</span><span class="city-row-meta">'+esc(place.location||place.country)+' · '+(done?esc(dateString(landmarkRecords[place.id].date)):state==='wish'?'想去':'尚未到访')+'</span></span>'+icon(done?'check':'arrow')+'</button>';}
    const f=feature,p=f.properties,r=records[p.adcode];return '<button class="city-row" data-city="'+esc(p.adcode)+'"><span class="city-row-icon '+(visited(f)?'done':'')+'">'+icon(visited(f)?'flag':'pin')+'</span><span><span class="city-row-name">'+esc(R.displayName(f))+'</span><span class="city-row-meta">'+esc(R.trail(f))+(p.level==='legacy'?(p.mapExcluded?' · 已从地图移除，记录保留':isCountryLegacy(f)?' · 旧国家足迹保留':isWorldLegacy(f)?' · 旧省州足迹待整理':p.reversalTarget?' · 旧分区记录保留':' · 旧版待定位'):'')+(visited(f)?' · '+esc(dateString(r.date)):'')+'</span></span>'+icon(visited(f)?'check':'arrow')+'</button>';});
  $('#city-list').innerHTML=rows.length?rows.join('')+(results.length>listLimit?'<button class="list-more" id="list-more">显示更多结果（剩余 '+(results.length-listLimit)+'）</button>':''):'<div class="empty-results">没有找到这个地点<br>试试城市、景点、州省或国家名称</div>';
  $('#city-list').querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>openCity(b.dataset.city));
  $('#city-list').querySelectorAll('[data-landmark]').forEach(b=>b.onclick=()=>{if($('#city-picker').open)$('#city-picker').close();landmarkUI.open(b.dataset.landmark);});
  if($('#list-more'))$('#list-more').onclick=()=>{const scroller=$('#city-list'),top=scroller.scrollTop;listLimit+=60;renderList();scroller.scrollTop=top;};
}
function resetList(){listLimit=60;renderList();$('#city-list').scrollTop=0;}
['city-search','province-filter','status-filter'].forEach(id=>$('#'+id).addEventListener(id==='city-search'?'input':'change',resetList));
function configureProvinceFilter(country,selectedProvince='all'){
  const list=country==='CHN'?provinces:[...(model?.regionsById?.values()||[])].filter(f=>R.countryOf(f)===country);
  $('#province-filter').hidden=!list.length;
  $('#province-filter').innerHTML='<option value="all">全部省 / 州 / 区</option>'+list.map(f=>'<option value="'+esc(R.id(f))+'">'+esc(R.displayName(f))+'</option>').join('');
  $('#province-filter').value=selectedProvince;
}
$('#country-filter').onchange=()=>{configureProvinceFilter($('#country-filter').value);resetList();};
function openCity(id){
  if(detailBusy)return;
  if(!cloud?.canEdit()){toast('请先成功读取当前存档，再编辑足迹。');return;}
  selected=model.byId.get(String(id))||(records[id]?model.legacyById.get(String(id)):null)||visits().find(f=>R.id(f)===String(id));if(!selected)return;
  detailContext=cloud.context();detailBase=cloud.getState().records;
  const p=selected.properties,r=records[id]||{};
  $('#detail-save-status').textContent=cloud.getState().guest?'当前为临时足迹，保存在此浏览器。':'';
  $('#detail-save-status').dataset.error='false';$('#detail-reload-cloud').hidden=true;
  $('#detail-city').textContent=R.displayName(selected);$('#detail-province').textContent=R.trail(selected)+(p.levelNote?' · '+p.levelNote:'')+(p.level==='legacy'&&!p.reversalTarget&&!p.mapExcluded&&!isWorldLegacy(selected)&&!isCountryLegacy(selected)?' · 旧版足迹，尚未定位到当前地图':'');
  $('#detail-member').textContent='正在为 '+(cloud.getState().memberName||'我')+' 记录';
  const history=R.prefectureHistory(detailBase,id,model);
  $('#detail-county-history').hidden=!history.length;
  $('#detail-county-history-list').innerHTML=history.map(({feature,record})=>'<article><strong>'+esc(R.displayName(feature))+'</strong><p>首次到访：'+esc(record.date||'未填写')+'</p>'+(record.note?'<p class="county-history-note">'+esc(record.note)+'</p>':'')+'</article>').join('');
  $('#detail-show-map').hidden=p.level==='legacy'&&!isWorldLegacy(selected)&&!isCountryLegacy(selected);
  $('#legacy-city-choice').hidden=!isWorldLegacy(selected);
  $('#legacy-city-target').innerHTML='<option value="">保留这条旧记录</option>'+(model.citiesByRegion.get(String(id))||[]).map(f=>'<option value="'+esc(R.id(f))+'"'+(records[R.id(f)]?' disabled':'')+'>'+esc(R.displayName(f))+(records[R.id(f)]?'（已有足迹，内容保留）':'')+'</option>').join('');$('#detail-visited').checked=r.visited===true;$('#detail-date').value=r.date||'';$('#detail-note').value=r.note||'';$('#remove-visit').hidden=!r.visited;
  if($('#region-dialog').open)$('#region-dialog').close();
  if($('#city-picker').open)$('#city-picker').close();
  $('#city-dialog').showModal();$('#city-dialog').scrollTop=0;
}
$('#close-dialog').onclick=()=>$('#city-dialog').close();
$('#city-dialog').addEventListener('click',e=>{if(detailBusy)return;if(e.target===$('#city-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
async function saveCity(remove){
  if(!selected||detailBusy)return;
  const id=String(selected.properties.adcode),v=!remove&&$('#detail-visited').checked;
  let cityName=R.displayName(selected),next=structuredClone(detailBase);
  if(v){
    const date=$('#detail-date').value,rawNote=$('#detail-note').value,old=detailBase[id];
    next[id]=old&&old.date===date&&old.note.replace(/\r\n?/g,'\n')===rawNote?{...old}:{visited:true,date,note:rawNote.trim(),updatedAt:new Date().toISOString()};
    const target=isWorldLegacy(selected)?$('#legacy-city-target').value:'';
    if(target){try{next=R.moveLegacyRegionRecord(next,id,target,model);cityName=R.displayName(model.byId.get(target));}catch(error){showSaveResult({ok:false,message:error.message});return;}}
  }else delete next[id];
  const operation=++detailOperation;
  setDetailBusy(true);$('#detail-save-status').textContent=cloud.getState().guest?'正在临时保存…':'正在保存到云端…';
  try{const result=await persist(next,detailContext);if(operation!==detailOperation||result.code==='STALE_REQUEST')return;showSaveResult(result);if(result.ok){$('#city-dialog').close();toast(v?(result.guest?'已临时保存 '+cityName+' 的足迹':'已将 '+cityName+' 的足迹保存到云端'):'已将 '+cityName+' 标记为未去过'+(result.guest?'（已临时保存）':'（已保存到云端）'));}}
  finally{if(operation===detailOperation)setDetailBusy(false);}
}
$('#city-form').onsubmit=event=>{event.preventDefault();saveCity(false);};
$('#remove-visit').onclick=()=>saveCity(true);
$('#city-dialog').addEventListener('cancel',event=>{if(detailBusy)event.preventDefault();});
$('#detail-reload-cloud').onclick=async()=>{const id=selected?.properties.adcode;if(!id)return;const operation=++detailOperation;setDetailBusy(true);try{const result=await cloud.refresh();if(operation!==detailOperation)return;if(result.ok){setDetailBusy(false);openCity(id);}else showSaveResult(result);}finally{if(operation===detailOperation)setDetailBusy(false);}};

function setMode(m){mode=m;$('#flag-mode').classList.toggle('active',m==='flag');$('#fill-mode').classList.toggle('active',m==='fill');$('#flag-mode').setAttribute('aria-pressed',m==='flag');$('#fill-mode').setAttribute('aria-pressed',m==='fill');$('#map-stage').classList.toggle('fill-mode',m==='fill');renderMapState();}
$('#flag-mode').onclick=()=>setMode('flag');$('#fill-mode').onclick=()=>setMode('fill');
function scopeName(s=scope){return s.kind==='world'?'世界':s.kind==='china'?'中国':s.kind==='province'?provinces.find(f=>R.id(f)===s.code)?.properties.name:model.countries.get(s.code)?.name;}
function paintNavigation(){
  $('#map-heading').textContent=scopeName()+'旅行地图';
  $('#map-description').textContent=scope.kind==='world'?'选择国家继续探索，或搜索你的下一站':scope.kind==='china'?'全国直接按地市展示 · 点击城市记录，放大查看更多名称':scope.kind==='province'&&scope.code==='710000'?'选择台湾22个县市，记录第一次到访':scope.kind==='country'?(scope.code==='USA'?'全国城市与城镇 · 点州查找，放大查看更多地点':scope.code==='ARE'?'七个酋长国 · 点击首府城市记录足迹':model.countries.get(scope.code)?.detailPath?'保留省州边界 · 点击城市插旗，或点地块选城市':'保留国家轮廓 · 点击城市插旗，或点国土选城市'):'点击一个地区，记录第一次到访';
  $('#map-breadcrumb').innerHTML='<button data-scope="world">世界</button>'+(scope.kind==='china'||scope.kind==='province'?'<span>›</span><button data-scope="china">中国</button>':'')+(scope.kind==='province'||scope.kind==='country'?'<span>›</span><strong>'+esc(scopeName())+'</strong>':'');
  $('#map-breadcrumb').querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>navigate({kind:b.dataset.scope}));
  $('#world-shortcut').classList.toggle('active',scope.kind==='world');$('#china-shortcut').classList.toggle('active',scope.kind==='china'||scope.kind==='province');
  $('#china-map').setAttribute('aria-label',scopeName()+'旅行足迹交互地图');
  $('#map-focus-row').hidden=!['china','province','country'].includes(scope.kind);
  $('#map-focus-row label').textContent=scope.kind==='china'?'放大查看省份':'定位地区';
  $('#map-region-focus').innerHTML='<option value="">'+(scope.kind==='china'?'全国地市地图':'完整地图')+'</option>'+(scope.kind==='china'?provinces:shapes).map(f=>'<option value="'+esc(R.id(f))+'">'+esc(R.displayName(f))+'</option>').join('');
  $('#map-caption-text').textContent=scope.kind==='world'?'WORLD · MY TRAVEL FOOTPRINTS':scopeName()+' · MY TRAVEL FOOTPRINTS';
}
async function jsonFile(path){const response=await fetch(path+'?v=20261029-us-incorporated');if(!response.ok)throw Error('无法读取地图资源');return response.json();}
async function navigate(next){
  const request=++mapRequest;$('#map-loading').hidden=false;$('#map-loading').textContent='正在展开'+(next.kind==='world'?'世界':'地区')+'地图…';
  try{
    let geo;
    if(next.kind==='world')geo={features:world};
    else if(next.kind==='china'){
      const path='assets/geo/china-prefectures.geo.json';
      if(!geometryCache.has(path))geometryCache.set(path,await jsonFile(path));
      geo=geometryCache.get(path);
    }
    else{
      const path=next.kind==='province'?'assets/geo/china-prefectures/'+next.code+'.geo.json':model.countries.get(next.code)?.detailPath;
      if(path){
        if(!geometryCache.has(path))geometryCache.set(path,await jsonFile(path));
        geo=geometryCache.get(path);
      }else if(next.kind==='country'&&model.citiesByCountry.has(next.code)){
        geo={features:world.filter(f=>f.properties.countryCode===next.code)};
        if(!geo.features.length)throw Error('没有国家地图');
      }else throw Error('没有详细地图');
    }
    if(request!==mapRequest)return;
    scope=next;shapes=geo.features;contextShapes=geo.contextFeatures||[];cityFocusId=null;drawMap();paintNavigation();
    $('#country-filter').value=next.kind==='world'?'all':next.kind==='country'?next.code:'CHN';
    configureProvinceFilter($('#country-filter').value,next.kind==='province'?next.code:'all');
    $('#city-search').value='';$('#status-filter').value='all';resetList();setMapTouch(false);
  }catch(error){
    if(request!==mapRequest)return;
    $('#map-loading').innerHTML='<div>地图暂时没能加载<br><button id="retry-map" class="button secondary">重新加载</button><button id="cancel-map" class="button secondary">返回原地图</button></div>';
    $('#retry-map').onclick=()=>navigate(next);$('#cancel-map').onclick=()=>{$('#map-loading').hidden=true;};
    console.error(error);
  }
}
function openShape(f){
  const p=f.properties;
  if(scope.kind==='world'){
    if(R.countryOf(f)==='CHN')return navigate(['TWN','HKG','MAC'].includes(p.countryCode)?{kind:'province',code:String(p.provinceCode)}:{kind:'china'});
    if(model.countries.get(p.countryCode)?.detailPath||model.citiesByCountry.has(p.countryCode))return navigate({kind:'country',code:p.countryCode}).then(()=>{
      if(p.focusRegionId&&scope.kind==='country'&&scope.code===p.countryCode){$('#map-region-focus').value=p.focusRegionId;focusRegion(p.focusRegionId);}
    });
  }
  if(scope.kind==='china')return openCity(R.id(f));
  if(scope.kind==='country')return openWorldRegion(R.id(f));
  openCity(R.id(f));
}
function openWorldRegion(id){
  const region=model.regionsById.get(String(id))||model.countriesById.get(String(id));if(!region)return;
  const p=region.properties,isCountry=p.level==='country',cities=(isCountry?model.citiesByCountry.get(p.countryCode):model.citiesByRegion.get(String(id)))||[];
  $('#region-title').textContent=p.name;$('#region-country').textContent=isCountry?'按城市记录足迹':p.country;
  $('#region-intro').textContent=cities.length?'可选择 '+cities.length+' 个城市或城镇，分别记录到访时间与旅行记忆。':(p.countryCode==='USA'?'按本目录口径，这个州暂无可选的正式建制城市或城镇。':'这里暂没有可核实的常住城市，保留地块供查看。');
  regionSelection={id:String(id),country:p.countryCode,isCountry,cities,pageIndex:0};$('#region-search').value='';$('#region-search-field').hidden=cities.length<=60;renderRegionCities();
  const exception=isCountry?worldCities.countryCoverage?.find(x=>x.countryCode===p.countryCode&&x.exception):worldCities.exceptions?.find(x=>x.regionId===String(id));
  $('#region-note').textContent=exception?.reason||(p.countryCode==='USA'?'只收录正式建制城市与法定城镇，不包含统计居民点。可搜索英文地名；缩放地图会显示附近更多地点。':'城市包含行政中心与常见旅行目的地；缩放地图可查看城市名称。');
  $('#region-legacy').hidden=!records[id];$('#region-legacy').textContent=isCountry?'查看原国家足迹':'整理原省州足迹';$('#region-legacy').onclick=()=>openCity(id);
  $('#region-focus').textContent=cities.length?'在地图中查看这些城市 ↗':'查看这个地区的地图 ↗';
  $('#region-focus').onclick=()=>{$('#region-dialog').close();$('#map-region-focus').value=id;focusRegion(id);};
  $('#region-dialog').showModal();$('#region-dialog').scrollTop=0;
}
function renderRegionCities(){
  if(!regionSelection)return;
  const s=regionSelection,query=$('#region-search').value.trim(),matches=query?citySearch.query({query,country:s.country,province:s.isCountry?'all':s.id}):s.cities;
  const page=ShanheCityCatalog.page(matches,s.pageIndex,60);s.pageIndex=page.pageIndex;
  $('#region-cities').innerHTML=page.items.length?page.items.map(f=>'<button type="button" class="region-city" data-city="'+esc(R.id(f))+'"><span class="city-row-icon '+(visited(f)?'done':'')+'">'+icon(visited(f)?'flag':'pin')+'</span><span><strong>'+esc(R.displayName(f))+'</strong><small>'+esc(f.properties.catalogKind?((f.properties.county?f.properties.county+' · ':'')+(f.properties.catalogKind==='census-town'?'法定城镇':'建制城市 / 城镇')):(f.properties.nameEn||f.properties.localName||''))+(f.properties.capitalOf?.includes(s.id)?' · 首府':'')+(f.properties.tourism?' · 旅游城市':'')+(visited(f)?' · 已经去过':'')+'</small></span>'+icon('arrow')+'</button>').join(''):'<p class="empty-results">'+(s.country==='USA'&&!s.cities.length?'已有居民点足迹仍可在“足迹”中查看和编辑。':'没有找到这个地点，请试试英文地名。')+'</p>';
  $('#region-cities').querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>openCity(b.dataset.city));
  $('#region-pagination').hidden=page.pageCount<=1;$('#region-page-status').textContent='共 '+page.total+' 个地点 · 第 '+(page.pageIndex+1)+' / '+Math.max(1,page.pageCount)+' 页';
  $('#region-prev').disabled=page.pageIndex===0;$('#region-next').disabled=!page.hasMore;
}
$('#region-search').oninput=()=>{if(regionSelection){regionSelection.pageIndex=0;renderRegionCities();}};
for(const [id,delta] of [['region-prev',-1],['region-next',1]])$('#'+id).onclick=()=>{if(regionSelection){regionSelection.pageIndex+=delta;renderRegionCities();$('#region-dialog').scrollTop=0;$('#region-search').focus();}};
$('#close-region').onclick=()=>$('#region-dialog').close();
$('#region-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#world-shortcut').onclick=()=>navigate({kind:'world'});$('#china-shortcut').onclick=()=>navigate({kind:'china'});
$('#focus-taiwan').onclick=()=>navigate({kind:'province',code:'710000'});
window.ShanheAtlas={backMap:()=>{if(currentView!=='map'||scope.kind==='world')return false;navigate(scope.kind==='province'?{kind:'china'}:{kind:'world'});return true;}};
function focusRegion(id){const f=shapes.find(x=>R.id(x)===String(id));if(!f)return;const [[x0,y0],[x1,y1]]=d3.geoPath(projection).bounds(f),k=Math.max(1,Math.min(192,Math.min((phoneLayout.matches?720:800)/Math.max(1,x1-x0),(mapHeight-(phoneLayout.matches?400:250))/Math.max(1,y1-y0))));svg.transition().duration(300).call(zoom.transform,d3.zoomIdentity.translate(500-k*(x0+x1)/2,mapHeight/2-(phoneLayout.matches?90:0)-k*(y0+y1)/2).scale(k));}
$('#map-region-focus').onchange=()=>{const id=$('#map-region-focus').value;if(scope.kind==='china'&&id)return navigate({kind:'province',code:id});if(id)focusRegion(id);else svg.transition().duration(250).call(zoom.transform,d3.zoomIdentity);};
$('#detail-show-map').onclick=async()=>{const f=selected;if(!f)return;$('#city-dialog').close();goView('map');const country=R.countryOf(f),next=country==='CHN'?{kind:'province',code:String(f.properties.provinceCode)}:(f.properties.level==='city'||f.properties.level==='admin1'||isWorldLegacy(f)||isCountryLegacy(f))?{kind:'country',code:country}:{kind:'world'};const pending=navigate(next),request=mapRequest;await pending;if(request!==mapRequest||scope.kind!==next.kind||scope.code!==next.code)return;const region=f.properties.parentRegionId||R.id(f);$('#map-region-focus').value=region;if(country==='USA'&&f.properties.level==='city'){cityFocusId=R.id(f);const point=projection(f.properties.center),k=32;svg.transition().duration(300).call(zoom.transform,d3.zoomIdentity.translate(500-k*point[0],mapHeight/2-k*point[1]).scale(k));}else focusRegion(region);};
function localGeometry(f){
  // Center the projection on each country's longitude so date-line islands stay together.
  return f;
}
function drawMap(){
  southProjection=null;southMarkers=null;
  mapHeight=phoneLayout.matches?1000:740;svg=d3.select('#china-map').attr('viewBox','0 0 1000 '+mapHeight);svg.selectAll('*').remove();svg.on('.zoom',null);
  const geo={type:'FeatureCollection',features:[...shapes,...contextShapes].map(localGeometry)};
  const fitted=scope.kind==='china'?{type:'FeatureCollection',features:shapes.map(f=>{const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];return {...f,geometry:{type:'MultiPolygon',coordinates:polys.filter(p=>p[0].some(c=>c[1]>=17.5))}};})}:geo;
  if(scope.kind==='world')projection=d3.geoEqualEarth().fitExtent([[22,90],[978,mapHeight-100]],{type:'Sphere'});
  else{
    const center=scope.kind==='country'?model.countries.get(scope.code)?.center:scope.kind==='china'?[104,35]:provinces.find(f=>R.id(f)===scope.code)?.properties.center;
    projection=d3.geoMercator().rotate([-(center?.[0]||104),0]).fitExtent([[45,65],[955,mapHeight-110]],fitted);
  }
  const path=d3.geoPath(projection),colors=['#e2e9d7','#e5eadb','#dce6d2','#e6ebdc','#dfe7d2','#e9ecdf'];
  layer=svg.append('g');
  if(scope.kind==='world')layer.append('path').datum({type:'Sphere'}).attr('d',path).attr('fill','#edf4ef').attr('stroke','#dbe6dc').attr('stroke-width',1);
  // Preserve source reference areas without turning them into visitable regions.
  layer.append('g').attr('class','map-context-layer').attr('aria-hidden','true').attr('pointer-events','none').selectAll('path').data(contextShapes).join('path').attr('d',path).attr('fill','#e8e7e2').attr('stroke','#b8bab2').attr('stroke-width',.65).attr('vector-effect','non-scaling-stroke');
  const mainShapes=shapes.filter(f=>scope.kind!=='china'||R.id(f)!=='460300');
  cityShapes=layer.append('g').selectAll('path').data(mainShapes).join('path').attr('d',path).attr('class','city-shape').attr('fill',(f,i)=>colors[i%colors.length]).attr('tabindex',0).attr('role','button').attr('aria-label',f=>R.displayName(f)+'，'+(scope.kind==='world'?'探索地区':scope.kind==='country'?'选择城市':'记录足迹')).on('click',(e,f)=>{openShape(f);$('#map-tooltip').hidden=true;}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openShape(f);}}).on('pointermove',(e,f)=>{if(e.pointerType==='touch')return;const r=$('#map-stage').getBoundingClientRect(),t=$('#map-tooltip');t.textContent=R.displayName(f)+(d3.select(e.currentTarget).classed('visited')?' · 已经去过':'');t.hidden=false;t.style.left=Math.min(e.clientX-r.left+14,r.width-180)+'px';t.style.top=Math.max(12,e.clientY-r.top-35)+'px';}).on('pointerleave',()=>$('#map-tooltip').hidden=true);
  // Mauritius is only a few pixels wide in the world overview. Keep its real
  // coastline, with a separate, screen-sized target for mouse and touch input.
  const locatorCountries=scope.kind==='world'?mainShapes.filter(f=>f.properties.countryCode==='MUS'):[];
  const locatorIds=new Set(locatorCountries.map(R.id));
  countryLocators=layer.append('g').selectAll('g').data(locatorCountries).join('g').attr('class','country-locator').attr('tabindex',0).attr('role','button').attr('aria-label',f=>R.displayName(f)+'，记录足迹').on('click',(e,f)=>{e.stopPropagation();openShape(f);}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openShape(f);}});
  // Put the roomy target east/south of the island; a centered target would
  // intercept Madagascar and Reunion at phone overview scale.
  countryLocators.append('rect').attr('class','country-locator-hit').attr('x',8).attr('y',0).attr('width',68).attr('height',44).attr('rx',8);
  countryLocators.append('circle').attr('class','country-locator-dot').attr('r',4);
  countryLocators.append('text').attr('class','country-locator-label').attr('x',10).attr('y',15).text(f=>R.displayName(f));
  labels=layer.append('g').attr('pointer-events','none').selectAll('text').data(mainShapes.filter(f=>Array.isArray(f.properties.center)&&!locatorIds.has(R.id(f)))).join('text').attr('class','city-label').attr('x',f=>projection(f.properties.center)[0]).attr('y',f=>projection(f.properties.center)[1]).text(f=>scope.kind==='world'?shortName(f.properties.name):R.displayName(f));
  const countryCities=scope.kind==='country'?(model.citiesByCountry.get(scope.code)||[]):[];
  citySpatial=ShanheCityCatalog.createSpatial(countryCities,projection);cityMapPriority=new Set(countryCities.filter(f=>!f.properties.catalogKind).map(R.id));
  cityPointLayer=layer.append('g').attr('class','world-city-points');cityLabelLayer=layer.append('g').attr('class','world-city-labels').attr('pointer-events','none');cityPoints=null;cityPointLabels=null;
  markers=layer.append('g');
  landmarkMap?.mount(layer);
  if(scope.kind==='china'){drawSouthInset(svg);cityShapes=svg.selectAll('.city-shape');}
  zoom=d3.zoom().scaleExtent([1,192]).clickDistance(8).tapDistance(12).filter(e=>{if(e.type.startsWith('touch')&&phoneLayout.matches&&!mapTouchActive)return false;return(!e.ctrlKey||e.type==='wheel')&&!e.button;}).translateExtent([[-300,-200],[1300,mapHeight+200]]).on('zoom',e=>{layer.attr('transform',e.transform);scheduleMapOverlays();$('#map-tooltip').hidden=true;});
  svg.call(zoom).on('dblclick.zoom',null).call(zoom.transform,d3.zoomIdentity);
  $('#zoom-in').onclick=()=>svg.transition().duration(200).call(zoom.scaleBy,1.6);
  $('#zoom-out').onclick=()=>svg.transition().duration(200).call(zoom.scaleBy,1/1.6);
  $('#zoom-reset').onclick=()=>svg.transition().duration(250).call(zoom.transform,d3.zoomIdentity);
  $('#map-loading').hidden=true;renderMapState();
}
function drawSouthInset(root){
 const h=mapHeight,south={type:'FeatureCollection',features:shapes.filter(f=>R.id(f)==='460300')};
 southProjection=d3.geoMercator().fitExtent([[85,h-285],[235,h-165]],south);
 const inset=root.append('g').attr('class','south-inset');
 inset.append('rect').attr('x',70).attr('y',h-300).attr('width',180).attr('height',200).attr('rx',4).attr('fill','#f5f8f2').attr('stroke','#c9d5be').attr('pointer-events','none');
 inset.selectAll('path').data(south.features).join('path').attr('class','city-shape').attr('d',d3.geoPath(southProjection)).attr('fill','#dae4cd').style('stroke','#91a47c').style('stroke-width','1').attr('tabindex',0).attr('role','button').attr('aria-label','三沙市，记录足迹').on('click',(e,f)=>{e.stopPropagation();openCity(R.id(f));}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCity(R.id(f));}});
 inset.append('text').attr('class','south-caption').attr('x',160).attr('y',h-135).attr('text-anchor','middle').attr('fill','#637657').attr('pointer-events','none').text('三沙市');
 inset.append('text').attr('class','south-caption').attr('x',160).attr('y',h-107).attr('text-anchor','middle').attr('fill','#637657').attr('pointer-events','none').text('南海诸岛');
 southMarkers=inset.append('g');
}
function renderMapState(){
  if(!cityShapes||!model)return;
  const v=mapVisits(),groups=ShanheFamilyMap.regionMarkers(mapMemberEntries('regions'),scope,world,provinces,model,R),ids=new Set(v.map(R.id));
  mapCityVisited=ids;
  const counts=new Map(groups.map(f=>[R.id(f),f.count]));
  cityShapes.classed('visited',f=>scope.kind==='world'?R.worldVisited(f,v):scope.kind==='china'?counts.has(R.id(f)):scope.kind==='country'?R.regionVisited(f,v):ids.has(R.id(f)));
  cityPoints?.classed('visited',f=>ids.has(R.id(f)));
  countryLocators?.classed('visited',f=>R.worldVisited(f,v));
  markers.selectAll('*').remove();
  southMarkers?.selectAll('*').remove();
  if(mode==='flag'){
    const paintFlags=(parent,data)=>{
    const flags=parent.selectAll('g').data(data).join('g').attr('class',f=>'city-marker'+(f.target==='legacy-region'?' legacy-region-marker':'')).attr('role','button').attr('tabindex',0).attr('aria-label',f=>f.member.name+'，'+R.displayName(f)+(f.target==='legacy-region'?'，旧省州足迹待整理':'，'+f.count+'处足迹')+'，查看当前记录人的足迹').on('click',(e,f)=>{e.stopPropagation();openRegionFlag(f);}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openRegionFlag(f);}});
    flags.append('rect').attr('x',-10).attr('y',-35).attr('width',44).attr('height',44).attr('fill','transparent');
    flags.append('ellipse').attr('cx',0).attr('cy',2).attr('rx',5).attr('ry',2).attr('fill','#9cae8270');
    flags.append('path').attr('d','M0,1 V-26').attr('stroke','#7c6246').attr('stroke-width',1.7);
    flags.append('path').attr('d','M1,-26 C8,-31 14,-20 23,-26 L23,-13 C14,-7 8,-19 1,-13 Z').attr('fill',f=>f.member.hex).attr('stroke','#fff9ed').attr('stroke-width',.8);
    flags.filter(f=>f.target!=='record'&&f.target!=='legacy-region').append('text').attr('x',12).attr('y',-17).attr('fill','white').attr('text-anchor','middle').attr('font-size',9).attr('font-weight',700).text(f=>f.count);
    };
    paintFlags(markers,groups.filter(f=>!southMarkers||R.id(f)!=='460300'));
    if(southMarkers)paintFlags(southMarkers,groups.filter(f=>R.id(f)==='460300'));
  }
  renderLandmarkMap();updateMapOverlays();
}
// Coloured flags show who visited; editing always follows the member explicitly
// selected above the map, including when a flag overlaps a city's hit target.
function openRegionFlag(f){if(f.target==='record'||f.target==='legacy-region')openCity(R.id(f));else openShape(f);}
function openLandmarkFromMap(id){landmarkUI.open(id);}
function renderLandmarkMap(){if(svg&&projection)landmarkMap?.render({scope,projection,mapHeight,width:svg.node().getBoundingClientRect().width,transform:d3.zoomTransform(svg.node())});}
async function focusLandmark(place){
  goView('map');const focusRequest=++landmarkFocus;landmarkMap.show();
  const next=place.countryCode==='CHN'&&place.provinceCodes?.length?{kind:'province',code:place.provinceCodes[0]}:model.countries.get(place.countryCode)?.detailPath||model.citiesByCountry.has(place.countryCode)?{kind:'country',code:place.countryCode}:{kind:'world'};
  const pending=navigate(next),request=mapRequest;await pending;
  if(focusRequest!==landmarkFocus||request!==mapRequest||currentView!=='map'||scope.kind!==next.kind||scope.code!==next.code)return;
  landmarkMap.focus(place.id);
  const point=projection(place.coordinates),k=next.kind==='world'?8:next.kind==='country'?5:3;
  svg.transition().duration(300).call(zoom.transform,d3.zoomIdentity.translate(500-k*point[0],mapHeight/2-k*point[1]).scale(k));
  $('#map-stage').scrollIntoView({behavior:'smooth',block:'center'});
}
function scheduleMapOverlays(){if(!overlayFrame)overlayFrame=requestAnimationFrame(()=>{overlayFrame=0;updateMapOverlays();});}
function refreshCityPoints(transform,width){
  if(!citySpatial||!cityPointLayer)return;
  const visibleCities=citySpatial.select({transform,width,mapHeight,limit:phoneLayout.matches?100:250,priorityIds:cityMapPriority,focusId:cityFocusId});
  cityPoints=cityPointLayer.selectAll('g').data(visibleCities,R.id).join(enter=>{const g=enter.append('g').attr('class','world-city-point').attr('tabindex',0).attr('role','button').attr('aria-label',f=>R.displayName(f)+'，记录城市足迹').on('click',(e,f)=>{e.stopPropagation();openCity(R.id(f));}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCity(R.id(f));}});g.append('circle').attr('class','city-point-hit').attr('r',18);g.append('circle').attr('class','city-point-dot').attr('r',4);return g;}).classed('visited',f=>mapCityVisited.has(R.id(f))).classed('focused',f=>R.id(f)===cityFocusId);
  cityPointLabels=cityLabelLayer.selectAll('text').data(visibleCities,R.id).join('text').attr('class','world-city-label').attr('x',f=>projection(f.properties.center)[0]).attr('y',f=>projection(f.properties.center)[1]).text(f=>R.displayName(f));
}
function updateMapOverlays(){
  if(!svg||!markers||!labels||!projection)return;
  const width=svg.node().getBoundingClientRect().width;if(!width)return;
  const transform=d3.zoomTransform(svg.node()),k=transform.k,phone=phoneLayout.matches,scale=phone?Math.max(1,720/width):1,font=(phone?11:10)*1000/width,occupied=[];
  refreshCityPoints(transform,width);
  countryLocators?.attr('transform',f=>'translate('+projection(f.properties.center)+') scale('+(1000/width)/k+')').each(function(f){
    const p=projection(f.properties.center),x=p[0]*k+transform.x,y=p[1]*k+transform.y,unit=1000/width;
    // Reserve room for this small island's persistent label before other labels.
    occupied.push([x+7*unit,y+2*unit,x+(12+R.displayName(f).length*12)*unit,y+19*unit]);
  });
  landmarkMap?.update({scope,projection,mapHeight,width,transform});
  const flagScale=scope.kind==='china'?Math.min(1,.72+.2*(k-1)):1;
  markers.selectAll('g').attr('transform',f=>'translate('+projection(f.properties.center)+') scale('+(1000/width)*flagScale/k+') translate('+((f.flagOffset||0)-11)+',0)');
  southMarkers?.selectAll('g').attr('transform',f=>'translate('+southProjection(f.properties.center)+') scale('+(1000/width)+') translate('+((f.flagOffset||0)-11)+',0)');
  svg.selectAll('.south-caption').style('font-size',(phone?8:10)*1000/width+'px');
  cityPoints?.attr('transform',f=>'translate('+projection(f.properties.center)+') scale('+(1000/width)/k+')');
  cityPointLabels?.style('font-size',(phone?12:11)*1000/width/k+'px').style('stroke-width',3*1000/width/k+'px').each(function(f){
    const l=d3.select(this),p=projection(f.properties.center),x=p[0]*k+transform.x,y=p[1]*k+transform.y,unit=1000/width,w=R.displayName(f).length*(phone?12:11)*unit,h=14*unit;
    const box=[x+8*unit,y-h,x+w+10*unit,y+4*unit],hidden=x<0||x>1000||y<25||y>mapHeight-30||occupied.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]);
    l.style('display',hidden?'none':null).attr('text-anchor','start').attr('dx',8*unit/k).attr('dy',-5*unit/k);if(!hidden)occupied.push(box);
  });
  labels.style('font-size',font/k+'px').style('stroke-width',3/k+'px').each(function(f){
    const l=d3.select(this),p=projection(f.properties.center),x=p[0]*k+transform.x,y=p[1]*k+transform.y,w=R.displayName(f).length*font,h=font;
    const box=[x-w/2-3,y-h-4,x+w/2+3,y+4];
    const small=scope.kind==='world'&&phone&&k<1.8&&!['CHN','USA','RUS','BRA','AUS','IND','CAN','ZAF'].includes(f.properties.countryCode);
    const hidden=small||x<0||x>1000||y<20||y>mapHeight-30||occupied.length>90||occupied.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]);
    l.style('display',hidden?'none':null).attr('text-anchor','middle').attr('dy',-4/k);if(!hidden)occupied.push(box);
  });
}
function renderCollection(){
  const list=allVisits().sort((a,b)=>(records[R.id(b)].updatedAt||'').localeCompare(records[R.id(a)].updatedAt||''));
  $('#visited-grid').innerHTML=list.length?list.map(f=>{const p=f.properties,r=records[p.adcode];return '<button class="visited-city" data-city="'+esc(p.adcode)+'">'+icon('flag')+'<h3>'+esc(R.displayName(f))+'</h3><p>'+esc(R.trail(f))+'</p>'+(p.level==='legacy'?'<p class="legacy-badge">'+(p.prefectureTarget?'旧县区记录 · 不重复计数':p.mapExcluded?'已从地图移除 · 内容完整保留':isCountryLegacy(f)?'旧国家足迹 · 内容完整保留':isWorldLegacy(f)?'旧省州足迹 · 内容完整保留':p.reversalTarget?'旧分区记录 · 内容完整保留':'旧版足迹 · 待定位')+'</p>':'')+'<p>初次到访 · '+esc(dateString(r.date))+'</p>'+(r.note?'<p class="memory">'+esc(r.note)+'</p>':'')+'</button>';}).join(''):'<div class="empty-collection">'+icon('map')+'<h3>你的旅行故事，正要开始。</h3><p>找到去过的地方，插上第一面小旗。</p><button class="button primary" id="start-exploring">去地图记录足迹 '+icon('arrow')+'</button></div>';
  $('#visited-grid').querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>openCity(b.dataset.city));if($('#start-exploring'))$('#start-exploring').onclick=()=>goView('map');
}
function renderStats(){
  const v=visits(),key=f=>R.countryOf(f)==='CHN'?f.properties.province:f.properties.country,groups=d3.group(v,key);
  $('#province-stats').innerHTML=groups.size?[...groups].sort((a,b)=>b[1].length-a[1].length).map(([name,fs])=>{const total=features.filter(f=>key(f)===name).length,current=fs.filter(f=>model.byId.has(R.id(f))).length,legacy=fs.length-current;return '<div class="bar-row"><div class="bar-label"><span>'+esc(name||'旧版足迹')+'</span><span>'+current+(total?' / '+total:'')+' 个地区'+(legacy?' · 另有 '+legacy+' 条旧足迹':'')+'</span></div><div class="bar-track"><i style="width:'+Math.min(100,current/(total||current||1)*100)+'%"></i></div></div>';}).join(''):'<p class="empty-results">插下第一面旗后，这里会展示探索进度。</p>';
  $('#timeline').innerHTML=v.length?[...v].sort((a,b)=>(records[R.id(a)].date||'9999').localeCompare(records[R.id(b)].date||'9999')).map(f=>{const r=records[R.id(f)];return '<div class="timeline-item"><small>'+esc(dateString(r.date))+'</small><h4>'+esc(R.displayName(f))+'</h4><p>'+esc(R.trail(f))+'</p>'+(r.note?'<p>'+esc(r.note)+'</p>':'')+'</div>';}).join(''):'<p class="empty-results">记录首次到访日期，串起你的旅行时间线。</p>';
}
function renderAll(){renderSummary();renderList();renderMapState();if(currentView==='cities')renderCollection();if(currentView==='stats')renderStats();}
$('#export-btn').onclick=()=>{
  const list=allVisits();if(!list.length){toast('先记录一段足迹，再来导出吧');return;}
  const quote=v=>'"'+String(v??'').replace(/^[=+@\t\r-]/,"'$&").replaceAll('"','""')+'"';
  const csv='\ufeff'+[['地区','国家/地区','省级地区','地市','首次到访日期','旅行记忆','地区编号'],...list.map(f=>{const p=f.properties,r=records[p.adcode];return[R.displayName(f),p.country,p.province,p.city,r.date,r.note,p.adcode];})].map(row=>row.map(quote).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='山河足迹-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('足迹已导出');
};
function showInfo(html){$('#info-body').innerHTML=html;$('#info-dialog').showModal();}
$('#close-info').onclick=()=>$('#info-dialog').close();
$('#help-btn').onclick=()=>showInfo('<h2>从一面小旗开始</h2><p>家庭旅行：登录后在页面顶部管理成员，一个邮箱最多记录 4 人。选择当前记录人为他单独保存；勾选地图显示成员，可同时查看不同颜色的旗子。共同到访的地点并排显示，取消一个人的到访不会影响其他成员。原有记录归在“我”名下。</p><p>① 无需注册，先选择国家或中国省份，进入详细地图；也可以直接搜索城市或州省名称。</p><p>② 海外地图支持按城市记录。已有省州细分的国家保留省州地块；新增覆盖的欧洲国家保留国界。点击城市圆点，或点击地块选择城市；填写首次到访日期和旅行记忆，保存足迹。总览上的数字小旗表示该区域的足迹数量。</p><p>③ 足迹临时保存在此浏览器。想长期保存或换设备继续时，点击“保存到云端”，用邮箱注册或登录；注册需两次输入相同密码并验证邮箱。</p><p>登录后的修改直接保存到云端，以成功提示为准。本机与云端同一地区内容不同的草稿会保留，避免覆盖。你也可以导出 CSV 留存。</p><p>大陆（含海南）改回地市级。旧县区足迹归到所属地市；地市已有记录时保留它，没有记录时取日期最早的一条完整记录。其他县区日期和笔记留在城市详情的历史记录里，不重复插旗或计数。取消城市到访后，历史记录不会重新生成旗子。台湾恢复22县市，港澳整体标记。海外旧省州足迹按已核实的首府归档，日期、笔记与更新时间原样保留；目标已有记录或首府无法唯一确定时，旧记录完整保留供整理。新增欧洲城市后，原有国家级足迹仍按原名保留，不自动改成某个城市。旧分区足迹回到所属县市，日期与笔记保持不变；同一县市有多条记录时，其余内容单独保留在“我的足迹”中。</p>');
$('#coverage-btn').onclick=()=>showInfo('<h2>地图数据与范围</h2><p>中国共 '+chinaIndex.features.length+' 个可标记地区，大陆（含海南）按地市、自治州、地区及盟等单位标记，四个直辖市各为一个城市；没有上级地市的省直辖单位沿用独立记录。台湾保持22个县市，香港、澳门各为整体。</p><p>世界总览包含 '+worldIndex.countries.length+' 个国家和地区边界要素，其中 '+worldIndex.detailCountries.length+' 个旅行目的地保留州省边界，并按其中的城市或主要居民点记录足迹。每个区域提供代表城市，热门旅行省州补充更多旅游城市；无人离岛不虚构城市，新加坡共用同一个城市记录。欧洲各国及跨洲旅行目的地至少提供5个真实城市或城镇，摩纳哥、梵蒂冈等单城单位保留一个；新增覆盖国家保留原国界并添加城市点。其余国家和地区可整体标记。</p><p>美国城市目录采用50州及华盛顿特区的数据，只收录正式建制城市与法定城镇，不包含统计居民点；夏威夷州在此口径下暂无可选地点，已有居民点足迹作为历史记录保留。来源口径、版本及数量见 <a href="assets/geo/us-cities-sources.md" target="_blank" rel="noopener">美国城市目录说明</a>。未有核实中文名的地点使用官方英文名称。同名地点按州区分，必要时附县名。</p><p>Natural Earth · U.S. Census Bureau · © OpenStreetMap contributors。新加坡保留社区发展理事会辖区，新西兰含部分岛屿；具体范围、版本、许可证与开放数据下载见 <a href="assets/geo/world-data-sources.md" target="_blank" rel="noopener">世界地图数据说明</a>、<a href="assets/geo/world-cities-sources.md" target="_blank" rel="noopener">海外城市与来源</a>、<a href="assets/geo/china-data-sources.md" target="_blank" rel="noopener">中国地图数据说明</a>。</p><p>边界以各数据源所载版本为准，用于个人旅行记录。旧记录迁移依据见 <a href="assets/geo/china-prefecture-migration-map.json" target="_blank" rel="noopener">县区归市对应关系</a>。</p>');
async function init(){
  try{
    [chinaIndex,worldIndex,migration,reversal,worldCities,cityMigration,countyIndex,prefectureMigration,usCities]=await Promise.all([jsonFile('assets/geo/china-prefecture-index.json'),jsonFile('assets/geo/world-index.json'),jsonFile('assets/geo/county-migration-map.json'),jsonFile('assets/geo/region-level-reversal-map.json'),jsonFile('assets/geo/world-cities.json'),jsonFile('assets/geo/world-city-migration-map.json'),jsonFile('assets/geo/china-index.json'),jsonFile('assets/geo/china-prefecture-migration-map.json'),jsonFile('assets/geo/us-cities.json')]);
    worldCities=R.withCitySupplement(worldCities,usCities,worldIndex);
    migration={version:1,mappings:{...migration.mappings,...reversal.mappings}};
    const [wg,pg,cg,tg,franceParts]=await Promise.all([jsonFile('assets/geo/world.geo.json'),jsonFile('assets/provinces.json'),jsonFile('assets/cities.json'),jsonFile('assets/taiwan-counties.json'),jsonFile('assets/geo/world-france-parts.geo.json')]);
    world=wg.features.flatMap(f=>R.id(f)==='world:FRA'?franceParts.features:[f]);provinces=pg.features.filter(f=>/^\d{6}$/.test(String(f.properties.adcode)));
    if(tg.outline)provinces.find(f=>R.id(f)==='710000').geometry=tg.outline;
    model=R.catalog(chinaIndex,worldIndex,[...cg.features,...tg.features,...countyIndex.features],reversal,worldCities,prefectureMigration);features=model.features;citySearch=ShanheCityCatalog.createSearch(features,R);
    const countries=worldIndex.countries.filter(p=>!['TWN','HKG','MAC'].includes(p.countryCode)).sort((a,b)=>(a.countryCode==='CHN'?-1:b.countryCode==='CHN'?1:a.name.localeCompare(b.name,'zh-CN')));
    $('#country-filter').innerHTML='<option value="all">全部国家和地区</option>'+countries.map(p=>'<option value="'+p.countryCode+'">'+esc(p.name)+'</option>').join('');
    $('#province-filter').innerHTML='<option value="all">全部省份</option>'+provinces.map(f=>'<option value="'+R.id(f)+'">'+esc(R.displayName(f))+'</option>').join('');
    $('#total-badge').textContent=features.length+' 个地区';
    landmarkCatalog=ShanheLandmarks.catalog(SHANHE_LANDMARK_CATALOG);
    const hasOpenEditor=()=>Boolean(document.querySelector('#city-dialog[open]'))||Boolean(landmarkUI?.hasOpenEditor())||Boolean(familyUI?.hasOpenEditor());
    familyStore=createFamilyStore({onChange:syncMemberRecords,onAccountChange:resetFamilyAccount,hasOpenEditor});
    primaryLandmarkStore=createLandmarkStore({onChange:()=>{landmarkUI?.render();renderList();renderLandmarkMap();},onAccountChange:()=>landmarkUI?.closeEditor(),hasOpenEditor});
    familyUI=createFamilyUI({store:familyStore,onActiveChange:changeRecordMember,onVisibilityChange:renderMapState,onAuth:()=>$('#cloud-account-btn').click(),notify:toast});
    landmarkStore=createFamilyArchiveAdapter({kind:'landmarks',primary:primaryLandmarkStore,family:familyStore,getMemberId:activeMemberId,getSelectionVersion:()=>selectionVersion});
    landmarkUI=createLandmarkUI({catalog:landmarkCatalog,store:landmarkStore,onMap:focusLandmark,onAuth:()=>$('#cloud-account-btn').click(),notify:toast,onViewChange:goView,countries:model.countries});
    landmarkMap=createLandmarkMap({catalog:landmarkCatalog,store:landmarkStore,getMembers:()=>mapMemberEntries('landmarks'),open:openLandmarkFromMap});
    primaryCloud=createShanheCloud({
      getLocalRecords:readLocalRecords,notify:toast,regionMigration:migration,cityMigration,prefectureMigration,
      companion:{start:client=>Promise.all([primaryLandmarkStore.start(client),familyStore.start(client)]),rememberIntent:email=>primaryLandmarkStore.rememberIntent(email)},
      onRecords:next=>{primaryRecords=next;syncMemberRecords();},
      onAccountChange:resetFamilyAccount,hasOpenEditor
    });
    cloud=createFamilyArchiveAdapter({kind:'regions',primary:primaryCloud,family:familyStore,getMemberId:activeMemberId,getSelectionVersion:()=>selectionVersion});
    primaryCloud.start();await navigate({kind:'world'});renderAll();
  }catch(error){
    $('#map-loading').textContent='地图加载失败，请刷新页面重试';$('#city-list').innerHTML='<div class="empty-results">地图资源未能加载，请刷新重试</div>';console.error(error);
  }
}
init();

