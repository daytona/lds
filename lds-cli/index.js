#!/usr/bin/env node --use_strict

var program = require('commander');

program.version('0.0.1');

module.exports = function cli(params) {
  Object.keys(params).forEach(function(command) {
    params[command].args
    program
      .command(command + (params[command].args ? ' ' + params[command].args : ''))
      .description(params[command].description || '')
      .action(function() {
        return params[command].action(arguments.splice(1));
      });
  });

  program.parse(process.argv);
}
