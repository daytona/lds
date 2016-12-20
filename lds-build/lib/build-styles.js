var fs = require('fs-extra');
var postcss = require('postcss');
var cssnext = require('postcss-cssnext');
var cssnano = require('cssnano');
var cssimport = require('postcss-import');
var cssprefix = require('postcss-class-prefix');
var cssurl = require('postcss-url');

module.exports = function buildStyles(files, src, dest, prefix, plugins, callback) {
  var bundle = postcss.root();
  var plugins = plugins || [];
// Create fake base style with imports
  var imports = files.map(function(file) {
    return '@import \"' + file + '\";';
  }).join('\n');
  var processor = postcss()
    .use(cssimport({
      map: {inline: true, sourcesContent: false}
    }))
    .use(cssprefix(prefix ? prefix + '-' : ''))
    //.use(cssurl())
    .use(cssnext())
    .use(cssnano());

  plugins.forEach(function(plugin) {
    processor.use(plugin);
  });

  processor
    .process(imports, { from: src + '/imports.css', to: dest })
    .then(function (result) {
      fs.writeFileSync(dest, result.css);
      if (result.map) {
        fs.writeFileSync(dest + '.map', result.map);
      }
      if (typeof callback === 'function') {
        callback();
      }
    });
}
