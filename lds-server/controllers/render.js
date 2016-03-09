var isJSON = require('../lib/isJSON');

// Render a single component with request.parameters or default json.
function* plainComponent (next) {
  const category = this.params.category;
  const name = this.params.name;
  const component = this.lds[category][name];

  const query = {};
  const componentdata = component.data || {};
  // Loop though query parameters to build an data object
  Object.keys(this.query).forEach((key) => {
    query[key] = isJSON(this.query[key]) ? JSON.parse(this.query[key]) : this.query[key];
  });

  const data = Object.assign(componentdata, {componentName: name}, query);

  this.body = this.render(component.template, data);
}

module.exports = plainComponent;
