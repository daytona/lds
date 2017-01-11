var isJSON = require('./isJSON');

module.exports = function pureQuery(rawQuery) {
  var query = {};
  Object.keys(rawQuery).forEach((key) => {
    query[key] = isJSON(rawQuery[key]) ? JSON.parse(rawQuery[key]) : rawQuery[key];
  });
  return query;
}
