var handlebars = require('handlebars');
var templates = require('./templates');

module.exports = function updateIframeHeightScript(iframeid){
  return handlebars.compile(templates['updateHeightScript.hbs'])({
    iframeid
  });
};
