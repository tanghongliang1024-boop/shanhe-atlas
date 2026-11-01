(function(root){
  'use strict';
  const VISITOR_KEY='shanhe-analytics-visitor-v1',OPT_OUT_KEY='shanhe-analytics-opt-out-v1';
  const ORIGIN='https://tanghongliang1024-boop.github.io',BASE='/shanhe-atlas/';
  const API='https://gxaeatehlgepgeuhhmll.supabase.co';
  const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function createAnalytics(options={}){
    const own=(key,fallback)=>Object.hasOwn(options,key)?options[key]:fallback;
    const location=own('location',root.location),navigator=own('navigator',root.navigator),document=own('document',root.document);
    const config=own('config',root.SHANHE_CLOUD_CONFIG),crypto=own('crypto',root.crypto);
    const request=own('fetch',typeof root.fetch==='function'?root.fetch.bind(root):null);
    const schedule=own('setTimeout',root.setTimeout?.bind(root)),cancel=own('clearTimeout',root.clearTimeout?.bind(root));
    const Controller=own('AbortController',root.AbortController),locks=own('locks',navigator?.locks);
    let storage,storageFailed=false;
    try{storage=own('storage',null);if(!Object.hasOwn(options,'storage'))storage=root.localStorage;}
    catch(_){storageFailed=true;}
    let started=false,stopped=false,awaitReload=false,bound=false,preparing=null,visitorId=null,eventId=null;
    let status=0,sentStatus=-1,inFlight=false,timer=null,controller=null,attempts=[0,0,0];
    const initialDelay=own('initialDelay',1000),retryDelay=own('retryDelay',1500),timeoutMs=own('timeoutMs',5000);
    const $=id=>document?.getElementById?.(id);
    function reason(){
      if(location?.origin!==ORIGIN||!String(location?.pathname||'').startsWith(BASE))return 'local';
      if(navigator?.globalPrivacyControl===true||String(navigator?.doNotTrack??root.doNotTrack)==='1')return 'privacy';
      if(config?.url?.replace(/\/$/,'')!==API||typeof config?.publishableKey!=='string'||!config.publishableKey.startsWith('sb_publishable_')||typeof request!=='function')return 'config';
      if(storageFailed||!storage||typeof crypto?.randomUUID!=='function')return 'storage';
      try{return storage.getItem(OPT_OUT_KEY)==='1'?'optout':null;}
      catch(_){storageFailed=true;return 'storage';}
    }
    function paint(){
      const why=reason(),checkbox=$('analytics-enabled'),label=$('analytics-status');
      if(checkbox){checkbox.checked=!why;checkbox.disabled=!!why&&why!=='optout';}
      if(!label)return;
      label.textContent=why==='local'?'本地预览和 App 不参与网页访问统计。':why==='privacy'?'浏览器已启用隐私保护，本页不发送访问统计。':why==='storage'?'浏览器无法保存随机标识，本页不发送访问统计。':why==='config'?'当前页面未启用访问统计。':why==='optout'?'已关闭此浏览器的访问统计。':awaitReload?'已开启，下次打开或刷新网页后生效。':'已开启。仅使用随机浏览器标识统计访问，不收集邮箱、旅行足迹或笔记。';
    }
    function stop(){
      stopped=true;if(timer!==null){cancel?.(timer);timer=null;}
      controller?.abort();controller=null;
    }
    async function prepare(){
      if(preparing)return preparing;
      preparing=(async()=>{
        if(reason()||stopped)return false;
        const identify=()=>{
          if(reason()||stopped)return false;
          let id=storage.getItem(VISITOR_KEY);
          if(!UUID.test(id||'')){
            id=crypto.randomUUID();if(!UUID.test(id))throw new Error('ANALYTICS_RANDOM_UNAVAILABLE');
            storage.setItem(VISITOR_KEY,id);
          }
          // Read back under the browser lock. Never fingerprint or fall back to
          // a weaker random generator if storage or Web Crypto is unavailable.
          id=storage.getItem(VISITOR_KEY);if(!UUID.test(id||''))throw new Error('ANALYTICS_STORAGE_UNAVAILABLE');
          const event=crypto.randomUUID();if(!UUID.test(event))throw new Error('ANALYTICS_RANDOM_UNAVAILABLE');
          visitorId=id;eventId=event;return true;
        };
        try{return locks?.request?await locks.request('shanhe-analytics-identity-v1',identify):identify();}
        catch(_){storageFailed=true;return false;}
      })();
      const ready=await preparing;if(!ready){stop();paint();}return ready;
    }
    function enqueue(delay){
      if(stopped||reason()||timer!==null||typeof schedule!=='function')return;
      timer=schedule(()=>{timer=null;void flush();},delay);
    }
    async function flush(){
      // Every possible entry point is intentionally best-effort. Analytics
      // never participates in map loading, auth, archive saving or their errors.
      try{
        if(stopped||reason()||inFlight||!await prepare())return;
        if(stopped||reason()||inFlight||sentStatus===status||attempts[status]>=2)return;
        const sending=status;attempts[sending]++;inFlight=true;
        let timeout,retry=false,finished=false;
        try{
          controller=typeof Controller==='function'?new Controller():null;
          const timeoutPromise=new Promise((_,reject)=>{timeout=schedule(()=>{controller?.abort();reject(new Error('ANALYTICS_TIMEOUT'));},timeoutMs);});
          const response=await Promise.race([request(API+'/rest/v1/rpc/shanhe_record_visit',{
            method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},
            credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,
            ...(controller?{signal:controller.signal}:{}),
            body:JSON.stringify({p_event_id:eventId,p_visitor_id:visitorId,p_status:sending})
          }),timeoutPromise]);
          if(response?.ok){sentStatus=sending;finished=true;}
          else retry=response?.status===408||response?.status===429||response?.status>=500;
        }catch(_){retry=true;}
        finally{cancel?.(timeout);controller=null;inFlight=false;}
        if(stopped||reason())return;
        if(status!==sending)enqueue(0);
        else if(!finished&&retry&&attempts[sending]<2)enqueue(retryDelay);
      }catch(_){inFlight=false;}
    }
    function start(){
      if(started)return;started=true;
      try{bindUI();if(reason()){paint();return;}enqueue(initialDelay);}
      catch(_){stop();}
    }
    function setAuthState(signedIn){
      // Keep the first resolved state, not the account or a user's identity.
      // Login/logout later on this page is not an additional page view.
      if(typeof signedIn!=='boolean'||status!==0)return;
      status=signedIn?2:1;if(started&&eventId)enqueue(0);
    }
    function setEnabled(enabled){
      try{
        if(enabled){storage.setItem(OPT_OUT_KEY,'0');awaitReload=true;}
        else{storage.setItem(OPT_OUT_KEY,'1');storage.removeItem(VISITOR_KEY);awaitReload=false;}
        // Re-enabling takes effect next page load, keeping this document's
        // event bound to its original identifier and avoiding duplicate PVs.
        stop();paint();
      }catch(_){storageFailed=true;stop();paint();}
    }
    function bindUI(){
      if(bound)return;bound=true;
      const open=$('analytics-info-button'),close=$('close-analytics'),checkbox=$('analytics-enabled'),dialog=$('analytics-dialog');
      if(open)open.onclick=()=>{paint();dialog?.showModal();};
      if(close)close.onclick=()=>dialog?.close();
      if(checkbox)checkbox.onchange=()=>setEnabled(checkbox.checked);
      if(dialog)dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
      paint();
    }
    function storageChanged(event){
      if(event?.key===OPT_OUT_KEY||event?.key===null){
        if(reason()==='optout'){stop();awaitReload=false;try{storage.removeItem(VISITOR_KEY);}catch(_){}}
        else if(stopped&&!reason())awaitReload=true;
        paint();
      }
    }
    return Object.freeze({start,setAuthState,setEnabled,bindUI,storageChanged,
      getState:()=>({started,enabled:!reason(),awaitReload,status,sentStatus,stopped})});
  }
  const instance=root.document?createAnalytics():null;
  const api=Object.freeze({createAnalytics,VISITOR_KEY,OPT_OUT_KEY,...instance});
  root.ShanheAnalytics=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(instance){
    root.addEventListener?.('storage',instance.storageChanged);
    instance.start();
  }
})(typeof globalThis==='object'?globalThis:this);
