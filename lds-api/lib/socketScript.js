var handlebars = require('handlebars');
var templates = require('./templates');

module.exports = function socketScript(socketUrl){
  return handlebars.compile(templates['socketScript.hbs'])({
    socketUrl
  });
};
