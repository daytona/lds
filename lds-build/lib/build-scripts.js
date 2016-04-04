var fs = require('fs-extra');
var Browserify = require('browserify');
var babelify = require('babelify');
var uglifyify = require('uglifyify');

module.exports = function buildScript(files, root, dest) {
  var browserify = Browserify({ debug: true });

  browserify
    .add(files, {
      basedir: root
    })
    .transform(babelify, {
      presets: ['es2015']
    })
    .transform({global: true, debug: true}, uglifyify)
    .bundle()
    .on('error', function(error) {
      console.log(error.message);
      this.emit('end');
    })
    .pipe(fs.createWriteStream(dest));
}
