const $=s=>document.querySelector(s);
const icon=id=>'<svg aria-hidden="true"><use href="#i-'+id+'"/></svg>';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=ShanheRegions,STORAGE='shanhe-atlas-v1';
let records={},features=[],provinces=[],world=[],model,chinaIndex,worldIndex,migration;
let selected=null,mode='flag',currentView='map',scope={kind:'world'},shapes=[];
let svg,layer,projection,zoom,cityShapes,markers,labels,cloud=null,mapHeight=740;
let detailContext=null,detailBase={},detailBusy=false,detailOperation=0,listLimit=60,mapRequest=0;
const geometryCache=new Map();
const visited=f=>records[R.id(f)]?.visited===true;
const visits=()=>model?R.recordsWithFeatures(records,model):[];
const shortName=s=>String(s||'').replace(/(壮族|回族|维吾尔)?自治区$|特别行政区$|省$|市$/g,'');
const dateString=s=>s?s.replaceAll('-','.'):'初见日期待补充';
const phoneLayout=window.matchMedia('(max-width:850px)');
let mapTouchActive=false;
function readLocalRecords(){try{return JSON.parse(localStorage.getItem(STORAGE)||'{}');}catch{return {};}}
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
function setDetailBusy(busy){detailBusy=busy;$('#city-form').querySelectorAll('button,input,textarea').forEach(el=>el.disabled=busy);}
function showSaveResult(result){$('#detail-save-status').textContent=result.ok?(result.guest?'已临时保存在此浏览器。':'已保存到云端。'):result.message;$('#detail-save-status').dataset.error=String(!result.ok);$('#detail-reload-cloud').hidden=result.ok||result.code!=='CONFLICT';$('#detail-reload-cloud').textContent=cloud.getState().guest?'读取最新临时足迹并重新编辑':'读取最新云端记录并重新编辑';}
function goView(view){currentView=view;document.body.dataset.activeView=view;['map','cities','stats'].forEach(v=>{$('#'+v+'-view').hidden=v!==view;const nav=document.querySelector('[data-view="'+v+'"]');nav.classList.toggle('active',v===view);nav.setAttribute('aria-current',v===view?'page':'false');});if(view==='cities')renderCollection();if(view==='stats')renderStats();if(phoneLayout.matches){window.scrollTo({top:0,behavior:'instant'});setMapTouch(false);}if(view==='map')updateMapOverlays();}
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
  let list=features.filter(f=>R.matches(f,query,country,province)&&(status==='all'||(status==='visited'?visited(f):!visited(f))));
  if(status==='visited')list.push(...visits().filter(f=>f.properties.level==='legacy'&&R.matches(f,query,country,province)));
  const recommended=['110112','310101','330106','440106','tw-63000030','world:JPN:JP-13','world:USA:US-CA'];
  if(!query&&country==='all'&&status==='all')list.sort((a,b)=>(recommended.indexOf(R.id(a))<0?999:recommended.indexOf(R.id(a)))-(recommended.indexOf(R.id(b))<0?999:recommended.indexOf(R.id(b))));
  $('#list-heading').textContent=query?'搜索结果':country==='all'?'从这里开始':'探索地区';
  $('#result-count').textContent=list.length+' 个';
  const rows=list.slice(0,listLimit).map(f=>{const p=f.properties,r=records[p.adcode];return '<button class="city-row" data-city="'+esc(p.adcode)+'"><span class="city-row-icon '+(visited(f)?'done':'')+'">'+icon(visited(f)?'flag':'pin')+'</span><span><span class="city-row-name">'+esc(p.name)+'</span><span class="city-row-meta">'+esc(R.trail(f))+(p.level==='legacy'?' · 旧版待定位':'')+(visited(f)?' · '+esc(dateString(r.date)):'')+'</span></span>'+icon(visited(f)?'check':'arrow')+'</button>';});
  $('#city-list').innerHTML=rows.length?rows.join('')+(list.length>listLimit?'<button class="list-more" id="list-more">显示更多地区（剩余 '+(list.length-listLimit)+'）</button>':''):'<div class="empty-results">没有找到这个地区<br>试试地市、县区或国家名称</div>';
  $('#city-list').querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>openCity(b.dataset.city));
  if($('#list-more'))$('#list-more').onclick=()=>{const scroller=$('#city-list'),top=scroller.scrollTop;listLimit+=60;renderList();scroller.scrollTop=top;};
}
function resetList(){listLimit=60;renderList();$('#city-list').scrollTop=0;}
['city-search','province-filter','status-filter'].forEach(id=>$('#'+id).addEventListener(id==='city-search'?'input':'change',resetList));
$('#country-filter').onchange=()=>{$('#province-filter').value='all';$('#province-filter').hidden=$('#country-filter').value!=='CHN';resetList();};
function openCity(id){
  if(detailBusy)return;
  if(!cloud?.canEdit()){toast('请先成功读取当前存档，再编辑足迹。');return;}
  selected=model.byId.get(String(id))||visits().find(f=>R.id(f)===String(id));if(!selected)return;
  detailContext=cloud.context();detailBase=cloud.getState().records;
  const p=selected.properties,r=records[id]||{};
  $('#detail-save-status').textContent=cloud.getState().guest?'当前为临时足迹，保存在此浏览器。':'';
  $('#detail-save-status').dataset.error='false';$('#detail-reload-cloud').hidden=true;
  $('#detail-city').textContent=p.name;$('#detail-province').textContent=R.trail(selected)+(p.levelNote?' · '+p.levelNote:'')+(p.level==='legacy'?' · 旧版足迹，尚未定位到县区':'');
  $('#detail-show-map').hidden=p.level==='legacy';$('#detail-visited').checked=true;$('#detail-date').value=r.date||'';$('#detail-note').value=r.note||'';$('#remove-visit').hidden=!r.visited;
  if($('#city-picker').open)$('#city-picker').close();
  $('#city-dialog').showModal();$('#city-dialog').scrollTop=0;
}
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

function setMode(m){mode=m;$('#flag-mode').classList.toggle('active',m==='flag');$('#fill-mode').classList.toggle('active',m==='fill');$('#flag-mode').setAttribute('aria-pressed',m==='flag');$('#fill-mode').setAttribute('aria-pressed',m==='fill');$('#map-stage').classList.toggle('fill-mode',m==='fill');renderMapState();}
$('#flag-mode').onclick=()=>setMode('flag');$('#fill-mode').onclick=()=>setMode('fill');
function scopeName(s=scope){return s.kind==='world'?'世界':s.kind==='china'?'中国':s.kind==='province'?provinces.find(f=>R.id(f)===s.code)?.properties.name:model.countries.get(s.code)?.name;}
function paintNavigation(){
  $('#map-heading').textContent=scopeName()+'旅行地图';
  $('#map-description').textContent=scope.kind==='world'?'选择国家继续探索，或搜索你的下一站':scope.kind==='china'?'选择省份，展开县区地图':'点击一个地区，记录第一次到访';
  $('#map-breadcrumb').innerHTML='<button data-scope="world">世界</button>'+(scope.kind==='china'||scope.kind==='province'?'<span>›</span><button data-scope="china">中国</button>':'')+(scope.kind==='province'||scope.kind==='country'?'<span>›</span><strong>'+esc(scopeName())+'</strong>':'');
  $('#map-breadcrumb').querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>navigate({kind:b.dataset.scope}));
  $('#world-shortcut').classList.toggle('active',scope.kind==='world');$('#china-shortcut').classList.toggle('active',scope.kind==='china'||scope.kind==='province');
  $('#china-map').setAttribute('aria-label',scopeName()+'旅行足迹交互地图');
  $('#map-focus-row').hidden=!['province','country'].includes(scope.kind);$('#map-region-focus').innerHTML='<option value="">完整地图</option>'+shapes.map(f=>'<option value="'+esc(R.id(f))+'">'+esc(f.properties.name)+'</option>').join('');
  $('#map-caption-text').textContent=scope.kind==='world'?'WORLD · MY TRAVEL FOOTPRINTS':scopeName()+' · MY TRAVEL FOOTPRINTS';
}
async function jsonFile(path){const response=await fetch(path);if(!response.ok)throw Error('无法读取地图资源');return response.json();}
async function navigate(next){
  const request=++mapRequest;$('#map-loading').hidden=false;$('#map-loading').textContent='正在展开'+(next.kind==='world'?'世界':'地区')+'地图…';
  try{
    let geo;
    if(next.kind==='world')geo={features:world};
    else if(next.kind==='china')geo={features:provinces};
    else{
      const path=next.kind==='province'?'assets/geo/china/'+next.code+'.geo.json':model.countries.get(next.code)?.detailPath;
      if(!path)throw Error('没有详细地图');
      if(!geometryCache.has(path))geometryCache.set(path,await jsonFile(path));
      geo=geometryCache.get(path);
    }
    if(request!==mapRequest)return;
    scope=next;shapes=geo.features;drawMap();paintNavigation();
    $('#country-filter').value=next.kind==='world'?'all':next.kind==='country'?next.code:'CHN';
    $('#province-filter').hidden=$('#country-filter').value!=='CHN';$('#province-filter').value=next.kind==='province'?next.code:'all';
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
    if(p.detailPath)return navigate({kind:'country',code:p.countryCode});
  }
  if(scope.kind==='china')return navigate({kind:'province',code:R.id(f)});
  openCity(R.id(f));
}
$('#world-shortcut').onclick=()=>navigate({kind:'world'});$('#china-shortcut').onclick=()=>navigate({kind:'china'});
$('#focus-taiwan').onclick=()=>navigate({kind:'province',code:'710000'});
window.ShanheAtlas={backMap:()=>{if(currentView!=='map'||scope.kind==='world')return false;navigate(scope.kind==='province'?{kind:'china'}:{kind:'world'});return true;}};
function focusRegion(id){const f=shapes.find(x=>R.id(x)===String(id));if(!f)return;const [[x0,y0],[x1,y1]]=d3.geoPath(projection).bounds(f),k=Math.max(1,Math.min(192,Math.min(800/Math.max(1,x1-x0),(mapHeight-250)/Math.max(1,y1-y0))));svg.transition().duration(300).call(zoom.transform,d3.zoomIdentity.translate(500-k*(x0+x1)/2,mapHeight/2-k*(y0+y1)/2).scale(k));}
$('#map-region-focus').onchange=()=>{const id=$('#map-region-focus').value;if(id)focusRegion(id);else svg.transition().duration(250).call(zoom.transform,d3.zoomIdentity);};
$('#detail-show-map').onclick=async()=>{const f=selected;if(!f)return;$('#city-dialog').close();goView('map');await navigate(R.countryOf(f)==='CHN'?{kind:'province',code:String(f.properties.provinceCode)}:f.properties.level==='admin1'?{kind:'country',code:f.properties.countryCode}:{kind:'world'});focusRegion(R.id(f));$('#map-region-focus').value=R.id(f);};
function localGeometry(f){
  // Center the projection on each country's longitude so date-line islands stay together.
  return f;
}
function drawMap(){
  mapHeight=phoneLayout.matches?1000:740;svg=d3.select('#china-map').attr('viewBox','0 0 1000 '+mapHeight);svg.selectAll('*').remove();svg.on('.zoom',null);
  const geo={type:'FeatureCollection',features:shapes.map(localGeometry)};
  const fitted=scope.kind==='china'?{type:'FeatureCollection',features:shapes.map(f=>{const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];return {...f,geometry:{type:'MultiPolygon',coordinates:polys.filter(p=>p[0].some(c=>c[1]>=17.5))}};})}:geo;
  if(scope.kind==='world')projection=d3.geoEqualEarth().fitExtent([[22,90],[978,mapHeight-100]],{type:'Sphere'});
  else{
    const center=scope.kind==='country'?model.countries.get(scope.code)?.center:scope.kind==='china'?[104,35]:provinces.find(f=>R.id(f)===scope.code)?.properties.center;
    projection=d3.geoMercator().rotate([-(center?.[0]||104),0]).fitExtent([[45,65],[955,mapHeight-110]],fitted);
  }
  const path=d3.geoPath(projection),colors=['#e2e9d7','#e5eadb','#dce6d2','#e6ebdc','#dfe7d2','#e9ecdf'];
  layer=svg.append('g');
  if(scope.kind==='world')layer.append('path').datum({type:'Sphere'}).attr('d',path).attr('fill','#edf4ef').attr('stroke','#dbe6dc').attr('stroke-width',1);
  cityShapes=layer.append('g').selectAll('path').data(shapes).join('path').attr('d',path).attr('class','city-shape').attr('fill',(f,i)=>colors[i%colors.length]).attr('tabindex',0).attr('role','button').attr('aria-label',f=>f.properties.name+'，'+(['world','china'].includes(scope.kind)?'探索地区':'记录足迹')).on('click',(e,f)=>{openShape(f);$('#map-tooltip').hidden=true;}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openShape(f);}}).on('pointermove',(e,f)=>{if(e.pointerType==='touch')return;const r=$('#map-stage').getBoundingClientRect(),t=$('#map-tooltip');t.textContent=f.properties.name+(visited(f)?' · 已经去过':'');t.hidden=false;t.style.left=Math.min(e.clientX-r.left+14,r.width-180)+'px';t.style.top=Math.max(12,e.clientY-r.top-35)+'px';}).on('pointerleave',()=>$('#map-tooltip').hidden=true);
  labels=layer.append('g').attr('pointer-events','none').selectAll('text').data(shapes.filter(f=>Array.isArray(f.properties.center))).join('text').attr('class','city-label').attr('x',f=>projection(f.properties.center)[0]).attr('y',f=>projection(f.properties.center)[1]).text(f=>scope.kind==='world'?shortName(f.properties.name):f.properties.name);
  markers=layer.append('g');
  if(scope.kind==='china')drawSouthInset(svg);
  zoom=d3.zoom().scaleExtent([1,192]).clickDistance(8).tapDistance(12).filter(e=>{if(e.type.startsWith('touch')&&phoneLayout.matches&&!mapTouchActive)return false;return(!e.ctrlKey||e.type==='wheel')&&!e.button;}).translateExtent([[-300,-200],[1300,mapHeight+200]]).on('zoom',e=>{layer.attr('transform',e.transform);updateMapOverlays();$('#map-tooltip').hidden=true;});
  svg.call(zoom).on('dblclick.zoom',null).call(zoom.transform,d3.zoomIdentity);
  $('#zoom-in').onclick=()=>svg.transition().duration(200).call(zoom.scaleBy,1.6);
  $('#zoom-out').onclick=()=>svg.transition().duration(200).call(zoom.scaleBy,1/1.6);
  $('#zoom-reset').onclick=()=>svg.transition().duration(250).call(zoom.transform,d3.zoomIdentity);
  $('#map-loading').hidden=true;renderMapState();
}
function drawSouthInset(root){
 const h=mapHeight,south={type:'FeatureCollection',features:provinces.filter(f=>R.id(f)==='460000').map(f=>{const cs=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];return {...f,geometry:{type:'MultiPolygon',coordinates:cs.filter(p=>p[0].every(c=>c[1]<20))}};})};
 const sp=d3.geoMercator().fitExtent([[835,h-285],[935,h-130]],south),inset=root.append('g').attr('pointer-events','none');
 inset.append('rect').attr('x',820).attr('y',h-300).attr('width',130).attr('height',200).attr('rx',4).attr('fill','#f5f8f2').attr('stroke','#c9d5be');inset.selectAll('path').data(south.features).join('path').attr('d',d3.geoPath(sp)).attr('fill','#dae4cd').attr('stroke','#a1b393').attr('stroke-width',1);inset.append('text').attr('x',885).attr('y',h-111).attr('text-anchor','middle').attr('font-size',14).attr('fill','#8a9c7f').text('南海诸岛');
}
function renderMapState(){
  if(!cityShapes||!model)return;
  const v=visits(),groups=R.groupMarkers(v,scope,world,provinces);
  const counts=new Map(groups.map(f=>[R.id(f),f.count]));
  cityShapes.classed('visited',f=>scope.kind==='world'?v.some(x=>R.countryOf(x)===R.countryOf(f)):scope.kind==='china'?counts.has(R.id(f)):visited(f));
  markers.selectAll('*').remove();
  if(mode==='flag'){
    const flags=markers.selectAll('g').data(groups.filter(f=>Array.isArray(f.properties.center))).join('g').attr('class','city-marker').attr('role','button').attr('tabindex',0).attr('aria-label',f=>f.properties.name+'，'+f.count+'处足迹').on('click',(e,f)=>{e.stopPropagation();if(f.target==='record')openCity(R.id(f));else openShape(f);}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(f.target==='record')openCity(R.id(f));else openShape(f);}});
    flags.append('ellipse').attr('cx',0).attr('cy',2).attr('rx',5).attr('ry',2).attr('fill','#9cae8270');
    flags.append('path').attr('d','M0,1 V-26').attr('stroke','#7c6246').attr('stroke-width',1.7);
    flags.append('path').attr('d','M1,-26 C8,-31 14,-20 23,-26 L23,-13 C14,-7 8,-19 1,-13 Z').attr('fill','#cf795e').attr('stroke','#fff9ed').attr('stroke-width',.8);
    flags.filter(f=>f.target!=='record').append('text').attr('x',12).attr('y',-17).attr('fill','white').attr('text-anchor','middle').attr('font-size',9).attr('font-weight',700).text(f=>f.count);
  }
  updateMapOverlays();
}
function updateMapOverlays(){
  if(!svg||!markers||!labels||!projection)return;
  const width=svg.node().getBoundingClientRect().width;if(!width)return;
  const transform=d3.zoomTransform(svg.node()),k=transform.k,phone=phoneLayout.matches,scale=phone?Math.max(1,720/width):1,font=(phone?11:10)*1000/width,occupied=[];
  markers.selectAll('g').attr('transform',f=>'translate('+projection(f.properties.center)+') scale('+scale/k+')');
  labels.style('font-size',font/k+'px').style('stroke-width',3/k+'px').each(function(f){
    const l=d3.select(this),p=projection(f.properties.center),x=p[0]*k+transform.x,y=p[1]*k+transform.y,w=String(f.properties.name).length*font,h=font;
    const box=[x-w/2-3,y-h-4,x+w/2+3,y+4];
    const small=scope.kind==='world'&&phone&&k<1.8&&!['CHN','USA','RUS','BRA','AUS','IND','CAN','ZAF'].includes(f.properties.countryCode);
    const hidden=small||x<0||x>1000||y<20||y>mapHeight-30||occupied.length>90||occupied.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]);
    l.style('display',hidden?'none':null).attr('text-anchor','middle').attr('dy',-4/k);if(!hidden)occupied.push(box);
  });
}
function renderCollection(){
  const list=visits().sort((a,b)=>(records[R.id(b)].updatedAt||'').localeCompare(records[R.id(a)].updatedAt||''));
  $('#visited-grid').innerHTML=list.length?list.map(f=>{const p=f.properties,r=records[p.adcode];return '<button class="visited-city" data-city="'+esc(p.adcode)+'">'+icon('flag')+'<h3>'+esc(p.name)+'</h3><p>'+esc(R.trail(f))+'</p>'+(p.level==='legacy'?'<p class="legacy-badge">旧版足迹 · 待定位</p>':'')+'<p>初次到访 · '+esc(dateString(r.date))+'</p>'+(r.note?'<p class="memory">'+esc(r.note)+'</p>':'')+'</button>';}).join(''):'<div class="empty-collection">'+icon('map')+'<h3>你的旅行故事，正要开始。</h3><p>找到去过的地方，插上第一面小旗。</p><button class="button primary" id="start-exploring">去地图记录足迹 '+icon('arrow')+'</button></div>';
  $('#visited-grid').querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>openCity(b.dataset.city));if($('#start-exploring'))$('#start-exploring').onclick=()=>goView('map');
}
function renderStats(){
  const v=visits(),key=f=>R.countryOf(f)==='CHN'?f.properties.province:f.properties.country,groups=d3.group(v,key);
  $('#province-stats').innerHTML=groups.size?[...groups].sort((a,b)=>b[1].length-a[1].length).map(([name,fs])=>{const total=features.filter(f=>key(f)===name).length;return '<div class="bar-row"><div class="bar-label"><span>'+esc(name||'旧版足迹')+'</span><span>'+fs.length+(total?' / '+total:'')+' 个地区</span></div><div class="bar-track"><i style="width:'+Math.min(100,fs.length/(total||fs.length)*100)+'%"></i></div></div>';}).join(''):'<p class="empty-results">插下第一面旗后，这里会展示探索进度。</p>';
  $('#timeline').innerHTML=v.length?[...v].sort((a,b)=>(records[R.id(a)].date||'9999').localeCompare(records[R.id(b)].date||'9999')).map(f=>{const r=records[R.id(f)];return '<div class="timeline-item"><small>'+esc(dateString(r.date))+'</small><h4>'+esc(f.properties.name)+'</h4><p>'+esc(R.trail(f))+'</p>'+(r.note?'<p>'+esc(r.note)+'</p>':'')+'</div>';}).join(''):'<p class="empty-results">记录首次到访日期，串起你的旅行时间线。</p>';
}
function renderAll(){renderSummary();renderList();renderMapState();if(currentView==='cities')renderCollection();if(currentView==='stats')renderStats();}
$('#export-btn').onclick=()=>{
  const list=visits();if(!list.length){toast('先记录一段足迹，再来导出吧');return;}
  const quote=v=>'"'+String(v??'').replace(/^[=+@\t\r-]/,"'$&").replaceAll('"','""')+'"';
  const csv='\ufeff'+[['地区','国家/地区','省级地区','地市','首次到访日期','旅行记忆','地区编号'],...list.map(f=>{const p=f.properties,r=records[p.adcode];return[p.name,p.country,p.province,p.city,r.date,r.note,p.adcode];})].map(row=>row.map(quote).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='山河足迹-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('足迹已导出');
};
function showInfo(html){$('#info-body').innerHTML=html;$('#info-dialog').showModal();}
$('#close-info').onclick=()=>$('#info-dialog').close();
$('#help-btn').onclick=()=>showInfo('<h2>从一面小旗开始</h2><p>① 无需注册，先选择国家或中国省份，进入详细地图；也可以直接搜索地市、县区或州省名称。</p><p>② 点击地区，填写首次到访日期和旅行记忆，保存足迹。总览上的数字小旗表示该区域的足迹数量。</p><p>③ 足迹临时保存在此浏览器。想长期保存或换设备继续时，点击“保存到云端”，用邮箱注册或登录；注册需两次输入相同密码并验证邮箱。</p><p>登录后的修改直接保存到云端，以成功提示为准。本机与云端同一地区内容不同的草稿会保留，避免覆盖。你也可以导出 CSV 留存。</p><p>旧地市足迹按已核实的政府驻地迁至县区，日期与笔记保持不变。尚未核实或发生冲突的记录继续保留在“我的足迹”中。</p>');
$('#coverage-btn').onclick=()=>showInfo('<h2>地图数据与范围</h2><p>中国共 '+chinaIndex.features.length+' 个可标记地区，包含大陆县区、台湾乡镇市区、香港18区和澳门堂区；东莞、中山、儋州、嘉峪关保留市本级。</p><p>世界总览包含 '+world.length+' 个国家和地区边界要素，其中 '+worldIndex.detailCountries.length+' 个旅行目的地细分为州、省或当地相应行政/统计地区。其他地区可整体标记。</p><p>Natural Earth · © OpenStreetMap contributors。新加坡采用规划区域，新西兰含部分岛屿；具体范围、版本、许可证与开放数据下载见 <a href="assets/geo/world-data-sources.md" target="_blank" rel="noopener">世界地图数据说明</a>、<a href="assets/geo/china-data-sources.md" target="_blank" rel="noopener">中国地图数据说明</a>。</p><p>边界以各数据源所载版本为准，用于个人旅行记录。旧记录迁移依据见 <a href="assets/geo/county-migration-map.json" target="_blank" rel="noopener">政府驻地迁移来源</a>。</p>');
async function init(){
  try{
    [chinaIndex,worldIndex,migration]=await Promise.all([jsonFile('assets/geo/china-index.json'),jsonFile('assets/geo/world-index.json'),jsonFile('assets/geo/county-migration-map.json')]);
    const [wg,pg,cg,tg]=await Promise.all([jsonFile('assets/geo/world.geo.json'),jsonFile('assets/provinces.json'),jsonFile('assets/cities.json'),jsonFile('assets/taiwan-counties.json')]);
    world=wg.features;provinces=pg.features.filter(f=>/^\d{6}$/.test(String(f.properties.adcode)));
    if(tg.outline)provinces.find(f=>R.id(f)==='710000').geometry=tg.outline;
    model=R.catalog(chinaIndex,worldIndex,[...cg.features,...tg.features]);features=model.features;
    const countries=worldIndex.countries.filter(p=>!['TWN','HKG','MAC'].includes(p.countryCode)).sort((a,b)=>(a.countryCode==='CHN'?-1:b.countryCode==='CHN'?1:a.name.localeCompare(b.name,'zh-CN')));
    $('#country-filter').innerHTML='<option value="all">全部国家和地区</option>'+countries.map(p=>'<option value="'+p.countryCode+'">'+esc(p.name)+'</option>').join('');
    $('#province-filter').innerHTML='<option value="all">全部省份</option>'+provinces.map(f=>'<option value="'+R.id(f)+'">'+esc(f.properties.name)+'</option>').join('');
    $('#total-badge').textContent=features.length+' 个地区';
    cloud=createShanheCloud({
      getLocalRecords:readLocalRecords,notify:toast,regionMigration:migration,
      onRecords:next=>{records=next;renderAll();},
      onAccountChange:()=>{detailOperation++;setDetailBusy(false);selected=null;detailContext=null;detailBase={};document.querySelectorAll('#city-dialog,#city-picker').forEach(dialog=>{if(dialog.open)dialog.close();});},
      hasOpenEditor:()=>Boolean(document.querySelector('#city-dialog[open]'))
    });
    cloud.start();await navigate({kind:'world'});renderAll();
  }catch(error){
    $('#map-loading').textContent='地图加载失败，请刷新页面重试';$('#city-list').innerHTML='<div class="empty-results">地图资源未能加载，请刷新重试</div>';console.error(error);
  }
}
init();

