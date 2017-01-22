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
    var camelString = (str + capitalize(part));
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
    return toCamelCase(string);
  },
  prettyName(string) {
    return string.split(/[_|.|-]/).map(capitalize).join(' ');
  },
  capitalize: capitalize,
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
      return typeof options.fn === 'function' ? options.fn(this) : true;
    } else if(typeof options.fn !== 'function') {
      return false;
    }
  },
  not(arg) {
    return !arg;
  },
  and() {
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.filter((arg)=> {
      return !arg;
    }).length === 0;
  },
  or () {
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.filter((arg) => {
      return arg;
    })[0];
  },
  objectLength(obj) {
    return typeof obj === 'object' && Object.keys(obj).length;
  },
  hasProperty(object, key) {
    return typeof(object[key]) !== 'undefined';
  },
  match(string, pattern) {
    var reg = new RegExp(pattern, 'g');
    return string.match(reg);
  },
  getProperty(object, key) {
    return object && object[key];
  },
  mergeObjects(object1, object2) {
    return Object.assign({}, object1, object2);
  },
  eachProperty(context, options) {
    var ret = '';
    for (var prop in context) {
      if (context) {
        ret = ret + options.fn({ key: prop, value: context[prop] });
      }
    }
    return ret;
  },
  grid(items, options) {
    return `<div class="Grid">${items.map((item) => {
      var cell = `<div class="Grid-cell">${options.fn(item)}</div>`;
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
    uid = uid + 1;
    return uid;
  },
  tablistdata(options) {
    var id = options.hash.id;
    return options.hash.tabs.split(' ').map((tab) => {
      var split = tab.split('#');
      return {
        id: split[1] + id,
        title: split[0]
      };
    });
  },
  split (str, separator) {
    separator = typeof separator === 'string' ? separator : ' ';
    // Skip if already an array
    if (!str || Array.isArray(str)) {
      return str;
    }
    return str.split(separator);
  },
  join (arr, separator) {
    separator = typeof separator === 'string' ? separator : '';
    // Skip if already an array
    if (!arr || !Array.isArray(arr)) {
      return arr;
    }
    return arr.join(separator);
  },
  concat() {
    // remove trailing options argument
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.join('');
  },
  prefix(options){
    return options.data.root.prefix || '';
  },
  increment(value){
    return Number(value) ? Number(value)+1 : value;
  },
  hasPartialContent(options) {
    return options.data['partial-block'];
  },
  encodeURI(string) {
    return encodeURI(string);
  },
  gt(x, y) {
    return Number(x) > Number(y);
  },
  lt(x, y) {
    return Number(x) < Number(y);
  },
  ifAll() {
    var args = [].slice.apply(arguments);
    var opts = args.pop();

    var fn = opts.fn;
    for(var i = 0; i < args.length; ++i) {
        if(args[i])
            continue;
        fn = opts.inverse;
        break;
    }
    return fn(this);
  },
  querifyObject(obj) {
    if (!obj) {
      return;
    }
    var queries = [];
    Object.keys(obj).forEach((key) => {
      queries.push(`${key}=${(typeof obj[key] === 'object' ?
                              JSON.stringify(obj[key], null, 0) :
                              obj[key])}`);
    });
    return queries.join('&');
  },
  toString(value) {
    return typeof value === 'undefined' ? 'undefined' : value.toString();
  },
  dateString(timestamp) {
    return new Date(timestamp-0).toLocaleString('sv-SE');
  },
  reverse(arr) {
    Array.prototype.reverse.call(arr);
    return arr;
  }

};

module.exports = helpers;
