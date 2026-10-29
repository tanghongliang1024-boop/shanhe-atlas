'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../landmark-model.js');
const data = require('../landmark-catalog.js');
const model = L.catalog(data);
const clone = value => JSON.parse(JSON.stringify(value));
const visited = () => ({status:'visited', date:'2024-10-01', note:'旅行记录'});
const WUYUE_IDS = ['poi:CHN:taishan','poi:CHN:huashan','poi:CHN:hengshan-hunan','poi:CHN:hengshan-shanxi','poi:CHN:songshan'];
const WORLD_MAP_IDS = [...WUYUE_IDS,...data.places.filter(place=>place.countryCode!=='CHN').map(place=>place.id)];
// Independently verified book entries, with three separate Qufu sites and the user-approved Nara supplement.
const SOURCE_NAMES = {
  "china-most-beautiful-100": [
    "珠穆朗玛峰",
    "贡嘎山",
    "博格达峰",
    "梅里雪山",
    "泰山",
    "华山",
    "峨眉山",
    "五台山",
    "黄山",
    "武夷山",
    "阿里山",
    "庐山",
    "塔克拉玛干沙漠",
    "将军戈壁",
    "火焰山",
    "罗布泊",
    "乌尔禾魔鬼城",
    "阿里",
    "鸣沙山",
    "雅鲁藏布大峡谷",
    "长江三峡",
    "太鲁阁大峡谷",
    "怒江大峡谷",
    "黄土高原",
    "小寨天坑",
    "织金洞",
    "石林",
    "长白山天池",
    "天山天池",
    "纳木错",
    "青海湖",
    "喀纳斯湖",
    "西湖",
    "茶卡盐湖",
    "肇庆星湖",
    "日月潭",
    "洱海",
    "漓江",
    "塔里木河",
    "淡水河",
    "五彩湾",
    "三江并流",
    "德天瀑布",
    "黄果树瀑布",
    "壶口瀑布",
    "天涯海角",
    "西沙群岛",
    "澎湖列岛",
    "鼓浪屿",
    "亚龙湾",
    "东寨港",
    "野柳",
    "大兴安岭",
    "祁连山草原",
    "神农架",
    "西双版纳",
    "四姑娘山",
    "梵净山",
    "呼伦贝尔草原",
    "扎龙自然保护区",
    "卧龙自然保护区",
    "坝上草原",
    "香格里拉",
    "武陵源",
    "九寨沟",
    "稻城",
    "黄龙",
    "万里长城",
    "北京故宫",
    "天坛",
    "布达拉宫",
    "承德避暑山庄",
    "曲阜孔庙",
    "曲阜孔府",
    "曲阜孔林",
    "武当山古建筑",
    "云冈石窟",
    "龙门石窟",
    "大足石刻",
    "苏州园林",
    "颐和园",
    "明清皇陵",
    "都江堰",
    "坎儿井",
    "京杭大运河",
    "元阳梯田",
    "平遥古城",
    "凤凰古城",
    "丽江古城",
    "安徽民居",
    "福建土楼",
    "开平碉楼",
    "乌镇",
    "屯溪老街",
    "周庄",
    "哈尔滨",
    "大连",
    "青岛",
    "上海",
    "香港"
  ],
  "world-most-beautiful-100": [
    "喜马拉雅山脉",
    "阿尔卑斯山脉",
    "乞力马扎罗山",
    "安第斯山脉",
    "落基山脉",
    "大峡谷",
    "东非大裂谷",
    "好望角",
    "麦金利山",
    "阿切斯岩拱",
    "巴德兰兹劣地",
    "撒哈拉沙漠",
    "艾尔斯岩",
    "岩塔沙漠",
    "埃特纳火山",
    "基拉韦厄火山",
    "瑙鲁霍伊火山",
    "哈莱阿卡拉火山口",
    "尼亚加拉瀑布",
    "维多利亚瀑布",
    "安赫尔瀑布",
    "伊瓜苏瀑布",
    "亚马孙雨林",
    "昆士兰湿热带雨林",
    "南极洲",
    "大平原",
    "巨人之路",
    "棉花堡",
    "尼罗河",
    "多瑙河",
    "密西西比河",
    "佛罗里达湿地",
    "纳库鲁湖",
    "的的喀喀湖",
    "埃尔湖",
    "坎贝尔港",
    "大堡礁",
    "罗托鲁阿",
    "攀牙湾",
    "加拉帕戈斯群岛",
    "塞伦盖蒂",
    "黄石国家公园",
    "恩戈罗恩戈罗火山口",
    "拉普兰",
    "瑞士",
    "冰岛",
    "英格兰湖区",
    "佛蒙特森林",
    "沃特顿湖区",
    "雷尼尔山",
    "挪威海岸",
    "普罗旺斯",
    "托斯卡纳",
    "夏威夷",
    "塞舌尔",
    "克里特岛",
    "黄金海岸",
    "皇后镇",
    "马尔代夫",
    "巴厘岛",
    "塔希提岛",
    "北海道",
    "香格里拉",
    "西藏",
    "雅典卫城",
    "大金字塔",
    "巨石阵",
    "梵蒂冈",
    "罗马竞技场",
    "耶路撒冷",
    "巴尔米拉",
    "杰拉什",
    "巴比伦",
    "玛雅",
    "马丘比丘",
    "奇琴伊察",
    "佩特拉",
    "吴哥",
    "泰姬陵",
    "麦加",
    "卡纳克神庙",
    "复活节岛",
    "巴黎",
    "威尼斯",
    "巴塞罗那",
    "萨尔茨堡",
    "伦敦",
    "圣彼得堡",
    "悉尼",
    "纽约",
    "旧金山",
    "新奥尔良",
    "里约热内卢",
    "卡萨布兰卡",
    "大马士革",
    "伊斯坦布尔",
    "博卡拉",
    "京都",
    "香港",
    "奈良"
  ]
};

test('five mountains have distinct stable IDs and the two Heng mountains are assigned correctly', () => {
  const wuyue = model.themeById.get('wuyue');
  assert.equal(wuyue.placeIds.length, 5);
  assert.deepEqual(wuyue.placeIds, WUYUE_IDS);
  const south = model.byId.get('poi:CHN:hengshan-hunan');
  const north = model.byId.get('poi:CHN:hengshan-shanxi');
  assert.equal(south.name, '衡山');
  assert.equal(north.name, '恒山');
  assert.equal(south.regionIds.length, 1);
  assert.ok(['430412','430400'].includes(south.regionIds[0]));
  assert.equal(north.regionIds.length, 1);
  assert.ok(['140225','140200'].includes(north.regionIds[0]));
  assert.ok(south.coordinates[1] > 27 && south.coordinates[1] < 28);
  assert.ok(north.coordinates[1] > 39 && north.coordinates[1] < 40);
});

test('every landmark retains sources, representative coordinates and valid map references', () => {
  const china=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo/china-prefecture-index.json'),'utf8')).features;
  const world=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo/world-index.json'),'utf8'));
  const cities=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo/world-cities.json'),'utf8')).cities;
  const map=new Map([...china.map(f=>f.properties),...world.regions,...world.countries,...cities].map(p=>[String(p.adcode),p]));
  for(const place of model.places){
    assert.ok(place.sources.length>0,place.id+' has sources');
    assert.ok(place.sources.every(s=>new URL(s.url).protocol==='https:'));
    assert.ok(place.coordinateMethod,place.id+' explains its representative point');
    assert.ok(place.coordinates.every(value=>Math.abs(value*100-Math.round(value*100))<1e-8));
    for(const id of place.regionIds){
      const region=map.get(id);assert.ok(region,id+' exists in current map');
      assert.ok(place.countryCodes.includes(region.countryCode),place.id+' matches region country');
      if(region.countryCode==='CHN')assert.ok(place.provinceCodes.includes(region.provinceCode));
    }
  }
});

test('both 100-place themes match every verified source name exactly once', () => {
  for(const [themeId,names] of Object.entries(SOURCE_NAMES)){
    const theme=model.themeById.get(themeId);
    assert.ok(theme);
    assert.equal(theme.placeIds.length,100);
    assert.equal(new Set(data.themes.find(item=>item.id===themeId).placeIds).size,100);
    const places=theme.placeIds.map(id=>model.byId.get(id));
    const matched=names.map(name=>{
      const matching=places.filter(p=>p.name===name||p.aliases.includes(name));
      assert.equal(matching.length,1,name+' has exactly one entry');
      return matching[0].id;
    });
    assert.equal(new Set(matched).size,100);
    assert.deepEqual(new Set(matched),new Set(theme.placeIds));
  }
  assert.equal(model.places.length,201);
  const china=model.themeById.get('china-most-beautiful-100').placeIds;
  const world=model.themeById.get('world-most-beautiful-100').placeIds;
  assert.deepEqual(china.filter(id=>WUYUE_IDS.includes(id)),['poi:CHN:taishan','poi:CHN:huashan']);
  assert.deepEqual(new Set(china.filter(id=>world.includes(id))),new Set(['poi:CHN:shangri-la','poi:CHN:hong-kong']));
});

test('one Mount Tai visit advances both real themes but creates only one passport stamp', () => {
  const records = {'poi:CHN:taishan':visited()};
  assert.deepEqual(L.progress(model.themeById.get('wuyue'), records), {visited:1,total:5,complete:false});
  assert.deepEqual(L.progress(model.themeById.get('china-most-beautiful-100'), records), {visited:1,total:100,complete:false});
  assert.deepEqual(L.stats(model, records), {visited:1,wish:0,countries:1,completedThemes:0});
  assert.equal(L.markerPlaces(model,{kind:'world'},{status:'visited',records}).length, 1);
  delete records['poi:CHN:taishan'];
  assert.equal(L.progress(model.themeById.get('wuyue'), records).visited, 0);
  assert.equal(L.progress(model.themeById.get('china-most-beautiful-100'), records).visited, 0);
  assert.equal(L.stats(model, records).visited, 0);
});

test('theme completion is derived from visits and can be undone immediately', () => {
  const theme = model.themeById.get('wuyue');
  const records = Object.fromEntries(theme.placeIds.map(id => [id, visited()]));
  assert.deepEqual(L.progress(theme, records), {visited:5,total:5,complete:true});
  records[theme.placeIds[0]] = {status:'wish'};
  assert.deepEqual(L.progress(theme, records), {visited:4,total:5,complete:false});
  delete records[theme.placeIds[1]];
  assert.equal(L.status(records, theme.placeIds[1]), 'unvisited');
  assert.deepEqual(L.stats(model, records), {visited:3,wish:1,countries:1,completedThemes:0});
  assert.deepEqual(L.progress({placeIds:[]}, records), {visited:0,total:0,complete:false});
});

test('sharing one landmark between themes never duplicates a passport stamp or country', () => {
  const extended = clone(data);
  extended.themes.push({id:'mountains',name:'山岳',placeIds:[data.places[0].id,data.places[0].id]});
  const shared = L.catalog(extended);
  const records = {[data.places[0].id]:visited(), 'poi:FRA:future-place':visited()};
  assert.deepEqual(L.stats(shared, records), {visited:1,wish:0,countries:1,completedThemes:1});
  assert.deepEqual(L.progress(shared.themeById.get('mountains'), records), {visited:1,total:1,complete:true});
  assert.deepEqual(shared.byId.get(data.places[0].id).themeIds, ['wuyue','china-most-beautiful-100','mountains']);
  assert.deepEqual(data.places[0].themeIds, ['wuyue','china-most-beautiful-100'], 'catalog construction does not mutate original membership');
});

test('international and cross-border places use the same records and filtering without assuming China', () => {
  const extended = clone(data);
  extended.places.push({id:'poi:FRA:test-alpine-place',name:'跨境山景',nameEn:'Alpine Scenery',country:'法国',countryCode:'FRA',countryCodes:['FRA','ITA'],coordinates:[7,45],provinceCodes:[],regionIds:['world:FRA:alpine','world:ITA:alpine'],themeIds:['global']});
  extended.themes.push({id:'global',name:'环球测试',placeIds:['poi:FRA:test-alpine-place',data.places[0].id]});
  const global = L.catalog(extended);
  const records = {'poi:FRA:test-alpine-place':visited(),[data.places[0].id]:visited()};
  assert.equal(L.markerPlaces(global, {kind:'world'}).length, WORLD_MAP_IDS.length + 1);
  assert.equal(L.markerPlaces(global, {kind:'china'}).length, data.places.filter(p=>p.countryCodes.includes('CHN')).length);
  assert.equal(L.markerPlaces(global, {kind:'country',code:'ITA'}, {theme:'global'}).length, 1);
  assert.equal(L.markerPlaces(global, {kind:'region',code:'world:ITA:alpine'}, {theme:'global'}).length, 1);
  assert.equal(L.markerPlaces(global, {kind:'country',code:'USA'}, {theme:'global'}).length, 0);
  assert.equal(L.markerPlaces(global, {kind:'province',code:'370000'}, {theme:'global'}).length, 1);
  assert.deepEqual(L.stats(global, records), {visited:2,wish:0,countries:2,completedThemes:1}, 'a border place does not claim visits to every bordering country');
});

test('marker filtering intersects map scope, theme and the latest visit status', () => {
  const records = {[data.places[0].id]:visited(),[data.places[1].id]:{status:'wish'}};
  assert.deepEqual(L.markerPlaces(model,{kind:'world'},{theme:'wuyue',status:'visited',records}).map(place=>place.id), [data.places[0].id]);
  assert.deepEqual(L.markerPlaces(model,{kind:'province',code:'610000'},{status:'wish',records}).map(place=>place.id), [data.places[1].id]);
  assert.equal(L.markerPlaces(model,{kind:'country',code:'USA'},{status:'visited',records}).length, 0);
  assert.equal(L.markerPlaces(model,{kind:'world'},{theme:'missing'}).length, 0);
  assert.equal(L.markerPlaces(model,{kind:'world'},{status:'unvisited',records}).length, WORLD_MAP_IDS.length - 2);
  delete records[data.places[0].id];
  assert.equal(L.markerPlaces(model,{kind:'world'},{status:'visited',records}).length, 0);
});

test('world overview shows exactly the five sacred mountains in China and preserves every overseas destination', () => {
  const before=clone(data),world=L.markerPlaces(model,{kind:'world'});
  assert.deepEqual(new Set(world.map(place=>place.id)),new Set(WORLD_MAP_IDS));
  assert.deepEqual(new Set(world.filter(place=>place.countryCode==='CHN').map(place=>place.id)),new Set(WUYUE_IDS));
  assert.deepEqual(world.filter(place=>place.countryCode!=='CHN').map(place=>place.id),model.places.filter(place=>place.countryCode!=='CHN').map(place=>place.id));
  assert.ok(world.some(place=>place.id==='poi:NPL:himalayas'),'an overseas-primary cross-border destination remains visible');
  assert.equal(world.some(place=>place.id==='poi:CHN:hong-kong'),false,'membership in the world book does not bypass the China overview rule');
  assert.equal(world.some(place=>place.id==='poi:CHN:shangri-la'),false);
  assert.deepEqual(L.markerPlaces(model,{kind:'world'},{theme:'china-most-beautiful-100'}).map(place=>place.id),['poi:CHN:taishan','poi:CHN:huashan']);
  assert.deepEqual(data,before,'rendering choices never change the source catalogue');
});

test('China and province maps retain all domestic landmarks independently of the world overview filter', () => {
  const expected=model.places.filter(place=>place.countryCodes.includes('CHN'));
  assert.deepEqual(L.markerPlaces(model,{kind:'china'}).map(place=>place.id),expected.map(place=>place.id));
  assert.deepEqual(L.markerPlaces(model,{kind:'country',code:'CHN'}).map(place=>place.id),expected.map(place=>place.id));
  for(const code of new Set(expected.flatMap(place=>place.provinceCodes))){
    assert.deepEqual(L.markerPlaces(model,{kind:'province',code}).map(place=>place.id),expected.filter(place=>place.provinceCodes.includes(code)).map(place=>place.id));
  }
  assert.equal(model.themeById.get('china-most-beautiful-100').placeIds.length,100);
  assert.equal(model.themeById.get('world-most-beautiful-100').placeIds.length,100);
  assert.equal(model.places.length,201);
});

test('hiding non-mountain China markers on the world map preserves saved dates, notes and passport progress', () => {
  const jiuzhaigou=model.places.find(place=>place.name==='九寨沟'),nara=model.places.find(place=>place.name==='奈良');
  assert.ok(jiuzhaigou&&nara);
  const records={[jiuzhaigou.id]:visited(),[nara.id]:visited(),[WUYUE_IDS[0]]:{status:'wish',date:'',note:'计划登泰山'}};
  const before=clone(records),stats=L.stats(model,records),progress=model.themes.map(theme=>L.progress(theme,records));
  assert.deepEqual(L.markerPlaces(model,{kind:'world'},{status:'visited',records}).map(place=>place.id),[nara.id]);
  assert.deepEqual(L.markerPlaces(model,{kind:'world'},{status:'wish',records}).map(place=>place.id),[WUYUE_IDS[0]]);
  assert.deepEqual(L.markerPlaces(model,{kind:'china'},{status:'visited',records}).map(place=>place.id),[jiuzhaigou.id]);
  assert.ok(L.matches(model.byId.get(jiuzhaigou.id),'九寨沟'),'the full list can still find the hidden world marker');
  assert.equal(L.progress(model.themeById.get('china-most-beautiful-100'),records).visited,1);
  assert.equal(L.stats(model,records).visited,2);
  assert.deepEqual(L.stats(model,records),stats);
  assert.deepEqual(model.themes.map(theme=>L.progress(theme,records)),progress);
  assert.deepEqual(records,before);
});

test('Jiuzhaigou can be found and filtered by its book theme, Sichuan scope and current visit status', () => {
  const place = model.places.find(item => item.name === '九寨沟' || item.aliases.includes('九寨沟'));
  assert.ok(place);
  assert.ok(L.matches(place,'九寨沟','CHN'));
  assert.ok(L.matches(place,'Jiuzhaigou','CHN'));
  const records = {[place.id]:visited()};
  const filter = {theme:'china-most-beautiful-100',status:'visited',records};
  assert.deepEqual(L.markerPlaces(model,{kind:'province',code:'510000'},filter).map(item=>item.id), [place.id]);
  assert.deepEqual(L.markerPlaces(model,{kind:'region',code:place.regionIds[0]},filter).map(item=>item.id), [place.id]);
  assert.equal(L.markerPlaces(model,{kind:'world'},{...filter,theme:'wuyue'}).length, 0);
  delete records[place.id];
  assert.equal(L.markerPlaces(model,{kind:'province',code:'510000'},filter).length, 0);
  assert.equal(L.status(records,place.id), 'unvisited');
});

test('search includes aliases, location, English, accents and a country constraint', () => {
  const tai = model.byId.get('poi:CHN:taishan');
  assert.ok(L.matches(tai,'东岳'));
  assert.ok(L.matches(tai,'泰安'));
  assert.ok(L.matches(tai,' ＴＡＩＳＨＡＮ '));
  assert.ok(L.matches(tai,'mount tái'));
  assert.equal(L.matches(tai,'泰山','USA'), false);
  assert.ok(L.matches(model.byId.get('poi:CHN:hengshan-hunan'),'Hunan'));
  assert.equal(L.matches(model.byId.get('poi:CHN:hengshan-shanxi'),'Hunan'), false);
});

test('unknown statuses, tombstones and unrelated city records never create a stamp', () => {
  const id = data.places[0].id;
  for(const row of [undefined,{visited:true},{status:'unvisited'},{status:'VISITED'},{status:'visited',deleted:true}]){
    assert.equal(L.status({[id]:row},id), 'unvisited');
  }
  assert.equal(L.status(new Map([[id,visited()]]),id), 'visited');
  assert.deepEqual(L.stats(model, {'370902':{visited:true}}), {visited:0,wish:0,countries:0,completedThemes:0});
});

test('invalid data fails rather than silently changing record identity or drawing bad coordinates', () => {
  const duplicate = clone(data);
  duplicate.places.push(clone(duplicate.places[0]));
  assert.throws(()=>L.catalog(duplicate), /Duplicate landmark identifier/);
  for(const coordinates of [[91,181],[0,91],['117',36],[0],[0,0,0]]){
    const bad = clone(data); bad.places[0].coordinates = coordinates;
    assert.throws(()=>L.catalog(bad), /coordinates/);
  }
  const wrongCountry = clone(data); wrongCountry.places[0].countryCode = 'FRA';
  assert.throws(()=>L.catalog(wrongCountry), /country/);
  const missing = clone(data); missing.themes[0].placeIds.push('poi:CHN:missing');
  assert.throws(()=>L.catalog(missing), /Unknown landmark/);
  const inconsistent = clone(data); inconsistent.places[0].themeIds.push('missing');
  assert.throws(()=>L.catalog(inconsistent), /Inconsistent/);
});
