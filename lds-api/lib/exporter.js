var fs = require('fs');
var path = require('path');
var objectDeepMap = require('./object-deep-map');

module.exports = function* exporter (next) {
  var views = [];
  objectDeepMap(this.lds.structure.views, (value) => {
    if (value && value.isLDSObject && value.template) {
      value.exporturl = value.url + '/index.html';
      views.push(value);
    }
    return value;
  });
  views.forEach((view) => {
    var viewpath = view.url.replace(/\/index$/, '');

    var relativePath = viewpath.replace(/^\//, '').replace(/([^\/]+)/g, '..');
    if (relativePath == '/') {
      relativePath = '';
    }
    var dir = path.join(this.lds.config.path.dirname, this.lds.config.path.dist, 'html', viewpath);

    // Render view content
    var html = this.renderView(view, {}, true);

    // Replace all assets links with relative urls
    html = html.replace(/\/assets/g, relativePath ? '../' + relativePath : '..');

    // Replace all view URLs to relative urls
    views.forEach(otherview => {

      var viewurl = new RegExp('="' + otherview.url || '/' + '"', 'g');
      html = html.replace(viewurl, '="' + relativePath + otherview.exporturl + '"');
    })
    html = html.replace(/="\//g, '="' + relativePath);
    fs.mkdir(dir, () => {
      fs.writeFile( dir + '/index.html', html, (err) => {
         if (err) throw err;
         console.log(viewpath, ' saved!');
      });
    });
  });

  this.body = 'Exporting views to <a href="/assets/html">/dist/html</a>';
};
