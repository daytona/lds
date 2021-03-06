function objectDeepMap(object, callback) {
  Object.keys(object).map((key) => {
    object[key] = callback(object[key], key);
    if (typeof object[key] === 'object' && !('length' in object[key])) {
      objectDeepMap(object[key], callback);
    }
  })
  return object;
}

module.exports = objectDeepMap;
