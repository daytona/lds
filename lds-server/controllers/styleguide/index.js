var path = require('path');
var session = require('../../app/session');
var styleguide = require('lds-styleguide');
var parseLdsComponents = require('../../app/parse-components');

function* parseComponents(next) {
  this.styleguide = parseLdsComponents(styleguide.config);
  yield next;
}

function* styleguidePage(next) {
  console.log('styleguide', this.styleguide);
  // const data = Object.assign({
  //   category: this.params.category,
  //   component: this.params.unit,
  //   layout: 'styleguide:default'
  // }, parseData(session));
  //
  // var view = 'styleguide:start';
  //
  // if (this.params.unit) {
  //   view = 'styleguide:single';
  // } else if (this.params.category) {
  //   view = 'styleguide:category';
  // }

  this.renderView('start');
  //yield this.render(view, data);
  //yield next;
}

module.exports = {
  page: styleguidePage,
  parseComponents,
  engine: styleguide.config.engine('styleguide', 'lds')
};
