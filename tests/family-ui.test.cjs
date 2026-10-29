'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {COLORS} = require('../family-store.js');

const self = () => ({id: 'self', name: '我', color: 'terracotta'});
const child = (id = 'child-one', name = '小明', color = 'blue') => ({id, name, color});
const plain = value => JSON.parse(JSON.stringify(value));

// Production event handlers run with isolated DOM controls and a memory store.
// This exercises member selection, form preservation and stale async completion
// without using any account, browser storage, or network endpoint.
function harness(list = [self(), child()], options = {}) {
  const elements = new Map();
  let radios = [], checkboxes = [];
  function el(selector) {
    if (selector.includes('input[name="family-color"]:checked')) return radios.find(radio => radio.checked);
    if (!elements.has(selector)) {
      let html = '';
      const element = {
        value: '', textContent: '', dataset: {}, style: {}, hidden: false, disabled: false, open: false, listeners: {},
        classList: {add() {}}, setAttribute() {}, focus() {document.activeElement = this;},
        close() { this.open = false; }, showModal() { this.open = true; }, reportValidity() { return true; },
        addEventListener(type, handler) { this.listeners[type] = handler; },
        querySelectorAll() { return selector === '#family-member-chips' ? checkboxes : [el('#family-name'), ...radios, el('#family-save'), el('#family-edit-reload')]; },
        getBoundingClientRect: () => ({left: 0, right: 500, top: 0, bottom: 700})
      };
      Object.defineProperty(element, 'innerHTML', {
        get: () => html,
        set(value) {
          html = value;
          if (selector === '#family-colors') radios = [...value.matchAll(/<input\b([^>]+)>/g)].map(match => ({
            value: match[1].match(/value="([^"]+)"/)[1], checked: /\bchecked\b/.test(match[1]), disabled: /\bdisabled\b/.test(match[1])
          }));
          if (selector === '#family-member-chips') checkboxes = [...value.matchAll(/<input\b([^>]+)>/g)].map(match => ({
            dataset: {familyVisible: match[1].match(/data-family-visible="([^"]+)"/)[1]}, checked: /\bchecked\b/.test(match[1]),
            focus() {document.activeElement = this;}
          }));
        }
      });
      elements.set(selector, element);
    }
    return elements.get(selector);
  }
  const document = {querySelector: el, createElement: () => el('#family-dialog'), body: {append() {}}};
  const state = {document: {version: 1, members: structuredClone(list), regions: {}, landmarks: {}}, userId: 'parent', guest: false, ready: true, busy: false, error: null, revision: 1, ...options.state};
  let context = {userId: state.userId, revision: state.revision, epoch: 1};
  const calls = [], notices = [], activeChanges = [], visibilityChanges = [], authCalls = [];
  const store = {
    getState: () => state, context: () => context, canEdit: () => !state.guest && state.ready && !state.busy,
    async addMember(name, color, ctx) {
      calls.push({kind: 'add', name, color, ctx});
      if (options.add) return options.add(name, color, ctx);
      const member = child('new-child', name, color);
      state.document.members.push(member); state.document.regions[member.id] = {}; state.document.landmarks[member.id] = {};
      return {ok: true, memberId: member.id};
    },
    async updateMember(id, data, ctx) {
      calls.push({kind: 'update', id, data, ctx});
      if (options.update) return options.update(id, data, ctx);
      Object.assign(state.document.members.find(member => member.id === id), data);
      return {ok: true};
    },
    async refresh() {
      calls.push({kind: 'refresh'});
      if (options.refresh) return options.refresh();
      context = {...context, revision: ++state.revision}; return {ok: true};
    }
  };
  const sandbox = {document, structuredClone, ShanheFamily: {COLORS}, module: {exports: {}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../family-ui.js'), 'utf8'), sandbox);
  const ui = sandbox.createFamilyUI({store, onActiveChange: id => activeChanges.push(id), onVisibilityChange: ids => visibilityChanges.push(plain(ids)), onAuth: () => authCalls.push(true), notify: message => notices.push(message)});
  const selectColor = color => { for (const radio of radios) radio.checked = radio.value === color; };
  const toggle = (id, checked) => el('#family-member-chips').listeners.change({target: {dataset: {familyVisible: id}, checked}});
  const edit = id => el('#family-manage-list').listeners.click({target: {closest: () => ({dataset: {familyEdit: id}})}});
  const submit = () => el('#family-form').onsubmit({preventDefault() {}});
  return {ui, el, state, store, calls, notices, activeChanges, visibilityChanges, authCalls, selectColor, toggle, edit, submit, document, checkboxes: () => checkboxes, radios: () => radios};
}

test('all family members start visible while self is the current record owner', () => {
  const h = harness();
  assert.equal(h.ui.activeId(), 'self');
  assert.deepEqual(plain(h.ui.visibleIds()), ['self', 'child-one']);
  assert.equal(h.el('#family-current-description').textContent, '足迹保存给 我，清单与护照随之切换。');
  assert.match(h.el('#family-member-chips').innerHTML, /小明/);
  assert.match(h.el('#family-member-chips').innerHTML, /暖红 · 正在记录/);
});

test('editing selection and map visibility remain independent and emit only real changes', () => {
  const h = harness();
  assert.equal(h.ui.selectMember('child-one'), true);
  h.toggle('child-one', false);
  assert.equal(h.ui.activeId(), 'child-one');
  assert.deepEqual(plain(h.ui.visibleIds()), ['self']);
  assert.deepEqual(h.activeChanges, ['child-one']);
  assert.deepEqual(h.visibilityChanges, [['self']]);
  assert.match(h.el('#family-current-description').textContent, /地图旗子与统计已隐藏/);
  assert.equal(h.ui.selectMember('child-one'), false);
  assert.equal(h.ui.selectMember('not-a-member'), false);
  assert.deepEqual(h.activeChanges, ['child-one']);
});

test('map visibility checkboxes retain keyboard focus when their labels re-render', () => {
  const h = harness();
  const original = h.checkboxes().find(input => input.dataset.familyVisible === 'child-one');
  original.focus(); h.toggle('child-one', false);
  assert.notEqual(h.document.activeElement, original);
  assert.equal(h.document.activeElement.dataset.familyVisible, 'child-one');
  assert.equal(h.document.activeElement.checked, false);
  assert.equal(h.ui.activeId(), 'self');
});

test('ordinary renders retain hidden members and reveal newly added family members', () => {
  const h = harness();
  h.toggle('self', false); h.ui.render(); h.ui.render();
  h.state.document.members.push(child('second-child', '小红', 'purple')); h.ui.render();
  assert.deepEqual(plain(h.ui.visibleIds()), ['child-one', 'second-child']);
  h.toggle('child-one', false); h.toggle('second-child', false);
  assert.match(h.el('#family-status').textContent, /隐藏所有成员/);
});

test('guest add-family action opens authentication without writing any member records', () => {
  const h = harness([self()], {state: {guest: true, userId: null}});
  h.el('#family-manage').onclick();
  assert.deepEqual(h.authCalls, [true]);
  assert.deepEqual(h.calls, []);
  assert.equal(h.ui.hasOpenEditor(), false);
  assert.match(h.el('#family-status').textContent, /临时足迹/);
});

test('loading or failed cloud reads block profile editing and expose a retry action', () => {
  const h = harness([self()], {state: {ready: false, error: {message: '读取失败'}}});
  assert.equal(h.el('#family-manage').disabled, true);
  assert.equal(h.el('#family-active').disabled, true);
  assert.equal(h.el('#family-retry').hidden, false);
  h.el('#family-manage').onclick();
  assert.equal(h.ui.hasOpenEditor(), false);
  assert.deepEqual(h.calls, []);
});

test('adding a member uses the captured context and selects the new visible record owner', async () => {
  const h = harness();
  h.toggle('self', false); h.el('#family-manage').onclick(); h.el('#family-add').onclick();
  const ctx = h.store.context();
  h.el('#family-name').value = '  小红  '; h.selectColor('purple');
  await h.submit();
  assert.equal(h.calls[0].ctx, ctx);
  assert.deepEqual(plain(h.calls[0]), {kind: 'add', name: '小红', color: 'purple', ctx});
  assert.equal(h.ui.activeId(), 'new-child');
  assert.deepEqual(plain(h.ui.visibleIds()), ['child-one', 'new-child']);
  assert.deepEqual(h.activeChanges, ['new-child']);
  assert.equal(h.ui.hasOpenEditor(), false);
  assert.match(h.notices[0], /已添加 小红/);
});

test('member colors remain unique and the four-person limit blocks another add', async () => {
  const h = harness([self(), child(), child('second', '小红', 'purple'), child('third', '小金', 'gold')]);
  h.el('#family-manage').onclick();
  assert.equal(h.el('#family-add').disabled, true);
  assert.equal(h.radios().find(r => r.value === 'terracotta').disabled, false);
  assert.equal(h.radios().find(r => r.value === 'blue').disabled, true);
  h.el('#family-add').onclick();
  assert.equal(h.el('#family-name').value, '我');
  h.selectColor('blue'); await h.submit();
  assert.match(h.el('#family-edit-status').textContent, /尚未被其他成员使用/);
  assert.deepEqual(h.calls, []);
});

test('duplicate names are compared case-insensitively before saving', async () => {
  const h = harness([self(), child('one', 'Alice')]);
  h.el('#family-manage').onclick(); h.el('#family-add').onclick();
  h.el('#family-name').value = ' ALICE '; h.selectColor('purple'); await h.submit();
  assert.match(h.el('#family-edit-status').textContent, /不同的昵称/);
  assert.deepEqual(h.calls, []);
});

test('failed saves keep the nickname, selected color and editor open for retry', async () => {
  const h = harness([self(), child()], {update: async () => ({ok: false, code: 'WRITE_FAILED', message: '网络暂时不可用'})});
  h.el('#family-manage').onclick(); h.edit('child-one');
  h.el('#family-name').value = '新的昵称'; h.selectColor('purple'); await h.submit();
  assert.equal(h.ui.hasOpenEditor(), true);
  assert.equal(h.el('#family-name').value, '新的昵称');
  assert.equal(h.radios().find(r => r.checked).value, 'purple');
  assert.equal(h.el('#family-save').disabled, false);
  assert.equal(h.radios().find(r => r.value === 'terracotta').disabled, true);
  assert.equal(h.el('#family-edit-status').textContent, '网络暂时不可用');
  assert.deepEqual(h.notices, []);
});

test('conflict refresh keeps entered values and renews the context before a retry', async () => {
  let attempts = 0;
  const h = harness([self()], {update: async () => ++attempts === 1 ? {ok: false, code: 'CONFLICT', message: '需要最新记录'} : {ok: true}});
  h.el('#family-manage').onclick(); h.el('#family-name').value = '妈妈'; h.selectColor('gold');
  await h.submit();
  assert.equal(h.el('#family-edit-reload').hidden, false);
  await h.el('#family-edit-reload').onclick();
  assert.equal(h.el('#family-name').value, '妈妈');
  assert.equal(h.radios().find(r => r.checked).value, 'gold');
  assert.equal(h.el('#family-edit-reload').hidden, true);
  await h.submit();
  assert.equal(h.calls[0].ctx.revision, 1);
  assert.equal(h.calls[2].ctx.revision, 2);
});

test('failed refresh keeps unsaved values and restores an enabled form', async () => {
  const h = harness([self()], {update: async () => ({ok: false, code: 'STALE_CONTEXT'}), refresh: async () => {throw Error('offline');}});
  h.el('#family-manage').onclick(); h.el('#family-name').value = '妈妈'; h.selectColor('gold'); await h.submit();
  await h.el('#family-edit-reload').onclick();
  assert.equal(h.el('#family-name').value, '妈妈');
  assert.equal(h.radios().find(r => r.checked).value, 'gold');
  assert.equal(h.el('#family-save').disabled, false);
  assert.match(h.el('#family-edit-status').textContent, /输入仍保留/);
});

test('account reset closes the editor and ignores an earlier account save completion', async () => {
  let finish;
  const h = harness([self(), child()], {update: () => new Promise(resolve => {finish = resolve;})});
  h.ui.selectMember('child-one'); h.toggle('self', false); h.el('#family-manage').onclick();
  h.el('#family-name').value = '旧账号昵称'; const save = h.submit();
  h.state.document.members = [self()]; h.state.userId = 'other-parent'; h.ui.reset();
  finish({ok: true}); await save;
  assert.equal(h.ui.activeId(), 'self');
  assert.deepEqual(plain(h.ui.visibleIds()), ['self']);
  assert.equal(h.ui.hasOpenEditor(), false);
  assert.deepEqual(h.notices, []);
  assert.deepEqual(h.visibilityChanges, [['child-one']]);
});

test('member names never become HTML and service errors use text content', () => {
  const h = harness([self(), child('unsafe', '<b>小明</b>')]);
  h.state.error = {message: '<img src=x onerror=alert(1)>'}; h.ui.render(); h.el('#family-manage').onclick();
  for (const selector of ['#family-member-chips', '#family-active', '#family-manage-list']) {
    assert.doesNotMatch(h.el(selector).innerHTML, /<b>小明<\/b>/);
    assert.match(h.el(selector).innerHTML, /&lt;b&gt;小明&lt;\/b&gt;/);
  }
  assert.equal(h.el('#family-status').textContent, '<img src=x onerror=alert(1)>');
});
