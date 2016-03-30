var path = require('path');
var koa = require('koa');
var serve = require('koa-static');
var mount = require('koa-mount');
var router = require('./router');
var styleguide = require('lds-styleguide');
var api = require('lds-api');
var parseLds = require('./parse-components');
var extendLds = require('./extend-components');
var Engine = require('lds-engine');

var session = {};

function Server(config) {
  if (!config.engine || !config.engine.render) {
    throw new Error('No templating engine specified');
  }
  var engine = new Engine(config.engine);

  // Parse all components of LDS and register on instance Handlebars
  session.config = config;

  var app = koa();

  app
    // Serve static files from /dist folder
    .use(mount(config.path.public, serve(config.path.dist)))
    .use(parseLds(config))
    .use(engine.setup('lds'))
    .use(extendLds())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(mount('/styleguide', styleguide))
    .use(mount('/api', api.app))
    .listen(process.env.PORT || config.port || 4000);

  console.log('HTTP-Server running at port ', process.env.PORT || config.port || 4000);
  return app;
};

module.exports = Server;
