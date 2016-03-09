var path = require('path');
var koa = require('koa');
var serve = require('koa-static');
var mount = require('koa-mount');
var assignDeep = require('assign-deep');
var router = require('./router');
var session = require('./session');
var styleguide = require('lds-styleguide');
var api = require('lds-api');
var parseLdsComponents = require('./parse-components');

function* parseComponents (next) {
  this.lds = parseLdsComponents(session.config);
  //this.styleguide = parseLdsComponents(session.styleguide.config);
  yield next;
}

function Server(appConfig) {
  if (!appConfig.engine) {
    throw new Error('No templating engine specified');
  }

  // Parse all components of LDS and register on instance Handlebars
  session.config = appConfig;

  const app = koa();

  app
    // Serve static files from /dist folder
    .use(mount(session.config.path.public, serve(session.config.path.dist)))
    .use(parseComponents)
    .use(appConfig.engine('lds'))
    .use(router.routes())
    .use(router.allowedMethods())
    .use(mount('/styleguide', styleguide))
    .use(mount('/api', api.app))
    .listen(process.env.PORT || session.config.port || 4000);

  console.log('HTTP-Server running at port ', process.env.PORT || session.config.port || 4000);
  return app;
};

module.exports = Server;
