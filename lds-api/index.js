var ldsbuild = require('lds-build');
var ldstest = require('lds-test');

var koa = require('koa');
var Router = require('koa-router');
var isJSON = require('./lib/isJSON');
var webshot = require('webshot');
var app = koa();
var router = new Router();

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
    create(type) {
      // Create a new component/base/module/view
    },
    build(task) {
      // Build

    },
    update(object) {
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

router
  .get('/:category/:name', function *(next){
    var component = this.lds[this.params.category][this.params.name];
    var query = {};

    // Loop though query parameters to build an data object
    Object.keys(this.query).forEach((key) => {
      query[key] = isJSON(this.query[key]) ? JSON.parse(this.query[key]) : this.query[key];
    });

    if (query === 'json') {
      this.type = 'text/plain; charset=utf-8';
      this.body = component;
    } else if (query.standalone || query.screenshot) {
      var body = `<html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <link rel="shortcut icon" href="">
                      <link rel="stylesheet" href="/assets/style.css">
                    </head>
                    <body>
                      <div id="Standalone-wrapper" style="max-width:500px">
                      ${this.render(component.template, Object.assign({}, component.data, query))}
                      </div>
                      <script src="/assets/main.js"></script>
                    </body>
                  </html>`;
        if (query.standalone) {
          this.body = body;
        } else {
          this.type = 'image/png';
          this.body = webshot(`http://localhost:4000/api/${this.params.category}/${this.params.name}?standalone=true`, {siteType:'url', captureSelector: '#Standalone-wrapper'});
        }
    } else {
      this.body = this.render(component.template, Object.assign({}, component.data, query));
    }
  })
  .put('/:category/:name', function *(next){
    var component;
    try {
      component = this.lds[this.params.category][this.params.name];
    } catch (err) {
      component = methods.create(this.params.category, this.params.name);
    }
      // Modify component data and write changes to file and bump component version
      // Or if component not existing, create new component
  })
  .del('/:category/:name', function *(next){
      // Delete component from file structure, require authentication
  });

app.use(router.routes());

module.exports = {
  app,
  methods
};
