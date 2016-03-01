var session = require('../../app/session');

function* componentsPage (next) {
  const category = this.params.category;
  const components = session.lds.components;
  const data = Object.assign(session, {
    category
  }, {layout: 'styleguide:default'});

  yield this.render("styleguide:category", data);
}

module.exports = componentsPage;
