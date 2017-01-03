var fs = require('fs');
var fileExists = require('file-exists');
var path = require('path');
var watch = require('watch');
var cli = require('@daytona/lds-cli');
var server = require('@daytona/lds-server');
var generator = require('@daytona/lds-create');
var build = require('@daytona/lds-build');
var styleguide = require('@daytona/lds-styleguide');
var api = require('@daytona/lds-api');
var engine = require('@daytona/lds-engine');
var parser = require('@daytona/lds-parser');
var test = require('@daytona/lds-test');
var config = process.cwd() && fileExists(process.cwd() + '/lds.config.js') ? require(process.cwd() + '/lds.config') : false;

var dependencies = {
  cli,
  build,
  server,
  styleguide,
  test,
  api,
  parser,
  engine : engine,
};
var runningServer;
function setup(config) {
  var commands = {
    start: {
      description: "Start new HTTP-server to serve views and styleguide",
      action() {
        runningServer = server(config);
        return runningServer;
      }
    },
    build: {
      description: "Build all assets to dist folder, starting watchtasks",
      args: '[type]',
      action(type) {
        type = type || false;
        return build(type, config);
      }
    },
    watch: {
      description: "Look for changes in files and callappropriate build task",
      action() {
        // Start server first
        commands.start.action();
        console.log('--------------------------------');
        console.log('Watching for changes in files...');
        watch.createMonitor(config.path.dirname, {
          ignoreDirectoryPattern: /node_modules|dist/,
          ignoreDotFiles: true,
        }, function (monitor) {
          monitor.on("created", fileWatcher);
          monitor.on("changed", fileWatcher);
          monitor.on("removed", fileWatcher);
        });
      }
    },
    create: {
      description: "Create new component,view,base,helper,layout",
      args: '<type> <name>',
      action(type, name) {
        console.log('create', type, name);
        generator.create(type, name, config);
      }
    },
    test: {
      description: "Test your LDS strucuture, file syntax and all nessecary functions",
      args: '[silent]',
      action(silent) {
        test(process.cwd(), silent);
      }
    }
  };

  cli(commands);
}

// If run from CLI
if (process.argv && process.cwd()) {
  var root = process.cwd(); // Command line directory
  if (config) {
    setup(config);
  } else {
    // IF no config is available, only allow '$ lds init'
    cli({
      init: {
        description: "Initialize a blank direcory as a LDS seting up a default folder structure",
        action() {
          var path = root;
          return generator.init(path, function() {
            console.log('A new living design system is set up');
          });
        }
      }
    });
  }
}

function fileWatcher (file) {
  if (!test(process.cwd(), true)) {
    return false;
  }
  function done() {
    runningServer.parse();
    console.log('Watching for changes in files...');
  }

  if (/\.jsx?$/.test(file)) {
    build('script', config, done);
  } else if (/\.css$/.test(file)) {
    build('styles', config, done);
  } else if (new RegExp(config.path.images +'/.*\.(png|jpg|gif|svg)$').test(file)) {
    build('images', config, done);
  } else if (new RegExp(config.path.icons +'/.*\.svg$').test(file)) {
    build('icons', config, done);
  } else if (new RegExp(config.path.fonts +'/.*\.(woff|woff2|ttf|otf|eot)$').test(file)) {
    build('fonts', config, done);
  } else if (new RegExp('\.(json|md|' + (config.engine.ext  || 'hbs') + ')$').test(file)) {
    done();
  }
}

module.exports = dependencies;
