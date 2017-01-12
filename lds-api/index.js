var path = require('path');
var fs = require('fs');
var koa = require('koa');
var Router = require('koa-router');

var marked = require('marked');
var pureQuery = require('./lib/pure-query');
var screenDump = require('./lib/screenshots.js');
var findComponent = require('./lib/find-component');
var objectDeepMap = require('./lib/object-deep-map');
var trace = require('./lib/trace');
var guid = require('./lib/guid');
var handlebars = require('handlebars');
var isJSON = require('./lib/isJSON');

var exporter = require('./lib/exporter');
var view = require('./lib/view');
var component = require('./lib/component');
var getScreenshot = require('./lib/getScreenshot');

var sessions = require('./lib/session');
var build = require('@daytona/lds-build');

var app = koa();
var router = new Router();

// app.use(function* (next) {
//
//   console.log(this.ws);
//   yield next;
// });

router
  .get('/screendump', function *(next){
    this.body = 'Saving screens of views';
    var query = pureQuery(this.query);
    screenDump(this.lds.structure, query._type, 'http://'+this.request.host);

    yield next;
  })
  .get('/export', exporter)
  .get('/screen/:path*', getScreenshot)
  .get('/views/:name*', view)
  .get('/:path*', component)
  .post('/:path*', function *(next) {
    var component = findComponent(this.lds.structure, '/'+ this.params.path);
    var params = this.request.body;

    var file = params.filename;
    var ldsConfig = this.lds.config;
    var reparser = this.parse;

    if (params.method === 'put' && component) {
      yield new Promise((resolve, reject) => {
        methods.write(component, file, params.filecontent, function(){
          if (/\.jsx?$/.test(file)) {
            build('script', ldsConfig, resolve);
          } else if (/\.css$/.test(file)) {
            build('styles', ldsConfig, resolve);
          } else if (new RegExp('\.(json|md|' + (ldsConfig.engine.ext  || 'hbs') + ')$').test(file)) {
            resolve();
          } else {
            reject();
          }
        });
      }).then(() => {
        return new Promise((resolve, reject) => {
          reparser(resolve);
        });
      }).then(() => {
        console.log('resolve promise');
        this.redirect(this.request.header.referer);
      }).catch(() => {
        console.log('No reparse nessecary');
        this.redirect(this.request.header.referer);
      });
    } else {
      yield component;
    }
  })
  .del('/:category/:name', function *(next){
    var component = findComponent(this.lds.structure, '/'+ this.params.path);
    // Delete component from file structure, require authentication
  });

app.use(router.routes());

const methods = {
  message(message, connection, lds) {
    var data = isJSON(message);
    if (data && data.component) {
      var session = data.session || guid('session_');
      var component = findComponent(lds.structure, data.component);
      if (!component) {
        return;
      }

      switch (data.action) {
        case 'update':
          if (data.data) {
            sessions.set(session, {
              data: Object.assign({}, component.data, data.data)
            });
          }

          connection.send(JSON.stringify({
            type: 'updated',
            id: data.id,
            component: data.component,
            status: 200,
            message: 'Component updated',
            session: data.session || guid('session_')
          }));
          break;

        case 'write':
          if (data.file) {
            methods.write (data.component, data.file, data.content, function(){
              connection.send(JSON.stringify({
                type: 'reload'
              }));
            });
          }
      }
    }
  },
  init() {
    // Set up a new LDS structure installing dependencies, creating folders, and lds.config
  },
  start() {
    // Start server, or if server is already running, restart
  },
  test(which) {
    // Run test suite to make sure everyting is A-OK.
  },
  create(object) {
    // Create a new component/base/module/view
    if (!object.name || !object.category) {
      console.error('cant create component without name or parent');
    }
  },
  build(task, callback) {
    // Build
  },
  update(component, changes) {
    console.log('trigger update', changes);
    // write updated data object to disk
  },
  write (component, filename, content, callback) {
    console.log('write to', path.join(component.path, filename));
    try  {
      fs.statSync(path.join(component.path, '.versions')).isDirectory();
    }
    catch (e) {
      fs.mkdirSync(path.join(component.path, '.versions'));
    };

    fs.renameSync(path.join(component.path, filename), path.join(component.path, '.versions', filename + '.' + new Date().getTime()))
    fs.writeFileSync(path.join(component.path, filename), content, 'utf-8');
    callback();
  },
  remove(object) {
    // delete component from file structure
  },
  bump(object, change) {
    // update semver version of object
  },
  diff(commit1, commit2) {
    // Get a diff view
  },
  pull() {
    // Pull latest changes
  },
  commit(message) {
    // Check in changes in branch and update pull request
  },
  pullRequest() {
    // Create a new Pull request for all changes made to LDS through the service
  }
};

module.exports = {
  app,
  methods
};
