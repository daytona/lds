var fs = require('fs-extra')
var path = require('path');
var trace = require('./lib/trace');
var folderExists = require('is-existing-folder');

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
    base : config.path.base ? trace(path.join(config.path.dirname, config.path.base)) : false,
    components : config.path.components ? trace(path.join(config.path.dirname, config.path.components)) : false,
    modules : config.path.modules ? trace(path.join(config.path.dirname, config.path.modules)) : false,
    views :  config.path.views ? trace(path.join(config.path.dirname, config.path.views)) : false,
    helpers :  config.path.helpers ? trace(path.join(config.path.dirname, config.path.helpers)) : false
  };

  // Look if folder exists, otherwise create it
  try  {
    fs.statSync(path.join(config.path.dirname, config.path.dist)).isDirectory();
  }
  catch (e) {
    fs.mkdirSync(path.join(config.path.dirname, config.path.dist));
  };

  if (!type) {
    // fs.emptyDirSync(path.join(config.path.dirname, config.path.dist), function (err) {
    //   if (!err) console.log('Empty DIST')
    // });
  }

  if (!type || type === 'icons') {
    console.log('Generating iconfont');

    require('./lib/build-icons')({
      iconSrc: path.join(config.path.dirname, config.path.icons),
      fontName: 'icons',
      fontDest: path.join(config.path.dirname, config.path.dist, config.dest.fonts || 'fonts'),
      iconDest: path.join(config.path.dirname, config.path.dist, config.dest.icons || 'icons'),
      cssDest: path.join(config.path.dirname, config.path.base + '/icon/index.css'),
      templateDest: path.join(config.path.dirname, config.path.base + '/icon/index.hbs')
    }, function(){
      console.log('Iconfont generated');
    });
  }

  if(!type || type === 'fonts' && config.path.fonts) {
    console.log('Copying webfonts');
    require('./lib/build-fonts')(path.join(config.path.dirname, config.path.fonts), path.join(config.path.dirname, config.path.dist, config.dest.fonts), function(){
      console.log('All fonts written to disk');
    });
  }

  if (!type || type === 'images') {
    console.log('Building images');
    require('./lib/build-images')(path.join(config.path.dirname, config.path.images), path.join(config.path.dirname, config.path.dist, config.dest.images), function(files) {
      console.log(files.length, 'images written to disk');
    });
  }

  if (!type || type === 'script') {
    var scripts = findComponents(components, /index.js$/, 'src/');
    console.log('Bundling scripts');
    require('./lib/build-scripts')(scripts, config.path.dirname, path.join(config.path.dirname, config.path.dist, config.dest.script), function(){
      console.log('JS bundle written to disk: ', path.join(config.path.dirname, config.path.dist, config.dest.script));
    });
  }

  if (type === 'sass') {
    var styles = findComponents(components, /index.scss$/, 'src/');
    console.log('Building sass styles');
    require('./lib/build-sass')(styles, config.path.dirname, path.join(config.path.dirname, config.path.dist, config.dest.style), config.prefix);
  }

  if (!type || type === 'styles') {
    var styles = findComponents(components, /index.css$/, 'src/');
    var buildStyles = require('./lib/build-styles');
    console.log('Bundling styles');

    buildStyles(styles, config.path.dirname, path.join(config.path.dirname, config.path.dist, config.dest.style), config.prefix, config.postcss, function() {
      console.log('CSS bundle written to disk: ',path.join(config.path.dirname, config.path.dist, config.dest.style));
    });
    console.log('looking for styleguide styles');
    try {
      // Query the entry
      stats = fs.lstatSync(path.join(config.path.dirname, 'styleguide.css'));

      if(stats.isFile()) {
        buildStyles([path.join(config.path.dirname, 'styleguide.css')], config.path.dirname, path.join(config.path.dirname, config.path.dist, 'styleguide.css'), config.prefix, config.postcss, function() {
          console.log('Styleguide theme css written to disk');
        });
      }
    } catch(err) {
      // No styleguide.css available
    }
  }

};
