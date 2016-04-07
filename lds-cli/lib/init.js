var path = require('path');
var promptly = require('promptly');
//var verify = require('./utils/verify');

var chalk = require('chalk');
var print = require('./utils/print');
var schema = require('./utils/schema');

//var create = require('lds-create');
// Remove the silly prompt prefix
// prompt.message = '';
// prompt.delimiter = '';

/**
 * Prompt the user for input to populate the package.json
 * @return {undefined}
 */
function init(callback) {
  var info;
  var dir = process.cwd();

  try {
    // Try and find a existing package.json
    info = require(path.normalize(dir + '/package'));
    print.warn('\nPackage file exists! Will extend with options.\n');
  } catch (err) {
    // Fall back to an empty object
    info = {};
    print.rainbow('\n#################################################');
    print.info('\n   Let’s set up a new Living Design System! :)\n');
    print.rainbow('#################################################\n');
  }

  // Set existing package properties as defaults
  Object.keys(info).forEach(function (key) {
    var prop = schema.properties[key];

    if (prop) {
      switch (key) {
      case 'repository':
      case 'keywords':
      case 'author':
        // Don't try and meddle with the more complex properties
        delete schema.properties[key];
        break;
      default:
        prop.default = info[key];
      }
    }
  });

  // info.dependencies = Object.assign({}, info.dependencies, {'living-design-system' : 'latest'});
console.log(schema, info);
  // Start prompting user for input
  // prompt.get(schema, function (err, data) {
  //   var options = Object.assign({}, info, data);
  //
  //   // Remove all empty values
  //   Object.keys(options).forEach(function (key) {
  //     if (!options[key]) {
  //       delete options[key];
  //     }
  //   });
  //
  //   if (err) {
  //     if (err.message === 'canceled') {
  //       // Aborted by user
  //       print.error('\n\nAborted. Nothing has been written to disk.');
  //     } else {
  //       // Other error, dunno
  //       throw err;
  //     }
  //   } else {
  //     // Show the result
  //     print.log('\nDoes this look about right?\n');
  //     print(options);
  //
  //     // Verify that the data is correct
  //     verify('\nSave to package.json', function (err, answer) {
  //       if (err || !answer) {
  //         if (!answer || (answer === 'canceled')) {
  //           print.error('Aborted. Nothing has been written to disk.');
  //         } else {
  //           print(err);
  //         }
  //         return;
  //       }
  //
  //       try {
  //         save(dir, options, function () {
  //           print.info('\nLiving design system "%s" created!', options.name);
  //           if (typeof callback === 'function') {
  //             callback();
  //           }
  //         });
  //       } catch (err) {
  //         return print(err);
  //       }
  //     });
  //   }
  // });
}
function save(dir, options, callback) {
  var infoFile = path.normalize(dir + '/package.json');
  fs.writeFile(infoFile, JSON.stringify(info, null, 2), function (err) {
    if (err) { throw err; }
    // Build LDS structure
    //create.init(dir, callback);
  });
}
module.exports = init;
