var isJSON = require('./isJSON');

module.exports = function pureQuery(rawQuery) {
  var query = {};
  console.log(rawQuery)
  Object.keys(rawQuery).forEach((key) => {
    query[key] = isJSON(rawQuery[key]) ? JSON.parse(rawQuery[key]) : rawQuery[key];
  });
  return query;
}
