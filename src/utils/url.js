export function getQuery(name) {
    return location.search.substr(location.search.indexOf(name)).split('&')[0].split('=')[1];
}

export function isQuery(name) {
    return typeof getQuery(name) === 'string';
}