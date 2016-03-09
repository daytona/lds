var isJSON = require('../lib/isJSON');

// Render a single component with request.parameters or default json.
function* viewPage (next) {
  let view = this.params.view || 'start';
  const query = {};

  // Loop though query parameters to build an data object
  Object.keys(this.query).forEach((key) => {
    query[key] = isJSON(this.query[key]) ? JSON.parse(this.query[key]) : this.query[key];
  });

  this.renderView(view, query);
  yield next;
}

module.exports = viewPage;
