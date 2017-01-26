var fs = require('fs-extra')
var path = require('path');
var trace = require('./lib/trace');
var folderExists = require('is-existing-folder');

var buildIcons = require('./lib/build-icons');
var buildFonts = require('./lib/build-fonts');
var buildImages = require('./lib/build-images');
var buildScripts = require('./lib/build-scripts');
var buildStyles = require('./lib/build-styles');
var buildTree = require('./lib/build-tree');
var buildSass = require('./lib/build-sass');
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
      } else if ((path + name).match(regexp)) {
        matches.push(path + name);
      }
    });
  }

  return matches;
}

// Short for log
var log = console.log.bind(console);

// Build scripts for bundling scripts and styles, generating icon-fonts, minifying imagages and copying font files.
module.exports = function build(type, config, callback) {
  let taskcount = 0;

  function taskStart() {
    if (arguments) {
      log.call(this, ...arguments);
    }
    taskcount++;
  }

  function taskDone() {
    if (arguments) {
      log.call(this, ...arguments);
    }
    taskcount--;
    if (taskcount < 1 && typeof(callback) === 'function') {
      callback();
    }
  }

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

      taskStart('generating icon font');
      buildIcons({
        iconSrc: path.join(cfgPath.dirname, cfgPath.icons),
        fontName: 'icons',
        fontDest: path.join(cfgPath.dirname, cfgPath.dist, config.dest.fonts || 'fonts'),
        iconDest: path.join(cfgPath.dirname, cfgPath.dist, config.dest.icons || 'icons'),
        cssDest: path.join(cfgPath.dirname, cfgPath.base + '/icon/index.css'),
        templateDest: path.join(cfgPath.dirname, cfgPath.base + '/icon/index.hbs')
      }, function(){
        taskDone('Iconfont generated');
      });
    },

    fonts: (config) => {
      if (!cfgPath.fonts) return;
      taskStart('Copying webfonts');
      buildFonts(path.join(cfgPath.dirname, cfgPath.fonts), path.join(cfgPath.dirname, cfgPath.dist, config.dest.fonts), function(){
        taskDone('All fonts written to disk');
      });
    },

    images: (config) => {
      if (!cfgPath.images) return;
      taskStart('Building images');
      buildImages(path.join(cfgPath.dirname, cfgPath.images), path.join(cfgPath.dirname, cfgPath.dist, config.dest.images), function(files) {
        taskDone(files.length, 'images written to disk');
      });
    },

    script: (config) => {
      var scripts = findComponents(components, /index.js$/, 'src/');
      taskStart('Bundling scripts');
      buildScripts(scripts, cfgPath.dirname, path.join(cfgPath.dirname, cfgPath.dist, config.dest.script), function(){
        taskDone('JS bundle written to disk: ', path.join(cfgPath.dirname, cfgPath.dist, config.dest.script));
      });
      if (config.dest.scripts && config.dest.scripts.length) {
        config.dest.scripts.forEach(bundle => {
          taskStart('Bundling scripts', bundle.dest);
          var bundleScripts = [];
          bundle.src.forEach(path => {
            bundleScripts = bundleScripts.concat(findComponents(components, new RegExp(path + '.*\\.js$'), 'src/'));
          });
          buildScripts(bundleScripts, cfgPath.dirname, path.join(cfgPath.dirname, cfgPath.dist, bundle.dest), function(){
            taskDone('JS bundle '+ bundle.dest +' written to disk: ', path.join(cfgPath.dirname, cfgPath.dist, bundle.dest));
          });
        })
      }
    },

    styles: (config) => {
      var styles = findComponents(components, /index.css$/, 'src/');
      taskStart('Bundling styles');

      buildStyles(styles, cfgPath.dirname, path.join(cfgPath.dirname, cfgPath.dist, config.dest.style), config.prefix, config.postcss, function() {
        taskDone('CSS bundle written to disk:', path.join(cfgPath.dirname, cfgPath.dist, config.dest.style));
      });

      if (config.dest.styles && config.dest.styles.length) {
        config.dest.styles.forEach(bundle => {
          taskStart('Bundling styles', bundle.dest);
          var bundleStyles = [];
          bundle.src.forEach(path => {
            bundleStyles = bundleStyles.concat(findComponents(components, new RegExp(path + '.*\\.css$'), 'src/'));
          });
          buildStyles(bundleStyles, cfgPath.dirname, path.join(cfgPath.dirname, cfgPath.dist, bundle.dest), config.prefix, config.postcss, function(){
            taskDone('CSS bundle '+ bundle.dest +' written to disk: ', path.join(cfgPath.dirname, cfgPath.dist, bundle.dest));
          });
        })
      }

      try {
        // Query the entry
        stats = fs.lstatSync(path.join(cfgPath.dirname, 'styleguide.css'));

        if(stats.isFile()) {
          taskStart('Building styleguide theme')
          buildStyles([path.join(cfgPath.dirname, 'styleguide.css')], cfgPath.dirname, path.join(cfgPath.dirname, cfgPath.dist, 'styleguide.css'), config.prefix, config.postcss, function() {
            taskDone('Styleguide theme css written to disk');
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
