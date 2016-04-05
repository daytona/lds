var fs = require('fs');

module.exports = function pathExists(path) {
  var stat = fs.lstatSync(path);
  return stat.isFile() || stat.isDirectory();
}
