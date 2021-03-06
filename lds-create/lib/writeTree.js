var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var isPlainObject = require('is-plain-object');

var id = 0;

/**
 * Create a file structure based on a dictionary representing a file structure.
 * Expects an object as so:
 * ```
 * {
 *   "fileName": "fileContent",
 *   "filderName": {
 *     "anotherFile": "anotherFilesContent",
 *     "nestedFolder": functionThatReturnsDictionary()
 *   }
 * }
 * ```
 * @param  {Object}   object    Schema to use as template for file structure
 * @param  {String}   path      Working directory path
 * @param  {Function} callback  Callback function to call once it's done
 */
function build(object, dir, callback) {
  if (!object) {
    return callback(new Error('No object to be built'));
  }

  if (!dir) {
    return callback(new Error('Build can not write to disk without a root directory.'));
  } else {
    mkdirp.sync(dir);
  }

  var stack = [];

  // A makeshift promise implementation for queueing the callback
  function defer() {
    var pointer = id;

    stack.push(id += 1);

    // Returns a callback that removes it's pointer form the queue
    return function promise() {
      stack.splice(stack.indexOf(pointer), 1);

      if (!stack.length) {
        // If the queue is empty, call the original callback
        callback();
      }
    };
  }

  Object.keys(object).forEach((key) => {
    var file = path.normalize(dir + '/' + key);
    var promise = (callback && defer());

    var value = object[key];

    if (typeof value === 'function') {
      value = value(file);
    }

    if (isPlainObject(value)) {
      // Try and create folder
      fs.mkdir(file, () => {
        // Nevermind if the folder already exists, just keep going
        build(value, file, promise);
      });
    } else if (typeof value === 'string') {
      fs.writeFile(file, value, (err) => {
        if (err) {
          throw err;
        }

        if (promise) {
          promise();
        }
      });
    }
  });

  if (!Object.keys(object).length && callback) {
    callback();
  }
}

module.exports = build;
