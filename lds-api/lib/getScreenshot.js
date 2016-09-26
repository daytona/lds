var fs = require('fs');
var path = require('path');
var findComponent = require('./find-component');

module.exports = function* getScreenshot (next) {
  var component = findComponent(this.lds.structure, '/'+ this.params.path);

  if (!component) {
    return 'not found image';
  }
  var type = 'png';
  if (component.screen) {
    type = component.screen.match(/\.(.*)$/)[1];
    screenpath = component.screen;
  } else if (component.template || component.example || component.styles || component.script || (component.info && !component.children)) {
    var screenpath = path.join(this.lds.config.path.dirname, this.lds.config.path.dist, 'screens' + component.id + '.png');
  } else if (component.children) {
    this.redirect('/api/screen' + component.children[Object.keys(component.children)[0]].id);
    return;
  }
  if (screenpath)
  this.type = `image/${type}`;
  this.body = fs.readFileSync(screenpath);
};
