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
    components: 'src/components',
    views: 'src/views',
    layouts: 'src/layouts',
    dist: 'dist',
    public: '/assets',
    icons: 'src/assets/icons',
    fonts: 'src/assets/fonts',
    images: 'src/assets/images'
  },
  dest: {
    script: 'main.js',
    style: 'style.css',
    images: 'images',
    fonts: 'fonts'
  }
};
