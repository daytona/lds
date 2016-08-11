var fs = require('fs');
var fileExists = require('file-exists');
var path = require('path');
var watch = require('watch');
var cli = require('@daytona/lds-cli');
var server = require('@daytona/lds-server');
var generator = require('@daytona/lds-create');
var build = require('@daytona/lds-build');
var styleguide = require('@daytona/lds-styleguide');
var test = require('@daytona/lds-test');
var api = require('@daytona/lds-api');
var engine = require('@daytona/lds-engine');
var parser = require('@daytona/lds-parser');
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

function setup(config) {
  var commands = {
    start: {
      description: "Start new HTTP-server to serve views and styleguide",
      action() {
        return server(config);
      }
    },
    build: {
      description: "Build all assets to dist folder, starting watchtasks",
      action(command, type) {
        return build(type, config);
      }
    },
    watch: {
      description: "Look for changes in files and callappropriate build task",
      action(command, type) {
        // Start server forst
        commands.start.action();
        console.log('--------------------------------');
        console.log('Watching for changes in files...');
        watch.createMonitor(config.path.dirname, {
          ignoreDirectoryPattern: /node_modules|dist/,
          ignoreDotFiles: true,
        },function (monitor) {
          monitor.on("changed", function (file, curr, prev) {
            if (/\.jsx?$/.test(file)) {
              build('script', config);
            } else if (/\.css$/.test(file)) {
              build('styles', config);
            } else if (/\.(png|jpg|gif)$/.test(file)) {
              build('images', config);
            } else if (/\.svg$/.test(file)) {
              build('icons', config);
            } else if (/\.(woff|ttf|otf|eot)$/.test(file)) {
              build('fonts', config);
            }
          });
        });
      }
    },
    create: {
      description: "Create new component,view,base,helper,layout",
      action(type, name) {
        generator.create(type, name, config);
      }
    },
    test: {
      description: "Test your LDS strucuture, file syntax and all nessecary functions",
      action(type) {
        console.log('Tests not yet implemented. sorry');
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
          return generator.init(root, function() {
            console.log('A new living design system is set up');
          });
        }
      }
    });
  }
}

module.exports = dependencies;
