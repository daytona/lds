var helpers = require('./lib/handlebar-helpers');
var handlebars = require('handlebars').create();

module.exports = {
  version: '0.0.2',
  namespace: 'styleguide',
  engine: {
    render(string, data) {
      return handlebars.compile(string)(data);
    },
    registerHelper(name, fn) {
      return handlebars.registerHelper(name, fn);
    },
    registerPartial(name, fn) {
      return handlebars.registerPartial(name, fn);
    },
    helpers,
    ext: 'hbs'
  },
  path : {
    dirname: __dirname,
    base: 'src/base',
    dist: 'dist',
    public: '/assets',
    components: 'src/components',
    modules: 'src/modules',
    views: 'src/views',
    layouts: 'src/layouts',
    fonts: 'src/assets/fonts',
    images: 'src/assets/images'
  },
  dest: {
    script: 'main.js',
    style: 'style.css',
    images: 'images',
    fonts: 'fonts'
  },
  port: 4001,
  styleguide: {
    clientName: 'Sveriges Miljömål',
    guideName: 'Style Guide'
  }
};
