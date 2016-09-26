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
var handlebars = require('handlebars');

var exporter = require('./lib/exporter');
var view = require('./lib/view');
var component = require('./lib/component');
var getScreenshot = require('./lib/getScreenshot');

var app = koa();
var router = new Router();


router
  .get('/screendump', function *(next){
    this.body = 'Saving screens of views';
    var query = pureQuery(this.query);
    screenDump(this.lds.structure, query.type, 'http://'+this.request.host);

    yield next;
  })
  .get('/export', exporter)
  .get('/screen/:path*', getScreenshot)
  .get('/views/:name*', view)
  .get('/:path*', component)
  .put('/:category/:name', function *(next){
    var component = findComponent(this.lds.structure, '/'+ this.params.path);
    var query = pureQuery(this.query);

    if (component) {
      this.methods.update(component, query);
    } else {
      // Create new component
    }
      // Modify component data and write changes to file and bump component version
      // Or if component not existing, create new component
  })
  .del('/:category/:name', function *(next){
    var component = findComponent(this.lds.structure, '/'+ this.params.path);
    // Delete component from file structure, require authentication
  });

app.use(router.routes());

function methods(config) {
  return {
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
    build(task) {
      // Build
    },
    update(component, changes) {
      // write updated data object to disk
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
  }
}
module.exports = {
  app,
  methods
};
