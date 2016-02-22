var fs = require('fs-extra');

module.exports = function buildFonts(src, dest) {
  try {
    fs.copySync(src, dest);
  } catch (err) {
    console.error('Could not copy font files: ' + err.message)
  }
}
