var marked = require('marked');
var uid = 1;

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
    return object && object[key];
  },
  mergeObjects(object1, object2) {
    return Object.assign(object1, object2);
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
    return unCapitalize(name);
  },
  indent(string) {
    return '    ' + string;
  },
  undent(string) {

    return string.split("\n").map((row) => {
      return row.replace(/^ {4}/, '');
    }).join("\n");
  },
  saveas(name, options) {
    // if (options.data) {
    //   data = Handlebars.createFrame(options.data);
    // }
    options.data[name] = this;
    return options.fn(this);
  },
  uid() {
    uid = uid + 1
    return uid;
  },
  tablistdata(options) {
    var id = options.hash.id;
    return options.hash.tabs.split(' ').map((tab) => {
      let split = tab.split('#');
      return {
        id: split[1] + id,
        title: split[0]
      };
    });
  },
  concat() {
    // remove trailing options argument
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.join('');
  },
  prefix(options){
    return options.data.root.prefix || '';
  }
};

module.exports = helpers;
