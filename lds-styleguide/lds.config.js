var helpers = require('./lib/handlebar-helpers');
var ldsHandlebars = require('lds-handlebars');

module.exports = {
  version: '0.0.2',
  engine: ldsHandlebars({
    helpers,
    ext: 'hbs'
  }),
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
  }
};
