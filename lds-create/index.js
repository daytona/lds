var fs = require('mz/fs');
var path = require('path');
var trace = require('./lib/readTree');
var build = require('./lib/writeTree');
var Mustache = require('mustache');
var objectDeepMap = require('./lib/object-deep-map');
var cmd = require("cmd-exec").init();
var fileExists = require('file-exists');

var groups = {
  base: 'base',
  component: 'components',
  view: 'views',
  helper: 'helpers',
  module: 'modules',
  init: 'dirname',
  layout: 'layouts'
};
function init(root, callback) {
  console.log('Setting up a Living Design System');
  var tree = trace(path.join(__dirname, '/generators/init'));
  build(tree, root, function(err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Setting up npm dependencies');
    var cmdString = '';
    if (!fileExists(root + '/package.json')) {
      // Copy "./generators/package.json" to root
      cmdString += 'npm init --y && ';
    }
    cmdString += 'npm i --save @daytona/living-design-system handlebars eslint babel-core babel-eslint babel-preset-es2015';
    cmd.exec(cmdString).then(function(){
      console.log('Building initial assets');
      return cmd.exec('lds build');
    }).then(function(){
      callback();
    });
  });
  return;
}

function create(type, name, config) {
  var helpers = {
    name: name,
    type: type,
    capitalize(string) {
      return (string[0].toUpperCase() + string.substr(1));
    },
    unCapitalize(string) {
      return (string[0].toLowerCase() + string.substr(1));
    },
    toCamelCase(string) {
      return string.split(/[_|.|-]/).reduce((str, part) => {
        const camelString = (str + helpers.capitalize(part));
        return camelString;
      }, '');
    },
    functionName() {
      return helpers.unCapitalize(helpers.toCamelCase(name));
    },
    prettyName() {
      return name.split(/[_|.|-]/).map(helpers.capitalize).join(' ');
    },
    className() {
      return helpers.toCamelCase(name);
    }
  };
  var tree = trace(path.join(__dirname, '/generators/', type));

  var componentObject = {};
  componentObject[name] = objectDeepMap(tree, function(value, key){
    if (typeof value === 'string') {
      value = Mustache.render(value, helpers)
    }
    return value;
  });

  build(componentObject, path.join(config.path.dirname, config.path[groups[type]]), function(err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Build complete');
  });
  // Function to create new components, views, or inital LDS structure based on certain generators
}
module.exports = {
  init,
  create,
};
