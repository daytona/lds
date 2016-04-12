var path = require('path');
var koa = require('koa');
var serve = require('koa-static');
var mount = require('koa-mount');
var router = require('./router');
var styleguide = require('lds-styleguide');
var api = require('lds-api');
var editor = require('lds-editor');
var parseLds = require('lds-parser');
//var extendLds = require('./extend-components');
var Engine = require('lds-engine');
var view = require('../controllers/view');
var pageNotFound = require('../controllers/404');
var objectDeepMap = require('../lib/object-deep-map');

function getRoutes(config) {

}
function Server(config) {
  if (!config.engine || !config.engine.render) {
    throw new Error('No templating engine specified');
  }

  if (!config.namespace) {
  config.namespace = 'lds';
  }

  var engine = new Engine(config.engine);
  var app = koa();

  var lds = parseLds.sync(config);
  var port = process.env.PORT || config.port || 4000;
  app
    // Serve static files from /dist folder
    .use(pageNotFound) // Handle 404 after parsing every other middleware, if no match trigger 404
    .use(mount(config.path.public, serve(config.path.dist)))
    .use(parseLds.async(config))
    .use(engine.setup(config.namespace))
    //.use(extendLds(config))
    .use(mount('/styleguide', styleguide))
    .use(mount('/api', api.app))
    .use(mount('/playground', editor))
    .use(view)
    .listen(port);

  console.log('HTTP-Server running at port ', port);
  objectDeepMap(lds.structure.views, (value) => {
    if (value && value.isLDSObject && value.template) {
      console.log(value.name + ': http://localhost:' + port + value.id.replace(/^\/views/, ''));
    }
    return value;
  });
  console.log('Styleguide: http://localhost:' + port + '/styleguide');
  return app;
};

module.exports = Server;
