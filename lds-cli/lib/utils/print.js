/*eslint no-console: 0 */

var isPlainObject = require('is-plain-object');
var util = require('util');
var chalk = require('chalk');

var RAINBOW = [
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'black'
];

/**
 * Apply color to first element in list
 * @param  {arguments} list  An array-like object
 * @param  {string}    color name of color to apply
 * @return {Array}           A new array with first color
 */
function colorizeArgs(list, color) {
  var args = Array.prototype.slice.call(list, 0);
  var first = (typeof args[0] === 'string') ? chalk[color](args[0]) : args[0];

  return [first].concat(args.slice(1));
}

/**
 * Print utility with some smartness based on passed in args
 */
function print() {
  var args = Array.prototype.slice.call(arguments, 0);

  if (args[0] instanceof Error) {
    args[0] = args[0].toString();

    return error.apply(this, args);
  }

  if (isPlainObject(args[0])) {
    return dir.apply(this, arguments);
  }

  return log.apply(this, arguments);
}

// console.log([data][, ...])
function log() {
  return console.log.apply(console, colorizeArgs(arguments, 'green'));
}

// console.info([data][, ...])
function info() {
  return console.info.apply(console, colorizeArgs(arguments, 'green'));
}

// console.error([data][, ...])
function error() {
  return console.error.apply(console, colorizeArgs(arguments, 'red'));
}

// console.warn([data][, ...])
function warn() {
  return console.warn.apply(console, colorizeArgs(arguments, 'yellow'));
}

// console.dir(obj[, options])
function dir(obj, options) {
  options = (options || {});
  options.colors = true;

  return console.info(util.inspect(obj, options));
}

// Unicorns and whatnot
function rainbow() {
  var args = Array.prototype.slice.call(arguments, 0);
  var color = 0;

  var colorized = args[0].split('').reduce(function (mem, value) {
    if (color === (RAINBOW.length - 1)) {
      color = 0;
    } else if (value !== ' ') {
      color += 1;
    }

    return (mem + chalk[RAINBOW[color]](value));
  }, '');

  return console.log.apply(console, [colorized].concat(args.slice(1)));
}

// Extend print with utility methods
print.log = log;
print.info = info;
print.error = error;
print.warn = warn;
print.dir = dir;
print.rainbow = rainbow;

module.exports = print;
