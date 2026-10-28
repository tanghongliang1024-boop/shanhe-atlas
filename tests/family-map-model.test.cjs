'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const F = require('../family-map-model.js');
const R = require('../region-model.js');
const L = require('../landmark-model.js');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '../assets', name), 'utf8'));
const world = read('geo/world.geo.json').features, provinces = read('provinces.json').features;
const model = R.catalog(read('geo/china-index.json'), read('geo/world-index.json'),
  [...read('cities.json').features, ...read('taiwan-counties.json').features],
  read('geo/region-level-reversal-map.json'), read('geo/world-cities.json'));
const members = [
  { id: 'self', name: '家长', color: 'terracotta' }, { id: 'child-a', name: '小明', color: 'blue' },
  { id: 'child-b', name: '小花', color: 'purple' }, { id: 'child-c', name: '小雨', color: 'gold' }
];
const row = () => ({ visited: true, date: '', note: '' });
const entries = records => records.map((value, i) => ({ member: members[i], records: value }));
const marks = (list, scope) => F.regionMarkers(list, scope, world, provinces, model, R);
const detail = { kind: 'province', code: '440000' };

test('two children visiting Huizhou Huicheng produce separate colored flags, not a merged visit', () => {
  const input = [{ member: members[1], records: { '441302': row() } }, { member: members[2], records: { '441302': row() } }];
  const before = structuredClone(input), flags = marks(input, detail);
  assert.equal(flags.length, 2);
  assert.deepEqual(flags.map(f => f.member.id), ['child-a', 'child-b']);
  assert.deepEqual(flags.map(f => f.member.color), ['blue', 'purple']);
  assert.ok(flags.every(f => R.id(f) === '441302' && f.count === 1 && f.target === 'record'));
  assert.ok(flags[0].flagOffset < 0 && flags[1].flagOffset > 0);
  assert.ok(flags[1].flagOffset - flags[0].flagOffset >= 44, 'distinct mobile tap positions');
  assert.deepEqual(input, before, 'map projection must not modify either child archive');
});

test('canceling one child county visit removes only that flag and recenters the remaining sibling', () => {
  const input = [{ member: members[1], records: { '441302': row(), '440104': row() } }, { member: members[2], records: { '441302': row() } }];
  delete input[0].records['441302'];
  const flags = marks(input, detail), huicheng = flags.filter(f => R.id(f) === '441302');
  assert.equal(huicheng.length, 1); assert.equal(huicheng[0].member.id, 'child-b');
  assert.equal(huicheng[0].flagOffset, 0); assert.equal(huicheng[0].flagTotal, 1);
  assert.equal(flags.find(f => R.id(f) === '440104').member.id, 'child-a');
});

test('four overlapping family flags have independent positions and isolated places stay centered', () => {
  const input = entries(members.map(() => ({ '441302': row() })));
  input[0].records['440104'] = row();
  const flags = marks(input, detail), shared = flags.filter(f => R.id(f) === '441302');
  assert.equal(shared.length, 4); assert.equal(new Set(shared.map(f => f.flagOffset)).size, 4);
  assert.equal(shared.reduce((sum, f) => sum + f.flagOffset, 0), 0);
  assert.ok(shared.every(f => f.flagTotal === 4));
  assert.equal(flags.find(f => R.id(f) === '440104').flagOffset, 0);
  assert.deepEqual(marks([], detail), []);
});

test('world aggregation preserves each member count instead of adding siblings to one record', () => {
  const input = entries([{ '441302': row(), '440104': row() }, { '441302': row() }]);
  const flags = marks(input, {kind:'world'});
  assert.equal(flags.length, 2); assert.deepEqual(flags.map(f => f.count), [2, 1]);
  assert.deepEqual(flags.map(f => f.member.id), ['self', 'child-a']);
  assert.equal(flags[0].markerKey, flags[1].markerKey);
  assert.notEqual(flags[0].flagOffset, flags[1].flagOffset);
});

test('per-member region resolution retains county cancellation and country isolation rules', () => {
  const foreign = model.features.find(f => R.countryOf(f) === 'JPN');
  const input = entries([{ '441300': row(), '441302': { visited: false }, [R.id(foreign)]: row() }, { '441302': row() }]);
  const county = marks(input, detail);
  assert.equal(county.length, 1); assert.equal(county[0].member.id, 'child-a');
  const japan = marks(input, { kind: 'country', code: 'JPN' });
  assert.equal(japan.length, 1); assert.equal(japan[0].member.id, 'self'); assert.equal(R.id(japan[0]), R.id(foreign));
});

const landmarkData = structuredClone(require('../landmark-catalog.js'));
const TAISHAN = 'poi:CHN:taishan', HUASHAN = 'poi:CHN:huashan', BORDER = 'poi:FRA:test-border';
landmarkData.places.push({ id: BORDER, name: '跨境景点', countryCode: 'FRA', countryCodes: ['FRA', 'ITA'], coordinates: [7, 45], regionIds: ['world:ITA:alps'], themeIds: ['shared'] });
landmarkData.themes.push({ id: 'shared', name: '旅行收藏', placeIds: [BORDER, TAISHAN, TAISHAN] });
const landmarks = L.catalog(landmarkData);
const landmarkFlags = (input, status = 'all', scope = { kind: 'world' }, theme = 'all') => F.landmarkMarkers(input, landmarks, scope, { status, theme }, L);

test('landmarks display one flag per visited or wish member while unvisited placeholders remain singular', () => {
  const input = entries([{ [TAISHAN]: { status: 'visited' } }, { [TAISHAN]: { status: 'wish' } }, {}]);
  const flags = landmarkFlags(input), shared = flags.filter(f => f.place.id === TAISHAN);
  assert.equal(shared.length, 2); assert.deepEqual(shared.map(f => f.status), ['visited', 'wish']);
  assert.deepEqual(shared.map(f => f.member.id), ['self', 'child-a']);
  assert.notEqual(shared[0].flagOffset, shared[1].flagOffset);
  const blank = flags.filter(f => f.place.id === HUASHAN);
  assert.equal(blank.length, 1); assert.equal(blank[0].member, null); assert.equal(blank[0].status, 'unvisited');
  assert.deepEqual(landmarkFlags([]), [], 'hiding all members also hides their landmark layer');
});

test('landmark visited and wish filters select matching members, not a place-wide combined status', () => {
  const input = entries([{ [TAISHAN]: { status: 'visited' }, [HUASHAN]: { status: 'wish' } }, { [TAISHAN]: { status: 'wish' }, [HUASHAN]: { status: 'visited' } }]);
  const visited = landmarkFlags(input, 'visited'), wish = landmarkFlags(input, 'wish');
  assert.deepEqual(visited.map(f => [f.place.id, f.member.id]), [[TAISHAN, 'self'], [HUASHAN, 'child-a']]);
  assert.deepEqual(wish.map(f => [f.place.id, f.member.id]), [[TAISHAN, 'child-a'], [HUASHAN, 'self']]);
  assert.ok([...visited, ...wish].every(f => f.flagOffset === 0));
  assert.deepEqual(landmarkFlags(input, 'unknown'), []);
});

test('canceling one landmark keeps the sibling visit and filters use only visible family entries', () => {
  const input = entries([{ [TAISHAN]: { status: 'visited' } }, { [TAISHAN]: { status: 'visited' } }]);
  delete input[0].records[TAISHAN];
  const flags = landmarkFlags(input, 'visited');
  assert.equal(flags.length, 1); assert.equal(flags[0].member.id, 'child-a'); assert.equal(flags[0].flagOffset, 0);
  assert.deepEqual(landmarkFlags(input.slice(0, 1), 'visited'), []);
  const hiddenSibling = landmarkFlags(input.slice(0, 1), 'unvisited').filter(f => f.place.id === TAISHAN);
  assert.equal(hiddenSibling.length, 1); assert.equal(hiddenSibling[0].member, null);
});

test('landmark member filters intersect theme and geographical scope without duplicate shared-theme flags', () => {
  const input = entries([{ [TAISHAN]: { status: 'visited' }, [BORDER]: { status: 'visited' } }, { [BORDER]: { status: 'wish' } }]);
  const before = structuredClone(input);
  const shared = landmarkFlags(input, 'all', { kind: 'world' }, 'shared');
  assert.equal(shared.filter(f => f.place.id === TAISHAN).length, 1);
  assert.equal(shared.filter(f => f.place.id === BORDER).length, 2);
  const italy = landmarkFlags(input, 'visited', { kind: 'country', code: 'ITA' }, 'shared');
  assert.deepEqual(italy.map(f => f.place.id), [BORDER]);
  const shandong = landmarkFlags(input, 'visited', { kind: 'province', code: '370000' }, 'shared');
  assert.deepEqual(shandong.map(f => f.place.id), [TAISHAN]);
  assert.deepEqual(landmarkFlags(input, 'all', { kind: 'world' }, 'missing'), []);
  assert.deepEqual(input, before);
});

test('two children can independently cancel Nara while member selection preserves the other child flags', () => {
  const NARA = 'poi:JPN:nara', KYOTO = 'poi:JPN:kyoto';
  const catalog = L.catalog({
    places: [
      {id:NARA, name:'奈良', countryCode:'JPN', coordinates:[135.80,34.69], regionIds:['world:JPN:JP-29']},
      {id:KYOTO, name:'京都', countryCode:'JPN', coordinates:[135.75,35.03], regionIds:['world:JPN:JP-26']}
    ],
    themes: [{id:'world-most-beautiful-100',name:'世界100景',placeIds:[NARA,KYOTO]}]
  });
  const input = [
    {member:members[1],records:{[NARA]:{status:'visited',date:'2024-04-06',note:'小明的奈良'}}},
    {member:members[2],records:{[NARA]:{status:'visited',date:'2025-08-11',note:'小花的奈良'},[KYOTO]:{status:'wish'}}}
  ];
  const flags = (visible, status='visited') => F.landmarkMarkers(visible,catalog,{kind:'country',code:'JPN'},{theme:'world-most-beautiful-100',status},L);
  const before = structuredClone(input), shared = flags(input);
  assert.deepEqual(shared.map(f=>[f.place.id,f.member.id,f.member.color]),[[NARA,'child-a','blue'],[NARA,'child-b','purple']]);
  assert.ok(shared[0].flagOffset<0 && shared[1].flagOffset>0);
  assert.deepEqual(input,before,'rendering preserves both children dates and notes');

  delete input[0].records[NARA];
  const remaining = flags(input);
  assert.deepEqual(remaining.map(f=>[f.place.id,f.member.id,f.flagOffset,f.flagTotal]),[[NARA,'child-b',0,1]]);
  assert.deepEqual(input[1],before[1],'one cancellation leaves every sibling record intact');
  assert.deepEqual(flags(input.slice(0,1)),[],'showing only the child who cancelled must hide Nara');
  assert.deepEqual(flags(input.slice(1)).map(f=>[f.place.id,f.member.id]),[[NARA,'child-b']]);
  assert.deepEqual(flags(input,'wish').map(f=>[f.place.id,f.member.id]),[[KYOTO,'child-b']]);
  assert.deepEqual(flags([]),[],'deselecting all members hides overseas flags');
  delete input[1].records[NARA];
  assert.deepEqual(flags(input),[],'the last sibling can independently remove the final visited flag');
  assert.equal(input[1].records[KYOTO].status,'wish');
});
