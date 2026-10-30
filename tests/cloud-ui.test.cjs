'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCloudArchiveStore, prepareLocalArchiveImport } = require('../cloud-store.js');
const { createGuestArchiveStore, SHANHE_GUEST_STORAGE_KEY: GUEST_KEY } = require('../guest-store.js');

const row = (note = '游客记忆') => ({ visited: true, date: '2024-02-29', note });
const clone = value => structuredClone(value);
const user = (id = 'account-a', email = 'a@example.com') => ({ id, email, emailConfirmed: true, emailConfirmedAt: '2026-10-22T06:00:00Z', email_confirmed_at: '2026-10-22T06:00:00Z' });
const deferred = () => { let resolve, reject; const promise = new Promise((done, fail) => { resolve = done; reject = fail; }); return { promise, resolve, reject }; };

function sharedLocks() {
  const tails = new Map();
  return { request(name, action) {
    const result = (tails.get(name) || Promise.resolve()).then(action);
    tails.set(name, result.catch(() => {}));
    return result;
  } };
}

function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    data, failWrite: false,
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { if (this.failWrite) throw new Error('quota'); data.set(key, String(value)); },
    removeItem(key) { if (this.failWrite) throw new Error('quota'); data.delete(key); }
  };
}

class Element {
  constructor(id) {
    this.id = id; this.value = ''; this.hidden = false; this.disabled = false;
    this.required = false; this.minLength = 0; this.maxLength = 524288;
    this.dataset = {}; this.textContent = ''; this.open = false;
    this.attributes = {}; this.listeners = new Map(); this.validationMessage = '';
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  setCustomValidity(value) { this.validationMessage = value; }
  checkValidity() {
    return this.disabled || (!this.validationMessage && (!this.required || !!this.value) &&
      (!this.value || (this.value.length >= this.minLength && this.value.length <= this.maxLength)) &&
      (this.type !== 'email' || !this.value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.value)));
  }
  reportValidity() { return this.checkValidity(); }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; return this.dispatch('close'); }
  async dispatch(type, extra = {}) {
    const event = { target: this, preventDefault() {}, ...extra };
    if (typeof this['on' + type] === 'function') await this['on' + type](event);
    for (const callback of this.listeners.get(type) || []) await callback(event);
  }
}

function makeDocument() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const elements = new Map();
  for (const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
    const tag = match[0], el = new Element(match[1]);
    el.hidden = /\shidden(?:[\s=>])/.test(tag);
    el.required = /\srequired(?:[\s=>])/.test(tag);
    el.disabled = /\sdisabled(?:[\s=>])/.test(tag);
    for (const name of ['type', 'autocomplete']) el[name] = new RegExp(name + '="([^"]*)"').exec(tag)?.[1] || '';
    const min = /minlength="(\d+)"/.exec(tag), max = /maxlength="(\d+)"/.exec(tag);
    if (min) el.minLength = Number(min[1]);
    if (max) el.maxLength = Number(max[1]);
    elements.set(el.id, el);
  }
  const document = {
    querySelector(selector) { assert.match(selector, /^#[\w-]+$/); return elements.get(selector.slice(1)) || null; },
    querySelectorAll(selector) { return selector.split(',').map(id => document.querySelector(id.trim())).filter(Boolean); }
  };
  const form = elements.get('cloud-auth-form');
  form.checkValidity = () => ['cloud-email', 'cloud-password', 'cloud-password-confirm', 'cloud-code'].every(id => !elements.has(id) || elements.get(id).checkValidity());
  form.reportValidity = form.checkValidity;
  return { document, elements };
}

function createHarness(options = {}) {
  const { document, elements } = makeDocument();
  const storage = options.storage || memoryStorage();
  const guest = createGuestArchiveStore({ storage, locks: options.locks || null });
  const events = new Map(), scheduled = [], timers = [];
  let now = Date.now();
  class TestDate extends Date { static now() { return now; } }
  const calls = { signUp: [], signIn: [], resend: [], verify: [], reset: [], read: [], write: [], password: [], notifications: [], accountChanges: 0, views: [] };
  const remote = new Map(Object.entries(options.remote || {}));
  let currentUser = options.initialUser || null, observer;
  const provider = {
    failWrites: 0,
    transport: {
      async read(id) {
        calls.read.push(id);
        if (options.onRead) await options.onRead(id);
        return clone(remote.get(id) || { records: {}, revision: 0 });
      },
      async write(id, payload) {
        calls.write.push({ id, ...clone(payload) });
        if (options.onWrite) await options.onWrite(id, payload);
        if (provider.failWrites > 0) { provider.failWrites--; throw new Error('offline'); }
        const previous = remote.get(id) || { records: {}, revision: 0 };
        if (previous.revision !== payload.expectedRevision) throw Object.assign(new Error('conflict'), { code: 'CONFLICT' });
        const result = { records: clone(payload.records), revision: previous.revision + 1 };
        remote.set(id, result);
        return clone(result);
      }
    },
    async getSession() { return options.onGetSession ? options.onGetSession(currentUser) : { user: currentUser }; },
    onAuthStateChange(callback) { observer = callback; return () => {}; },
    async signUp(email, password, redirect) {
      calls.signUp.push({ email, password, redirect });
      return options.onSignUp ? options.onSignUp(email) : { user: null };
    },
    async signIn(email, password) {
      calls.signIn.push({ email, password });
      currentUser = options.signInUser || user('account-a', email);
      if (options.emitDuringSignIn) observer('SIGNED_IN', { user: currentUser });
      return { user: currentUser };
    },
    async signOut() { currentUser = null; observer('SIGNED_OUT', { user: null }); },
    async resendConfirmation(email, redirect) {
      calls.resend.push({ email, redirect });
      return options.onResend ? options.onResend(email, redirect) : {};
    },
    async verifyEmailCode(email, code) {
      calls.verify.push({email, code});
      if(options.emitDuringVerify)observer('SIGNED_IN',{user:options.verifyUser||user('account-a',email)});
      if(options.onVerify)return options.onVerify(email,code);
      currentUser=options.verifyUser||user('account-a',email);
      return {user:currentUser};
    },
    async sendPasswordReset(email, redirect) { calls.reset.push({ email, redirect }); },
    async updatePassword(password, id) { calls.password.push({ password, id }); }
  };
  const location = { href: options.href || 'https://example.com/shanhe-atlas/' };
  const window = {
    SHANHE_CLOUD_CONFIG: { url: 'https://test-project.supabase.co', publishableKey: 'sb_publishable_test' },
    supabase: { createClient() { return { auth: { async initialize() {
      return options.onInitialize ? options.onInitialize({ location, emit(event, next) { currentUser = next; observer(event, { user: next }); } }) : { error: null };
    } } }; } },
    localStorage: storage, navigator: { locks: options.locks || null },
    setTimeout(callback, delay) { timers.push({ callback, due: now + delay }); },
    addEventListener(type, callback) {
      if (!events.has(type)) events.set(type, []);
      events.get(type).push(callback);
    }
  };
  const source = fs.readFileSync(path.join(__dirname, '..', 'cloud-ui.js'), 'utf8');
  const install = new Function('window', 'document', 'location', 'localStorage', 'createSupabaseArchiveProvider', 'createCloudArchiveStore', 'createGuestArchiveStore', 'prepareLocalArchiveImport', 'setTimeout', 'Date', source);
  const createGuest = args => createGuestArchiveStore({ ...args, storage, locks: options.locks || null });
  window.createGuestArchiveStore = createGuest;
  window.SHANHE_GUEST_STORAGE_KEY = GUEST_KEY;
  window.createCloudArchiveStore = createCloudArchiveStore;
  window.prepareLocalArchiveImport = prepareLocalArchiveImport;
  window.ShanheRegionMigration = require('../region-migration.js');
  window.ShanhePrefectureMigration = require('../prefecture-migration.js');
  install(window, document, location, storage, () => provider, createCloudArchiveStore, createGuest, prepareLocalArchiveImport, callback => { scheduled.push(callback); }, TestDate);
  const cloud = window.createShanheCloud({
    getLocalRecords: () => clone(options.oldRecords || {}),
    onRecords: records => calls.views.push(clone(records)),
    onAccountChange: () => calls.accountChanges++,
    notify(message) { calls.notifications.push(message); }, hasOpenEditor: () => options.hasOpenEditor?.() || false,
    regionMigration: options.regionMigration, cityMigration: options.cityMigration, prefectureMigration: options.prefectureMigration, companion: options.companion
  });
  const el = id => { const result = elements.get(id); assert.ok(result, 'Missing element #' + id); return result; };
  const fill = (email = 'a@example.com', password = 'long-password', confirm = password) => {
    el('cloud-email').value = email;
    el('cloud-password').value = password;
    if (elements.has('cloud-password-confirm')) el('cloud-password-confirm').value = confirm;
  };
  return {
    cloud, guest, storage, provider, calls, remote, el, fill,
    storedGuest: () => JSON.parse(storage.getItem(GUEST_KEY) || '{"version":1,"records":{},"revision":0}'),
    click: id => el(id).dispatch('click'),
    submit: () => el('cloud-auth-form').dispatch('submit'),
    async emit(event, next) { currentUser = next; observer(event, { user: next }); },
    advance(milliseconds) {
      now += milliseconds;
      for (let index = timers.length - 1; index >= 0; index--) if (timers[index].due <= now) timers.splice(index, 1)[0].callback();
    },
    async flush() {
      for (let index = 0; index < 30; index++) {
        for (const callback of scheduled.splice(0)) callback();
        await new Promise(resolve => setImmediate(resolve));
        if (!scheduled.length && index > 1) break;
      }
    },
    async windowEvent(type, event) { for (const callback of events.get(type) || []) await callback(event); }
  };
}

async function saveGuest(h, records) {
  const result = await h.cloud.save(records, h.cloud.context());
  assert.equal(result.ok, true);
  assert.equal(result.guest, true);
}

function assertLoginMode(h) {
  assert.equal(h.el('cloud-login-tab').getAttribute('aria-pressed'), 'true');
  assert.equal(h.el('cloud-signup-tab').getAttribute('aria-pressed'), 'false');
  assert.equal(h.el('cloud-confirm-field').hidden, true);
  assert.equal(h.el('cloud-password-confirm').required, false);
  assert.equal(h.el('cloud-password-confirm').disabled, true);
  assert.equal(h.el('cloud-password').autocomplete, 'current-password');
  assert.equal(h.el('cloud-password').minLength, 1);
  assert.equal(h.el('cloud-forgot').hidden, false);
  assert.equal(h.el('cloud-submit').textContent, '登录并保存到云端');
}

const prefectureManifest={version:1,mappings:{'441302':{targetId:'441300',verified:true,source:'https://example.gov/city'},'441303':{targetId:'441300',verified:true,source:'https://example.gov/city'},'110112':{targetId:'110000',verified:true,source:'https://example.gov/beijing'}}};
test('v4 prefecture guest upgrade selects earliest date and saved cancellation cannot revive from history or old transfer backup',async()=>{
  const original={'441302':{...row('later'),date:'2024-05-01'},'441303':{...row('earliest'),date:'2010-01-01'}};
  const raw=JSON.stringify({version:4,revision:4,records:original}),storage=memoryStorage({'shanhe-atlas-guest-v4':raw});
  const h=createHarness({storage,prefectureMigration:prefectureManifest});await h.cloud.start();
  assert.equal(h.cloud.getState().records['441300'].note,'earliest');assert.equal(h.cloud.getState().records['441302'].note,'later');
  await saveGuest(h,{'441302':original['441302']});
  const next=createHarness({storage,prefectureMigration:prefectureManifest});await next.cloud.start();assert.deepEqual(next.cloud.getState().records,{'441302':original['441302']});
  await next.click('cloud-account-btn');next.fill();await next.submit();
  assert.deepEqual(next.remote.get('account-a').records,{'441302':original['441302']});assert.equal(storage.getItem('shanhe-atlas-guest-v4'),raw);
});

test('legacy pending county intent upgrades once, preserves original bytes and clears only the matching migrated guest snapshot',async()=>{
  const source={'441302':{...row('later'),date:'2024-05-01'},'441303':{...row('early'),date:'2010-01-01'}},snapshot={records:source,revision:6};
  const oldIntent=JSON.stringify({version:1,id:'pending-v4',email:'a@example.com',snapshot}),oldGuest=JSON.stringify({version:4,...snapshot});
  const storage=memoryStorage({'shanhe-cloud-transfer-v1':oldIntent,'shanhe-atlas-guest-v4':oldGuest});
  const h=createHarness({storage,prefectureMigration:prefectureManifest,initialUser:user()});await h.cloud.start();
  assert.deepEqual(h.remote.get('account-a').records,{'441300':source['441303'],'441302':source['441302']});
  assert.equal(storage.getItem('shanhe-cloud-transfer-v1'),oldIntent);assert.equal(storage.getItem('shanhe-atlas-guest-v4'),oldGuest);
  assert.equal(storage.getItem('shanhe-cloud-transfer-v2'),'null');assert.deepEqual(h.storedGuest().records,{});
  const remaining={'441302':source['441302']};assert.equal((await h.cloud.save(remaining,h.cloud.context())).ok,true);
  const reopened=createHarness({storage,prefectureMigration:prefectureManifest,initialUser:user(),remote:Object.fromEntries(h.remote)});await reopened.cloud.start();
  assert.deepEqual(reopened.cloud.getState().records,remaining);assert.equal(reopened.calls.write.length,0);
});

test('legacy intent for a different email remains untouched and local quota failure cannot send an unversioned archive',async()=>{
  const snapshot={records:{'441302':row()},revision:2},oldIntent=JSON.stringify({version:1,id:'pending-a',email:'a@example.com',snapshot});
  const storage=memoryStorage({'shanhe-cloud-transfer-v1':oldIntent});
  const other=createHarness({storage,prefectureMigration:prefectureManifest,initialUser:user('account-b','b@example.com')});await other.cloud.start();
  assert.equal(other.calls.write.length,0);assert.equal(storage.getItem('shanhe-cloud-transfer-v2'),null);
  storage.failWrite=true;
  const same=createHarness({storage,prefectureMigration:prefectureManifest,initialUser:user()});await same.cloud.start();
  assert.equal(same.calls.write.length,0);assert.equal(storage.getItem('shanhe-cloud-transfer-v1'),oldIntent);assert.match(same.el('cloud-transfer-status').textContent,/无法保留新版转存请求/);
});

test('account change while legacy intent upgrade waits for a lock cannot upload or clear the former account draft',async()=>{
  const snapshot={records:{'441302':row()},revision:2},oldIntent=JSON.stringify({version:1,id:'pending-a-lock',email:'a@example.com',snapshot});
  const storage=memoryStorage({'shanhe-cloud-transfer-v1':oldIntent,'shanhe-atlas-guest-v4':JSON.stringify({version:4,...snapshot})}),locks=sharedLocks(),gate=deferred();
  const holding=locks.request('shanhe-cloud-transfer-intent-v1',()=>gate.promise);
  const h=createHarness({storage,locks,prefectureMigration:prefectureManifest,initialUser:user()});
  const starting=h.cloud.start();await h.flush();
  await h.emit('SIGNED_IN',user('account-b','b@example.com'));await h.flush();gate.resolve();await holding;await starting;await h.flush();
  assert.equal(h.cloud.getState().userId,'account-b');assert.equal(h.calls.write.length,0);assert.equal(storage.getItem('shanhe-cloud-transfer-v2'),null);assert.equal(storage.getItem('shanhe-cloud-transfer-v1'),oldIntent);
});

test('explicit old-city import skips the former government-seat detour and preserves a differing existing city',async()=>{
  const old={'110000':row('original Beijing'),'441302':row('Huicheng')};
  const forward={version:1,mappings:{'110000':{targetId:'110112',verified:true,source:'https://example.gov/office'}}};
  const h=createHarness({initialUser:user(),prefectureMigration:prefectureManifest,regionMigration:forward,oldRecords:old,remote:{'account-a':{revision:3,records:{'110000':row('cloud Beijing')}}}});await h.cloud.start();await h.click('cloud-import');
  assert.deepEqual(h.remote.get('account-a').records,{'110000':row('cloud Beijing'),'441300':old['441302']});assert.equal(h.remote.get('account-a').records['110112'],undefined);
});

test('landmark companion starts on the same auth client and binds intent before login or registration', async () => {
  for(const signup of [false,true]){
    const intents=[],started=[],gate=deferred();
    const h=createHarness({companion:{start(client){started.push(client);},async rememberIntent(email){intents.push(email);await gate.promise;}}});
    await h.cloud.start();assert.equal(started.length,1);assert.ok(started[0]);
    if(signup)await h.click('cloud-signup-tab');
    h.fill('a@example.com');const pending=h.submit();
    assert.deepEqual(intents,['a@example.com']);assert.equal(h.calls.signIn.length+h.calls.signUp.length,0);
    gate.resolve();await pending;
    assert.equal(signup?h.calls.signUp.length:h.calls.signIn.length,1);
  }
});

test('both save-to-cloud entries default to login, allow signup, and return to login after reopening', async () => {
  for (const entry of ['cloud-account-btn', 'cloud-banner-action']) {
    const h = createHarness();
    await h.cloud.start();
    assertLoginMode(h);
    await h.click(entry);
    assert.equal(h.el('cloud-dialog').open, true);
    assertLoginMode(h);
    await h.click('cloud-signup-tab');
    assert.equal(h.el('cloud-signup-tab').getAttribute('aria-pressed'), 'true');
    assert.equal(h.el('cloud-confirm-field').hidden, false);
    assert.equal(h.el('cloud-password-confirm').required, true);
    assert.equal(h.el('cloud-password-confirm').disabled, false);
    assert.equal(h.el('cloud-password').autocomplete, 'new-password');
    assert.equal(h.el('cloud-password').minLength, 8);
    assert.equal(h.el('cloud-submit').textContent, '注册并保存到云端');
    h.fill();
    await h.click('cloud-close');
    assertLoginMode(h);
    assert.equal(h.el('cloud-password').value, '');
    assert.equal(h.el('cloud-password-confirm').value, '');
    await h.click(entry);
    assertLoginMode(h);
    assert.equal(h.calls.signIn.length, 0);
    assert.equal(h.calls.signUp.length, 0);
    assert.equal(h.calls.write.length, 0);
  }
});

test('legacy guest county mappings are applied once while current cloud archives are already upgraded', async () => {
  const mapping={version:1,mappings:{'110000':{targetId:'110112',verified:true,source:'https://example.gov.cn/office'}}};
  const raw=JSON.stringify({version:1,records:{'110000':row('旧城记录')},revision:3});
  const storage=memoryStorage({'shanhe-atlas-guest-v1':raw});
  const h=createHarness({storage,regionMigration:mapping});
  await h.cloud.start();
  assert.deepEqual(h.cloud.getState().records,{'110112':row('旧城记录')});
  assert.deepEqual(h.calls.views.at(-1),{'110112':row('旧城记录')});
  assert.equal(storage.getItem('shanhe-atlas-guest-v1'),raw);
  const signed=createHarness({regionMigration:mapping,initialUser:user(),remote:{'account-a':{records:{'110112':row('云端旧城')},revision:9}}});
  await signed.cloud.start();
  assert.deepEqual(signed.calls.views.at(-1),{'110112':row('云端旧城')});
  assert.equal(signed.cloud.getState().revision,9); assert.equal(signed.calls.write.length,0);
});

test('legacy local import preserves a government-seat collision as a separate pending old-city record', async () => {
  const mapping={version:1,mappings:{'110000':{targetId:'110112',verified:true,source:'https://example.gov.cn/office'}}};
  const h=createHarness({regionMigration:mapping,oldRecords:{'110000':row('旧记忆')},initialUser:user(),remote:{'account-a':{records:{'110112':row('已有县区')},revision:4}}});
  await h.cloud.start(); await h.click('cloud-import');
  assert.deepEqual(h.remote.get('account-a').records,{'110000':row('旧记忆'),'110112':row('已有县区')});
});

test('registration rejects unequal passwords before any provider request; mode changes clear validation', async () => {
  const h = createHarness();
  await h.cloud.start();
  await h.click('cloud-signup-tab');
  h.fill('a@example.com', 'first-password', 'second-password');
  await h.submit();
  assert.equal(h.calls.signUp.length, 0);
  assert.ok(h.el('cloud-password-confirm').validationMessage);
  assert.equal(h.el('cloud-password-confirm').required, true);
  assert.equal(h.el('cloud-password-confirm').disabled, false);
  await h.click('cloud-login-tab');
  assert.equal(h.el('cloud-password-confirm').required, false);
  assert.equal(h.el('cloud-password-confirm').disabled, true);
  assert.equal(h.el('cloud-password-confirm').validationMessage, '');
  assert.equal(h.el('cloud-password-confirm').value, '');
  await h.click('cloud-forgot');
  assert.equal(h.el('cloud-password').required, false);
  assert.equal(h.el('cloud-password').disabled, true);
  assert.equal(h.el('cloud-password-confirm').disabled, true);
  assert.equal(h.el('cloud-email').required, true);
  assert.equal(h.el('cloud-email').disabled, false);
  await h.click('cloud-back-login');
  assert.equal(h.el('cloud-password').required, true);
  assert.equal(h.el('cloud-password').disabled, false);
  await h.click('cloud-signup-tab');
  h.fill();
  await h.submit();
  assert.equal(h.calls.signUp.length, 1);
});

test('signup awaiting email verification closes the form, announces success, and preserves the temporary archive', async () => {
  const h = createHarness();
  await h.cloud.start();
  const draft = { '110000': row('尚待验证的草稿') };
  await saveGuest(h, draft);
  await h.click('cloud-account-btn');
  await h.click('cloud-signup-tab');
  h.fill();
  await h.submit();
  assert.equal(h.el('cloud-dialog').open, false);
  assert.equal(h.el('cloud-password').value, '');
  assert.equal(h.el('cloud-password-confirm').value, '');
  assert.equal(h.calls.notifications.length, 1);
  assert.match(h.calls.notifications[0], /注册提交成功.*邮箱.*验证/);
  assert.doesNotMatch(h.calls.notifications[0], /已登录|已保存到云端/);
  assert.equal(h.cloud.getState().guest, true);
  assert.deepEqual(h.storedGuest().records, draft);
  assert.deepEqual(JSON.parse(h.storage.getItem('shanhe-cloud-transfer-v2')).snapshot.records, draft);
  assert.equal(h.calls.write.length, 0);
  await h.cloud.refresh();
  assert.match(h.el('cloud-heading').textContent, /注册已提交.*尚待验证/);
  assert.match(h.el('cloud-description').textContent, /临时足迹仍保留/);
});

test('signup with an immediate session closes the form and transfers the draft only once despite an earlier auth event', async () => {
  const gate = deferred(), h = createHarness({ onSignUp: () => gate.promise });
  await h.cloud.start();
  const draft = { '110000': row('直接登录的草稿') };
  await saveGuest(h, draft);
  await h.click('cloud-account-btn');
  await h.click('cloud-signup-tab');
  h.fill();
  const submitting = h.submit();
  await h.flush();
  await h.emit('SIGNED_IN', user());
  await h.flush();
  gate.resolve({ user: user() });
  await submitting;
  await h.flush();
  assert.equal(h.el('cloud-dialog').open, false);
  assert.match(h.calls.notifications.at(-1), /注册成功.*已登录/);
  assert.equal(h.calls.notifications.filter(text => /注册成功/.test(text)).length, 1);
  assert.equal(h.cloud.getState().userId, 'account-a');
  assert.equal(h.calls.write.length, 1);
  assert.deepEqual(h.remote.get('account-a').records, draft);
  assert.deepEqual(h.storedGuest().records, {});
  assert.equal(h.storage.getItem('shanhe-cloud-transfer-v2'), 'null');
  assert.equal(h.el('cloud-password').value, '');
  assert.equal(h.el('cloud-password-confirm').value, '');
});

test('failed signup leaves its form open without a success announcement and keeps the draft', async () => {
  const h = createHarness({ onSignUp: async () => { throw Object.assign(new Error('rate limited'), { code: 'over_email_send_rate_limit' }); } });
  await h.cloud.start();
  const draft = { '110000': row('注册失败后的草稿') };
  await saveGuest(h, draft);
  await h.click('cloud-account-btn');
  await h.click('cloud-signup-tab');
  h.fill();
  await h.submit();
  assert.equal(h.el('cloud-dialog').open, true);
  assert.equal(h.el('cloud-message').dataset.error, 'true');
  assert.match(h.el('cloud-message').textContent, /请求过于频繁/);
  assert.deepEqual(h.calls.notifications, []);
  assert.doesNotMatch(h.el('cloud-heading').textContent, /注册提交成功/);
  assert.deepEqual(h.storedGuest().records, draft);
  assert.equal(h.calls.write.length, 0);
  assert.equal(h.el('cloud-submit').disabled, false);
});

test('successful signup still closes when cloud loading or transfer fails without claiming the draft was saved', async () => {
  for (const failure of ['read', 'write']) {
    const h = createHarness({
      onSignUp: async () => ({ user: user() }),
      ...(failure === 'read' ? { onRead: async () => { throw new Error('offline'); } } : {})
    });
    if (failure === 'write') h.provider.failWrites = 1;
    await h.cloud.start();
    const draft = { '110000': row('等待云端重试的草稿') };
    await saveGuest(h, draft);
    await h.click('cloud-account-btn');
    await h.click('cloud-signup-tab');
    h.fill();
    await h.submit();
    assert.equal(h.el('cloud-dialog').open, false, failure);
    assert.match(h.calls.notifications.at(-1), /注册成功.*已登录/);
    assert.match(h.calls.notifications.at(-1), /重试/);
    assert.doesNotMatch(h.calls.notifications.at(-1), /已保存到云端/);
    assert.deepEqual(h.storedGuest().records, draft);
    assert.ok(h.storage.getItem('shanhe-cloud-transfer-v2'));
    assert.match(h.el('cloud-description').textContent, /重试|失败|保留/);
    assert.equal(h.remote.has('account-a'), false);
  }
});

test('late signup completion cannot close or overwrite a form reopened by the user', async () => {
  for (const outcome of ['pending-verification', 'session', 'failure']) {
    const gate = deferred(), h = createHarness({ onSignUp: () => gate.promise });
    await h.cloud.start();
    await h.click('cloud-account-btn');
    await h.click('cloud-signup-tab');
    h.fill();
    const submitting = h.submit();
    await h.flush();
    assert.equal(h.calls.signUp.length, 1);
    await h.click('cloud-close');
    await h.click('cloud-account-btn');
    const reopenedMessage = h.el('cloud-message').textContent;
    if (outcome === 'failure') gate.reject(new Error('late network error'));
    else gate.resolve({ user: outcome === 'session' ? user() : null });
    await submitting;
    await h.flush();
    assert.equal(h.el('cloud-dialog').open, true, outcome);
    assert.equal(h.el('cloud-message').textContent, reopenedMessage, outcome);
    assert.deepEqual(h.calls.notifications, [], outcome);
    assert.equal(h.cloud.getState().userId, outcome === 'session' ? 'account-a' : null);
  }
});

test('ordinary login and password reset or recovery retain their existing open-dialog flow', async () => {
  for (const action of ['login', 'reset', 'recover']) {
    const h = createHarness(action === 'recover' ? { initialUser: user() } : {});
    await h.cloud.start();
    if (action === 'recover') {
      await h.emit('PASSWORD_RECOVERY', user());
      await h.flush();
    } else {
      await h.click('cloud-account-btn');
      await h.click('cloud-login-tab');
      if (action === 'reset') await h.click('cloud-forgot');
    }
    h.fill();
    await h.submit();
    assert.equal(h.el('cloud-dialog').open, true, action);
    assert.equal(h.calls.notifications.some(text => /注册/.test(text)), false, action);
    assert.match(h.el('cloud-message').textContent, action === 'login' ? /已登录/ : action === 'reset' ? /密码重置邮件/ : /密码已更新/);
  }
});

test('guest saving and reload work without login, while old local archives remain separate', async () => {
  const oldRecords = { '310000': row('旧备份') }, storage = memoryStorage({ 'shanhe-atlas-v1': JSON.stringify(oldRecords) });
  const h = createHarness({ storage, oldRecords });
  await h.cloud.start();
  assert.equal(h.cloud.getState().guest, true);
  assert.deepEqual(h.cloud.getState().records, {});
  await saveGuest(h, { '110000': row() });
  assert.equal(h.calls.write.length, 0);
  assert.equal(h.calls.signIn.length, 0);
  const next = createHarness({ storage, oldRecords });
  await next.cloud.start();
  assert.deepEqual(next.cloud.getState().records, { '110000': row() });
  assert.deepEqual(JSON.parse(storage.getItem('shanhe-atlas-v1')), oldRecords);
});

test('signup intent transfers to its matching account while different same-region draft records remain recoverable', async () => {
  const h = createHarness();
  await h.cloud.start();
  const draft = { '110000': row('游客北京'), '710000': row('台湾旧记录') };
  await saveGuest(h, draft);
  await h.click('cloud-signup-tab');
  h.fill('A@EXAMPLE.COM');
  await h.submit();
  assert.equal(h.calls.write.length, 0);
  assert.deepEqual(h.storedGuest().records, draft);
  const afterVerification = createHarness({
    storage: h.storage, initialUser: user(),
    remote: { 'account-a': { records: { '110000': row('云端北京') }, revision: 4 } }
  });
  await afterVerification.cloud.start();
  await afterVerification.flush();
  assert.equal(afterVerification.calls.write.length, 1);
  assert.equal(afterVerification.calls.write[0].expectedRevision, 4);
  assert.deepEqual(afterVerification.remote.get('account-a').records, {
    '110000': row('云端北京'), '710000': row('台湾旧记录')
  });
  assert.deepEqual(afterVerification.storedGuest().records, draft);
  assert.match(afterVerification.el('cloud-transfer-status').textContent, /内容不同.*完整保留/);
});

test('a restored existing session without an explicit transfer intent cannot inherit guest or old data', async () => {
  const draft = { '110000': row() }, oldRecords = { '310000': row('旧备份') };
  const storage = memoryStorage({ [GUEST_KEY]: JSON.stringify({ version: 5, records: draft, revision: 2 }) });
  const h = createHarness({ storage, oldRecords, initialUser: user(), remote: { 'account-a': { records: {}, revision: 0 } } });
  await h.cloud.start();
  await h.flush();
  assert.equal(h.calls.write.length, 0);
  assert.deepEqual(h.cloud.getState().records, {});
  assert.deepEqual(h.storedGuest().records, draft);
});

test('cloud failure keeps the draft and a manual retry imports once after refreshing the cloud', async () => {
  const h = createHarness();
  await h.cloud.start();
  const draft = { '110000': row() };
  await saveGuest(h, draft);
  h.provider.failWrites = 1;
  await h.click('cloud-login-tab');
  h.fill();
  await h.submit();
  await h.flush();
  assert.equal(h.calls.write.length, 1);
  assert.deepEqual(h.storedGuest().records, draft);
  assert.equal(h.remote.has('account-a'), false);
  await h.click('cloud-transfer-retry');
  await h.flush();
  assert.equal(h.calls.write.length, 2);
  assert.ok(h.calls.read.length >= 2);
  assert.deepEqual(h.remote.get('account-a').records, draft);
  assert.deepEqual(h.storedGuest().records, {});
});

test('passive login to another account cannot take a pending signup draft; a later explicit submission may choose it', async () => {
  const h = createHarness({ signInUser: user('account-b', 'b@example.com') });
  await h.cloud.start();
  const draft = { '110000': row('A注册前的草稿') };
  await saveGuest(h, draft);
  await h.click('cloud-signup-tab');
  h.fill('a@example.com');
  await h.submit();
  await h.emit('SIGNED_IN', user('account-b', 'b@example.com'));
  await h.flush();
  assert.equal(h.calls.write.length, 0);
  assert.deepEqual(h.storedGuest().records, draft);
  await h.click('cloud-logout');
  await h.flush();
  await h.click('cloud-login-tab');
  h.fill('b@example.com');
  await h.submit();
  await h.flush();
  assert.equal(h.calls.write.length, 1);
  assert.equal(h.calls.write[0].id, 'account-b');
  assert.deepEqual(h.remote.get('account-b').records, draft);
});

test('duplicate initial and signed-in events do not start simultaneous transfer writes', async () => {
  const h = createHarness({ emitDuringSignIn: true });
  await h.cloud.start();
  await saveGuest(h, { '110000': row() });
  await h.click('cloud-login-tab');
  h.fill();
  await h.submit();
  await h.emit('INITIAL_SESSION', user());
  await h.emit('SIGNED_IN', user());
  await h.emit('TOKEN_REFRESHED', user());
  await h.flush();
  assert.equal(h.calls.write.length, 1);
  assert.deepEqual(h.storedGuest().records, {});
});

test('draft edits during a pending cloud write survive post-upload cleanup', async () => {
  const gate = deferred();
  const h = createHarness({ onWrite: () => gate.promise });
  await h.cloud.start();
  const original = { '110000': row('开始上传') };
  await saveGuest(h, original);
  await h.click('cloud-login-tab');
  h.fill();
  const signingIn = h.submit();
  await h.flush();
  assert.equal(h.calls.write.length, 1);
  await h.guest.refresh();
  const later = { ...original, '310000': row('另一个标签页新增') };
  await h.guest.save(later, { expectedRevision: h.guest.getState().revision });
  gate.resolve();
  await signingIn;
  await h.flush();
  assert.deepEqual(h.remote.get('account-a').records, original);
  assert.deepEqual(h.storedGuest().records, later);
  await h.click('cloud-transfer-retry');
  await h.flush();
  assert.equal(h.calls.write.length, 2);
  assert.deepEqual(h.remote.get('account-a').records, later);
  assert.deepEqual(h.storedGuest().records, {});
});

test('a late write from account A cannot replace account B display or clear B pending draft', async () => {
  const gate = deferred();
  const h = createHarness({ onWrite: () => gate.promise });
  await h.cloud.start();
  const original = { '110000': row('A上传中的记录') };
  await saveGuest(h, original);
  await h.click('cloud-login-tab');
  h.fill();
  const signingIn = h.submit();
  await h.flush();
  await h.emit('SIGNED_IN', user('account-b', 'b@example.com'));
  await h.flush();
  gate.resolve();
  await signingIn;
  await h.flush();
  assert.equal(h.cloud.getState().userId, 'account-b');
  assert.deepEqual(h.cloud.getState().records, {});
  assert.deepEqual(h.storedGuest().records, original);
  assert.equal(h.calls.write.length, 1);
});

test('successful cloud upload followed by local cleanup failure retains the draft and retries without another cloud write', async () => {
  let h;
  h = createHarness({ onWrite: () => { h.storage.failWrite = true; } });
  await h.cloud.start();
  const draft = { '110000': row('云端已保存但本机暂不能清理') };
  await saveGuest(h, draft);
  await h.click('cloud-login-tab');
  h.fill();
  await h.submit();
  await h.flush();
  assert.equal(h.calls.write.length, 1);
  assert.deepEqual(h.remote.get('account-a').records, draft);
  assert.deepEqual(h.storedGuest().records, draft);
  h.storage.failWrite = false;
  await h.click('cloud-transfer-retry');
  await h.flush();
  assert.equal(h.calls.write.length, 1);
  assert.deepEqual(h.storedGuest().records, {});
});

test('an account switch while successful-upload cleanup waits for a lock preserves the pending guest archive', async () => {
  const locks = sharedLocks(), writing = deferred(), locked = deferred();
  const h = createHarness({ locks, onWrite: () => writing.promise });
  await h.cloud.start();
  const draft = { '110000': row('等待清理时换号') };
  await saveGuest(h, draft);
  await h.click('cloud-login-tab');
  h.fill();
  const signingIn = h.submit();
  await h.flush();
  const holding = locks.request('shanhe-guest-archive-v1', () => locked.promise);
  writing.resolve();
  await h.flush();
  assert.equal(h.remote.get('account-a').records['110000'].note, draft['110000'].note);
  await h.emit('SIGNED_IN', user('account-b', 'b@example.com'));
  await h.flush();
  locked.resolve();
  await holding;
  await signingIn;
  await h.flush();
  assert.equal(h.cloud.getState().userId, 'account-b');
  assert.deepEqual(h.cloud.getState().records, {});
  assert.deepEqual(h.storedGuest().records, draft);
});

test('queued guest saving cannot publish guest records into a newly signed-in account', async () => {
  const locks = sharedLocks(), gate = deferred();
  const h = createHarness({ locks, remote: { 'account-b': { records: { '310000': row('B云端') }, revision: 3 } } });
  await h.cloud.start();
  const holding = locks.request('shanhe-guest-archive-v1', () => gate.promise);
  const saving = h.cloud.save({ '110000': row('登录前提交') }, h.cloud.context());
  await h.emit('SIGNED_IN', user('account-b', 'b@example.com'));
  await h.flush();
  gate.resolve();
  await holding;
  assert.equal((await saving).code, 'STALE_REQUEST');
  await h.flush();
  assert.equal(h.cloud.getState().userId, 'account-b');
  assert.deepEqual(h.calls.views.at(-1), { '310000': row('B云端') });
  assert.deepEqual(h.storedGuest().records, { '110000': row('登录前提交') });
  assert.equal(h.calls.write.length, 0);
});

test('signed-in editing and logout do not copy cloud records into the separate guest archive', async () => {
  const draft = { '110000': row('未转存游客') };
  const storage = memoryStorage({ [GUEST_KEY]: JSON.stringify({ version: 5, records: draft, revision: 5 }) });
  const h = createHarness({ storage, initialUser: user(), remote: { 'account-a': { records: { '310000': row('云端') }, revision: 3 } } });
  await h.cloud.start();
  const context = h.cloud.context();
  const result = await h.cloud.save({ '310000': row('云端修改') }, context);
  assert.equal(result.ok, true);
  assert.deepEqual(h.storedGuest().records, draft);
  await h.click('cloud-logout');
  await h.flush();
  assertLoginMode(h);
  await h.click('cloud-account-btn');
  assertLoginMode(h);
  assert.deepEqual(h.cloud.getState().records, draft);
  assert.equal((await h.cloud.save({ '310000': row('旧云端表单') }, context)).code, 'STALE_REQUEST');
  assert.deepEqual(h.storedGuest().records, draft);
});

test('password recovery disables the hidden email and requires matching new passwords', async () => {
  const h = createHarness({ initialUser: user() });
  await h.cloud.start();
  await h.emit('PASSWORD_RECOVERY', user());
  await h.flush();
  await h.click('cloud-close');
  await h.click('cloud-account-btn');
  assert.equal(h.el('cloud-title').textContent, '设置新密码');
  assert.equal(h.el('cloud-email').required, false);
  assert.equal(h.el('cloud-email').disabled, true);
  assert.equal(h.el('cloud-password-confirm').required, true);
  assert.equal(h.el('cloud-password-confirm').disabled, false);
  h.fill('', 'new-long-password', 'mismatched-password');
  await h.submit();
  assert.equal(h.calls.password.length, 0);
  h.fill('', 'new-long-password');
  await h.submit();
  assert.deepEqual(h.calls.password, [{ password: 'new-long-password', id: 'account-a' }]);
  assert.equal(h.el('cloud-password-confirm').disabled, true);
  assert.equal(h.el('cloud-password-confirm').validationMessage, '');
  assert.equal(h.el('cloud-email').required, true);
});

test('an old form waiting for the transfer-intent lock cannot sign in or overwrite a newer account intent', async () => {
  const locks = sharedLocks(), gate = deferred();
  const h = createHarness({ locks });
  await h.cloud.start();
  const draft = { '110000': row('草稿') };
  await saveGuest(h, draft);
  const holding = locks.request('shanhe-cloud-transfer-intent-v1', () => gate.promise);
  await h.click('cloud-login-tab');
  h.fill('a@example.com');
  const submitting = h.submit();
  await h.flush();
  await h.emit('SIGNED_IN', user('account-b', 'b@example.com'));
  await h.flush();
  const newerIntent = JSON.stringify({ version: 2, id: 'new-b-intent', email: 'b@example.com', snapshot: { records: draft, revision: 1 } });
  h.storage.setItem('shanhe-cloud-transfer-v2', newerIntent);
  gate.resolve();
  await holding;
  await submitting;
  await h.flush();
  assert.equal(h.calls.signIn.length, 0);
  assert.equal(h.calls.signUp.length, 0);
  assert.equal(h.cloud.getState().userId, 'account-b');
  assert.equal(h.storage.getItem('shanhe-cloud-transfer-v2'), newerIntent);
  assert.deepEqual(h.storedGuest().records, draft);
});

test('late signup confirmation, session, or error cannot replace or close the new account display', async () => {
  for (const outcome of ['pending-verification', 'session', 'failure']) {
    const gate = deferred();
    const h = createHarness({ onSignUp: () => gate.promise });
    await h.cloud.start();
    await saveGuest(h, { '110000': row() });
    await h.click('cloud-account-btn');
    await h.click('cloud-signup-tab');
    h.fill('a@example.com');
    const submitting = h.submit();
    await h.flush();
    assert.equal(h.calls.signUp.length, 1);
    await h.emit('SIGNED_IN', user('account-b', 'b@example.com'));
    await h.flush();
    const accountMessage = h.el('cloud-message').textContent;
    if (outcome === 'failure') gate.reject(new Error('late signup failure'));
    else gate.resolve({ user: outcome === 'session' ? user() : null });
    await submitting;
    await h.flush();
    assert.equal(h.cloud.getState().userId, 'account-b');
    assert.equal(h.el('cloud-message').textContent, accountMessage);
    assert.equal(h.el('cloud-dialog').open, true);
    assert.deepEqual(h.calls.notifications, []);
    assert.equal(h.calls.write.length, 0);
  }
});

test('another tab update during editing cannot pair old visible records with a new revision in the next form', async () => {
  let editorOpen = false;
  const h = createHarness({ hasOpenEditor: () => editorOpen });
  await h.cloud.start();
  await saveGuest(h, { '110000': row('原有城市') });
  editorOpen = true;
  const oldContext = h.cloud.context();
  await h.guest.refresh();
  await h.guest.save({ ...h.guest.getState().records, '310000': row('其他页面新增') }, { expectedRevision: h.guest.getState().revision });
  await h.windowEvent('storage', { key: GUEST_KEY });
  assert.equal((await h.cloud.save({ '110000': row('旧表单编辑') }, oldContext)).code, 'CONFLICT');
  assert.equal(h.storedGuest().records['310000'].note, '其他页面新增');
  editorOpen = false;
  // The app retains the onRecords snapshot for opening its next city form.
  const nextFormRecords = { ...h.calls.views.at(-1), '510100': row('关闭旧表单后新建') };
  const result = await h.cloud.save(nextFormRecords, h.cloud.context());
  assert.equal(result.ok, true);
  assert.deepEqual(Object.keys(h.storedGuest().records).sort(), ['110000', '310000', '510100']);
  assert.equal(h.storedGuest().records['310000'].note, '其他页面新增');
});

const capitalMapping={version:1,mappings:{'world:USA:US-CA':{targetId:'world:USA:city-sacramento',verified:true,source:'https://example.gov/capital'}}};

test('current cloud reads retain old provinces and do not recreate a deleted capital', async () => {
  const source={'world:USA:US-CA':row('conflicting old state'),'world:USA:city-sacramento':row('city')};
  const h=createHarness({cityMigration:capitalMapping,initialUser:user(),remote:{'account-a':{records:source,revision:4}}});
  await h.cloud.start();
  assert.deepEqual(h.cloud.getState().records,source);
  const remaining={'world:USA:US-CA':source['world:USA:US-CA']};
  assert.equal((await h.cloud.save(remaining,h.cloud.context())).ok,true);
  await h.cloud.refresh();
  assert.deepEqual(h.cloud.getState().records,remaining);
  assert.deepEqual(h.remote.get('account-a').records,remaining);
  const afterReload=createHarness({cityMigration:capitalMapping,initialUser:user(),remote:Object.fromEntries(h.remote)});
  await afterReload.cloud.start();
  assert.deepEqual(afterReload.cloud.getState().records,remaining);
  assert.equal(afterReload.calls.write.length,0);
});

test('legacy guest initialization uses capital conversion but the saved v4 snapshot does not repeat it', async () => {
  const raw=JSON.stringify({version:3,revision:3,records:{'world:USA:US-CA':row('state')}});
  const storage=memoryStorage({'shanhe-atlas-guest-v3':raw});
  const h=createHarness({storage,cityMigration:capitalMapping});
  await h.cloud.start();
  assert.deepEqual(h.cloud.getState().records,{'world:USA:city-sacramento':row('state')});
  await saveGuest(h,{'world:USA:US-CA':row('manually retained state')});
  const next=createHarness({storage,cityMigration:capitalMapping});
  await next.cloud.start();
  assert.deepEqual(next.cloud.getState().records,{'world:USA:US-CA':row('manually retained state')});
  assert.equal(storage.getItem('shanhe-atlas-guest-v3'),raw);
});

test('pending transfer uses its current snapshot without capital conversion', async () => {
  const draft={'world:USA:US-CA':row('old conflict retained after deleting capital')};
  const h=createHarness({cityMigration:capitalMapping});
  await h.cloud.start();
  await saveGuest(h,draft);
  await h.click('cloud-signup-tab');
  h.fill();await h.submit();
  const signed=createHarness({storage:h.storage,cityMigration:capitalMapping,initialUser:user()});
  await signed.cloud.start();await signed.flush();
  assert.deepEqual(signed.remote.get('account-a').records,draft);
  assert.equal(signed.remote.get('account-a').records['world:USA:city-sacramento'],undefined);
  assert.deepEqual(signed.storedGuest().records,{});
});

test('explicit old-archive import converts capitals only when their cloud destination is free', async () => {
  const oldRecords={'world:USA:US-CA':row('legacy state')};
  const empty=createHarness({cityMigration:capitalMapping,oldRecords,initialUser:user()});
  await empty.cloud.start();await empty.click('cloud-import');
  assert.deepEqual(empty.remote.get('account-a').records,{'world:USA:city-sacramento':row('legacy state')});
  const occupied=createHarness({cityMigration:capitalMapping,oldRecords,initialUser:user(),remote:{'account-a':{records:{'world:USA:city-sacramento':row('existing city')},revision:2}}});
  await occupied.cloud.start();await occupied.click('cloud-import');
  assert.deepEqual(occupied.remote.get('account-a').records,{'world:USA:city-sacramento':row('existing city'),...oldRecords});
});

const countyAndReversalMapping = {
  version: 1,
  mappings: {
    '440100': require('../assets/geo/county-migration-map.json').mappings['440100'],
    '810001': require('../assets/geo/region-level-reversal-map.json').mappings['810001']
  }
};
const retainedOldRecord = () => ({
  visited: true, date: '2021-02-03', note: '  原地市或旧分区记录\r\n必须完整保留  ', updatedAt: '2026-10-22T07:08:09.000Z'
});

test('Huicheng cancellation persists in cloud and guest storage even with an unmapped old Huizhou record', async () => {
  const manifest=require('../assets/geo/county-migration-map.json');
  assert.equal(manifest.mappings['441300'],undefined);
  const old=retainedOldRecord(),source={'441300':old,'441302':row('惠城区足迹')},remaining={'441300':old};
  const h=createHarness({regionMigration:manifest,initialUser:user(),remote:{'account-a':{records:source,revision:7}}});
  await h.cloud.start();
  assert.equal((await h.cloud.save(remaining,h.cloud.context())).ok,true);
  await h.cloud.refresh();
  assert.deepEqual(h.cloud.getState().records,remaining);
  const next=createHarness({regionMigration:manifest,initialUser:user(),remote:Object.fromEntries(h.remote)});
  await next.cloud.start();
  assert.deepEqual(next.cloud.getState().records,remaining);
  assert.equal(next.calls.write.length,0);
  const storage=memoryStorage({[GUEST_KEY]:JSON.stringify({version:5,revision:7,records:source})});
  const guest=createHarness({storage,regionMigration:manifest});
  await guest.cloud.start();
  await saveGuest(guest,remaining);
  await guest.cloud.refresh();
  assert.deepEqual(guest.cloud.getState().records,remaining);
  const reopened=createHarness({storage,regionMigration:manifest});
  await reopened.cloud.start();
  assert.deepEqual(reopened.cloud.getState().records,remaining);
});

test('current cloud county and reversal conflicts cannot recreate a removed destination after refresh or a new session', async () => {
  for (const [from, mapping] of Object.entries(countyAndReversalMapping.mappings)) {
    const to = mapping.targetId, old = retainedOldRecord(), other = row('无关县区不变');
    const source = { [from]: old, [to]: row('后来保存的目的地区'), '110112': other };
    const h = createHarness({ regionMigration: countyAndReversalMapping, initialUser: user(), remote: { 'account-a': { records: source, revision: 7 } } });
    await h.cloud.start();
    assert.deepEqual(h.cloud.getState().records, source);
    const remaining = { [from]: old, '110112': other };
    assert.equal((await h.cloud.save(remaining, h.cloud.context())).ok, true);
    await h.cloud.refresh();
    assert.deepEqual(h.cloud.getState().records, remaining);
    assert.deepEqual(h.remote.get('account-a').records, remaining);
    assert.equal(h.calls.write.length, 1);
    const next = createHarness({ regionMigration: countyAndReversalMapping, initialUser: user(), remote: Object.fromEntries(h.remote) });
    await next.cloud.start();
    assert.deepEqual(next.cloud.getState().records, remaining);
    assert.equal(next.cloud.getState().records[to], undefined);
    assert.equal(next.calls.write.length, 0);
  }
});

test('current v4 guest county and reversal conflicts remain at their original IDs after destination removal and reload', async () => {
  for (const [from, mapping] of Object.entries(countyAndReversalMapping.mappings)) {
    const to = mapping.targetId, old = retainedOldRecord(), other = row('另一县区原样保留');
    const source = { [from]: old, [to]: row('待移除的目的地区'), '110112': other };
    const storage = memoryStorage({ [GUEST_KEY]: JSON.stringify({ version: 5, revision: 7, records: source }) });
    const h = createHarness({ storage, regionMigration: countyAndReversalMapping });
    await h.cloud.start();
    const remaining = { [from]: old, '110112': other };
    await saveGuest(h, remaining);
    await h.cloud.refresh();
    assert.deepEqual(h.cloud.getState().records, remaining);
    assert.deepEqual(h.storedGuest().records, remaining);
    const next = createHarness({ storage, regionMigration: countyAndReversalMapping });
    await next.cloud.start();
    assert.deepEqual(next.cloud.getState().records, remaining);
    assert.equal(next.cloud.getState().records[to], undefined);
    assert.equal(next.calls.write.length, 0);
  }
});

test('a current transfer-intent snapshot preserves retained county and reversal sources instead of recreating removed destinations', async () => {
  const draft = { '440100': retainedOldRecord(), '810001': { ...retainedOldRecord(), note: '旧分区单独保留' }, '110112': row('已有县区') };
  const h = createHarness({ regionMigration: countyAndReversalMapping });
  await h.cloud.start();
  await saveGuest(h, draft);
  await h.click('cloud-signup-tab');
  h.fill();
  await h.submit();
  const intent = JSON.parse(h.storage.getItem('shanhe-cloud-transfer-v2'));
  assert.deepEqual(intent.snapshot.records, draft);
  const signed = createHarness({ storage: h.storage, regionMigration: countyAndReversalMapping, initialUser: user() });
  await signed.cloud.start();
  await signed.flush();
  assert.equal(signed.calls.write.length, 1);
  assert.deepEqual(signed.calls.write[0].records, draft);
  assert.deepEqual(signed.remote.get('account-a').records, draft);
  assert.equal(signed.cloud.getState().records['440104'], undefined);
  assert.equal(signed.cloud.getState().records['810000'], undefined);
  assert.deepEqual(signed.storedGuest().records, {});
});

test('pre-v4 guest archives still receive reviewed county and reversal mappings while their original bytes remain untouched', async () => {
  const original = { '440100': retainedOldRecord(), '810001': row('旧香港分区') };
  const converted = { '440104': original['440100'], '810000': original['810001'] };
  for (const version of [1, 2, 3]) {
    const key = 'shanhe-atlas-guest-v' + version;
    const raw = JSON.stringify({ version, revision: 2, records: original });
    const storage = memoryStorage({ [key]: raw });
    const h = createHarness({ storage, regionMigration: countyAndReversalMapping });
    await h.cloud.start();
    assert.deepEqual(h.cloud.getState().records, converted);
    await saveGuest(h, converted);
    assert.equal(storage.getItem(key), raw);
    assert.equal(h.storedGuest().version, 5);
    assert.deepEqual(h.storedGuest().records, converted);
    const next = createHarness({ storage, regionMigration: countyAndReversalMapping });
    await next.cloud.start();
    assert.deepEqual(next.cloud.getState().records, converted);
  }
});

test('explicit old-archive imports still convert reviewed counties and reversals while preserving an occupied destination', async () => {
  const original = { '440100': retainedOldRecord(), '810001': row('旧香港分区') };
  const existing = { '440104': row('云端越秀区内容'), '110112': row('其他云端县区') };
  const h = createHarness({ regionMigration: countyAndReversalMapping, oldRecords: original, initialUser: user(), remote: { 'account-a': { records: existing, revision: 5 } } });
  await h.cloud.start();
  await h.click('cloud-import');
  assert.deepEqual(h.remote.get('account-a').records, { ...existing, '440100': original['440100'], '810000': original['810001'] });
  assert.equal(h.calls.write.length, 1);
});

test('expired verification callbacks open login with an explicit fixed error and never send mail automatically', async () => {
  for (const separator of ['?', '#']) {
    const h = createHarness({ href: 'https://example.com/shanhe-atlas/' + separator + 'error=access_denied&error_code=otp_expired&error_description=RAW_UNTRUSTED_DESCRIPTION' });
    await h.cloud.start(); await h.flush();
    assert.equal(h.el('cloud-dialog').open, true); assertLoginMode(h);
    assert.match(h.el('cloud-message').textContent, /验证链接已失效或已使用/);
    assert.match(h.el('cloud-message').textContent, /重新发送验证邮件/);
    assert.equal(h.el('cloud-message').dataset.error, 'true');
    assert.doesNotMatch(h.el('cloud-message').textContent + h.calls.notifications.join(' '), /RAW_UNTRUSTED_DESCRIPTION|验证成功/);
    assert.equal(h.el('cloud-resend').hidden, false); assert.deepEqual(h.calls.resend, []);
    assert.deepEqual(h.calls.signUp, []); assert.deepEqual(h.calls.signIn, []); assert.deepEqual(h.calls.password, []);
  }
});

test('a code or token in a callback without a real session prompts login or resend rather than claiming success', async () => {
  for (const suffix of ['?code=synthetic-code', '#access_token=synthetic-access', '#refresh_token=synthetic-refresh']) {
    const h = createHarness({ href: 'https://example.com/shanhe-atlas/' + suffix });
    await h.cloud.start(); await h.flush();
    assert.equal(h.el('cloud-dialog').open, true); assertLoginMode(h);
    assert.match(h.el('cloud-message').textContent, /没有完成自动登录/); assert.match(h.el('cloud-message').textContent, /重新发送验证邮件/);
    assert.doesNotMatch(h.calls.notifications.join(' '), /验证成功|synthetic-code|synthetic-access|synthetic-refresh/);
    assert.equal(h.cloud.getState().guest, true); assert.deepEqual(h.calls.resend, []); assert.deepEqual(h.calls.write, []);
  }
});

test('ordinary startup and unrelated URL parameters do not open auth or send confirmation emails', async () => {
  for (const initialUser of [null, user()]) {
    const h = createHarness({ initialUser, href: 'https://example.com/shanhe-atlas/?view=map#map' });
    await h.cloud.start(); await h.flush();
    assert.equal(h.el('cloud-dialog').open, false); assert.deepEqual(h.calls.resend, []); assert.deepEqual(h.calls.signUp, []);
    assert.doesNotMatch(h.calls.notifications.join(' '), /验证成功|验证未完成|验证链接/);
  }
});

test('a consumed PKCE callback with a real signed-in session reports successful verification', async () => {
  const confirmed = user('confirmed-account', 'confirmed@example.com');
  const h = createHarness({ href: 'https://example.com/shanhe-atlas/?code=synthetic-code', onInitialize({ emit, location }) {
    location.href = 'https://example.com/shanhe-atlas/'; emit('SIGNED_IN', confirmed); return { error: null };
  } });
  await h.cloud.start(); await h.flush();
  assert.equal(h.cloud.getState().userId, confirmed.id); assert.equal(h.el('cloud-dialog').open, false);
  assert.ok(h.calls.notifications.some(message => /验证成功/.test(message) && message.includes(confirmed.email)));
  assert.deepEqual(h.calls.resend, []); assert.deepEqual(h.calls.signUp, []); assert.deepEqual(h.calls.password, []);
});

test('a restored old session cannot prove that a new verification code was consumed, even if SDK emits SIGNED_IN', async () => {
  for (const emitSignedIn of [false, true]) {
    const old = user('old-account', 'old@example.com');
    const h = createHarness({ initialUser: old, href: 'https://example.com/shanhe-atlas/?code=unconsumed-code', onInitialize({ emit }) {
      if (emitSignedIn) emit('SIGNED_IN', old); return { error: null };
    } });
    await h.cloud.start(); await h.flush();
    assert.equal(h.cloud.getState().userId, old.id); assert.equal(h.el('cloud-dialog').open, true);
    assert.match(h.el('cloud-message').textContent, /未能确认/); assert.match(h.el('cloud-message').textContent, /old@example\.com/);
    assert.doesNotMatch(h.calls.notifications.join(' '), /验证成功/); assert.deepEqual(h.calls.resend, []);
  }
});

test('initialization or session-read errors keep verification failure visible without exposing provider messages', async () => {
  const variants = [
    { onInitialize: () => ({ error: { message: 'RAW_SDK_SECRET' } }) },
    { onGetSession: async () => { throw new Error('RAW_SDK_SECRET'); } }
  ];
  for (const variant of variants) {
    const h = createHarness({ ...variant, href: 'https://example.com/shanhe-atlas/?code=synthetic-code' });
    await h.cloud.start(); await h.flush();
    assert.equal(h.el('cloud-dialog').open, true); assert.equal(h.el('cloud-message').dataset.error, 'true');
    assert.match(h.el('cloud-message').textContent, /验证未完成/); assert.doesNotMatch(h.el('cloud-message').textContent, /RAW_SDK_SECRET/);
    assert.deepEqual(h.calls.resend, []);
  }
});

test('a standalone URL error description is recognized but only a fixed failure message is displayed', async () => {
  const h = createHarness({ href: 'https://example.com/shanhe-atlas/#error_description=UNTRUSTED_URL_ERROR' });
  await h.cloud.start(); await h.flush();
  assert.equal(h.el('cloud-dialog').open, true); assert.match(h.el('cloud-message').textContent, /验证未完成/);
  assert.doesNotMatch(h.el('cloud-message').textContent + h.calls.notifications.join(' '), /UNTRUSTED_URL_ERROR/); assert.deepEqual(h.calls.resend, []);
});

test('successful password recovery retains its editor while an expired recovery callback is not silently ignored', async () => {
  const h = createHarness({ href: 'https://example.com/shanhe-atlas/?code=recovery-code&type=recovery', onInitialize({ emit, location }) {
    location.href = 'https://example.com/shanhe-atlas/'; emit('PASSWORD_RECOVERY', user()); return { error: null };
  } });
  await h.cloud.start(); await h.flush();
  assert.equal(h.el('cloud-dialog').open, true); assert.equal(h.el('cloud-title').textContent, '设置新密码');
  assert.equal(h.el('cloud-resend').hidden, true); assert.doesNotMatch(h.calls.notifications.join(' '), /邮箱链接验证成功|验证未完成/);
  const expired = createHarness({ href: 'https://example.com/shanhe-atlas/#type=recovery&error_code=otp_expired' });
  await expired.cloud.start(); await expired.flush();
  assert.equal(expired.el('cloud-dialog').open, true); assert.match(expired.el('cloud-message').textContent, /失效|未完成/);
  assert.equal(expired.el('cloud-message').dataset.error, 'true'); assert.deepEqual(expired.calls.resend, []);
});

test('resending checks email only, preserves the draft, and never signs up or changes a password', async () => {
  const h = createHarness({ href: 'https://example.com/shanhe-atlas/?code=unused-synthetic-code' });
  await h.cloud.start(); await saveGuest(h, { '110000': row('原始临时足迹') });
  assert.equal(h.el('cloud-resend').type, 'button');
  for (const email of ['', 'not-an-email']) { h.el('cloud-email').value = email; await h.click('cloud-resend'); }
  assert.deepEqual(h.calls.resend, []);
  h.el('cloud-email').value = 'Reader@Example.com'; h.el('cloud-password').value = '';
  assert.equal(h.el('cloud-auth-form').checkValidity(), false, 'login password is absent and must not be required for resend');
  const before = clone(h.storedGuest()); await h.click('cloud-resend');
  assert.deepEqual(h.calls.resend, [{ email: 'reader@example.com', redirect: 'https://example.com/shanhe-atlas/' }]);
  assert.match(h.el('cloud-message').textContent, /已提交重发请求/); assert.match(h.el('cloud-message').textContent, /最新验证邮件/);
  assert.equal(h.el('cloud-message').dataset.error, 'false'); assert.equal(h.el('cloud-dialog').open, true);
  assert.deepEqual(h.storedGuest(), before); assert.deepEqual(h.calls.signUp, []); assert.deepEqual(h.calls.signIn, []); assert.deepEqual(h.calls.password, []); assert.deepEqual(h.calls.reset, []); assert.deepEqual(h.calls.write, []);
});

test('resend blocks concurrent requests and enforces the send cooldown without blocking later manual retry', async () => {
  const gate = deferred(), h = createHarness({ onResend: () => gate.promise });
  await h.cloud.start(); await h.click('cloud-account-btn'); h.fill();
  const pending = h.click('cloud-resend'); await h.click('cloud-resend'); await h.submit();
  assert.equal(h.calls.resend.length, 1); assert.equal(h.el('cloud-resend').disabled, true); assert.deepEqual(h.calls.signIn, []);
  gate.resolve({}); await pending; await h.click('cloud-resend'); assert.equal(h.calls.resend.length, 1);
  h.advance(59999); assert.equal(h.el('cloud-resend').disabled, true);
  h.advance(1); assert.equal(h.el('cloud-resend').disabled, false); await h.click('cloud-resend'); assert.equal(h.calls.resend.length, 2);
});

test('resend errors remain visible and do not claim mail delivery or trigger another account operation', async () => {
  for (const code of ['over_email_send_rate_limit', 'network_error']) {
    const h = createHarness({ onResend: async () => { throw { code, message: 'RAW_PROVIDER_ERROR' }; } });
    await h.cloud.start(); await h.click('cloud-account-btn'); h.el('cloud-email').value = 'reader@example.com';
    await h.click('cloud-resend');
    assert.equal(h.calls.resend.length, 1); assert.equal(h.el('cloud-message').dataset.error, 'true'); assert.equal(h.el('cloud-dialog').open, true);
    assert.match(h.el('cloud-message').textContent, code.includes('rate') ? /频繁/ : /无法完成/);
    assert.doesNotMatch(h.el('cloud-message').textContent, /RAW_PROVIDER_ERROR|已提交重发请求|验证成功/);
    assert.equal(h.el('cloud-resend').disabled, false); assert.deepEqual(h.calls.signUp, []); assert.deepEqual(h.calls.password, []); assert.deepEqual(h.calls.reset, []);
  }
});

test('a late resend response cannot overwrite a new email, reopened form, or signed-in account', async () => {
  for (const change of ['email', 'dialog', 'account']) for (const rejected of [false, true]) {
    const gate = deferred(), h = createHarness({ onResend: () => gate.promise });
    await h.cloud.start(); await h.click('cloud-account-btn'); h.el('cloud-email').value = 'first@example.com';
    const pending = h.click('cloud-resend');
    if (change === 'email') h.el('cloud-email').value = 'second@example.com';
    else if (change === 'dialog') { await h.click('cloud-close'); await h.click('cloud-account-btn'); }
    else { await h.emit('SIGNED_IN', user('account-b', 'second@example.com')); await h.flush(); }
    const message = h.el('cloud-message').textContent;
    if (rejected) gate.reject({ code: 'network_error' }); else gate.resolve({});
    await pending; await h.flush();
    assert.equal(h.el('cloud-message').textContent, message); assert.doesNotMatch(h.el('cloud-message').textContent, /first@example\.com|已提交重发请求/);
    assert.deepEqual(h.calls.signUp, []); assert.deepEqual(h.calls.password, []); assert.deepEqual(h.calls.write, []);
    if (change === 'account') { assert.equal(h.cloud.getState().userId, 'account-b'); assert.equal(h.el('cloud-resend').hidden, true); }
  }
});

const PENDING_EMAIL_KEY='shanhe-pending-email-v1';
async function openCodeForm(h,email='a@example.com',code='12345678'){
  await h.click('cloud-account-btn');h.el('cloud-email').value=email;await h.click('cloud-verify-entry');h.el('cloud-code').value=code;
}

test('email verification entry needs only email and an eight-digit code, with no automatic send',async()=>{
  const h=createHarness();await h.cloud.start();await openCodeForm(h);
  assert.equal(h.el('cloud-dialog').open,true);assert.equal(h.el('cloud-title').textContent,'验证你的邮箱');
  assert.equal(h.el('cloud-password').disabled,true);assert.equal(h.el('cloud-password-confirm').disabled,true);
  assert.equal(h.el('cloud-code').disabled,false);assert.equal(h.el('cloud-code').required,true);
  assert.equal(h.el('cloud-code').autocomplete,'one-time-code');assert.equal(h.el('cloud-submit').textContent,'验证邮箱并登录');
  assert.deepEqual(h.calls.resend,[]);assert.deepEqual(h.calls.verify,[]);assert.deepEqual(h.calls.signUp,[]);
  for(const code of ['', '1234567','123456789','1234ABCD']){
    h.el('cloud-code').value=code;await h.submit();assert.equal(h.calls.verify.length,0);assert.match(h.el('cloud-message').textContent,/8 位数字/);
  }
  h.el('cloud-code').value='1234 5678';await h.submit();assert.deepEqual(h.calls.verify,[{email:'a@example.com',code:'12345678'}]);
});

test('successful signup closes its form and restores only the pending email after reload',async()=>{
  const h=createHarness();await h.cloud.start();await h.click('cloud-account-btn');await h.click('cloud-signup-tab');h.fill('A@Example.com');await h.submit();
  assert.equal(h.el('cloud-dialog').open,false);assert.equal(h.el('cloud-banner-action').textContent,'输入验证码');
  assert.deepEqual(JSON.parse(h.storage.getItem(PENDING_EMAIL_KEY)),{version:1,email:'a@example.com'});
  assert.doesNotMatch(h.storage.getItem(PENDING_EMAIL_KEY),/password|token|code/);
  const reloaded=createHarness({storage:h.storage});await reloaded.cloud.start();assert.equal(reloaded.el('cloud-dialog').open,false);
  await reloaded.click('cloud-banner-action');assert.equal(reloaded.el('cloud-code-field').hidden,false);assert.equal(reloaded.el('cloud-email').value,'a@example.com');
  assert.equal(reloaded.el('cloud-code').value,'');assert.deepEqual(reloaded.calls.resend,[]);
  await reloaded.click('cloud-close');await reloaded.click('cloud-account-btn');assertLoginMode(reloaded);
});

test('harmless verification URL opens code entry on another device without submitting anything',async()=>{
  const h=createHarness({href:'https://example.com/shanhe-atlas/?auth=verify'});await h.cloud.start();await h.flush();
  assert.equal(h.el('cloud-dialog').open,true);assert.equal(h.el('cloud-code-field').hidden,false);assert.equal(h.el('cloud-email').value,'');
  assert.equal(h.el('cloud-message').dataset.error,'false');assert.deepEqual(h.calls.verify,[]);assert.deepEqual(h.calls.resend,[]);assert.deepEqual(h.calls.write,[]);
  const signed=createHarness({href:'https://example.com/shanhe-atlas/?auth=verify',initialUser:user()});await signed.cloud.start();
  assert.equal(signed.cloud.getState().userId,'account-a');assert.match(signed.el('cloud-message').textContent,/当前已登录/);assert.deepEqual(signed.calls.verify,[]);
});

test('verification URL cannot override failed callback or password recovery',async()=>{
  const failed=createHarness({href:'https://example.com/shanhe-atlas/?auth=verify&error_code=otp_expired'});await failed.cloud.start();
  assertLoginMode(failed);assert.match(failed.el('cloud-message').textContent,/验证链接已失效/);
  const recovering=createHarness({href:'https://example.com/shanhe-atlas/?auth=verify&code=fake&type=recovery',onInitialize({emit,location}){
    location.href='https://example.com/shanhe-atlas/?auth=verify';emit('PASSWORD_RECOVERY',user());return {error:null};
  }});await recovering.cloud.start();await recovering.flush();assert.equal(recovering.el('cloud-title').textContent,'设置新密码');assert.equal(recovering.el('cloud-code').disabled,true);
});

test('resend moves to code entry with the same email and clears old codes while preserving send cooldown',async()=>{
  const h=createHarness();await h.cloud.start();await openCodeForm(h,'a@example.com','87654321');await h.click('cloud-resend');
  assert.equal(h.el('cloud-code-field').hidden,false);assert.equal(h.el('cloud-code').value,'');assert.equal(h.el('cloud-email').value,'a@example.com');
  assert.match(h.el('cloud-message').textContent,/最新验证邮件.*8 位验证码/);assert.equal(h.el('cloud-resend').disabled,true);
  assert.equal(JSON.parse(h.storage.getItem(PENDING_EMAIL_KEY)).email,'a@example.com');assert.deepEqual(h.calls.verify,[]);
});

test('code confirmation adopts only the provider-confirmed account and transfers region and landmark intent once',async()=>{
  const gate=deferred(),intents=[],h=createHarness({emitDuringVerify:true,onVerify:()=>gate.promise,companion:{start(){},async rememberIntent(email){intents.push(email);}}});
  await h.cloud.start();const draft={'110000':row('验证码确认后的足迹')};await saveGuest(h,draft);await openCodeForm(h);await h.click('cloud-resend');h.el('cloud-code').value='12345678';
  const pending=h.submit();await h.flush();assert.equal(h.calls.verify.length,1);assert.deepEqual(intents,['a@example.com']);
  assert.equal(h.cloud.getState().guest,true);assert.deepEqual(h.calls.write,[]);assert.equal(h.el('cloud-dialog').open,true);
  await h.submit();assert.equal(h.calls.verify.length,1,'duplicate submit blocked');
  gate.resolve({user:user()});await pending;await h.flush();
  assert.equal(h.cloud.getState().userId,'account-a');assert.equal(h.el('cloud-dialog').open,false);
  assert.match(h.calls.notifications.at(-1),/邮箱验证成功.*已登录/);assert.equal(h.calls.write.length,1);assert.deepEqual(h.remote.get('account-a').records,draft);
  assert.deepEqual(h.storedGuest().records,{});assert.equal(h.storage.getItem(PENDING_EMAIL_KEY),null);assert.equal(h.el('cloud-code').value,'');
  assert.doesNotMatch([...h.storage.data.values()].join(' '),/12345678/);
});

test('wrong, expired, incomplete, and network verification failures keep drafts and never adopt SDK premature SIGNED_IN',async()=>{
  for(const code of ['VERIFICATION_CODE_INVALID','otp_expired','VERIFICATION_INCOMPLETE','RATE_LIMITED','AUTH_FAILED']){
    const h=createHarness({emitDuringVerify:true,onVerify:async()=>{throw {code,message:'RAW_OTP_SECRET'};}});
    await h.cloud.start();const draft={'110000':row('失败后保留')};await saveGuest(h,draft);await openCodeForm(h);await h.submit();await h.flush();
    assert.equal(h.el('cloud-dialog').open,true);assert.equal(h.el('cloud-message').dataset.error,'true');assert.equal(h.cloud.getState().guest,true);
    assert.deepEqual(h.storedGuest().records,draft);assert.deepEqual(h.calls.write,[]);assert.deepEqual(h.calls.notifications,[]);
    assert.doesNotMatch(h.el('cloud-message').textContent,/RAW_OTP_SECRET|验证成功/);assert.equal(h.el('cloud-code').value,'');assert.equal(h.el('cloud-submit').disabled,false);
  }
});

test('a late verification result cannot replace edited email, reopened form, or another account',async()=>{
  for(const change of ['email','dialog','account','signout'])for(const reject of [false,true]){
    const gate=deferred(),h=createHarness({onVerify:()=>gate.promise});await h.cloud.start();await openCodeForm(h);const pending=h.submit();await h.flush();
    if(change==='email'){h.el('cloud-email').value='b@example.com';await h.el('cloud-email').dispatch('input');}
    else if(change==='dialog'){await h.click('cloud-close');await h.click('cloud-account-btn');}
    else {await h.emit(change==='account'?'SIGNED_IN':'SIGNED_OUT',change==='account'?user('account-b','b@example.com'):null);await h.flush();}
    const before=h.el('cloud-message').textContent;
    if(reject)gate.reject({code:'VERIFICATION_CODE_INVALID'});else gate.resolve({user:user()});await pending;await h.flush();
    assert.equal(h.el('cloud-message').textContent,before,change);assert.deepEqual(h.calls.notifications,[],change);assert.deepEqual(h.calls.write,[],change);
    assert.equal(h.cloud.getState().userId,change==='account'?'account-b':null,change);
  }
});

test('codes are cleared on email edit, mode change, close and account switch, never persisted',async()=>{
  const h=createHarness();await h.cloud.start();await openCodeForm(h);await h.el('cloud-email').dispatch('input');assert.equal(h.el('cloud-code').value,'');
  h.el('cloud-code').value='12345678';await h.click('cloud-back-login');assert.equal(h.el('cloud-code').value,'');assertLoginMode(h);
  await openCodeForm(h);await h.click('cloud-close');assert.equal(h.el('cloud-code').value,'');
  await openCodeForm(h);await h.emit('SIGNED_IN',user('account-b','b@example.com'));await h.flush();assert.equal(h.el('cloud-code').value,'');
  assert.doesNotMatch([...h.storage.data.values()].join(' '),/12345678/);
});

test('pending email is retained across another account session and cleared only by the matching confirmed account',async()=>{
  const storage=memoryStorage({[PENDING_EMAIL_KEY]:JSON.stringify({version:1,email:'a@example.com'})});
  const other=createHarness({storage,initialUser:user('account-b','b@example.com')});await other.cloud.start();assert.ok(storage.getItem(PENDING_EMAIL_KEY));
  await other.emit('SIGNED_IN',user());await other.flush();assert.equal(storage.getItem(PENDING_EMAIL_KEY),null);
});

test('verified login remains explicit when cloud transfer fails and never claims unsaved drafts were saved',async()=>{
  const h=createHarness();await h.cloud.start();h.provider.failWrites=1;const draft={'110000':row('云端待重试')};await saveGuest(h,draft);await openCodeForm(h);await h.submit();
  assert.equal(h.cloud.getState().userId,'account-a');assert.equal(h.el('cloud-dialog').open,false);assert.match(h.calls.notifications.at(-1),/邮箱验证成功.*已登录.*临时足迹仍保留/);
  assert.deepEqual(h.storedGuest().records,draft);assert.doesNotMatch(h.calls.notifications.at(-1),/已保存到云端/);
});
