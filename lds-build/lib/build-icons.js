var path = require('path');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var webfontsGenerator = require('webfonts-generator')
var SVGSpriter = require('svg-sprite');

module.exports = function buildIcons(config) {
  var files = fs.readdirSync(config.iconSrc).filter(function(file) {
    return file.substr(-4) === '.svg';
  }).map(function(file) {
    // if (config.iconDest) {
    //   fs.copy(config.iconSrc + '/' + file, config.iconDest + '/' + file);
    // }
    return config.iconSrc + '/' + file;
  });

  var cssTemplate = path.join(__dirname, 'icons-css-template.hbs');
  var hbsTemplate = path.join(__dirname, 'icon-partial-template.mustache');

/*
  icon/
    index.hbs (if icon, if spritemap, if css-class)
    index.css
*/
  if (files.length) {
    var spriter = new SVGSpriter({
      dest: config.iconDest,
      log: null,
      mode: {
        css: {
          example: true
        },
        defs: {
          example: {
            template: hbsTemplate
          }
        }
      },
      shape: {
        transform: ['svgo'],            // List of transformations / optimizations
        dest: config.iconDest
      },
      svg: {
        transform: [function cleanSVG(svg) {
          var fillColors = [];
          svg = svg.replace(/ fill="([^"]*)"/g, function(match, color) {
            console.log('fill', match, color);
            fillColors.push(color);
            if (fillColors.length) {
              return '';
            }
            return 'fill="currentColor"';
          });

          return svg;
        }],
        xmlDeclaration		: true,       // Add XML declaration to SVG sprite
        doctypeDeclaration	: true,     // Add DOCTYPE declaration to SVG sprite
        namespaceIDs		: true,         // Add namespace token to all IDs in SVG shapes
        namespaceClassnames	: true,     // Add namespace token to all CSS class names in SVG shapes
        dimensionAttributes	: true      // Width and height attributes on the sprite
      },
      variables: {
        open: '{{',
        close: '}}'
      },
    });

    files.forEach(function(path) {
      var file = path.match(/([^\/]*).svg$/)[0];
      var name = path.match(/([^\/]*).svg$/)[1]
      spriter.add(path, file, fs.readFileSync(path, {encoding: 'utf-8'}));
    });

    spriter.compile(function(error, result) {
      for (var mode in result) {
        for (var resource in result[mode]) {
          mkdirp.sync(path.dirname(result[mode][resource].path));
          fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
        }
      }
    });
  }

  // Generate @font-face set of icons
  webfontsGenerator({
    files: files,
    fontName: config.fontName,
    dest: config.fontDest + '/' + config.fontName,
    cssFontsPath: '/assets/fonts/' + config.fontName,
    cssDest: config.cssDest,
    cssTemplate: cssTemplate,
    templateOptions: {
      classPrefix: 'Icon--',
      baseClass: 'Icon',
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
