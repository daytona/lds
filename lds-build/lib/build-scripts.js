var fs = require('fs-extra');
var Browserify = require('browserify');
var babelify = require('babelify');
var uglifyify = require('uglifyify');

module.exports = function buildScript(files, root, dest, callback) {
  var browserify = Browserify({ debug: true });

  browserify
    .add(files, {
      basedir: root
    })
    .transform(babelify, {
      presets: ['es2015']
    })
    .transform({global: true, debug: true}, uglifyify);

  browserify
    .bundle()
    .on('error', function(error) {
      console.log(error.message);
      this.emit('end');
    })
    .on('end', function(stream) {
      if (typeof callback === 'function') {
        callback();
      }
    })
    .pipe(fs.createWriteStream(dest));
}
