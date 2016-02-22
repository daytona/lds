#!/usr/bin/env node
require('babel-core/register');
require("babel-polyfill");
var program = require('commander');
var path = require('path');
var server = require('lds-server').default;
var build = require('lds-build');
var test = require('lds-test');

root = process.cwd();
var config = require(path.join(root, 'lds.config')).default;

program
  .version('0.0.1')
  .arguments('<cmd> [env]')
  .action(function (cmd, env) {
    if (cmd === 'init') { // Initialize a blank direcory as a LDS seting up a default folder structure
      console.log('init process.cwd() as a lds, checkout boilerplate folder structure and link lds-dependencies');

    } else if (cmd === 'start') { // Start new HTTP-server to serve views and styleguide
      server(config);

    } else if (cmd === 'build') { // Build all assets to dist folder, starting watchtasks
      build(env, config);

    } else if (cmd === 'test') { // Run tests to make sure LDS is correctly configured
      test(env, config);

    } else if (cmd === 'create') { // create new component,view,base,helper,layout
      console.log('Create component/base/helper/view/layout');

    } else if (cmd === 'export') { // Export static html to /dist
      console.log('export routes to static html to dist with relative paths to assets');

    } else {
      console.log('LDS does not yet recognize your command');
    }
  })
  .parse(process.argv);
