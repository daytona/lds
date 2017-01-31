var id = 0;

module.exports = function guid(prefix) {
  prefix = prefix || '';
  return id++;
}
