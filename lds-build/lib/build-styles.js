var fs = require('fs-extra');
var postcss = require('postcss');
var cssnext = require('postcss-cssnext');
var cssnano = require('cssnano');
var cssimport = require('postcss-import');
var cssurl = require('postcss-url');

module.exports = function buildStyles(files, src, dest) {
  var bundle = postcss.root();

// Create fake base style with imports
  var imports = files.map(function(file) {
    return '@import \"' + file + '\";';
  }).join('\n');

  postcss()
    .use(cssimport({
      map: {inline: true, sourcesContent: true}
    }))
    .use(cssurl())
    .use(cssnext())
    .use(cssnano())
    .process(imports, { from: src + '/imports.css', to: dest })
    .then(function (result) {
      fs.writeFileSync(dest, result.css);
      if (result.map) {
        fs.writeFileSync(dest + '.map', result.map);
      }
    });
}
