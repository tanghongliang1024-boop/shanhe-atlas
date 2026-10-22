(function(root){
  'use strict';
  root.createShanheCloud=function({getLocalRecords,onRecords,onAccountChange,notify,hasOpenEditor}){
    const $=s=>document.querySelector(s),config=root.SHANHE_CLOUD_CONFIG||{};
    const dialog=$('#cloud-dialog'),message=$('#cloud-message'),form=$('#cloud-auth-form');
    let provider,store,user=null,mode='login',authBusy=false,sessionKnown=false,disposed=false;
    let authSerial=0,sessionGeneration=0,recoveryUserId=null;
    const readyConfig=typeof config.url==='string'&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url)&&typeof config.publishableKey==='string'&&config.publishableKey.startsWith('sb_publishable_');
    const state=()=>store?store.getState():{userId:null,records:{},revision:null,ready:false,busy:false,status:'unconfigured',error:null};
    const say=(text,error=false)=>{message.textContent=text;message.dataset.error=String(error);};
    const localCount=()=>Object.values(getLocalRecords()).filter(r=>r?.visited===true).length;
    function paint(){
      const s=state(),signed=!!s.userId;
      const labels={unconfigured:'云端服务待连接','signed-out':'登录，让足迹随你同行',loading:'正在读取云端足迹',ready:'云端存档已读取',saving:'正在保存到云端…',saved:'已保存到云端',conflict:'云端有更新，暂未保存',error:'云端连接需要重试'};
      $('#cloud-banner').dataset.status=s.status;
      $('#cloud-heading').textContent=labels[s.status]||'云端存档';
      $('#cloud-description').textContent=s.error?.message||(signed?'同一邮箱登录，即可在手机和电脑继续记录。':localCount()?`发现本机 ${localCount()} 条旧足迹。登录后可导入，原备份会保留。`:'用邮箱登录，保存每座城市的首次到访与旅行记忆。');
      $('#cloud-account-btn').textContent=signed?'我的存档':'登录存档';
      $('#cloud-banner-action').textContent=signed?'管理存档':'登录 / 注册';
      $('#cloud-signed-in').hidden=!signed||mode==='recover';
      $('#cloud-auth-area').hidden=signed&&mode!=='recover';
      $('#cloud-account-email').textContent=user?.email||'已登录';
      $('#cloud-import-count').textContent=localCount()?`本机有 ${localCount()} 条旧足迹。只补充云端没有的城市，同城记录以云端为准。`:'本机没有待导入的旧足迹。';
      $('#cloud-import').disabled=s.busy||!s.ready||!localCount();
      $('#cloud-refresh').disabled=s.busy;
      $('#cloud-logout').disabled=s.busy||authBusy;
      $('#cloud-submit').disabled=authBusy||!provider;
      $('#cloud-status-inline').textContent=signed?(s.error?.message||labels[s.status]):'';
    }
    function setMode(next){
      mode=next;
      $('#cloud-login-tab').setAttribute('aria-pressed',String(next==='login'));
      $('#cloud-signup-tab').setAttribute('aria-pressed',String(next==='signup'));
      $('#cloud-tabs').hidden=next==='recover';
      $('#cloud-email-field').hidden=next==='recover';
      $('#cloud-email').required=next!=='recover';
      $('#cloud-password-field').hidden=next==='reset';
      $('#cloud-password').required=next!=='reset';
      $('#cloud-password').minLength=next==='login'?1:8;
      $('#cloud-password').autocomplete=next==='login'?'current-password':'new-password';
      $('#cloud-title').textContent=next==='signup'?'收藏你的第一份云端足迹':next==='reset'?'找回你的云端存档':next==='recover'?'设置新密码':'把足迹带到下一台设备';
      $('#cloud-submit').textContent=next==='signup'?'注册并发送验证邮件':next==='reset'?'发送密码重置邮件':next==='recover'?'保存新密码':'登录云端存档';
      $('#cloud-forgot').hidden=next!=='login';
      $('#cloud-back-login').hidden=!['reset','recover'].includes(next);
      $('#cloud-password').value='';
      say('');paint();
      if(next==='recover'){$('#cloud-signed-in').hidden=true;$('#cloud-auth-area').hidden=false;}
    }
    function open(){paint();if(!provider)say('云端服务还未连接，暂时无法登录或保存。旧足迹仍保留在本机。',true);if(!dialog.open)dialog.showModal();}
    $('#cloud-account-btn').onclick=open;
    $('#cloud-banner-action').onclick=open;
    $('#cloud-close').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>{$('#cloud-password').value='';if(mode!=='recover')setMode('login');});
    $('#cloud-login-tab').onclick=()=>setMode('login');
    $('#cloud-signup-tab').onclick=()=>setMode('signup');
    $('#cloud-forgot').onclick=()=>setMode('reset');
    $('#cloud-back-login').onclick=()=>setMode('login');
    function authError(error){
      const code=String(error?.code||'').toLowerCase();
      if(['invalid_credentials','email_not_confirmed'].includes(code))return code==='email_not_confirmed'?'请先打开注册邮箱中的验证链接，再登录。':'邮箱或密码不正确，请检查后重试。';
      if(/rate|over_email/.test(code))return '请求过于频繁，请稍后再试。';
      if(/weak_password/.test(code))return '请使用至少 8 位的更强密码。';
      if(/email_address_not_authorized|email_provider_disabled/.test(code))return '邮件服务暂未配置完成，请联系网站管理员。';
      return '暂时无法完成，请检查网络后重试。如果验证邮件未到达，请查看垃圾邮件箱。';
    }
    async function applySession(next,event){
      if(disposed)return;
      const changed=!sessionKnown||(next?.id||null)!==(user?.id||null);
      sessionKnown=true;user=next||null;
      if(changed){sessionGeneration++;recoveryUserId=null;if(mode==='recover'){authSerial++;authBusy=false;setMode('login');}}
      const generation=sessionGeneration;
      if(changed){onAccountChange();await store.setUser(user?.id||null);}
      if(generation!==sessionGeneration||(next?.id||null)!==(user?.id||null))return;
      paint();
      if(event==='PASSWORD_RECOVERY'&&user){
        recoveryUserId=user.id;setMode('recover');if(!dialog.open)dialog.showModal();
      }
    }
    form.onsubmit=async event=>{
      event.preventDefault();if(authBusy||!provider)return;
      authBusy=true;const serial=++authSerial,action=mode,email=$('#cloud-email').value.trim(),password=$('#cloud-password').value;
      const recoveryGeneration=sessionGeneration,recoveringAccount=recoveryUserId;
      say('正在处理…');paint();
      const redirect=new URL('./',location.href).href;
      try{
        if(action==='reset'){
          await provider.sendPasswordReset(email,redirect);say('如果这个邮箱已注册，你会收到密码重置邮件。请在此浏览器打开邮件链接。');
        }else if(action==='recover'){
          const recoverySession=await provider.getSession();
          if(serial!==authSerial||recoveryGeneration!==sessionGeneration)return;
          if(!recoveringAccount||recoverySession.user?.id!==recoveringAccount||user?.id!==recoveringAccount){setMode('login');say('登录账号已变化，请重新打开密码重置邮件。',true);return;}
          await provider.updatePassword(password,recoveringAccount);
          if(serial!==authSerial||recoveryGeneration!==sessionGeneration)return;
          recoveryUserId=null;setMode('login');say('密码已更新，可以继续使用云端存档。');
        }else{
          const result=await (action==='signup'?provider.signUp(email,password,redirect):provider.signIn(email,password));
          if(serial!==authSerial)return;
          if(result.user){await applySession(result.user,'SIGNED_IN');say('登录成功，云端存档已开始加载。');}
          else say('请到邮箱完成验证，然后回到这里登录。已经注册过的邮箱可直接尝试登录或找回密码。');
        }
      }catch(error){if(serial===authSerial&&(action!=='recover'||recoveryGeneration===sessionGeneration))say(authError(error),true);}
      finally{if(serial===authSerial){authBusy=false;$('#cloud-password').value='';paint();}}
    };
    $('#cloud-refresh').onclick=async()=>{say('正在读取最新存档…');const r=await store.refresh();say(r.ok?'已读取最新云端足迹。':r.message,!r.ok);};
    $('#cloud-import').onclick=async()=>{
      const s=state();if(!s.ready||s.busy)return;
      try{
        const merged=prepareLocalArchiveImport(getLocalRecords(),s.records);
        if(!merged.added){say('这些城市已经在云端，无需重复导入。原本机备份仍保留。');return;}
        const r=await store.save(merged.records,{expectedRevision:s.revision});
        say(r.ok?`已存入云端 ${merged.added} 条足迹，保留 ${merged.skipped} 条已有云端记录。本机备份未改动。`:r.message,!r.ok);
      }catch(error){say(error.message||'本机旧足迹格式有误，请先导出备份。',true);}
    };
    $('#cloud-logout').onclick=async()=>{
      if(!provider||state().busy)return;
      authBusy=true;paint();
      try{await provider.signOut();await applySession(null,'SIGNED_OUT');setMode('login');say('已退出，云端足迹仍安全保存。');}
      catch(error){say('退出未成功，请检查网络后重试。',true);}
      finally{authBusy=false;paint();}
    };
    function changed(s){onRecords(s.userId?s.records:getLocalRecords());paint();}
    async function start(){
      setMode('login');
      if(!readyConfig||!root.supabase?.createClient){onRecords(getLocalRecords());paint();return;}
      try{
        const client=root.supabase.createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storageKey:'shanhe-cloud-auth-v1'}});
        provider=createSupabaseArchiveProvider(client,{url:config.url,publishableKey:config.publishableKey});
        store=createCloudArchiveStore({transport:provider.transport,onChange:changed});
        provider.onAuthStateChange((event,session)=>{setTimeout(()=>applySession(session.user,event),0);});
        const initial=await provider.getSession();
        if(!sessionKnown)await applySession(initial.user,'INITIAL_SESSION');
        paint();
      }catch(error){say('云端连接失败，请检查网络后刷新页面。',true);paint();}
    }
    window.addEventListener('focus',()=>{if(store&&state().ready&&!state().busy&&!hasOpenEditor()&&!dialog.open)store.refresh();});
    window.addEventListener('storage',event=>{if(event.key==='shanhe-atlas-v1'){if(!state().userId)onRecords(getLocalRecords());paint();}});
    return {
      start,open,getState:state,
      context:()=>({userId:state().userId,revision:state().revision}),
      async save(next,context){
        if(!store||!state().userId){open();return {ok:false,code:'AUTH_REQUIRED',message:'请先登录，再保存这段足迹到云端。'};}
        if(!context||context.userId!==state().userId)return {ok:false,code:'STALE_REQUEST',message:'登录账号已变化，请重新打开城市详情。'};
        return store.save(next,{expectedRevision:context.revision});
      },
      async refresh(){return store?store.refresh():{ok:false,message:'请先登录云端存档。'};}
    };
  };
})(window);
