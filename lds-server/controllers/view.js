var isJSON = require('../lib/isJSON');
var findComponent = require('../lib/find-component');

// Render a single component with request.parameters or default json.
function* viewPage (next) {
  let url = this.request.url.replace(/\/$/, '');

  var view = findComponent(this.lds.structure.views, '/views' + url);

  if (!view || (!view.template && view.children)) {
    view = findComponent(this.lds.structure.views, '/views' + url + '/start');
  }

  if (view) {
    const query = {};

    // Loop though query parameters to build an data object
    Object.keys(this.query).forEach((key) => {
      query[key] = isJSON(this.query[key]) ? JSON.parse(this.query[key]) : this.query[key];
    });

    this.renderView(view, query);
  }
  yield next;
}

module.exports = viewPage;
