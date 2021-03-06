var helpers = require('./lib/handlebar-helpers');
var handlebars = require('handlebars').create();

module.exports = {
  version: '0.0.2',
  engine: {
    render(string, data) {
      if (string) {
        return handlebars.compile(string)(data);
      }
    },
    registerHelper (name, fn) {
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
    documentation: 'documentation',
    base: 'src/base',
    components: 'src/components',
    modules: 'src/modules',
    helpers: 'src/helpers',
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
    fonts: 'fonts',
    html: 'html'
  },
  server: {
    port: 4000
  }
};
