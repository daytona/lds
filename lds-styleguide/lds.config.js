var helpers = require('./lib/handlebar-helpers');
var ldsHandlebars = require('lds-handlebars');

module.exports = {
  version: '0.0.1',
  prefix: 'lds',
  engine: ldsHandlebars({
    helpers,
    ext: 'hbs'
  }),
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
