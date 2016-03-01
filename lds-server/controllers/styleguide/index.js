var path = require('path');
var session = require('../../app/session');
var parseData = require('lds-styleguide').parseData;


function* styleguide(next) {

  const data = Object.assign({
    category: this.params.category,
    component: this.params.unit,
    layout: 'styleguide:default'
  }, parseData(session));

  var view = 'styleguide:start';

  if (this.params.unit) {
    view = 'styleguide:single';
  } else if (this.params.category) {
    view = 'styleguide:category';
  }
  yield this.render(view, data);
}

module.exports = styleguide;
