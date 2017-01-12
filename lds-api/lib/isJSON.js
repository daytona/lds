module.exports = function isJSON(string) {
  var json;
  try {
    json = JSON.parse(string);
  } catch (err) {
    return false;
  }
  return json;
};
