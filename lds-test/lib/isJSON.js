var jsonlint = require('jsonlint');

module.exports = function isJSON(string) {
  try {
    jsonlint.parse(string);
  } catch (err) {
    return false;
  }
  return true;
};
