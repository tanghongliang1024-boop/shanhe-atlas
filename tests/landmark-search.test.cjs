'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const R = require('../region-model.js');
const L = require('../landmark-model.js');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '../assets', name), 'utf8'));
const model = R.catalog(read('geo/china-prefecture-index.json'), read('geo/world-index.json'),
  [...read('cities.json').features, ...read('taiwan-counties.json').features, ...read('geo/china-index.json').features],
  read('geo/region-level-reversal-map.json'), read('geo/world-cities.json'), read('geo/china-prefecture-migration-map.json'));
const catalog = L.catalog(require('../landmark-catalog.js'));
const JERUSALEM = 'poi:PSX:jerusalem', PARIS = 'poi:FRA:paris', PARIS_CITY = 'world:FRA:city-1159151613';
const VERSAILLES = 'world:FRA:city-1159142029';
const appSource = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const start = appSource.indexOf('function renderList(){'), end = appSource.indexOf('function resetList()',start);
assert.ok(start >= 0 && end > start, 'production search renderer remains identifiable');
const renderSource = appSource.slice(start,end);
const helpers = appSource.slice(appSource.indexOf('const icon='),appSource.indexOf('const R='));
const regionRow = note => ({visited:true,date:'2023-03-12',note,updatedAt:'2026-10-28T08:00:00.000Z'});
const landmarkRow = (status='visited',note='景点笔记') => ({status,date:status==='visited'?'2024-05-06':'',note,updatedAt:'2026-10-28T08:00:00.000Z'});

// Run the actual homepage renderer with real catalogues, without a live account,
// browser persistence, map downloads or any remote writes.
function harness(options = {}) {
  const elements = new Map(), events = [], opened = [];
  const members = structuredClone(options.members || {self:{regions:{},landmarks:{}}});
  let activeMember = Object.keys(members)[0], buttons = [], more = null;
  function el(selector) {
    if (selector === '#list-more') return more;
    if (!elements.has(selector)) {
      const element = {value:selector.endsWith('-filter')?'all':'',textContent:'',scrollTop:0,open:false,
        close(){this.open=false;events.push('close-picker');},
        querySelectorAll(query){return buttons.filter(button => query === '[data-city]' ? button.dataset.city : query === '[data-landmark]' ? button.dataset.landmark : false);}
      };
      let html = '';
      Object.defineProperty(element,'innerHTML',{get:()=>html,set(value){
        html=value;
        if(selector !== '#city-list')return;
        buttons=[];more=null;
        for(const match of value.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)){
          const button={dataset:{},innerHTML:match[2],onclick:null};
          for(const attribute of match[1].matchAll(/data-(city|landmark)="([^"]+)"/g))button.dataset[attribute[1]]=attribute[2];
          if(/id="list-more"/.test(match[1]))more=button;
          else if(button.dataset.city||button.dataset.landmark)buttons.push(button);
        }
      }});
      elements.set(selector,element);
    }
    return elements.get(selector);
  }
  const context = {
    $:el,R,ShanheLandmarks:L,model,features:model.features,records:members[activeMember].regions,
    landmarkCatalog:options.withoutLandmarks?null:catalog,listLimit:options.limit||60,
    landmarkStore:{getState:()=>({records:members[activeMember].landmarks,memberId:activeMember})},
    landmarkUI:{open(id){events.push('open-landmark');opened.push({kind:'landmark',id,memberId:activeMember,pickerOpen:el('#city-picker').open});}},
    openCity(id){events.push('open-city');opened.push({kind:'city',id,memberId:activeMember});},
    visited:feature=>context.records[R.id(feature)]?.visited===true,
    visits:()=>R.recordsWithFeatures(context.records,model).filter(feature=>!feature.properties.prefectureTarget),
    isWorldLegacy:feature=>feature.properties.legacyKind==='world-region',
    isCountryLegacy:feature=>feature.properties.legacyKind==='world-country',
    dateString:value=>value?value.replaceAll('-','.'):'初见日期待补充'
  };
  vm.createContext(context);vm.runInContext(helpers+renderSource,context);
  return {
    el,events,opened,members,context,
    render(){context.renderList();},
    search({query='',country='all',province='all',status='all'}={}){
      for(const [selector,value] of [['#city-search',query],['#country-filter',country],['#province-filter',province],['#status-filter',status]])el(selector).value=value;
      context.renderList();
    },
    switchMember(id){assert.ok(members[id]);activeMember=id;context.records=members[id].regions;context.renderList();},
    buttons:()=>buttons,
    landmarkIds:()=>buttons.filter(button=>button.dataset.landmark).map(button=>button.dataset.landmark),
    cityIds:()=>buttons.filter(button=>button.dataset.city).map(button=>button.dataset.city)
  };
}

test('homepage Chinese, English and alias searches each find Jerusalem once in the real landmark catalogue', () => {
  const h=harness();
  for(const query of ['耶路撒冷',' Jerusalem ','JERUSALEM','耶路撒冷旧城','Old City of Jerusalem']){
    h.search({query});
    assert.deepEqual(h.landmarkIds(),[JERUSALEM],query);
    assert.deepEqual(h.cityIds(),[],query+' is a landmark, not an invented city record');
    assert.equal(h.el('#result-count').textContent,'1 个');
    assert.match(h.el('#city-list').innerHTML,/耶路撒冷 · 景点/);
  }
});

test('Jerusalem can be found through both supported country filters and only matching region filters', () => {
  const h=harness();
  for(const country of ['PSX','ISR']){
    h.search({query:'Jerusalem',country});
    assert.deepEqual(h.landmarkIds(),[JERUSALEM]);
    h.search({query:'耶路撒冷',country,province:'world:'+country});
    assert.deepEqual(h.landmarkIds(),[JERUSALEM]);
  }
  h.search({query:'耶路撒冷',country:'FRA'});
  assert.deepEqual(h.landmarkIds(),[]);
  h.search({query:'耶路撒冷',country:'ISR',province:'world:FRA:FR-IDF'});
  assert.deepEqual(h.landmarkIds(),[]);
  h.search({query:'泰山',country:'CHN',province:'370000'});
  assert.deepEqual(h.landmarkIds(),['poi:CHN:taishan'],'Chinese provinceCodes are supported');
  h.search({query:'泰山',country:'CHN',province:'610000'});
  assert.deepEqual(h.landmarkIds(),[]);
  h.search({query:'Paris',country:'FRA',province:'world:FRA:FR-IDF'});
  assert.deepEqual(h.landmarkIds(),[PARIS],'overseas regionIds are supported');
});

test('visited and unvisited search use the active member landmark records and wish stays unvisited', () => {
  const h=harness({members:{
    parent:{regions:{},landmarks:{[JERUSALEM]:landmarkRow('visited','家长到访')}},
    child:{regions:{},landmarks:{[JERUSALEM]:landmarkRow('wish','孩子想去')}},
    other:{regions:{},landmarks:{}}
  }});
  const before=structuredClone(h.members);
  h.search({query:'耶路撒冷',status:'visited'});
  assert.deepEqual(h.landmarkIds(),[JERUSALEM]);
  assert.match(h.el('#city-list').innerHTML,/2024\.05\.06/);
  h.switchMember('child');
  assert.deepEqual(h.landmarkIds(),[],'a parent visit must not appear as a child visit');
  h.search({query:'耶路撒冷',status:'unvisited'});
  assert.deepEqual(h.landmarkIds(),[JERUSALEM]);
  assert.match(h.el('#city-list').innerHTML,/想去/);
  h.switchMember('other');
  assert.deepEqual(h.landmarkIds(),[JERUSALEM]);
  assert.match(h.el('#city-list').innerHTML,/尚未到访/);
  h.switchMember('parent');
  assert.deepEqual(h.landmarkIds(),[]);
  h.search({query:'耶路撒冷',status:'all'});
  assert.deepEqual(h.landmarkIds(),[JERUSALEM]);
  assert.deepEqual(h.members,before,'searching and changing members never rewrite dates or notes');
});

test('a same-name city and landmark stay independent with landmarks ordered first', () => {
  const h=harness({members:{self:{regions:{[PARIS_CITY]:regionRow('地区巴黎记录')},landmarks:{[PARIS]:landmarkRow('wish','巴黎景点愿望')}}}});
  const before=structuredClone(h.members);
  h.search({query:'巴黎',country:'FRA'});
  // The existing region search also matches Versailles through its region aliases.
  assert.deepEqual(h.buttons().map(button=>button.dataset),[{landmark:PARIS},{city:VERSAILLES},{city:PARIS_CITY}]);
  assert.equal(h.el('#result-count').textContent,'3 个');
  h.search({query:'巴黎',country:'FRA',status:'visited'});
  assert.deepEqual(h.landmarkIds(),[]);
  assert.deepEqual(h.cityIds(),[PARIS_CITY]);
  h.search({query:'巴黎',country:'FRA',status:'unvisited'});
  assert.deepEqual(h.landmarkIds(),[PARIS]);
  assert.deepEqual(h.cityIds(),[VERSAILLES],'the visited Paris city is excluded while its landmark wish remains');
  assert.deepEqual(h.members,before,'filtering preserves both independent archives');
  h.members.self.regions={};h.context.records=h.members.self.regions;
  h.members.self.landmarks[PARIS]=landmarkRow('visited','景点巴黎记录');
  h.search({query:'巴黎',country:'FRA',status:'visited'});
  assert.deepEqual(h.landmarkIds(),[PARIS]);
  assert.deepEqual(h.cityIds(),[],'a landmark visit must not create a city visit');
  assert.equal(h.members.self.landmarks[JERUSALEM],undefined);
});

test('an empty or whitespace query preserves the original region list, filters and pagination', () => {
  const options={members:{self:{regions:{[PARIS_CITY]:regionRow('巴黎地区'), 'world:FRA':regionRow('法国旧记录')},landmarks:{[JERUSALEM]:landmarkRow()}}}};
  const h=harness(options),regionsOnly=harness({...options,withoutLandmarks:true});
  for(const filters of [{},{query:'   '},{country:'FRA'},{country:'FRA',status:'visited'},{country:'FRA',status:'unvisited'}]){
    h.search(filters);regionsOnly.search(filters);
    assert.deepEqual(h.landmarkIds(),[]);
    assert.deepEqual(h.cityIds(),regionsOnly.cityIds());
    assert.equal(h.el('#result-count').textContent,regionsOnly.el('#result-count').textContent);
    assert.equal(h.el('#city-list').innerHTML,regionsOnly.el('#city-list').innerHTML);
  }
  h.search();regionsOnly.search();
  assert.equal(h.cityIds().length,60);
  h.el('#city-list').scrollTop=138;regionsOnly.el('#city-list').scrollTop=138;
  h.el('#list-more').onclick();regionsOnly.el('#list-more').onclick();
  assert.deepEqual(h.cityIds(),regionsOnly.cityIds());
  assert.equal(h.cityIds().length,120);
  assert.equal(h.el('#city-list').scrollTop,138);
});

test('clicking a landmark closes mobile search before opening its editor and city clicks retain their own handler', () => {
  const h=harness();
  h.search({query:'耶路撒冷'});h.el('#city-picker').open=true;
  h.buttons()[0].onclick();
  assert.deepEqual(h.events,['close-picker','open-landmark']);
  assert.deepEqual(h.opened,[{kind:'landmark',id:JERUSALEM,memberId:'self',pickerOpen:false}]);
  assert.equal(h.el('#city-picker').open,false);
  h.search({query:'巴黎',country:'FRA'});
  const landmark=h.buttons().find(button=>button.dataset.landmark===PARIS),city=h.buttons().find(button=>button.dataset.city===PARIS_CITY);
  landmark.onclick();city.onclick();
  assert.deepEqual(h.events.slice(2),['open-landmark','open-city'],'a closed desktop picker is not closed again');
  assert.equal(h.opened.at(-2).id,PARIS);
  assert.deepEqual(h.opened.at(-1),{kind:'city',id:PARIS_CITY,memberId:'self'});
});
