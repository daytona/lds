var fs = require('fs-extra');

module.exports = function buildFonts(src, dest, callback) {
  console.log('build fonts from', src, 'to ', dest);
  try {
    fs.copySync(src, dest);
    if (typeof callback === 'function') {
      callback();
    }
  } catch (err) {
    console.error('Could not copy font files: ' + err.message)
  }
}
