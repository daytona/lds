#!/usr/bin/env node --use_strict

var program = require('commander');
var path = require('path');
var server = require('lds-server');
var build = require('lds-build');
var test = require('lds-test');
var generator = require('lds-create');

root = process.cwd();
var config = {};

program.version('0.0.1');

program
  .command('init')
  .description('Initialize a blank direcory as a LDS seting up a default folder structure')
  .action(function() {
    generator.init(root);
  });

program
  .command('start')
  .description('Start new HTTP-server to serve views and styleguide')
  .action(function() {
    config = require(path.join(root, 'lds.config'));
    server(config);
  });

program
  .command('build [type]')
  .description('Build all assets to dist folder, starting watchtasks')
  .action(function(type) {
    config = require(path.join(root, 'lds.config'));
    build(type, config);
  });

program
  .command('test [type]')
  .description('Run tests to make sure LDS is correctly configured')
  .action(function(type, root) {
    test(type);
  });

program
  .command('create <type> <name>')
  .description('Create new component,view,base,helper,layout')
  .action(function(type, name) {
    config = require(path.join(root, 'lds.config'));
    generator.create(type, name, config);
  });

program
  .command('export')
  .description('export routes to static html to dist with relative paths to assets');

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log('Unregistered command');
}
