var session = require('../../app/session');

function* componentsPage (next) {
  const category = this.params.category;
  const component = this.params.component;

  const components = session.lds.components;
  const data = Object.assign(session, {
    category,
    component
  }, {layout: 'styleguide:default'});

  yield this.render("styleguide:single", data);
}

module.exports = componentsPage;
