var marked = require('marked');
var config = require('../lds.config');

function capitalize(string) {
  return (string[0].toUpperCase() + string.substr(1));
}

function unCapitalize(string) {
  return (string[0].toLowerCase() + string.substr(1));
}

function toCamelCase(string) {
  return string.split(/[_|.|-]/).reduce((str, part) => {
    const camelString = (str + capitalize(part));
    return camelString;
  }, '');
}

var helpers = {
  lowercase(string) {
    return string.toLowerCase();
  },
  uppercase(string) {
    return string.toUpperCase();
  },
  markdown(string) {
    return marked(string);
  },
  json(object) {
    return JSON.stringify(object, null, 2);
  },
  jsonLine(object) {
    return JSON.stringify(object, null, 0);
  },
  functionName(string) {
    return unCapitalize(toCamelCase(string));
  },
  prettyName(string) {
    return string.split(/[_|.|-]/).map(capitalize).join(' ');
  },
  className(string) {
    return toCamelCase(string);
  },
  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  },
  isString(obj) {
    return typeof obj === 'string';
  },
  equals(obj1, obj2, options) {
    if ((typeof obj1 === 'object' &&
         typeof obj2 === 'object' &&
         JSON.stringify(obj1) === JSON.stringify(obj2)) ||
        obj1 === obj2) {
      return options.fn(this);
    }
  },
  getProperty(object, key) {
    return object[key];
  },
  eachProperty(context, options) {
    let ret = '';
    for (const prop in context) {
      if (context) {
        ret = ret + options.fn({ key: prop, value: context[prop] });
      }
    }
    return ret;
  },
  grid(items, options) {
    return `<div class="Grid">${items.map((item) => {
      const cell = `<div class="Grid-cell">${options.fn(item)}</div>`;
      return cell;
    })}</div>`;
  },
  log(data) {
    console.log(data);
  },
  partial(name) {
    // if (config.prefix && !name.match(new RegExp(`^${config.prefix}`))) {
    //   name = `${config.prefix}:${unCapitalize(name)}`;
    // }
    return unCapitalize(name);
  },
  indent(string) {
    return '    ' + string;
  },
};

module.exports = helpers;
