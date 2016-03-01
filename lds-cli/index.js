#!/usr/bin/env node --use_strict

// require('babel-core/register');
// require("babel-polyfill");
var program = require('commander');
var path = require('path');
var server = require('lds-server');
var build = require('lds-build');
var test = require('lds-test');

root = process.cwd();
var config = require(path.join(root, 'lds.config'));

program.version('0.0.1');

program
  .command('init')
  .description('Initialize a blank direcory as a LDS seting up a default folder structure');

program
  .command('start')
  .description('Start new HTTP-server to serve views and styleguide')
  .action(function() {
    server(config);
  });

program
  .command('build [type]')
  .description('Build all assets to dist folder, starting watchtasks')
  .action(function(type) {
    build(type, config);
  });

program
  .command('test')
  .description('Run tests to make sure LDS is correctly configured')
  .action(function() {
    test(env, config);
  });

program
  .command('create <type>')
  .description('Create new component,view,base,helper,layout')
  .action(function() {
    console.log('Create component/base/helper/view/layout');
  });

program
  .command('export')
  .description('export routes to static html to dist with relative paths to assets');

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log('Unregistered command');
}
