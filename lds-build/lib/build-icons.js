var path = require('path');
var fs = require('fs-extra');
var webfontsGenerator = require('webfonts-generator')

module.exports = function buildIcons(config) {
  var files = fs.readdirSync(config.iconSrc).filter(function(file) {
    return file.substr(-4) === '.svg';
  }).map(function(file) {
    return config.iconSrc + '/' + file;
  });

  var cssTemplate = path.join(__dirname, 'icons-css-template.hbs');

  webfontsGenerator({
    files: files,
    fontName: config.fontName,
    dest: config.fontDest + '/' + config.fontName,
    cssFontsPath: '/assets/fonts/' + config.fontName,
    cssDest: config.cssDest,
    cssTemplate: cssTemplate,
    templateOptions: {
      classPrefix: 'icon--',
      baseClass: 'icon',
    },
    normalize: true,
    fontHeight: 1001,
    }, (error) => {
    if (error) {
      console.log('Fail!', error);
    } else {
      console.log('Done!');
    }
    });
}
