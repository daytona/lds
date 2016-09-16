var path = require('path');
var fs = require('fs');
var koa = require('koa');
var Router = require('koa-router');
var marked = require('marked');
var pureQuery = require('./lib/pure-query');
var screenDump = require('./lib/screenshots.js');
var findComponent = require('./lib/find-component');
var objectDeepMap = require('./lib/object-deep-map');
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
function updateIframeScript(iframeid){
  return `<script>
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
      if (typeof window.parent.updateIframeHeight === 'function') {
        window.parent.updateIframeHeight(iframeID, documentHeight);
      }
    }
    var resizeInterval = setInterval(checkHeight, 100);
  }

  if (window !== window.top) {
    callMyParent('${iframeid}');
  }
</script>`;
}
router
  .get('/screendump', function *(next){
    this.body = 'Saving screens of views';
    var query = pureQuery(this.query);
    screenDump(this.lds.structure, query.type);
    yield next;
  })
  .get('/export', function *(next){
    var views = [];
    objectDeepMap(this.lds.structure.views, (value) => {
      if (value && value.isLDSObject && value.template) {
        value.exporturl = value.url + '/index.html';
        views.push(value);
      }
      return value;
    });
    views.forEach((view) => {
      var viewpath = view.url.replace(/\/index$/, '');

      var relativePath = viewpath.replace(/^\//, '').replace(/([^\/]+)/g, '..');
      if (relativePath == '/') {
        relativePath = '';
      }
      var dir = path.join(this.lds.config.path.dirname, this.lds.config.path.dist, 'html', viewpath);

      // Render view content
      var html = this.renderView(view, {}, true);

      // Replace all assets links with relative urls
      html = html.replace(/\/assets/g, relativePath ? '../' + relativePath : '..');

      // Replace all view URLs to relative urls
      views.forEach(otherview => {

        var viewurl = new RegExp('="' + otherview.url || '/' + '"', 'g');
        html = html.replace(viewurl, '="' + relativePath + otherview.exporturl + '"');
      })
      html = html.replace(/="\//g, '="' + relativePath);
      fs.mkdir(dir, () => {
        fs.writeFile( dir + '/index.html', html, (err) => {
           if (err) throw err;
           console.log(viewpath, ' saved!');
        });
      });
    });
    this.body = 'Exporting views to <a href="/assets/html">/dist/html</a>';
  })
  .get('/screen/:path*', function *(next) {
    var component = findComponent(this.lds.structure, '/'+ this.params.path);

    if (!component) {
      return 'not found image';
    }
    var type = 'png';
    if (component.screen) {
      type = component.screen.match(/\.(.*)$/)[1];
      screenpath = component.screen;
    } else if (component.template || component.example || component.styles || component.script || (component.info && !component.children)) {
      var screenpath = path.join(this.lds.config.path.dirname, this.lds.config.path.dist, 'screens' + component.id + '.png');
    } else if (component.children) {
      this.redirect('/api/screen' + component.children[Object.keys(component.children)[0]].id);
      return;
    }
    if (screenpath)
    this.type = `image/${type}`;
    this.body = fs.readFileSync(screenpath);
  })
  .get('/views/:name*', function *(next) {
    var query = pureQuery(this.query);
    var view = findComponent(this.lds.structure.views, '/views/' + this.params.name);

    // if (!view || (!view.template && view.children.index)) {
    //   view = findComponent(this.lds.structure.views, '/views/' + this.params.name + '/index');
    // }

    if (query.type === 'json') {
      this.type = 'text/plain; charset=utf-8';
      this.body = view;
    } else if (query.standalone) {
      var viewtemplate = this.renderView(view, query, true);
      this.body = viewtemplate.replace(/\<\/body\>/,
        "<script>document.addEventListener('click', (event)=>{event.preventDefault();});</script>\n<\/body>"
      );
    } else if (!Object.keys(query).length){
      this.renderView(view, Object.assign({layout:'default'}, query));
    } else {
      yield next;
    }
  })
  .get('/:path*', function *(next){
    var component = findComponent(this.lds.structure, '/'+ this.params.path);

    if (!component) {
      return false;
    }
    var query = pureQuery(this.query);

    if (query.type === 'json' || query.type === 'js' || query.type === 'css' || query.type === 'template' || query.type === 'html') {
      var content;
      var language = query.type;
      switch (query.type) {
        case 'json':
          content = JSON.stringify(component.data, null, 2);
          break;
        case 'js':
          content = component.code.script;
          break;
        case 'css':
          content = component.code.styles;
          break;
        case 'template':
          content = component.code.template;
          language = 'handlebars';
          break;
        case 'html':
          content = this.render(component.template, Object.assign({}, component.data, query));
          language = 'html';
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
                    <body style="margin: 0; background: #272822; overflow: hidden; ${query.screenshot ? 'transform: rotate(-3deg) translate(2%, -3%); -webkit-transform: rotate(-3deg) translate(2%, -3%); font-size: 50px;' : ''}">
                    <code><pre style="overflow:hidden;" class="language-${language}">${content}</pre></code>
                    </body>
                  </html>`;
      this.body = body;
    } else if (query.type === 'info') {
      var body = `<html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <link rel="shortcut icon" href="">
                    </head>
                    <body style="margin: 0; background: #cecece;">
                    <div style="background: #fefefe; box-shadow: 0 0 20px rgba(0,0,0,0.6); overflow:hidden; width:60%; margin: 50px auto 0; padding: 80px 60px 0; height: 70%; bottom: 0; position: absolute; left: 0; right: 0;">
                    ${marked(component.info)}
                    </div>
                    </body>
                  </html>`;
      this.body = body;
    } else if (query.type === 'example') {
      var body = `<html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <link rel="shortcut icon" href="">
                      <link rel="stylesheet" href="/assets/style.css">
                    </head>
                    <body style="margin: 0; background: #fefefe; ">
                    <div class="Page Page--nopadding text">
                      <div id="Standalone-wrapper">
                      ${this.render(component.example, Object.assign({}, component, query))}
                      </div>
                    </div>
                    <script src="/assets/main.js"></script>
                    ${query.iframeid && updateIframeScript(query.iframeid)}
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
                    <body style="margin: 0; background: #fefefe; ">
                    <div class="Page Page--nopadding text">
                      <div id="Standalone-wrapper" style="${component.category === 'component' ? 'padding: 20px; position:relative; margin: auto; max-width:800px':''}">
                      ${this.render(component.template, Object.assign({}, component.data, query))}
                      </div>
                    </div>
                    <script src="/assets/main.js"></script>
                    ${query.iframeid ? updateIframeScript(query.iframeid) : ''}
                    </body>
                  </html>`;

        this.body = body;
    } else if (!Object.keys(query).length) {
      this.body = this.render(component.template, Object.assign({}, component.data, query));
    } else {
      yield next;
    }

  })
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

module.exports = {
  app,
  methods
};
