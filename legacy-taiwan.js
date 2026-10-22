// Preserve the old whole-province footprint until its owner assigns it to a county/city.
// Call render() from renderAll(); append csvRows() to the export's raw data rows.
function createLegacyTaiwanAdapter({getRecords,getFeatures,getContext,canOpen,persist,onChange,notify}) {
  const legacyId='710000';
  let banner,dialog,select,saveButton,description,dateText,noteText,status,context,base,busy=false,operation=0;
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
  const legacyRecord=()=>{
    const value=getRecords()[legacyId];
    return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
  };
  const counties=()=>getFeatures().filter(f=>String(f.properties.provinceCode)===legacyId&&String(f.properties.adcode)!==legacyId);
  const element=(tag,text,className)=>{
    const node=document.createElement(tag);
    if(text!==undefined)node.textContent=text;
    if(className)node.className=className;
    return node;
  };

  function build() {
    banner=element('section',undefined,'map-card');
    banner.id='legacy-taiwan-banner';
    banner.setAttribute('aria-labelledby','legacy-taiwan-heading');
    banner.style.cssText='padding:16px;margin-bottom:16px';
    const heading=element('h2','还有一段台湾足迹待归入县市');
    heading.id='legacy-taiwan-heading';
    const explanation=element('p','旧版整体记录的日期和记忆已保留。选择实际到访的县市后，即可继续查看足迹统计。');
    explanation.style.cssText='margin:8px 0 12px;font-size:13px';
    const openButton=element('button','整理这段足迹','button secondary');
    openButton.type='button';
    openButton.style.minHeight='44px';
    openButton.setAttribute('aria-haspopup','dialog');
    openButton.onclick=()=>{
      if(typeof canOpen==='function'&&!canOpen())return;
      if(busy)return;
      if(!legacyRecord())return render();
      status.textContent='';context=getContext();base=structuredClone(getRecords());
      paintDialog();
      dialog.showModal();
    };
    banner.append(heading,explanation,openButton);
    document.querySelector('.summary').after(banner);

    dialog=element('dialog');
    dialog.id='legacy-taiwan-dialog';
    dialog.setAttribute('aria-labelledby','legacy-taiwan-title');
    dialog.setAttribute('aria-describedby','legacy-taiwan-description');
    dialog.style.maxHeight='calc(100dvh - 32px)';
    const form=element('form',undefined,'info-content');
    const top=element('div',undefined,'dialog-top');
    const title=element('h2','整理台湾旅行足迹');
    title.id='legacy-taiwan-title';
    title.style.margin='0';
    const close=element('button','×','icon-button');
    close.type='button';
    close.style.cssText='min-width:44px;min-height:44px;font-size:24px';
    close.setAttribute('aria-label','关闭旧版台湾足迹整理');
    close.onclick=()=>{if(!busy)dialog.close();};
    top.append(title,close);
    description=element('p','选择这段旧版记录对应的县市，原有日期和记忆将完整保留。其他到访地点可稍后分别添加。');
    description.id='legacy-taiwan-description';
    dateText=element('p');
    noteText=element('p');
    noteText.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere';
    const label=element('label','这段足迹属于哪个县市？','field-label');
    label.htmlFor='legacy-taiwan-destination';
    select=element('select',undefined,'form-input');
    select.id='legacy-taiwan-destination';
    select.required=true;
    select.style.cssText='font-size:16px;min-height:48px';
    select.setAttribute('aria-describedby','legacy-taiwan-conflict-hint');
    const hint=element('p','已有记录的县市不可选择，以保留各自的日期和记忆。暂时不选也可以继续保留并导出这段旧记录。','form-hint');
    hint.id='legacy-taiwan-conflict-hint';
    status=element('p');
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    const actions=element('div',undefined,'dialog-actions');
    saveButton=element('button','归入所选县市','button primary save-button');
    saveButton.type='submit';
    saveButton.style.minHeight='48px';
    const later=element('button','暂时保留原记录','remove-visit');
    later.type='button';
    later.style.minHeight='44px';
    later.onclick=()=>{if(!busy)dialog.close();};
    actions.append(saveButton,later);
    form.append(top,description,dateText,noteText,label,select,hint,status,actions);
    dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
    dialog.append(form);
    document.body.append(dialog);
    form.onsubmit=async event=>{
      event.preventDefault();
      if(busy)return;
      const current=base,record=base?.[legacyId];
      const destination=counties().find(f=>String(f.properties.adcode)===select.value);
      if(!record){dialog.close();render();return;}
      if(!destination){status.textContent='请选择一个县市后再保存。';select.focus();return;}
      const id=String(destination.properties.adcode);
      if(own(current,id)){
        paintDialog();
        status.textContent='这个县市已有记录，请选择其他县市。原记录已保留。';
        select.focus();
        return;
      }
      // The original record is removed only by the same successful storage write.
      const next={...current,[id]:{...record}};
      delete next[legacyId];
      const requestOperation=++operation;
      busy=true;saveButton.disabled=true;select.disabled=true;status.textContent=context?.userId?'正在保存到云端…':'正在临时保存…';
      let result;
      try{result=await persist(next,context);}
      catch(_){result={ok:false,message:'保存失败，请稍后重试。'};}
      finally{if(requestOperation===operation){busy=false;saveButton.disabled=false;select.disabled=false;}}
      if(requestOperation!==operation||result.code==='STALE_REQUEST')return;
      if(!result.ok){status.textContent=result.message+' 原记录仍然保留。';return;}
      dialog.close();
      onChange();
      notify('已将原记录归入'+destination.properties.name+'，日期和记忆已保留');
    };
  }

  function paintDialog() {
    const record=legacyRecord();
    if(!record)return;
    dateText.textContent='首次到访：'+(record.date||'未填写');
    noteText.textContent='旅行记忆：'+(record.note||'未填写');
    const previous=select.value,records=getRecords();
    select.replaceChildren();
    const placeholder=element('option','请选择实际到访的县市');
    placeholder.value='';
    select.append(placeholder);
    let available=0;
    counties().forEach(feature=>{
      const p=feature.properties,id=String(p.adcode),occupied=own(records,id);
      const option=element('option',p.name+(occupied?'（已有记录）':''));
      option.value=id;
      option.disabled=occupied;
      if(!occupied){available++;if(id===previous)option.selected=true;}
      select.append(option);
    });
    saveButton.disabled=!available;
    description.textContent=available
      ?'选择这段旧版记录对应的县市，原有日期和记忆将完整保留。其他到访地点可稍后分别添加。'
      :'每个县市都已有记录。这段旧版整体记录会继续保留，并包含在导出的足迹中。';
  }

  function render() {
    const pending=Boolean(legacyRecord())&&counties().length>0;
    if(!banner&&!pending)return;
    if(!banner)build();
    banner.hidden=!pending;
    if(dialog.open){
      if(!pending)dialog.close();
      // Keep the opened form paired with its original snapshot and revision.
    }
  }

  function csvRows() {
    const record=legacyRecord();
    return record&&counties().length>0
      ?[['台湾（旧版整体记录，待归入县市）','台湾省',record.date||'',record.note||'']]
      :[];
  }

  function discard() {
    operation++;busy=false;context=null;base=null;
    if(!dialog)return;
    if(dialog.open)dialog.close();
    select.disabled=false;select.value='';saveButton.disabled=false;status.textContent='';
  }

  return {render,csvRows,discard};
}
