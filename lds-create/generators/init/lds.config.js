var helpers = require('./lib/handlebar-helpers');
var handlebars = require('handlebars').create(); // Include templating engine and create separate intance

module.exports = {
  version: '0.0.1',             // Current semver version of library
  engine: {                     // Setup a templating engine
    render (string, data) {      // Define custom render method
      return handlebars.compile(string)(data);
    },
    registerHelper (name, fn) {  // Define custom helperRegister
      return handlebars.registerHelper(name, fn);
    },
    registerPartial (name, fn) { // Define custom partialRegister
      return handlebars.registerPartial(name, fn);
    },
    helpers,                    // Custom handlebar helpers which are used in template files
    ext: 'hbs'                  // Define file extension for templating files
  },
  path: {
    dirname: process.cwd(),     // Current working directory of LDS
    base: 'src/base',           // Source of base components
    components: 'src/components', // Source of regular components
    modules: false,             // Source of complex CMS modules
    helpers: 'src/helpers',     // Source of javascript or CSS helpers which are used by components and views
    views: 'src/views',         // Source of content pages,
    layouts: 'src/layouts',     // Source of layout files
    dist: 'dist',               // Destination for build files, source for including bundled script, images and styles
    public: '/assets',          // Public path for a client to reach the content of dist folder
    icons: 'src/assets/icons',  // Source of SVG icons to be built into icon-font
    fonts: 'src/assets/fonts',  // Source of fonts, and destination for generated icon-font
    images: 'src/assets/images' // Source of image assets, to be optimized and put in dist
  },
  dest: {                   // Destination files and folders within the dist folder.
    script: 'main.js',      // Destination file for javascript bundle
    style: 'style.css',     // Destination file for stylesheet bundle
    images: 'images',       // Destination for optimized image files
    fonts: 'fonts'          // Destination folder for web-fonts to be copied
  },
  login: {                  // Restict production environment with a simple auth
    name: 'daytona',
    pass: 'd4y70n4'
  },
  port: 4000              // Port on which server should set up HTTP-Server
};
