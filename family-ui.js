(function(root){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fallbackColors=[{id:'terracotta',name:'暖红',hex:'#cf795e'},{id:'blue',name:'蓝色',hex:'#377eb8'},{id:'purple',name:'紫色',hex:'#8962a5'},{id:'gold',name:'金色',hex:'#b38325'}];
  const flag='<svg viewBox="0 0 24 26" aria-hidden="true"><path d="M5 24V3" fill="none" stroke="#73674f" stroke-width="1.7"/><path d="M6 3c5-3 8 4 14 0v11c-6 4-9-3-14 0Z" fill="currentColor"/></svg>';
  function createFamilyUI({store,onActiveChange,onVisibilityChange,onAuth,notify}){
    const $=selector=>document.querySelector(selector),panel=$('#family-panel');
    if(!panel)throw Error('Family panel container is missing.');
    const colors=root.ShanheFamily?.COLORS||fallbackColors,colorOf=id=>colors.find(color=>color.id===id)||colors[0];
    let active='self',visible=new Set(),knownIds=new Set(),editingId='self',context=null,busy=false,operation=0;
    const members=()=>store.getState().document?.members||[{id:'self',name:'我',color:'terracotta'}];
    panel.classList.add('family-panel');panel.setAttribute('aria-label','家庭旅行成员');
    panel.innerHTML='<div class="family-heading"><div><span class="eyebrow">OUR JOURNEYS, TOGETHER</span><h2>一起走过的山河</h2></div><button class="family-text-button" type="button" id="family-manage">管理成员 <span aria-hidden="true">↗</span></button></div><div class="family-active-row"><label for="family-active">当前记录人</label><span class="family-active-flag" id="family-active-flag">'+flag+'</span><select id="family-active" aria-describedby="family-current-description"></select><span id="family-current-description" class="family-current-description" aria-live="polite"></span></div><fieldset class="family-visibility"><legend>地图与统计显示成员 <span>可多选</span></legend><div class="family-members" id="family-member-chips"></div></fieldset><p class="family-explainer">勾选成员可同时查看地图旗帜和各自的旅行统计。共同到访的地方会并排显示彩旗。</p><div id="family-status" class="family-status" role="status" aria-live="polite"></div><button id="family-retry" class="family-text-button" type="button" hidden>重新读取家庭成员</button>';
    const dialog=document.createElement('dialog');dialog.id='family-dialog';dialog.setAttribute('aria-labelledby','family-dialog-title');
    dialog.innerHTML='<div class="family-dialog-inner"><div class="family-dialog-heading"><div><span class="eyebrow">A COLOR FOR EVERY JOURNEY</span><h2 id="family-dialog-title">家庭旅行成员</h2></div><button class="icon-button" type="button" id="family-close" aria-label="关闭家庭成员"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div><p class="family-dialog-intro">同一个邮箱最多记录 4 位成员。只需昵称，不需要孩子的邮箱或生日。</p><div id="family-manage-list" class="family-manage-list"></div><button class="family-add" type="button" id="family-add">＋ 添加成员</button><form id="family-form"><h3 id="family-form-title">编辑成员</h3><label for="family-name" class="field-label">成员昵称</label><input id="family-name" class="form-input" type="text" maxlength="12" required autocomplete="off" placeholder="例如：小明"><p class="family-field-hint">最多 12 个字，每位成员使用不同的昵称。</p><fieldset class="family-palette"><legend>专属旗子颜色</legend><div id="family-colors"></div></fieldset><p id="family-edit-status" class="family-edit-status" role="status" aria-live="polite"></p><button id="family-edit-reload" class="family-text-button" type="button" hidden>读取最新成员并保留输入</button><div class="family-dialog-actions"><button class="button primary" id="family-save" type="submit">保存成员</button></div></form></div>';
    document.body.append(dialog);
    function current(){return members().find(member=>member.id===active)||members()[0];}
    function visibleIds(){return members().filter(member=>visible.has(member.id)).map(member=>member.id);}
    function selectMember(id){
      if(!members().some(member=>member.id===id)||active===id)return false;
      active=id;render();onActiveChange?.(active);return true;
    }
    function closeEditor(){operation++;busy=false;context=null;dialog.close();setBusy(false);}
    function reset(){closeEditor();active='self';visible=new Set(members().map(member=>member.id));knownIds=new Set(visible);render();}
    function render(){
      const state=store.getState(),list=members(),ids=new Set(list.map(member=>member.id)),focusedMemberId=document.activeElement?.dataset?.familyVisible;
      for(const id of ids)if(!knownIds.has(id))visible.add(id);
      visible=new Set([...visible].filter(id=>ids.has(id)));knownIds=ids;
      if(!ids.has(active))active=list.find(member=>member.id==='self')?.id||list[0]?.id||'self';
      const person=current(),color=colorOf(person.color);
      $('#family-active').innerHTML=list.map(member=>'<option value="'+esc(member.id)+'">'+esc(member.name)+'</option>').join('');$('#family-active').value=active;
      $('#family-active').disabled=!!state.busy||(!state.guest&&!state.ready);
      $('#family-active-flag').style.color=color.hex;
      $('#family-current-description').textContent='足迹保存给 '+person.name+'，清单与护照随之切换。'+(visible.has(person.id)?'':'该成员的地图旗子与统计已隐藏。');
      $('#family-member-chips').innerHTML=list.map(member=>{const c=colorOf(member.color);return '<label class="family-member-chip'+(visible.has(member.id)?' is-visible':'')+'" style="--member-color:'+c.hex+'"><input type="checkbox" data-family-visible="'+esc(member.id)+'"'+(visible.has(member.id)?' checked':'')+' aria-label="在地图和统计中显示'+esc(member.name)+'的足迹，'+esc(c.name)+'旗"><span class="family-chip-flag">'+flag+'</span><span class="family-chip-copy"><strong>'+esc(member.name)+'</strong><small>'+esc(c.name)+(member.id===active?' · 正在记录':'')+'</small></span></label>';}).join('');
      if(focusedMemberId)$('#family-member-chips').querySelectorAll('input').forEach(input=>{if(input.dataset.familyVisible===focusedMemberId)input.focus();});
      $('#family-status').textContent=state.error?.message||(state.busy?'正在同步家庭记录…':state.guest?'登录后可添加家人；你自己的临时足迹仍可先记录。':!state.ready?'正在读取家庭成员…':visible.size?'':'目前已隐藏所有成员的地图旗子与统计，勾选名字即可显示。');
      $('#family-status').dataset.error=String(!!state.error);$('#family-retry').hidden=!state.error;$('#family-retry').disabled=!!state.busy;
      $('#family-manage').textContent=state.guest?'添加家人 ↗':'管理成员 ↗';$('#family-manage').disabled=!!state.busy||(!state.guest&&!state.ready);
      if(dialog.open)renderManageList();
    }
    function renderManageList(){
      $('#family-manage-list').innerHTML=members().map(member=>{const c=colorOf(member.color);return '<button type="button" class="family-edit-member'+(editingId===member.id?' is-selected':'')+'" data-family-edit="'+esc(member.id)+'"'+(busy?' disabled':'')+' aria-pressed="'+String(editingId===member.id)+'" aria-label="编辑'+esc(member.name)+'，'+esc(c.name)+'旗"><span style="color:'+c.hex+'">'+flag+'</span><strong>'+esc(member.name)+'</strong><small>'+esc(c.name)+'</small></button>';}).join('');
      $('#family-add').disabled=busy||members().length>=4;$('#family-add').textContent=members().length>=4?'已有 4 位成员':'＋ 添加成员';
    }
    function renderPalette(selected){
      $('#family-colors').innerHTML=colors.map(color=>{const owner=members().find(member=>member.id!==editingId&&member.color===color.id);return '<label class="family-color-option" style="--member-color:'+color.hex+'"><input type="radio" name="family-color" value="'+color.id+'"'+(color.id===selected?' checked':'')+(owner||busy?' disabled':'')+' aria-label="'+esc(color.name+(owner?'，'+owner.name+'正在使用':''))+'"><span>'+flag+'<b>'+esc(color.name)+'</b><small class="family-color-owner">'+(owner?esc(owner.name)+'在用':'可选')+'</small><small class="family-color-selected">✓ 已选</small></span></label>';}).join('');
    }
    function editMember(id){
      if(busy)return;
      if(!store.canEdit()){notify?.('请先成功读取家庭成员，再编辑。');return;}
      const member=id?members().find(item=>item.id===id):null;
      if(id&&!member)return;
      if(!id&&members().length>=4){notify?.('每个账号最多记录 4 位成员。');return;}
      editingId=id||null;context=store.context();$('#family-name').value=member?.name||'';
      $('#family-form-title').textContent=member?'编辑 '+member.name:'添加旅行成员';
      $('#family-save').textContent=member?'保存成员':'添加并开始记录';
      $('#family-edit-status').textContent='';$('#family-edit-status').dataset.error='false';$('#family-edit-reload').hidden=true;
      renderPalette(member?.color||colors.find(color=>!members().some(item=>item.color===color.id))?.id);renderManageList();
      $('#family-name').focus();
    }
    function open(){
      if(store.getState().guest){onAuth?.();return;}
      if(!store.canEdit()){notify?.('请先成功读取家庭成员，再编辑。');return;}
      editMember(active);if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
    }
    function setBusy(value){busy=value;$('#family-form').querySelectorAll('input,button').forEach(el=>el.disabled=value);$('#family-close').disabled=value;if(!value)renderPalette($('#family-form input[name="family-color"]:checked')?.value);renderManageList();}
    async function save(event){
      event.preventDefault();if(busy||!context)return;if(!$('#family-form').reportValidity())return;
      const name=$('#family-name').value.trim(),color=$('#family-form input[name="family-color"]:checked')?.value;
      if(!name||name.length>12||/[\u0000-\u001f\u007f]/.test(name)||members().some(member=>member.id!==editingId&&member.name.trim().toLowerCase()===name.toLowerCase())){showError('请使用 1 至 12 个字、与其他成员不同的昵称。');return;}
      if(!colors.some(item=>item.id===color)||members().some(member=>member.id!==editingId&&member.color===color)){showError('请选择尚未被其他成员使用的颜色。');return;}
      const token=++operation,oldIds=new Set(members().map(member=>member.id)),id=editingId;
      setBusy(true);$('#family-edit-status').textContent='正在保存成员…';$('#family-edit-status').dataset.error='false';
      try{
        const result=await (id?store.updateMember(id,{name,color},context):store.addMember(name,color,context));
        if(token!==operation)return;
        if(!result?.ok){showError(result?.message||'成员暂未保存，当前输入仍保留。');$('#family-edit-reload').hidden=!['CONFLICT','STALE_CONTEXT','STALE_REQUEST'].includes(result?.code);return;}
        const added=result.memberId?members().find(member=>member.id===result.memberId):members().find(member=>!oldIds.has(member.id));
        closeEditor();if(added)selectMember(added.id);render();onVisibilityChange?.(visibleIds());notify?.(id?'成员昵称与旗子颜色已保存':'已添加 '+name+'，现在可以记录足迹了');
      }catch(_){if(token===operation)showError('成员暂未保存，当前输入仍保留，请重试。');}
      finally{if(token===operation)setBusy(false);}
    }
    function showError(message){$('#family-edit-status').textContent=message;$('#family-edit-status').dataset.error='true';}
    async function refreshEditor(){
      if(busy)return;const token=++operation,savedName=$('#family-name').value,savedColor=$('#family-form input[name="family-color"]:checked')?.value;
      setBusy(true);try{const result=await store.refresh();if(token!==operation)return;if(!result?.ok){showError(result?.message||'读取未完成，当前输入仍保留。');return;}context=store.context();$('#family-name').value=savedName;renderPalette(savedColor);$('#family-edit-reload').hidden=true;$('#family-edit-status').textContent='已读取最新成员，输入仍保留，请核对后保存。';$('#family-edit-status').dataset.error='false';}
      catch(_){if(token===operation)showError('读取未完成，当前输入仍保留。');}finally{if(token===operation)setBusy(false);}
    }
    $('#family-active').onchange=()=>selectMember($('#family-active').value);
    $('#family-member-chips').addEventListener('change',event=>{const input=event.target,id=input.dataset.familyVisible;if(!id||!members().some(member=>member.id===id))return;if(input.checked)visible.add(id);else visible.delete(id);render();onVisibilityChange?.(visibleIds());});
    $('#family-manage').onclick=open;$('#family-close').onclick=()=>{if(!busy)closeEditor();};$('#family-add').onclick=()=>editMember(null);
    $('#family-manage-list').addEventListener('click',event=>{const button=event.target.closest('[data-family-edit]');if(button)editMember(button.dataset.familyEdit);});
    $('#family-form').onsubmit=save;$('#family-edit-reload').onclick=refreshEditor;
    $('#family-retry').onclick=async()=>{try{const result=await store.refresh();render();if(!result?.ok)notify?.(result?.message||'家庭成员暂时无法读取，请稍后重试。');}catch(_){notify?.('家庭成员暂时无法读取，请稍后重试。');}};
    dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();else closeEditor();});
    dialog.addEventListener('click',event=>{if(busy||event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeEditor();});
    render();
    return Object.freeze({render,activeId:()=>active,visibleIds,selectMember,closeEditor,hasOpenEditor:()=>dialog.open,reset});
  }
  root.createFamilyUI=createFamilyUI;
  if(typeof module==='object'&&module.exports)module.exports={createFamilyUI};
})(typeof globalThis==='object'?globalThis:this);
