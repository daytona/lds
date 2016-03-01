var fs = require('fs');
var path = require('path');

/**
 * Crawls the given directory path returning a dictionary of the
 * folder structure as so:
 * ```
 * {
 *   "fileName": "fileContent",
 *   "folderName": {
 *     "nestedFileName": "nestedFileContent"
 *   }
 * }
 * ```
 * @param  {String} dir Directory to crawl
 * @return {Object}
 */

function traverse(dir, struct) {
  fs.readdirSync(dir).forEach((name) => {
    const file = path.normalize(dir + '/' + name);
    const stats = fs.lstatSync(file);

    if (stats.isDirectory()) {
      struct[name] = {};
      traverse(file, struct[name]);
    } else if (stats.isFile()) {
      struct[name] = fs.readFileSync(file, 'utf-8');
    }
  });

  return struct;
}

function trace(dir) {
  const normalizedDir = path.normalize(dir);

  try {
    return traverse(normalizedDir, {});
  } catch (err) {
    return false;
  }
}

module.exports = trace;
