// Tests and lints, to make sure LDS is working correctly before trying a build, serving content or commiting

//var mocha = require('mocha');
var path = require ('path');
var fs = require ('fs');
var parser = require('@daytona/lds-parser').sync;
var isJSON = require('./lib/isJSON');
var passed = [];
var warnings = [];
var errors = [];

module.exports = function test(root, onlyErrors) {
  var config;
  var structure;
  var valid = true;

  function info() {
    if (!onlyErrors) {
      console.log(Array.prototype.join.call(arguments, ' '));
    }
  }
  function success() {
    passed.push(arguments);
    if (!onlyErrors) {
      console.log('√',  Array.prototype.join.call(arguments, ' '));
    }
  }
  function warn() {
    warnings.push(arguments);
    if (!onlyErrors) {
      console.log('!', Array.prototype.join.call(arguments, ' '));
    }
  }
  function error() {
    valid = false;
    errors.push(arguments);
    console.error('X', Array.prototype.join.call(arguments, ' '));
  }

  info('');
  info('');
  info('Running tests:');
  info('');

  // Test config file
  try {
    config = require(path.join(root, 'lds.config.js'));
    success('Config file found');
  } catch (err) {
    error('No config file: ', err)
    return false;
  }
  if (config.engine) {
    if (config.engine.render('testString', {example:'data'}) !== 'testString') {
      error('Template engine renderer not working');
    } else {
      success('Template engine rendered testString');
    }
  }
  // Test config path directories
  if (config.path) {
    Object.keys(config.path).forEach(function(key) {
      var value = config.path[key];
      if (typeof value === 'string' && key !== 'dirname' && key !== 'public') {
        try {
          fs.statSync(root + '/' + value).isDirectory();
          success(key, 'directory exists:', value);
        } catch (err) {
          warn(key, 'directory doesn\'t exist: ', err);
        }
      }
    });
  }
  try {
    structure = parser(config).structure;
    success('LDS structure successfully parsed');
  } catch(err) {
    error('Can\'t parse components', err);
    //return false;
  }

  if (structure) {
    Object.keys(structure).forEach(function(key) {
      if (structure[key]) {
        Object.keys(structure[key]).forEach(function(name) {
          testComponent(structure[key][name]);
        });
      }
    });
  }

  function testComponent (component) {
    if (!component.info) {
      warn(component.id, 'has no readme.md');
    }
    if (component.template && !component.data && component.template.match(/\{\{.*\}\}/g)) {
      warn(component.id, 'has no default.json');
    }

    if (component.data) {
      try {
        isJSON(component.data);
      } catch (err) {
        error('Invalid JSON data', err);
      }
      if (Object.keys(component.data).length === 0) {
        warn(component.id, 'default.json is empty object');
      }
      if (component.config && component.config.schema) {
        // Test component data with schema rules
      }
    }
  }

  info('');
  info('');
  info(errors.length + ' errors, ' + warnings.length + ' warnings, ' + passed.length + ' passed');

  if (!errors.length && !warnings.length) {
    info('Wow, perfect score!');
  } else if (!errors.length) {
    info('Nice job!');
  }

  return valid;
}
/**
 * Tests to expect
 * : is process.cwd() a lds directory
 * : lds-config.js exists and needed properties
 * : Non empty default.json
 * : Each path in config needs to exist
 * : Test Templating engine
 * : ...
 */
