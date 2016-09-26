var isJSON = require('./isJSON');

module.exports = function pureQuery(rawQuery) {
  var query = {};
  Object.keys(rawQuery).forEach((key) => {
    var value = (typeof rawQuery[key] === 'string') ? rawQuery[key].replace(/\%23/g, '#') : rawQuery[key];
    query[key] = isJSON(value) ? JSON.parse(value) : value;
  });
  return query;
}
