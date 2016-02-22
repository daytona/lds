var fs = require('fs-extra')
var path = require('path');
var trace = require('./lib/trace');

// Step through a object of files and return all file names which match a certain reg exp
function findComponents(branch, regexp, path) {
  path = path || '';
  var matches = [];
  if (branch) {
    Object.keys(branch).forEach(function(name) {
      var leaf = branch[name];

      if (typeof leaf === 'object') {
        var childmatches = findComponents(leaf, regexp, path + name + '/');
        matches = matches.concat(childmatches);
      } else if (name.match(regexp)) {
        matches.push(path + name);
      }
    });
  }

  return matches;
}

// Build scripts for bundling scripts and styles, generating icon-fonts, minifying imagages and copying font files.
module.exports = function build(type, config) {
  var components = {
    base : trace(path.join(config.path.dirname, config.path.base)),
    components : trace(path.join(config.path.dirname, config.path.components))
  };

  // If build all, first empty dist-folder
  if (!type) {
    fs.emptyDirSync(path.join(config.path.dirname, config.path.dist), function (err) {
      if (!err) console.log('Empty DIST')
    });
  }

  if (!type || type === 'icons') {
    console.log('Generating iconfont');

    require('./lib/build-icons')({
      iconSrc: path.join(config.path.dirname, config.path.icons),
      fontName: 'icons',
      fontDest: path.join(config.path.dirname, config.path.fonts),
      cssDest: path.join(config.path.dirname, config.path.base + '/icon/index.css')
    });
  }

  if(!type || type === 'fonts') {
    console.log('Copying webfonts');
    require('./lib/build-fonts')(path.join(config.path.dirname, config.path.fonts), path.join(root, config.path.dist, config.dest.fonts));
  }

  if (!type || type === 'images') {
    console.log('Building images');
    require('./lib/build-images')(path.join(config.path.dirname, config.path.images), path.join(root, config.path.dist, config.dest.images));
  }

  if (!type || type === 'script') {
    var scripts = findComponents(components, /index.js$/, 'src/');
    console.log('Building scripts:', scripts);
    require('./lib/build-scripts')(scripts, config.path.dirname, path.join(config.path.dirname, config.path.dist, config.dest.script));
  }

  if (!type || type === 'styles') {
    var styles = findComponents(components, /index.css$/, 'src/');
    console.log('Building styles:', styles);
    require('./lib/build-styles')(styles, config.path.dirname, path.join(config.path.dirname, config.path.dist, config.dest.style));
  }

  if (!type || type === 'tree') {
    require('./lib/build-tree')(config);
  }

};
