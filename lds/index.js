#!/usr/bin/env node --use_strict

var fs = require('fs');
var fileExists = require('file-exists');
var path = require('path');
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
  cli({
    start: {
      description: "Start new HTTP-server to serve views and styleguide",
      action() {
        return server(config);
      }
    },
    build: {
      description: "Build all assets to dist folder, starting watchtasks",
      action(type = '') {
        console.log('build assets');
        return build(type, config);
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
      action(type = 'all') {
        console.log('Tests not yet implemented. sorry');
      }
    }
  });
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
