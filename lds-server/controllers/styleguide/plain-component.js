var session = require('../../app/session');

function isJSON(string) {
  try {
    JSON.parse(string);
  } catch (err) {
    return false;
  }
  return true;
};


// Render a single component with request.parameters or default json.
function* componentPage (next) {
  // DON NOT tolerate name duplicates!!
  const components = Object.assign({}, session.lds.base, session.lds.components, session.lds.modules);
  const name = this.params.name;
  const component = components[name];
  const query = {};

  // Loop though query parameters to build an data object
  Object.keys(this.query).forEach((key) => {
    query[key] = isJSON(this.query[key]) ? JSON.parse(this.query[key]) : this.query[key];
  });

  const data = Object.assign({},
                             component.data,
                             {layout: 'styleguide:none', componentName: name},
                             query);

  yield this.render('styleguide:plain', data);
}

module.exports = componentPage;
