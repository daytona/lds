var marked = require('marked');
var isJSON = require('../lib/isJSON');
var findComponent = require('../lib/find-component');

// Render a single component with request.parameters or default json.
function* viewPage (next) {
  var url = this.request.url.replace(/\/$/, '');

  var view = findComponent(this.lds.structure.views, '/views' + url);

  if (!view || (!view.template && view.children)) {
    view = findComponent(this.lds.structure.views, '/views' + url + '/index') ||
           findComponent(this.lds.structure.views, '/views' + url + '/start');
  }

  if (view) {
    var data = {};
    if (this.showinfo) {
      data.readme = marked(view.info);
    }
    // Loop though query parameters to build an data object
    Object.keys(this.query).forEach((key) => {
      data[key] = isJSON(this.query[key]) ? JSON.parse(this.query[key]) : this.query[key];
    });

    this.renderView(view, data);
  }
  yield next;
}

module.exports = viewPage;
