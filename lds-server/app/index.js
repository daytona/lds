var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');
var koa = require('koa');
var koaHandlebars = require('koa-handlebars');
var serve = require('koa-static');
var mount = require('koa-mount');
var assignDeep = require('assign-deep');
var styleguide = require('lds-styleguide').config;
var router = require('./router');
var session = require('./session');
var parseLdsComponents = require('./components');

function* parseComponents (next) {
  session.lds = parseLdsComponents(session.config);
  session.styleguide.components = parseLdsComponents(session.styleguide.config, {prefix: 'lds'});

  yield next;
}

function Server(appConfig) {
  let newChanges = false;

  // Merge helpers from both app and styleguide
  const koaHelpers = Object.assign({}, appConfig.helpers, styleguide.helpers);

  // Parse all components of LDS and register on instance Handlebars
  if (!session.config || session.config.version !== appConfig.version) {
    session.config = assignDeep({path: {dirname: process.cwd()}}, appConfig);
    newChanges = true;
  }

  // Parse all components of Styleguide and register on instance Handlebars
  if (!session.styleguide || session.styleguide.config.version !== styleguide.version) {
    session.styleguide = {
      config: styleguide
    };
    newChanges = true;
  }


  if (false && newChanges) {
    const cache = {
      lds: session.lds,
      styleguide: session.styleguide,
    };
    fs.writeFile(path.join(__dirname, 'session.js'), `module.exports = ${JSON.stringify(cache, false, 2)};`, 'utf-8', (err) => {
      if (err) {
        throw err;
      }
      console.log('Session file updated');
    })
  }


  const app = koa();

  // Serve static files from /dist folder
  app.use(mount(session.config.path.public, serve(session.config.path.dist)));
  app.use(mount(session.styleguide.config.path.public, serve(path.join(session.styleguide.config.path.dirname, session.styleguide.config.path.dist))));

  app.use(koaHandlebars({
    handlebars,
    defaultLayout: "default",
    extension: [ "hbs" ],
    helpers: koaHelpers,
    layoutsDir: session.config.path.layouts,

    // When requesting a layoutpath beginning with "styleguide:", look for it in styleguide
    layoutPath(id) {
      if (id.match(/^styleguide:.+/)) {
        return path.join(session.styleguide.config.path.dirname, session.styleguide.config.path.layouts, id.replace(/^styleguide:/, ''), 'index');
      } else {
        return id + '/index';
      }
    },
    viewsDir: session.config.path.views,

    // When requesting a layoutpath beginning with "styleguide:", look for it in styleguide
    viewPath(id) {
      if (id.match(/^styleguide:.+/)) {
        return path.join(session.styleguide.config.path.dirname, session.styleguide.config.path.views, id.replace(/^styleguide:/, ''), 'index');
      } else {
        return id + '/index';
      }
    },
  }));

  app
    .use(parseComponents)
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(process.env.PORT || session.config.port || 4000);

  console.log('HTTP-Server running at port ', process.env.PORT || session.config.port || 4000);
  return app;
};

module.exports = Server;
