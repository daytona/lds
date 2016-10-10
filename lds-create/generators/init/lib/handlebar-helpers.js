module.exports = {
  isEmpty (obj) {
    return Object.keys(obj).length === 0;
  },
  isString (obj) {
    return typeof obj === 'string';
  },
  isArray (obj) {
    return typeof obj.length === 'number';
  },
  num (str) {
    return Number(str);
  },
  partial (name) {
    return name;
  },
  length (obj) {
    return obj.length;
  },
  gt (num1, num2) {
    return num1 > num2;
  },
  lt (num1, num2) {
    return num1 < num2;
  },
  equals (obj1, obj2, options) {
    if ((typeof obj1 === 'object' &&
         typeof obj2 === 'object' &&
         JSON.stringify(obj1) === JSON.stringify(obj2)) ||
        obj1 === obj2) {
      return options.fn ? options.fn(this) : true;
    }
  },
  and () {
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.filter((arg) => {
      return !arg;
    }).length === 0;
  },
  or () {
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.filter((arg) => {
      return arg;
    }).length > 0;
  },
  join (arr, separator) {
    separator = typeof separator === 'string' ? separator : ' ';
    return arr.join(separator);
  },
  split (str, separator) {
    separator = typeof separator === 'string' ? separator : ' ';
    // Skip if already an array
    if (!str || Array.isArray(str)) {
      return str;
    }
    return str.split(separator);
  },
  concat () {
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.join('');
  },
  add () {
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.reduce(function (prev, currVal) {
      return prev + currVal;
    }, 0);
  },
  capitalize (string) {
    return (string[0].toUpperCase() + string.substr(1));
  }
};
