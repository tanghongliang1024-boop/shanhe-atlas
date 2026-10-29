(function(root){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const status=(records,id)=>['visited','wish'].includes(records[id]?.status)?records[id].status:'unvisited';
  const stateNames={visited:'已经去过',wish:'想去',unvisited:'尚未到访'};
  const formattedDate=value=>value?value.replaceAll('-','.'):'到访日期待补充';
  const sourceLink=source=>typeof source?.url==='string'&&source.url.startsWith('https://')?'<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.title||'查看目录来源')+' ↗</a>':'';
  function themeSource(theme){
    const source=theme.source;if(!source)return '';
    return '<p><strong>'+esc(theme.name)+'</strong><br>'+esc(source.title)+' · '+esc(source.edition||'')+'<br>'+esc(source.note||'')+'<br>'+sourceLink({title:'查看目录来源',url:source.url})+(source.additionalSources||[]).map(item=>'<br>'+sourceLink(item)).join('')+'</p>';
  }
  const mountain='<path d="M15 69 40 30 56 51 75 18 113 69Z"/><path d="m31 44 9-14 10 15-11-4Z M63 37l12-19 12 17-12-5Z"/><path d="M17 77h94 M28 83h72"/>';
  const stamp=(place,lit=false)=>'<svg class="lm-stamp '+(lit?'is-lit':'')+'" viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="59"/><circle class="lm-stamp-inner" cx="64" cy="64" r="52"/><g transform="translate(10 17) scale(.84)">'+mountain+'</g><text x="64" y="97"'+((place.stampLabel||place.name).length>5?' textLength="94" lengthAdjust="spacingAndGlyphs"':'')+'>'+esc(place.stampLabel||place.name)+'</text><path d="M33 103h62"/></svg>';
  const progress=(theme,records)=>{const ids=[...new Set(theme.placeIds||[])],visited=ids.filter(id=>status(records,id)==='visited').length;return {visited,total:ids.length,complete:ids.length>0&&visited===ids.length};};
  function prepareEdit(base,id,nextStatus,date,note){
    const next=structuredClone(base);
    if(!['visited','wish','unvisited'].includes(nextStatus))throw Error('请选择有效的到访状态。');
    if(nextStatus==='unvisited'){delete next[id];return next;}
    const previous=base[id],savedDate=nextStatus==='visited'?date:'';
    const normalized=String(note).replace(/\r\n?/g,'\n');
    next[id]=previous&&previous.status===nextStatus&&previous.date===savedDate&&previous.note.replace(/\r\n?/g,'\n')===normalized?{...previous}:{status:nextStatus,date:savedDate,note:normalized.trim(),updatedAt:new Date().toISOString()};
    return next;
  }
  function createLandmarkUI({catalog,store,onMap,onAuth,notify,onViewChange,countries=new Map()}){
    const $=selector=>document.querySelector(selector),listView=$('#landmarks-view'),passportView=$('#passport-view');
    if(!listView||!passportView)throw Error('Landmark page containers are missing.');
    const places=catalog.places,themes=catalog.themes,byId=catalog.byId||new Map(places.map(p=>[p.id,p]));
    let selected=null,base={},context=null,busy=false,operation=0;
    const countryNames=new Map();
    for(const place of places)for(const code of new Set([place.countryCode,...(place.countryCodes||[])])){
      const name=countries.get(code)?.name||(code===place.countryCode?place.country:null);
      if(name||!countryNames.has(code))countryNames.set(code,name||code);
    }
    listView.classList.add('landmark-page');passportView.classList.add('landmark-page');
    listView.innerHTML='<div class="lm-page-heading"><div><span class="eyebrow">A WORLD OF PLACES TO REMEMBER</span><h2>名胜打卡</h2><p>从山川湖泊到古城古迹，收藏你的下一站。</p></div><button class="button secondary" data-lm-action="passport">查看旅行护照 <span aria-hidden="true">↗</span></button></div><div data-lm-storage></div><div id="lm-theme-cards" class="lm-theme-cards"></div><details class="lm-catalog-source"><summary>主题清单与收录范围</summary><p>'+esc(catalog.note||'每个景点独立记录，可属于多个主题。')+'</p>'+themes.filter(t=>t.source).map(themeSource).join('')+'</details><div class="lm-browse"><div class="lm-browse-heading"><h3>寻找下一站</h3><span id="lm-result-count" role="status"></span></div><label class="lm-search"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input id="lm-search" type="search" placeholder="搜索景点、中英文名称" aria-label="搜索名胜" autocomplete="off"></label><div class="lm-filters"><label>主题<select id="lm-theme-filter"><option value="all">全部主题</option>'+themes.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('')+'</select></label><label>国家 / 地区<select id="lm-country-filter"><option value="all">全部国家 / 地区</option>'+[...countryNames].map(([code,name])=>'<option value="'+esc(code)+'">'+esc(name)+'</option>').join('')+'</select></label><label>足迹状态<select id="lm-status-filter"><option value="all">全部状态</option><option value="wish">想去</option><option value="visited">已经去过</option><option value="unvisited">尚未到访</option></select></label></div><div id="lm-place-list" class="lm-place-list"></div></div><p class="lm-catalog-note">同一名胜在多个主题中共用一条记录。地图点表示代表位置；城市足迹与名胜打卡分别记录。</p>';
    passportView.innerHTML='<div class="lm-page-heading"><div><span class="eyebrow">YOUR PERSONAL TRAVEL PASSPORT</span><h2>旅行护照</h2><p>每一枚印章，都是你与山河的一次相遇。</p></div><button class="button secondary" data-lm-action="landmarks">继续探索名胜 <span aria-hidden="true">↗</span></button></div><div data-lm-storage></div><div id="lm-passport-cover" class="lm-passport-cover"></div><div class="lm-passport-links"><button class="button secondary" data-lm-action="cities">查看地区足迹 <span aria-hidden="true">↗</span></button><button class="button secondary" data-lm-action="stats">查看到访时间线 <span aria-hidden="true">↗</span></button></div><div class="lm-browse-heading"><h3>我的景点印章</h3><span>点击印章查看或补充记录</span></div><div id="lm-stamp-grid" class="lm-stamp-grid"></div><div class="lm-browse-heading lm-badge-heading"><h3>主题徽章</h3><span>完成一组足迹，收藏一份纪念</span></div><div id="lm-badge-list" class="lm-badge-list"></div><p class="lm-catalog-note">印章记录你标记的到访经历，不代表登顶或实地认证。取消到访后，印章与主题徽章会同步更新。</p>';
    const dialog=document.createElement('dialog');dialog.id='landmark-dialog';dialog.setAttribute('aria-labelledby','lm-detail-name');
    dialog.innerHTML='<form id="lm-detail-form"><div class="lm-dialog-top"><span class="eyebrow">A PLACE IN YOUR PASSPORT</span><button type="button" class="icon-button" id="lm-close" aria-label="关闭名胜详情"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div><div id="lm-detail-stamp"></div><p id="lm-detail-location" class="lm-detail-location"></p><h2 id="lm-detail-name"></h2><p id="lm-detail-member" class="family-record-owner"></p><p id="lm-detail-description"></p><button type="button" id="lm-detail-map" class="lm-text-button">在地图中查看 <span aria-hidden="true">↗</span></button><fieldset class="lm-state-choice"><legend>我的到访状态</legend><label><input type="radio" name="lm-state" value="unvisited"><span>未去过</span></label><label><input type="radio" name="lm-state" value="wish"><span>想去</span></label><label><input type="radio" name="lm-state" value="visited"><span>去过</span></label></fieldset><p id="lm-state-hint" class="lm-form-hint"></p><label class="field-label" for="lm-detail-date">首次到访日期 <span>选填</span></label><input class="form-input" id="lm-detail-date" type="date"><label class="field-label" for="lm-detail-note">旅行笔记 <span>选填</span></label><textarea id="lm-detail-note" maxlength="600" rows="3" placeholder="记下旅行记忆，或下一次出发的愿望…"></textarea><p id="lm-detail-status" class="lm-save-status" role="status" aria-live="polite"></p><button id="lm-detail-reload" type="button" class="lm-text-button" hidden>读取最新记录并重新编辑</button><details class="lm-sources"><summary>景点资料与地图位置</summary><p>地图点为景观代表位置，供旅行记录使用；不作为导航入口或登顶位置。</p><p id="lm-detail-coordinate-note"></p><ul id="lm-detail-sources"></ul></details><div class="lm-dialog-actions"><button class="button primary" id="lm-detail-save" type="submit">保存景点记录</button></div></form>';
    document.body.append(dialog);
    function actionButton(action){
      if(action==='passport'||action==='landmarks'||action==='cities'||action==='stats'){onViewChange?.(action);return;}
      if(action==='auth'){onAuth?.();return;}
      if(action==='clear-filters'){$('#lm-search').value='';$('#lm-theme-filter').value='all';$('#lm-country-filter').value='all';$('#lm-status-filter').value='all';render();return;}
      if(action==='refresh'||action==='transfer'){
        if(store.getState().busy)return;
        Promise.resolve(action==='transfer'?store.transferGuest():store.refresh()).then(result=>{render();if(result&&!result.ok)notify?.(result.message||'景点存档暂未完成，请重试。');}).catch(()=>notify?.('景点存档暂未完成，请稍后重试。'));
      }
    }
    function delegate(event){const button=event.target.closest('button');if(!button)return;if(button.dataset.lmAction)actionButton(button.dataset.lmAction);else if(button.dataset.lmPlace)open(button.dataset.lmPlace);else if(button.dataset.lmTheme){$('#lm-theme-filter').value=button.dataset.lmTheme;render();$('#lm-search').focus();}}
    listView.addEventListener('click',delegate);passportView.addEventListener('click',delegate);
    ['lm-search','lm-theme-filter','lm-country-filter','lm-status-filter'].forEach(id=>$('#'+id).addEventListener(id==='lm-search'?'input':'change',render));
    function storageBanner(s){
      const error=s.error?.message||'',loading=s.busy?'正在同步景点记录…':!s.ready?'正在读取景点记录…':'';
      const title=error?'景点存档需要重试':loading||(s.guest?'先记录，想保存时再登录':'景点足迹已连接云端');
      const text=error||s.transferMessage||(s.guest?'想去、到访和笔记临时保存在此浏览器。登录后可保存到你的账号。':'景点记录与地区足迹分别保存；使用同一邮箱即可继续收藏。');
      return '<div class="lm-storage"'+(error?' data-error="true"':'')+'><div><strong>'+esc(title)+'</strong><p>'+esc(text)+'</p></div><div class="lm-storage-actions">'+(s.guest?'<button class="button secondary" data-lm-action="auth">保存到云端</button>':'')+(!s.guest&&s.guestCount?'<button class="button secondary" data-lm-action="transfer"'+(s.busy?' disabled':'')+'>存入本机 '+Number(s.guestCount)+' 条景点记录</button>':'')+(!s.guest||error?'<button class="lm-text-button" data-lm-action="refresh"'+(s.busy?' disabled':'')+'>'+ (error?'重试读取':'刷新景点记录')+'</button>':'')+'</div></div>';
    }
    function render(){
      const s=store.getState(),records=s.records||{};
      document.querySelectorAll('[data-lm-storage]').forEach(el=>el.innerHTML=storageBanner(s));
      $('#lm-theme-cards').innerHTML=themes.map(theme=>{const p=progress(theme,records);return '<button type="button" class="lm-theme-card" data-lm-theme="'+esc(theme.id)+'"><span class="lm-theme-art" aria-hidden="true"><svg viewBox="0 0 128 108">'+mountain+'</svg></span><span class="lm-theme-copy"><span class="eyebrow">'+(p.complete?'COLLECTION COMPLETE':'A JOURNEY TO COLLECT')+'</span><strong>'+esc(theme.name)+'</strong><span>'+esc(theme.description||'一步一步，收集属于你的山河。')+'</span><span class="lm-theme-progress"><b>'+p.visited+'</b> / '+p.total+' 已到访'+(p.complete?' · 徽章已点亮':'')+'</span><span class="lm-progress-track"><i style="width:'+(p.total?p.visited/p.total*100:0)+'%"></i></span></span><span class="lm-theme-arrow" aria-hidden="true">↗</span></button>';}).join('');
      const query=$('#lm-search').value.trim().normalize('NFKC').toLowerCase(),theme=$('#lm-theme-filter').value,country=$('#lm-country-filter').value,filter=$('#lm-status-filter').value;
      const list=places.filter(p=>(theme==='all'||themes.find(t=>t.id===theme)?.placeIds.includes(p.id))&&(country==='all'||p.countryCode===country||p.countryCodes?.includes(country))&&(filter==='all'||status(records,p.id)===filter)&&(!query||[p.name,p.nameEn,p.location,p.country,...(p.aliases||[])].join(' ').normalize('NFKC').toLowerCase().includes(query)));
      $('#lm-result-count').textContent=list.length+' 个景点';
      $('#lm-place-list').innerHTML=list.length?list.map(p=>{const state=status(records,p.id),record=records[p.id];return '<button type="button" class="lm-place-card" data-lm-place="'+esc(p.id)+'"><div class="lm-place-art '+state+'">'+stamp(p,state==='visited')+'<span class="lm-status-tag '+state+'">'+stateNames[state]+'</span></div><div class="lm-place-copy"><span class="lm-location">'+esc(p.location||p.country)+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><span class="lm-card-foot">'+(state==='visited'?esc(formattedDate(record.date)):state==='wish'?'愿望已收藏，等一次出发':'记录与这里的第一次相遇')+'<span aria-hidden="true">↗</span></span></div></button>';}).join(''):'<div class="lm-empty"><h3>暂时没有匹配的景点</h3><p>试试其他名称，或换个筛选条件。</p><button class="button secondary" data-lm-action="clear-filters">查看全部景点</button></div>';
      const visited=places.filter(p=>status(records,p.id)==='visited'),wishes=places.filter(p=>status(records,p.id)==='wish'),complete=themes.filter(t=>progress(t,records).complete),countryCount=new Set(visited.map(p=>p.countryCode)).size;
      $('#lm-passport-cover').innerHTML='<div class="lm-cover-title"><span class="eyebrow">SHANHE ATLAS · TRAVEL PASSPORT</span><svg viewBox="0 0 128 108" aria-hidden="true">'+mountain+'</svg><h3>把山河，收进护照里。</h3><p>你的每一次到访，都有自己的印记。</p></div><div class="lm-passport-totals"><div><strong>'+visited.length+'</strong><span>景点印章</span></div><div><strong>'+complete.length+'</strong><span>主题徽章</span></div><div><strong>'+wishes.length+'</strong><span>心愿目的地</span></div><div><strong>'+countryCount+'</strong><span>国家 / 地区</span></div></div>';
      $('#lm-stamp-grid').innerHTML=places.map(p=>{const state=status(records,p.id);return '<button type="button" class="lm-stamp-card '+state+'" data-lm-place="'+esc(p.id)+'" aria-label="'+esc(p.name+'，'+(state==='visited'?'印章已点亮':state==='wish'?'已加入想去，印章未点亮':'印章未点亮'))+'">'+stamp(p,state==='visited')+'<strong>'+esc(p.name)+'</strong><span>'+(state==='visited'?esc(formattedDate(records[p.id].date)):state==='wish'?'愿望清单中的下一站':'等你留下一枚印章')+'</span></button>';}).join('');
      $('#lm-badge-list').innerHTML=themes.map(t=>{const p=progress(t,records);return '<div class="lm-badge-card '+(p.complete?'earned':'locked')+'"><div class="lm-badge-symbol" aria-hidden="true"><svg viewBox="0 0 100 120"><path d="m27 75-9 35 30-14 29 14-7-35"/><path d="m50 5 11 8 14 1 4 14 9 11-5 13 1 14-13 6-8 11-13-4-13 4-8-11-13-6 1-14-5-13 9-11 4-14 14-1Z"/><path d="m30 44 14 14 27-29"/></svg></div><div><span class="eyebrow">'+(p.complete?'COLLECTED':'A JOURNEY AHEAD')+'</span><h4>'+esc(t.badgeName||t.name+'足迹')+'</h4><p>'+(p.complete?'全部 '+p.total+' 处已到访，主题徽章已点亮。':'已到访 '+p.visited+' / '+p.total+' 处，集齐后点亮徽章。')+'</p></div><button type="button" class="lm-text-button" data-lm-action="landmarks">继续探索 ↗</button></div>';}).join('');
    }
    function formState(){
      const value=$('#lm-detail-form input[name="lm-state"]:checked')?.value||'unvisited';
      $('#lm-detail-date').disabled=busy||value!=='visited';
      $('#lm-state-hint').textContent=value==='visited'?'保存后，地图旗子、主题进度与护照印章会一起更新。':value==='wish'?'收藏下一站，愿望记录不会计入已到访或点亮印章。':base[selected?.id]?'保存后将移除这条景点记录与印章，地区足迹不受影响。':'可以先收藏为“想去”，到访后再点亮印章。';
    }
    function setBusy(value){busy=value;$('#lm-detail-form').querySelectorAll('input,textarea,button').forEach(el=>el.disabled=value);formState();}
    function closeEditor(){operation++;busy=false;selected=null;base={};context=null;dialog.close();setBusy(false);}
    function open(id){
      if(busy)return;
      if(!store.canEdit()){notify?.('请先成功读取景点存档，再编辑。');return;}
      const place=byId.get(id);if(!place)return;
      selected=place;base=structuredClone(store.getState().records);context=store.context();
      const current=base[id],state=status(base,id);
      $('#lm-detail-member').textContent='正在为 '+(store.getState().memberName||'我')+' 记录';$('#lm-detail-name').textContent=place.name;$('#lm-detail-location').textContent=place.location||place.country;
      $('#lm-detail-description').textContent=place.description||'';$('#lm-detail-stamp').innerHTML=stamp(place,state==='visited');
      $('#lm-detail-form').querySelectorAll('input[name="lm-state"]').forEach(el=>el.checked=el.value===state);
      $('#lm-detail-date').value=current?.date||'';$('#lm-detail-note').value=current?.note||'';
      $('#lm-detail-status').textContent=store.getState().guest?'本次记录将临时保存在此浏览器。':'本次记录将保存到你的云端账号。';$('#lm-detail-status').dataset.error='false';$('#lm-detail-reload').hidden=true;
      $('#lm-detail-coordinate-note').textContent=place.coordinateNote||place.coordinateMethod||'';$('#lm-detail-coordinate-note').hidden=!$('#lm-detail-coordinate-note').textContent;
      $('#lm-detail-sources').innerHTML=(place.sources||[]).filter(s=>/^https:\/\//.test(s.url)).map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||'资料来源')+' ↗</a></li>').join('');
      setBusy(false);if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
    }
    async function save(event){
      event.preventDefault();if(!selected||busy)return;
      if(!$('#lm-detail-form').reportValidity())return;
      const id=selected.id,name=selected.name,action=$('#lm-detail-form input[name="lm-state"]:checked')?.value||'unvisited';
      const next=prepareEdit(base,id,action,$('#lm-detail-date').value,$('#lm-detail-note').value),token=++operation;
      setBusy(true);$('#lm-detail-status').textContent='正在保存景点记录…';$('#lm-detail-status').dataset.error='false';
      try{
        const result=await store.save(next,context);if(token!==operation)return;
        if(result.ok){dialog.close();render();notify?.(name+(action==='visited'?'的到访已记录，印章已点亮':action==='wish'?'已加入想去清单':'已标记为未去过')+(result.guest?'（临时保存）':'（已保存到云端）'));}
        else{$('#lm-detail-status').textContent=result.message||'保存未完成，输入仍保留，请重试。';$('#lm-detail-status').dataset.error='true';$('#lm-detail-reload').hidden=!['CONFLICT','STALE_REQUEST','STALE_CONTEXT'].includes(result.code);}
      }catch(_){if(token===operation){$('#lm-detail-status').textContent='保存未完成，输入仍保留，请稍后重试。';$('#lm-detail-status').dataset.error='true';}}
      finally{if(token===operation)setBusy(false);}
    }
    $('#lm-detail-form').onsubmit=save;
    $('#lm-detail-form').querySelectorAll('input[name="lm-state"]').forEach(el=>el.onchange=formState);
    $('#lm-close').onclick=()=>{if(!busy)closeEditor();};
    dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
    dialog.addEventListener('click',event=>{if(busy||event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeEditor();});
    $('#lm-detail-map').onclick=()=>{if(!selected||busy)return;const place=selected;closeEditor();onMap?.(place);};
    $('#lm-detail-reload').onclick=async()=>{if(!selected||busy)return;const id=selected.id,token=++operation;setBusy(true);try{const result=await store.refresh();if(token!==operation)return;setBusy(false);if(result.ok)open(id);else{$('#lm-detail-status').textContent=result.message||'读取未完成，请重试。';$('#lm-detail-status').dataset.error='true';}}catch(_){if(token===operation){$('#lm-detail-status').textContent='读取未完成，输入仍保留，请稍后重试。';$('#lm-detail-status').dataset.error='true';}}finally{if(token===operation)setBusy(false);}};
    render();return {render,open,closeEditor,hasOpenEditor:()=>dialog.open};
  }
  root.createLandmarkUI=createLandmarkUI;
  if(typeof module!=='undefined'&&module.exports)module.exports={createLandmarkUI,prepareEdit};
})(typeof window!=='undefined'?window:globalThis);
