'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {prepareEdit} = require('../landmark-ui.js');
const L = require('../landmark-model.js');

const A = 'poi:CHN:taishan', B = 'poi:CHN:huashan';
const row = (status = 'visited', note = '旅行记忆') => ({status, date: status === 'visited' ? '2024-02-29' : '', note, updatedAt: '2026-10-27T12:00:00.000Z'});
const json = value => JSON.parse(JSON.stringify(value));

// Exercise the production UI handlers in isolation, without browser storage,
// user sessions, map requests, or any remote calls.
function harness(records = {}, options = {}) {
  const elements = new Map(), radios = ['unvisited', 'wish', 'visited'].map(value => ({value, checked: false, disabled: false}));
  function el(selector) {
    if (selector.includes('input[name="lm-state"]:checked')) return radios.find(r => r.checked);
    if (!elements.has(selector)) elements.set(selector, {
      value: selector.endsWith('-filter') ? 'all' : '', innerHTML: '', textContent: '', dataset: {}, hidden: false, disabled: false, open: false,
      classList: {add() {}}, addEventListener() {}, setAttribute() {}, focus() {},
      close() { this.open = false; }, showModal() { this.open = true; }, reportValidity() { return true; },
      querySelectorAll(query) { return query === 'input[name="lm-state"]' ? radios : [...radios, ...elements.values()].filter(item => item !== this); }
    });
    return elements.get(selector);
  }
  const document = {
    querySelector: el,
    querySelectorAll: () => [el('#list-storage'), el('#passport-storage')],
    createElement: () => el('#landmark-dialog'), body: {append() {}}
  };
  const places = [A, B, 'poi:CHN:hengshan-hunan', 'poi:CHN:hengshan-shanxi', 'poi:CHN:songshan'].map((id, i) => ({
    id, name: ['泰山', '华山', '衡山', '恒山', '嵩山'][i], nameEn: ['Mount Tai', 'Mount Hua', 'Mount Heng', 'Hengshan', 'Mount Song'][i],
    aliases: [], countryCode: 'CHN', country: '中国', countryCodes: ['CHN'], location: '中国', description: '山岳景点', stampLabel: '山河足迹', sources: []
  }));
  const catalog = options.catalog || {places, themes: [{id: 'wuyue', name: '五岳', badgeName: '五岳足迹', placeIds: places.map(p => p.id)}], byId: new Map(places.map(p => [p.id, p]))};
  const state = {records: structuredClone(records), guest: true, ready: true, busy: false, error: null, guestCount: 0};
  const notices = [], calls = [], ctx = {userId: null, revision: 1};
  const store = {
    getState: () => state, canEdit: () => state.ready && !state.busy, context: () => ctx,
    save: async (next, context) => { calls.push({next, context}); if (options.save) return options.save(next, context); state.records = next; return {ok: true, guest: true}; },
    refresh: options.refresh || (async () => ({ok: true})), transferGuest: async () => ({ok: true})
  };
  const sandbox = {document, structuredClone, module: {exports: {}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../landmark-ui.js'), 'utf8'), sandbox);
  const ui = sandbox.createLandmarkUI({catalog, store, countries: options.countries, notify: message => notices.push(message)});
  const select = value => { for (const radio of radios) radio.checked = radio.value === value; radios.find(r => r.checked).onchange(); };
  const submit = () => el('#lm-detail-form').onsubmit({preventDefault() {}});
  return {ui, el, radios, select, submit, state, notices, calls, ctx, catalog};
}

test('marking one attraction unvisited removes only that record without changing the source', () => {
  const base = {[A]: row(), [B]: row('wish', '下一站')};
  const next = prepareEdit(base, A, 'unvisited', '', '不应保存');
  assert.equal(next[A], undefined);
  assert.deepEqual(next[B], base[B]);
  assert.ok(base[A]);
});

test('an unchanged visit preserves its original timestamp and switching to wish clears the date', () => {
  const base = {[A]: row()};
  assert.deepEqual(prepareEdit(base, A, 'visited', base[A].date, base[A].note), base);
  const next = prepareEdit(base, A, 'wish', base[A].date, '  下次再来  ');
  assert.equal(next[A].status, 'wish');
  assert.equal(next[A].date, '');
  assert.equal(next[A].note, '下次再来');
  assert.notEqual(next[A].updatedAt, base[A].updatedAt);
  assert.throws(() => prepareEdit(base, A, 'invalid', '', ''), /有效/);
});

test('saving unvisited closes the editor and preserves other attraction records', async () => {
  const h = harness({[A]: row(), [B]: row('wish')});
  h.ui.open(A); h.select('unvisited');
  await h.submit();
  assert.equal(h.state.records[A], undefined);
  assert.deepEqual(json(h.state.records[B]), row('wish'));
  assert.equal(h.ui.hasOpenEditor(), false);
  assert.match(h.notices[0], /未去过/);
  assert.equal(h.calls[0].context, h.ctx);
});

test('failed saves retain entered date and notes, keep the editor open and enable retry', async () => {
  const h = harness({}, {save: async () => ({ok: false, code: 'NETWORK', message: '连接失败'})});
  h.ui.open(A); h.select('visited');
  h.el('#lm-detail-date').value = '2025-09-08'; h.el('#lm-detail-note').value = '尚未保存的笔记';
  await h.submit();
  assert.equal(h.ui.hasOpenEditor(), true);
  assert.equal(h.el('#lm-detail-date').value, '2025-09-08');
  assert.equal(h.el('#lm-detail-note').value, '尚未保存的笔记');
  assert.equal(h.el('#lm-detail-save').disabled, false);
  assert.equal(h.el('#lm-detail-status').textContent, '连接失败');
});

test('revision conflicts preserve input and a failed refresh does not throw or discard it', async () => {
  const h = harness({}, {save: async () => ({ok: false, code: 'CONFLICT', message: '请读取最新记录'}), refresh: async () => { throw Error('offline'); }});
  h.ui.open(A); h.select('wish'); h.el('#lm-detail-note').value = '准备下一次旅行';
  await h.submit();
  assert.equal(h.el('#lm-detail-reload').hidden, false);
  await h.el('#lm-detail-reload').onclick();
  assert.equal(h.el('#lm-detail-note').value, '准备下一次旅行');
  assert.equal(h.el('#lm-detail-save').disabled, false);
  assert.match(h.el('#lm-detail-status').textContent, /输入仍保留/);
});

test('account changes close the editor and stale save completion cannot notify or reopen it', async () => {
  let resolveSave;
  const h = harness({}, {save: () => new Promise(resolve => { resolveSave = resolve; })});
  h.ui.open(A); h.select('visited'); const saving = h.submit();
  h.ui.closeEditor(); resolveSave({ok: true, guest: false}); await saving;
  assert.equal(h.ui.hasOpenEditor(), false);
  assert.deepEqual(h.notices, []);
});

test('a stale landmark form offers the latest-record reload without dropping input', async () => {
  const h = harness({}, {save: async () => ({ok: false, code: 'STALE_CONTEXT', message: '景点存档已变化'})});
  h.ui.open(A); h.select('visited'); h.el('#lm-detail-note').value = '保留这次输入';
  await h.submit();
  assert.equal(h.el('#lm-detail-reload').hidden, false);
  assert.equal(h.el('#lm-detail-note').value, '保留这次输入');
});

test('five completed visits light the badge; wishes do not count and cancelling revokes it', () => {
  const h = harness();
  for (const p of h.catalog.places) h.state.records[p.id] = row();
  h.ui.render();
  assert.match(h.el('#lm-badge-list').innerHTML, /lm-badge-card earned/);
  assert.equal((h.el('#lm-stamp-grid').innerHTML.match(/lm-stamp is-lit/g) || []).length, 5);
  h.state.records[B] = row('wish'); h.ui.render();
  assert.match(h.el('#lm-badge-list').innerHTML, /lm-badge-card locked/);
  assert.match(h.el('#lm-badge-list').innerHTML, /4 \/ 5/);
  assert.equal((h.el('#lm-stamp-grid').innerHTML.match(/lm-stamp is-lit/g) || []).length, 4);
  delete h.state.records[A]; h.ui.render();
  assert.match(h.el('#lm-badge-list').innerHTML, /3 \/ 5/);
});

test('search and status filters render only matching attraction cards', () => {
  const h = harness({[A]: row(), [B]: row('wish')});
  h.el('#lm-search').value = 'mount tai'; h.ui.render();
  assert.equal(h.el('#lm-result-count').textContent, '1 个景点');
  assert.match(h.el('#lm-place-list').innerHTML, /泰山/);
  h.el('#lm-search').value = ''; h.el('#lm-status-filter').value = 'wish'; h.ui.render();
  assert.equal(h.el('#lm-result-count').textContent, '1 个景点');
  assert.match(h.el('#lm-place-list').innerHTML, /华山/);
});

test('untrusted notices and catalog text are escaped, and unsafe source links are omitted', () => {
  const h = harness();
  const place = h.catalog.byId.get(A);
  place.name = '<img src=x onerror=alert(1)>';
  place.sources = [{title: 'bad', url: 'javascript:alert(1)'}, {title: '<b>来源</b>', url: 'https://example.test/source'}];
  h.state.error = {message: '<img src=x onerror=alert(2)>'}; h.ui.render(); h.ui.open(A);
  assert.doesNotMatch(h.el('#list-storage').innerHTML, /<img/);
  assert.match(h.el('#list-storage').innerHTML, /&lt;img/);
  assert.doesNotMatch(h.el('#lm-place-list').innerHTML, /<img/);
  assert.doesNotMatch(h.el('#lm-detail-sources').innerHTML, /javascript:/);
  assert.match(h.el('#lm-detail-sources').innerHTML, /&lt;b&gt;来源/);
});

test('details expose each attraction position method as plain text', () => {
  const h = harness();
  h.catalog.byId.get(A).coordinateMethod = '官方资料所列范围的中点。';
  h.ui.open(A);
  assert.equal(h.el('#lm-detail-coordinate-note').textContent, '官方资料所列范围的中点。');
  assert.equal(h.el('#lm-detail-coordinate-note').hidden, false);
  h.ui.closeEditor(); h.ui.open(B);
  assert.equal(h.el('#lm-detail-coordinate-note').hidden, true);
});

test('both published 100-place themes render exactly their members and keep shared places singular', () => {
  const catalog = L.catalog(require('../landmark-catalog.js'));
  const h = harness({}, {catalog});
  const renderedIds = () => [...h.el('#lm-place-list').innerHTML.matchAll(/data-lm-place="([^"]+)"/g)].map(match => match[1]);
  for (const themeId of ['china-most-beautiful-100', 'world-most-beautiful-100']) {
    const theme = catalog.themeById.get(themeId);
    assert.ok(theme, themeId + ' is published');
    assert.equal(theme.placeIds.length, 100);
    h.el('#lm-theme-filter').value = themeId;
    h.el('#lm-search').value = '';
    h.ui.render();
    assert.equal(h.el('#lm-result-count').textContent, '100 个景点');
    assert.deepEqual(new Set(renderedIds()), new Set(theme.placeIds));
    assert.equal(renderedIds().length, 100, 'shared destinations must not create duplicate cards');
    h.el('#lm-search').value = '香格里拉'; h.ui.render();
    assert.deepEqual(renderedIds(), ['poi:CHN:shangri-la']);
  }
  h.el('#lm-search').value = '奈良'; h.ui.render();
  assert.deepEqual(renderedIds(), ['poi:JPN:nara']);
  h.el('#lm-theme-filter').value = 'china-most-beautiful-100'; h.ui.render();
  assert.deepEqual(renderedIds(), []);
  h.ui.open('poi:AUS:queensland-wet-tropics');
  assert.match(h.el('#lm-detail-stamp').innerHTML, /<text[^>]+textLength="94"[^>]+lengthAdjust="spacingAndGlyphs"[^>]*>昆士兰湿热带雨林<\/text>/);
});

test('theme bibliography escapes titles, editions and counting notes and admits only HTTPS sources', () => {
  const catalog = {places: [], themes: [{
    id: 'world-most-beautiful-100', name: '<img src=x onerror=alert(1)>', placeIds: [],
    source: {
      title: '<b>原书标题</b>', edition: '<em>2012 & 版本</em>',
      note: '<script>alert(2)</script>99 + 奈良 = 100',
      url: 'https://example.test/book?title="目录"&edition=2012',
      additionalSources: [
        {title: '<i>奈良补充来源</i>', url: 'https://example.test/nara'},
        {title: 'unsafe-js', url: 'javascript:alert(3)'},
        {title: 'unsafe-http', url: 'http://example.test/insecure'},
        {title: 'unsafe-data', url: 'data:text/html,<script>alert(4)</script>'},
        {title: 'unsafe-relative', url: '//example.test/relative'}
      ]
    }
  }, {id: 'unsafe-main', name: '无安全主链接', placeIds: [], source: {title: '仍显示书名', note: '保留说明', url: 'javascript:alert(5)'}}]};
  const h = harness({}, {catalog});
  const html = h.el('#landmarks-view').innerHTML;
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /&lt;b&gt;原书标题&lt;\/b&gt;/);
  assert.match(html, /&lt;em&gt;2012 &amp; 版本&lt;\/em&gt;/);
  assert.match(html, /&lt;script&gt;alert\(2\)&lt;\/script&gt;99 \+ 奈良 = 100/);
  assert.match(html, /&lt;i&gt;奈良补充来源&lt;\/i&gt;/);
  assert.match(html, /仍显示书名/);
  assert.match(html, /保留说明/);
  assert.doesNotMatch(html, /<(?:img|script|b|em|i)(?:\s|>)/);
  assert.doesNotMatch(html, /javascript:|data:text\/html|http:\/\/|unsafe-(?:js|http|data|relative)/);
  const links = [...html.matchAll(/<a href="([^"]+)" target="_blank" rel="noopener noreferrer">/g)].map(match => match[1]);
  assert.deepEqual(links, ['https://example.test/book?title=&quot;目录&quot;&amp;edition=2012', 'https://example.test/nara']);
});

test('country options include secondary cross-border countries once and filter by their map names', () => {
  const border = {id:'poi:FRA:alps-fixture', name:'跨境山地', countryCode:'FRA', country:'法国', countryCodes:['FRA','ITA','ITA','CHE'], aliases:[]};
  const local = {id:'poi:FRA:city-fixture', name:'法国城市', countryCode:'FRA', country:'法国', countryCodes:['FRA'], aliases:[]};
  const catalog = {places:[border,local], themes:[]};
  const countries = new Map([['FRA',{name:'法国地图名'}],['ITA',{name:'意大利'}]]);
  const h = harness({}, {catalog, countries});
  const html = h.el('#landmarks-view').innerHTML;
  const select = html.match(/<select id="lm-country-filter">([\s\S]*?)<\/select>/)[1];
  assert.deepEqual([...select.matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)].map(match => [match[1],match[2]]), [
    ['all','全部国家 / 地区'],['FRA','法国地图名'],['ITA','意大利'],['CHE','CHE']
  ]);
  h.el('#lm-country-filter').value = 'ITA'; h.ui.render();
  assert.equal(h.el('#lm-result-count').textContent, '1 个景点');
  assert.match(h.el('#lm-place-list').innerHTML, /data-lm-place="poi:FRA:alps-fixture"/);
  assert.doesNotMatch(h.el('#lm-place-list').innerHTML, /data-lm-place="poi:FRA:city-fixture"/);
  h.el('#lm-country-filter').value = 'FRA'; h.ui.render();
  assert.equal(h.el('#lm-result-count').textContent, '2 个景点');
  h.el('#lm-country-filter').value = 'CHE'; h.ui.render();
  assert.equal(h.el('#lm-result-count').textContent, '1 个景点');
});
