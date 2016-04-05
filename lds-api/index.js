var ldsbuild = require('lds-build');
var ldstest = require('lds-test');

var koa = require('koa');
var Router = require('koa-router');
var pureQuery = require('./lib/pure-query');
var screenDump = require('./lib/screenshots.js');
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

router
  .get('/screendump', function *(next){
    this.body = 'Saving screens of views';
    var query = pureQuery(this.query);
    screenDump(this.lds.structure, query.type);
  })
  .get('/views/:name', function *(next){
    var query = pureQuery(this.query);
    if (query.type === 'json') {
      this.type = 'text/plain; charset=utf-8';
      this.body = this.lds.structure.views[this.params.name];
    } else if (query.standalone) {
      var viewtemplate = this.renderView(this.params.name, query, true);
      this.body = viewtemplate.replace(/\<\/body\>/,
        "<script>document.addEventListener('click', (event)=>{event.preventDefault();});</script>\n<\/body>"
      );
    } else {
      this.renderView(this.params.name, Object.assign({layout:'default'}, query));
    }
  })
  .get('/:category/:name', function *(next){
    var component = this.lds.structure[this.params.category][this.params.name];
    var query = pureQuery(this.query);

    if (query.type === 'json' || query.type === 'js' || query.type === 'css' || query.type === 'template') {
      var content;
      var language = query.type;
      switch (query.type) {
        case 'json':
          content = component.data;
          break;
        case 'js':
          content = component.highlight.script;
          break;
        case 'css':
          content = component.highlight.styles;
          break;
        case 'template':
          content = component.highlight.template;
          language = 'handlebars';
          break;
      }
      if (query.clean) {
        this.type = 'text/plain; charset=utf-8';
        this.body = content;
        return;
      }
      var body = `<html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <link rel="shortcut icon" href="">
                      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.4.1/themes/prism-okaidia.min.css">
                    </head>
                    <body style="margin: 0; background: #272822; ${query.screenshot ? 'transform: rotate(-3deg) translate(2%, -3%); -webkit-transform: rotate(-3deg) translate(2%, -3%); font-size: 25px;' : ''}">
                    <code><pre class="language-${language}">${content}</pre></code>
                    </body>
                  </html>`;
      this.body = body;
    } else if (query.type === 'example') {
      var body = `<html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <link rel="shortcut icon" href="">
                      <link rel="stylesheet" href="/styleguide/assets/style.css">
                    </head>
                    <body>
                    <div class="text">
                      ${component.example}
                      </div>
                    </div>
                    <script src="/assets/main.js"></script>
                    </body>
                  </html>`;

        this.body = body;
    } else if (query.standalone) {
      var body = `<html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <link rel="shortcut icon" href="">
                      <link rel="stylesheet" href="/assets/style.css">
                    </head>
                    <body style="margin: 0;">
                    <div class="Page Page--nopadding text">
                      <div id="Standalone-wrapper" style="display: inline-block; position:relative; margin: auto; ">
                      ${this.render(component.template, Object.assign({}, component.data, query))}
                      </div>
                    </div>
                    <script src="/assets/main.js"></script>
                    <script>
                      document.addEventListener('click', (event)=>{
                        event.preventDefault();
                      });
                      function callMyParent(iframeID) {
                        var documentHeight;
                        var wrapper = document.querySelector('#Standalone-wrapper');

                        function checkHeight() {
                          if (wrapper.clientHeight !== documentHeight) {
                            updateHeight();
                          }
                        }

                        function updateHeight() {
                          documentHeight = wrapper.clientHeight;
                          window.parent.updateIframeHeight(iframeID, documentHeight);
                        }
                        var resizeInterval = setInterval(checkHeight, 100);
                      }

                      if (window !== window.top) {
                        callMyParent('${query.iframeid}');
                      }
                    </script>
                    </body>
                  </html>`;

        this.body = body;
    } else if (query.screenshot) {
      this.type = 'image/png';
      this.body = webshot(`http://localhost:4000/api/${this.params.category}/${this.params.name}?standalone=true`, {
        siteType:'url',
        captureSelector: '#Standalone-wrapper',
        quality: 100,
        streamType: 'png',
        screenSize: {
          width: query.screenwidth || 320,
          height: query.screenheight || 320
        },
        shotSize: {
          width: 'all',
          height: 'all'
        }
      });
    } else {
      this.body = this.render(component.template, Object.assign({}, component.data, query));
    }
  })
  .put('/:category/:name', function *(next){
    var component;
    var query = pureQuery(this.query);

    try {
      component = this.lds.structure[this.params.category][this.params.name];
      this.methods.update(component, query);
    } catch (err) {
      component = methods.create(Object.assign({
        name: this.params.name,
        category: this.params.category
      }, query));
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
