var ldsHandlebars = require('lds-handlebars');
var helpers = require('./lib/handlebar-helpers');

module.exports = {
  version: '0.0.1',
  engine: ldsHandlebars({
    'ext': 'hbs',
    helpers,
  }),
  path : {
    dirname: __dirname,
    base: 'src/base',
    components: 'src/components',
    modules: false,
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
    tree: 'structure.json'
  },
  server: {
    port: 4000
  }
};
