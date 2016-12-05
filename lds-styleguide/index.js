var fs = require('mz/fs');
var koa = require('koa');
var path = require('path');
var mount = require('koa-mount');
var serve = require('koa-static');
var Router = require('koa-router');
var objectDeepMap = require('./lib/object-deep-map');

var Engine = require('@daytona/lds-engine');
var parseLds = require('@daytona/lds-parser');

var pureQuery = require('./lib/pure-query');
var findComponent = require('./lib/find-component');

var config = require('./lds.config');
var app = koa();
var router = new Router();

function *defaultData(next) {
  var info = false;
  try {
    info = fs.readFileSync(path.join(this.lds.config.path.dirname, 'readme.md'), 'utf-8');
  } catch (err) {
    // No readme found
  }

  this.defaultData = Object.assign({}, this.lds.structure, {
    mainNav: mainNav(this.lds.structure),
    prefix: config.prefix ? `${config.prefix}-` : '',
    info: info
  });

  yield next;
}

if (!config.engine || !config.engine.render) {
  throw new Error('No templating engine specified');
}
var engine = new Engine(config.engine);
var styleguideLds = parseLds.sync(config);

if (!config.namespace) {
  config.namespace = 'styleguide';
}

router
  .get('/', function *(next){
    yield next;
    this.renderView(this[config.namespace].structure.views['index'], pureQuery(this.query));
  })
  .get('/:category', function *(next){
    yield next;
    this.renderView(this[config.namespace].structure.views['category'], Object.assign(this.params, pureQuery(this.query)));
  })
  .get('/views/:path*', function *(next){
    var component = findComponent(this.lds.structure.views, `/views/${this.params.path}`);
    yield next;

    if (component) {
      this.renderView(this[config.namespace].structure.views['view'], component);
    }
  })
  .get('/:category/:path*', function *(next){
    var component = findComponent(this.lds.structure[this.params.category], `/${this.params.category}/${this.params.path}`);
    yield next;

    if (component) {
      this.renderView(this[config.namespace].structure.views['single'], component);
    }
  });

//if (process.env.NODE_ENV === 'production') {
  app.use(function* (next) {
    this[config.namespace] = styleguideLds;
    yield next;
  });
// } else {
//   app.use(parseLds.async(config));
// }

app
  .use(mount(config.path.public, serve(path.join(config.path.dirname, config.path.dist))))
  .use(engine.setup(config.namespace, config.prefix))
  .use(defaultData)
  .use(router.routes());

module.exports = app;

function mainNav(data) {
  function getChildren(struct) {
    return Object.keys(struct).map((compName) => {
      var component = struct[compName];
      return {
        name: component.name,
        url: `/styleguide${component.id}`,
        items: component.children ? getChildren(component.children) : false
      };
    });
  }

  return {
    items: Object.keys(data).filter((groupName) => {
      // Remove empty
      return data[groupName] && Object.keys(data[groupName]).length;
    }).map((groupName) => {
      var group = data[groupName];

      return {
        name: groupName,
        url: `/styleguide/${groupName}`,
        items: getChildren(data[groupName])
      };
    })
  };
}
