var fs = require('fs-extra');

module.exports = function buildFonts(src, dest) {
  console.log('build fonts from', src, 'to ', dest);
  try {
    fs.copySync(src, dest);
  } catch (err) {
    console.error('Could not copy font files: ' + err.message)
  }
}
