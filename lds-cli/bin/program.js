#!/usr/bin/env node

var program = require('commander');
var config = require('../package');
var log = console.log.bind(console);

program.version(config.version);

program
  .command('init')
  .description('Set up a bare bones living design system')

program
  .command('start')
  .description('Starting up a HTTP-server')
  .action(require('./create'));

program
  .command('update')
  .description('Update system and all component dependencies')
  .action(log);

program
  .command('upgrade')
  .description('Fetch latest version and update all dependencies')
  .action(log);

program
  .command('bump [version]')
  .description('Bump version of entire system or specific component')
  .option('-c, --component [component]', 'Bump the version of a component')
  .option('-m, --message [message]', 'Commit message')
  .action(require('./bump'));

program
  .command('test')
  .description('Run tests for all components')
  .option('-c, --component [name]', 'Test only specific component')
  .action(log);

program
  .command('export')
  .description('Output entire system as static documents')
  .option('-c, --component [name]', 'Export only specific component')
  .action(log);

program
  .command('serve')
  .description('Start a local server for working with components')
  .option('-c, --component [name]', 'Serve only specific component')
  .action(log);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
