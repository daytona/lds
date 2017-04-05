var fs = require('fs-extra');
var Browserify = require('browserify');
var babelify = require('babelify');
var uglifyify = require('uglifyify');
var partialify = require('partialify/custom');

module.exports = function buildScript(files, root, dest, sourceMaps, viewsExtension, callback) {
  var debug = (typeof sourceMaps === 'boolean' ? sourceMaps : true);
  var browserify = Browserify({ debug: debug });

  browserify
    .add(files, {
      basedir: root
    })
    .transform(partialify.alsoAllow(viewsExtension || 'hbs'))
    .transform(babelify, {
      presets: ['es2015']
    })
    .transform({global: true, debug: debug }, uglifyify);

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
