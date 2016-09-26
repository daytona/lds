var path = require('path');
var trace = require('./trace');

var templates = trace(path.resolve(__dirname, '../views'));
module.exports = templates;
