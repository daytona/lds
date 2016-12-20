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

// Short for log
var log = console.log.bind(console);

// Build scripts for bundling scripts and styles, generating icon-fonts, minifying imagages and copying font files.
module.exports = function build(type, config) {
  var cfgPath = config.path;
  var components = {
    base : cfgPath.base ? trace(path.join(cfgPath.dirname, cfgPath.base)) : false,
    components : cfgPath.components ? trace(path.join(cfgPath.dirname, cfgPath.components)) : false,
    modules : cfgPath.modules ? trace(path.join(cfgPath.dirname, cfgPath.modules)) : false,
    views :  cfgPath.views ? trace(path.join(cfgPath.dirname, cfgPath.views)) : false,
    helpers :  cfgPath.helpers ? trace(path.join(cfgPath.dirname, cfgPath.helpers)) : false
  };

  // Look if dist folder exists, otherwise create it
  try  {
    fs.statSync(path.join(cfgPath.dirname, cfgPath.dist)).isDirectory();
  }
  catch (e) {
    fs.mkdirSync(path.join(cfgPath.dirname, cfgPath.dist));
  };

  /**
   * Define all possible build engines
   */
  var builders = {

    icons: (config) => {
      if (!cfgPath.icons) return;
      require('./lib/build-icons')({
        iconSrc: path.join(cfgPath.dirname, cfgPath.icons),
        fontName: 'icons',
        fontDest: path.join(cfgPath.dirname, cfgPath.dist, config.dest.fonts || 'fonts'),
        iconDest: path.join(cfgPath.dirname, cfgPath.dist, config.dest.icons || 'icons'),
        cssDest: path.join(cfgPath.dirname, cfgPath.base + '/icon/index.css'),
        templateDest: path.join(cfgPath.dirname, cfgPath.base + '/icon/index.hbs')
      }, function(){
        log('Iconfont generated');
      });
    },

    fonts: (config) => {
      if (!cfgPath.fonts) return;
      log('Copying webfonts');
      require('./lib/build-fonts')(path.join(cfgPath.dirname, cfgPath.fonts), path.join(cfgPath.dirname, cfgPath.dist, config.dest.fonts), function(){
        log('All fonts written to disk');
      });
    },

    images: (config) => {
      if (!cfgPath.images) return;
      log('Building images');
      require('./lib/build-images')(path.join(cfgPath.dirname, cfgPath.images), path.join(cfgPath.dirname, cfgPath.dist, config.dest.images), function(files) {
        log(files.length, 'images written to disk');
      });
    },

    script: (config) => {
      var scripts = findComponents(components, /index.js$/, 'src/');
      log('Bundling scripts');
      require('./lib/build-scripts')(scripts, cfgPath.dirname, path.join(cfgPath.dirname, cfgPath.dist, config.dest.script), function(){
        log('JS bundle written to disk: ', path.join(cfgPath.dirname, cfgPath.dist, config.dest.script));
      });
    },

    styles: (config) => {
      var styles = findComponents(components, /index.css$/, 'src/');
      var buildStyles = require('./lib/build-styles');
      log('Bundling styles');

      buildStyles(styles, cfgPath.dirname, path.join(cfgPath.dirname, cfgPath.dist, config.dest.style), config.prefix, config.postcss, function() {
        log('CSS bundle written to disk: ',path.join(cfgPath.dirname, cfgPath.dist, config.dest.style));
      });
      log('looking for styleguide styles');
      try {
        // Query the entry
        stats = fs.lstatSync(path.join(cfgPath.dirname, 'styleguide.css'));

        if(stats.isFile()) {
          buildStyles([path.join(cfgPath.dirname, 'styleguide.css')], cfgPath.dirname, path.join(cfgPath.dirname, cfgPath.dist, 'styleguide.css'), config.prefix, config.postcss, function() {
            log('Styleguide theme css written to disk');
          });
        }
      } catch(err) {
        // No styleguide.css available
      }
    }
  }

  // Build specific build type or all viable
  if (type) {
    builders[type](config);
  } else {
    Object.keys(builders).map(type => builders[type](config));
  }
};
