(function(root){
  'use strict';
  const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replaceAll('臺','台').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  const unique = values => [...new Set(values)];
  const recordOf = (records, id) => records instanceof Map ? records.get(id) : records?.[id];
  const countriesOf = place => unique([place.countryCode, ...(place.countryCodes || [])].filter(Boolean));

  function catalog(data){
    if(!data || !Array.isArray(data.places) || !Array.isArray(data.themes)) throw Error('Invalid landmark catalog');
    const byId = new Map(), themeById = new Map();
    const places = data.places.map(source => {
      if(!source || typeof source.id !== 'string' || !/^poi:[A-Z]{3}:[a-z0-9][a-z0-9-]*$/.test(source.id) || !source.name) throw Error('Invalid landmark identifier or name');
      if(byId.has(source.id)) throw Error('Duplicate landmark identifier: ' + source.id);
      if(!/^[A-Z]{3}$/.test(source.countryCode) || !source.id.startsWith('poi:' + source.countryCode + ':')) throw Error('Invalid landmark country: ' + source.id);
      if(!Array.isArray(source.coordinates) || source.coordinates.length !== 2 || !source.coordinates.every(Number.isFinite) || Math.abs(source.coordinates[0]) > 180 || Math.abs(source.coordinates[1]) > 90) throw Error('Invalid landmark coordinates: ' + source.id);
      for(const field of ['countryCodes','provinceCodes','regionIds','themeIds','aliases']){
        if(source[field] !== undefined && (!Array.isArray(source[field]) || source[field].some(value => typeof value !== 'string' || !value))) throw Error('Invalid landmark ' + field + ': ' + source.id);
      }
      if((source.countryCodes || []).some(code => !/^[A-Z]{3}$/.test(code))) throw Error('Invalid landmark country codes: ' + source.id);
      const place = {...source, coordinates:[...source.coordinates], countryCodes:countriesOf(source), provinceCodes:unique(source.provinceCodes || []), regionIds:unique(source.regionIds || []), themeIds:unique(source.themeIds || []), aliases:unique(source.aliases || [])};
      byId.set(place.id, place);
      return place;
    });
    const themes = data.themes.map(source => {
      if(!source || typeof source.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(source.id) || !source.name || !Array.isArray(source.placeIds)) throw Error('Invalid landmark theme');
      if(themeById.has(source.id)) throw Error('Duplicate landmark theme: ' + source.id);
      const theme = {...source, placeIds:unique(source.placeIds)};
      for(const id of theme.placeIds){
        if(!byId.has(id)) throw Error('Unknown landmark in theme: ' + id);
        const place = byId.get(id);
        if(!place.themeIds.includes(theme.id)) place.themeIds.push(theme.id);
      }
      themeById.set(theme.id, theme);
      return theme;
    });
    for(const place of places){
      for(const id of place.themeIds){
        if(!themeById.has(id) || !themeById.get(id).placeIds.includes(place.id)) throw Error('Inconsistent landmark theme: ' + place.id + '/' + id);
      }
    }
    return {places, themes, byId, themeById, note: typeof data.note === 'string' ? data.note : ''};
  }

  function matches(place, query, country = 'all'){
    if(country !== 'all' && !countriesOf(place).includes(country)) return false;
    const needle = normalize(query);
    return !needle || normalize([place.name, place.nameEn, place.country, place.location, place.stampLabel, ...(place.aliases || [])].filter(Boolean).join(' ')).includes(needle);
  }

  function status(records, id){
    const row = recordOf(records, id);
    if(!row || row.deleted === true) return 'unvisited';
    return row.status === 'visited' || row.status === 'wish' ? row.status : 'unvisited';
  }

  function progress(theme, records){
    const ids = unique(theme?.placeIds || []);
    const visited = ids.filter(id => status(records, id) === 'visited').length;
    return {visited, total:ids.length, complete:ids.length > 0 && visited === ids.length};
  }

  function stats(model, records){
    let visited = 0, wish = 0;
    const countries = new Set();
    for(const place of model.places){
      const value = status(records, place.id);
      if(value === 'visited'){
        visited++;
        // A cross-border landmark credits only its primary country. Visiting the
        // landmark alone does not establish that every border was crossed.
        countries.add(place.countryCode);
      }else if(value === 'wish') wish++;
    }
    return {visited, wish, countries:countries.size, completedThemes:model.themes.filter(theme => progress(theme, records).complete).length};
  }

  function markerPlaces(model, scope = {kind:'world'}, options = {}){
    const {theme = 'all', status: wanted = 'all', records = {}} = options;
    const themeIds = theme === 'all' ? null : new Set(model.themeById.get(theme)?.placeIds || []);
    if(!['all','visited','wish','unvisited'].includes(wanted)) return [];
    return model.places.filter(place => {
      if(themeIds && !themeIds.has(place.id)) return false;
      if(wanted !== 'all' && status(records, place.id) !== wanted) return false;
      switch(scope?.kind){
        case 'world': return true;
        case 'china': return countriesOf(place).includes('CHN');
        case 'country': return countriesOf(place).includes(String(scope.code));
        case 'province': return countriesOf(place).includes('CHN') && place.provinceCodes.includes(String(scope.code));
        case 'region': return place.regionIds.includes(String(scope.code));
        default: return false;
      }
    });
  }

  const api = {catalog, matches, status, progress, stats, markerPlaces};
  root.ShanheLandmarks = api;
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
