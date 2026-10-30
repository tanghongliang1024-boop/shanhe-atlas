'use strict';
const fs=require('node:fs'),path=require('node:path');
const assets=path.join(__dirname,'../assets');
const read=name=>JSON.parse(fs.readFileSync(path.join(assets,name),'utf8'));
const withoutGeometry=feature=>({...feature,geometry:null});

// These older boundary files remain the source of historical names and IDs.
// The current map loads its prefecture geometry separately when it is opened.
const metadata={
  version:1,
  sourceFiles:['provinces.json','cities.json','taiwan-counties.json'],
  provinces:read('provinces.json').features.filter(feature=>/^\d{6}$/.test(String(feature.properties.adcode))).map(withoutGeometry),
  legacy:[...read('cities.json').features,...read('taiwan-counties.json').features].map(withoutGeometry)
};
const output=path.join(assets,'geo/china-legacy-metadata.json');
fs.writeFileSync(output,JSON.stringify(metadata));
console.log(JSON.stringify({file:'assets/geo/china-legacy-metadata.json',provinces:metadata.provinces.length,legacy:metadata.legacy.length,bytes:fs.statSync(output).size}));
