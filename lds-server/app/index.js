var path = require('path');
var koa = require('koa');
var serve = require('koa-static');
var mount = require('koa-mount');
var router = require('./router');
var styleguide = require('lds-styleguide');
var api = require('lds-api');
var editor = require('lds-editor');
var parseLds = require('lds-parser');
var extendLds = require('./extend-components');
var Engine = require('lds-engine');
var view = require('../controllers/view');
var pageNotFound = require('../controllers/404');

function Server(config) {
  if (!config.engine || !config.engine.render) {
    throw new Error('No templating engine specified');
  }
  var engine = new Engine(config.engine);
  var app = koa();

  //if (!config.namespace) {
  config.namespace = 'lds';
  //}
  app
    // Serve static files from /dist folder
    .use(pageNotFound) // Handle 404 after parsing every other middleware, if no match trigger 404
    .use(mount(config.path.public, serve(config.path.dist)))
    .use(parseLds(config))
    .use(engine.setup(config.namespace))
    .use(extendLds(config))
    .use(mount('/styleguide', styleguide))
    .use(mount('/api', api.app))
    .use(mount('/playground', editor))
    .use(view)
    .listen(process.env.PORT || config.port || 4000);

  console.log('HTTP-Server running at port ', process.env.PORT || config.port || 4000);
  return app;
};

module.exports = Server;
