import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import koa from 'koa';
import koaHandlebars from 'koa-handlebars';
import serve from 'koa-static';
import mount from 'koa-mount';
import assignDeep from 'assign-deep';
import styleguide from 'lds-styleguide';
import router from './router';
import session from './session';
import parseLdsComponents from './components';

export default function Server(appConfig = {}) {
  let newChanges = false;
  // Parse all components of LDS and register on instance Handlebars
  if (!session.config || session.config.version !== appConfig.version) {
    session.config = assignDeep({path: {dirname: process.cwd()}}, appConfig);
    session.lds = parseLdsComponents(session.config);
    newChanges = true;
  }

  // Parse all components of Styleguide and register on instance Handlebars
  if (!session.styleguide || session.styleguide.config.version !== styleguide.version) {
    session.styleguide = {
      config: styleguide,
      components: parseLdsComponents(styleguide, {prefix: 'lds'}),
    };
    newChanges = true;
  }

  if (false && newChanges) {
    const cache = {
      lds: session.lds,
      styleguide: session.styleguide,
    };
    fs.writeFile(path.join(__dirname, 'session.js'), `export default ${JSON.stringify(cache, false, 2)};`, 'utf-8', (err) => {
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
    helpers: session.config.helpers || {},
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
    // partialsDir: session.config.path.components,
    // partialId(file) {
    //   return file.replace(/\/index.hbs$/, '');
    // },
  }));

  app
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(process.env.PORT || session.config.port || 4000);

  console.log('HTTP-Server running at port ', process.env.PORT || session.config.port || 4000);
  return app;
};
