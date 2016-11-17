var fs = require('fs');
var path = require('path');
var objectDeepMap = require('./object-deep-map');

module.exports = function* exporter (next) {
  var views = [];
  objectDeepMap(this.lds.structure.views, (value) => {
    if (value && value.isLDSObject && value.template) {
      value.url = value.url.replace(/\/(start|index)$/, '');
      value.exporturl = value.url + '/index.html';

      views.push(value);
    }
    return value;
  });

  var htmlRoot = path.join(this.lds.config.path.dirname, this.lds.config.path.dist, 'html');
  if (!fs.existsSync(htmlRoot)){
    fs.mkdirSync(htmlRoot);
  }
  fs.writeFile(path.join(this.lds.config.path.dirname, this.lds.config.path.dist, 'index.html'), '<html><meta http-equiv="refresh" content="0; url=html/index.html" /></html>');

  views.forEach((view) => {
    var viewpath = view.url;

    var relativePath = viewpath.replace(/^\//, '').replace(/([^\/]+)/g, '..');
    if (relativePath == '/') {
      relativePath = '';
    }
    var dir = path.join(htmlRoot, viewpath);

    // Render view content
    var html = this.renderView(view, {}, true);

    // Replace all assets links with relative urls
    html = html.replace(/\/assets/g, relativePath ? '../' + relativePath : '..');

    // Replace all view URLs to relative urls
    views.forEach(otherview => {
      var viewurl = new RegExp('="' + (otherview.url || '/') + '"', 'g');
      html = html.replace(viewurl, '="' + relativePath + otherview.exporturl + '"');
    });

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
