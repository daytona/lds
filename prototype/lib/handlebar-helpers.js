var marked = require('marked');

module.exports = {
  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  },
  isString(obj) {
    return typeof obj === 'string';
  },
  isArray(obj) {
    return typeof obj.length === 'number';
  },
  equals(obj1, obj2, options) {
    if ((typeof obj1 === 'object' &&
         typeof obj2 === 'object' &&
         JSON.stringify(obj1) === JSON.stringify(obj2)) ||
        obj1 === obj2) {
      return options.fn ? options.fn(this) : true;
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
  json(object) {
    return JSON.stringify(object, null, 2);
  },
  partial(name) {
    return name;
  },
  capitalize(string) {
    return (string[0].toUpperCase() + string.substr(1));
  },
  hasContent(options) {
    return options.data['partial-block'] && options.data['partial-block'].program > 1;
  },
  markdown(string) {
    return marked(string);
  },
};
