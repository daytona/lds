var sass = require('node-sass');
var importOnce = require('node-sass-import-once');
var fs = require('fs');

module.exports = function buildSass(files, src, dest, prefix) {
  // Create fake base style with imports
  var imports = files.map(function(file) {
    return '@import \"' + file + '\";';
  }).join('\n');

  var result = sass.render({
    data: imports,
    includePaths: [ src ],
    outputStyle: 'compressed',
    outFile: dest,
    sourceMap: true, // or an absolute or relative (to outFile) path
    importer: importOnce,
    importOnce: {
      index: true,
      css: true,
      bower: true
    }
  },
  function(error, result) { // node-style callback from v3.0.0 onwards
    console.log('callback', result, error);
    if (!error) {
      // No errors during the compilation, write this result on the disk
      fs.writeFile(dest, result.css, function(err){
        if(!err){
          console.log('files written to disk');
        }
      });
    }
  });
}

//.process(imports, { from: src + '/imports.css', to: dest })
