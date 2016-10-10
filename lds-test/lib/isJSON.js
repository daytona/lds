module.exports = function isJSON(string) {
  try {
    JSON.parse(string);
  } catch (err) {
    return false;
  }
  return true;
};
