#!/usr/bin/env node --use_strict

var cmd = require('cmd-exec').init();
var program = require('commander');
var path = require('path');
var server = require('lds-server');
var build = require('lds-build');
var test = require('lds-test');
var generator = require('lds-create');
var watch = require('watch');

var root = process.cwd();
var config = {};

program.version('0.0.1');

program
  .command('init')
  .description('Initialize a blank direcory as a LDS seting up a default folder structure')
  // Style processing [stylus, sass, less, css]
  // Template processing [handlebars, mustache, jsx]
  // Script bundling [browserify]
  // Optimization [uglify, imagemin, icon-font-generator]

  .action(function() {
    generator.init(root, function(){
      cmd.exec('npm install --save babel-preset-es2015 handlebars')
        .then(function(){
          cmd.exec('lds build', function(err, res){
            if (err) {
             console.log(err.message);
            } else {
              console.log(res.message);
            }
          });
        })
        .done(function(){
          console.log('LDS setup successfully');
        });
    });
  });

program
  .command('start')
  .description('Start new HTTP-server to serve views and styleguide')
  .action(function() {
    config = require(path.join(root, 'lds.config'));
    server(config);
    watch.createMonitor(root, {
      ignoreDirectoryPattern: /node_modules|dist/,
      ignoreDotFiles: true,
    },function (monitor) {
      monitor.on("changed", function (file, curr, prev) {
        if (/\.jsx?$/.test(file)) {
          build('script', config);
        } else if (/\.css$/.test(file)) {
          build('styles', config);
        }
      });
    });
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
