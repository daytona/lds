#!/usr/bin/env node --use_strict

var program = require('commander');

program.version('0.0.1');

module.exports = function cli(params) {
  Object.keys(params).forEach(function(command) {
    program
      .command(command + (params[command].args ? ' ' + params[command].args : ''))
      .description(params[command].description || '')
      .action(params[command].action);
  });

  program.parse(process.argv);
}
