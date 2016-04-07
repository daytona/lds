var semver = require('semver');
var chalk = require('chalk');

/**
 * Default prompt schema for collection information about a module
 */
var schema = {
  properties: {
    name: {
      pattern: /^[^._][a-z\-_]+$/,
      message: 'Must be lower case letters and dashes. It cannot start with a dot or underscore.',
      required: true,
      description: 'Name:'
    },
    version: {
      conform: function (str) {
        return semver.valid(str);
      },
      default: '1.0.0',
      message: 'The version must conform with the SemVer spec. See http://semver.org.',
      require: true,
      description: 'Version:'
    },
    description: {
      type: 'string',
      description: 'Description:'
    },
    repository: {
      type: 'string',
      before: function (value) {
        var type;

        if (value.length) {
          if (/^[git://]+|[\.git]+$/.test(value)) { type = 'git'; }
          if (/^[svn://]+/.test(value)) { type = 'svn'; }

          return {
            type: type,
            url: value
          };
        } else {
          return value;
        }
      },
      description: chalk.green('Respository:')
    },
    test: {
      type: 'string',
      default: 'jshint',
      description: 'Test:'
    },
    keywords: {
      type: 'string',
      before: function (value) {
        if (value.length) {
          return value.replace(/,/g, ' ').replace(/"|^\[|\]$/g, '').split(' ');
        } else {
          return value;
        }
      },
      description: 'Keywords:'
    },
    author: {
      type: 'string',
      description: 'Author:'
    },
    license: {
      type: 'string',
      default: 'ISC',
      description: 'License:'
    }
  }
};

Object.keys(schema.properties).forEach(function format(key) {
  var obj = schema.properties[key];
  if (obj.message) {
    obj.message = chalk.yellow(obj.message);
  }
  if (obj.description) {
    obj.description = chalk.green(obj.description);
  }
});

module.exports = schema;
