function objectDeepMap(object, callback, path) {
  path = path || '';
  Object.keys(object).map((key) => {
    object[key] = callback(object[key], key, path);

    if (typeof object[key] === 'object') {
      objectDeepMap(object[key], callback, path.length ? path+'.'+key : key);
    }
  });
  return object;
}

module.exports = objectDeepMap;
