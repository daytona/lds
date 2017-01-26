var path = require('path');
var fs = require('mz/fs');
var koa = require('koa');
var Router = require('koa-router');
var SimpleGit = require('simple-git');
var marked = require('marked');

var pureQuery = require('./lib/pure-query');
var objectValue = require('./lib/objectValue');
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
var Engine = require('@daytona/lds-engine');
var ldsParser = require('@daytona/lds-parser');
var mount = require('koa-mount');
var serve = require('koa-static');

var templates = require('./lib/templates');
var config = require('./lds.config');

var app = koa();
var router = new Router();


if (!config.engine || !config.engine.render) {
  throw new Error('No templating engine specified');
}
var engine = new Engine(config.engine);

var namespace = 'api';


module.exports = function API (lds, server) {
  var apiLds = ldsParser.sync(config);
  var app = koa();
  var router = new Router();
  var git = SimpleGit(lds.config.path.dirname);
  router
    .get('/', function *(next) {
      yield next;
      this.renderView(this.api.structure.views.start, {});
    })
    .get('/client', function *(next) {
      yield next;
      this.type = 'text/javascript';
      this.body = handlebars.compile(templates['clientScript.js'])({socketUrl: `${this.request.protocol === 'https' ? 'wss' : 'ws'}://${this.request.host}`});
    })
    .get('/editstyles', function *(next) {
      this.type = 'text/css';
      this.body = handlebars.compile(templates['editStyles.css'])({});
    })
    .get('/editscript', function *(next) {
      yield next;
      this.type = 'text/javascript';
      this.body = handlebars.compile(templates['editScript.js'])({});
    })
    .get('/screendump', function *(next){
      this.body = 'Saving screens of views';
      var query = pureQuery(this.query);
      screenDump(this.lds.structure, query._type, 'http://'+this.request.host);

      yield next;
    })
    .get('/export', exporter)
    .get('/screen/:path*', getScreenshot)
    .get('/:path*', component)
    .post('/:path*', function *(next) {
      var component = findComponent(this.lds.structure, '/'+ this.params.path);
      var params = this.request.body;

      var file = params.filename;

      if (params.method === 'put' && component) {
        yield new Promise((resolve, reject) => {
          methods.write(component, file, params.filecontent, function(){
            if (/\.jsx?$/.test(file)) {
              build('script', lds.config, resolve);
            } else if (/\.css$/.test(file)) {
              build('styles', lds.config, resolve);
            } else if (new RegExp('\.(json|md|' + (lds.config.engine.ext  || 'hbs') + ')$').test(file)) {
              resolve();
            } else {
              reject();
            }
          });
        }).then(() => {
          return new Promise((resolve, reject) => {
            server.reparse(resolve);
          });
        }).then(() => {
          console.log('resolve promise');
          this.redirect(this.request.header.referer);
        }).catch((err) => {
          console.log('couldn\'t write file', err);
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

  app
    // .use(function*(next) {
    //   this[namespace] = apiLds;
    //   yield next;
    // })
    // .use(mount(config.path.public, serve(path.join(config.path.dirname, config.path.dist))))
    // .use(engine.setup(namespace))
    .use(router.routes());

  const methods = {
    message(message, connection) {
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
              var sessiondata = Object.assign({}, component.data);

              Object.keys(data.data).forEach(param => {
                if (!param.match(/^\$/)) {
                  objectValue.set(sessiondata, param, data.data[param]);
                }
              });

              sessions.set(session, {
                data: sessiondata
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
          case 'writeData':
            if (!data.data) {
              return;
            }
            var rawdata = component.data;

            Object.keys(data.data).forEach(param => {
              if (!param.match(/^\$/)) {
                objectValue.set(rawdata, param, data.data[param]);
              }
            });

            var fileName = component.files['index.json'] ? 'index.json' : 'default.json';
            new Promise((resolve, reject) => {
              methods.write(component, fileName, JSON.stringify(rawdata, false, 2), resolve);
            }).then(() => {
              return new Promise((resolve, reject) => {
                server.reparse(resolve);
              });
            }).then(() => {
              methods.commit('Styleguide updated component data in ' + component.name, component.path);
              connection.send(JSON.stringify({
                type: 'reload'
              }));
            }).catch((err) => {
              console.log('couldn\'t write file', err);
            });
            break;
          case 'write':
            if (data.file) {
              var file = data.file;
              new Promise((resolve, reject) => {
                methods.write(component, file, data.content, function(){
                  if (/\.jsx?$/.test(file)) {
                    build('script', lds.config, resolve);
                  } else if (/\.css$/.test(file)) {
                    build('styles', lds.config, resolve);
                  } else if (new RegExp('\.(json|md|' + (lds.config.engine.ext  || 'hbs') + ')$').test(file)) {
                    resolve();
                  } else {
                    reject();
                  }
                });
              }).then(() => {
                return new Promise((resolve, reject) => {
                  server.reparse(resolve);
                });
              }).then(() => {
                connection.send(JSON.stringify({
                  type: 'reload'
                }));
              }).catch((err) => {
                console.log('couldn\'t write file', err);
              });
            }
            break;
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

      fs.exists(path.join(component.path, '.versions')).then(function (exists) {
        if (!exists) {
          return fs.mkdir(path.join(component.path, '.versions'));
        }
        return;
      }).then(()=>{
        return fs.rename(path.join(component.path, filename), path.join(component.path, '.versions', filename + '.' + new Date().getTime()));
      }).then(()=> {
        fs.writeFile(path.join(component.path, filename), content, 'utf-8', (err) => {
          if (err) {
            console.log(err);
            return;
          }
          callback();
        });
      });
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
      git.stash().fetch().rebase(['origin', 'master']).stash(['apply']);
    },
    commit(message, files) {
      console.log('tring to commit', message);
      // Check in changes in branch and update pull request
      if (!git) {
        return false;
      }
      git.add(files || '.').commit(message).push(['-u', 'origin', 'master'], function(){
        console.log('Git sync complete');
      });
    },
    pullRequest() {
      // Create a new Pull request for all changes made to LDS through the service
    }
  };

  return {
    app,
    methods
  };
}
