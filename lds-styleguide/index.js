var fs = require('mz/fs');
var koa = require('koa');
var path = require('path');
var mount = require('koa-mount');
var serve = require('koa-static');
var Router = require('koa-router');
var objectDeepMap = require('./lib/object-deep-map');

var Engine = require('@daytona/lds-engine');
var ldsParser = require('@daytona/lds-parser');

var pureQuery = require('./lib/pure-query');
var findComponent = require('./lib/find-component');

var config = require('./lds.config');
var app = koa();
var router = new Router();

var lds = ldsParser.sync(config);

if (!config.engine || !config.engine.render) {
  throw new Error('No templating engine specified');
}
var engine = new Engine(config.engine);

if (!config.namespace) {
  config.namespace = 'styleguide';
}

var readme;
try {
  readme = fs.readFileSync(path.join(lds.config.path.dirname, 'readme.md'), 'utf-8');
} catch (err) {
  // No readme found
  readme = false;
}

// Builds styleguide main nav tree structure
function buildMainNavTree(data) {
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
      var group = data[groupName];
      // Remove empty
      return group && Object.keys(group).length;
    }).map((groupName) => {
      return {
        name: groupName,
        url: `/styleguide/${groupName}`,
        items: getChildren(data[groupName])
      };
    })
  };
}

/**
 * Middleware: Extends state with default data
 */
function *defaultData(next) {
  var structure = this.lds.structure;
  this.defaultData = Object.assign({}, config.styleguide, structure, {
    mainNav: buildMainNavTree(structure),
    prefix: config.prefix ? `${config.prefix}-` : '',
    info: readme,
    styleguide: config.styleguide
  });
  yield next;
}

/**
 * Middleware: Updates styleguide state if query string "live" is present
 */
function* updateState(next) {
  var shouldUpdate = this.query && this.query.ltrue;
  var currentState = this[config.namespace] || {};
  this[config.namespace] = shouldUpdate ? Object.assign({}, currentState, ldsParser.sync(config)) : lds;
  yield next;
}

const getGuideView = (obj, view) => {
  return obj[config.namespace].structure.views[view];
}

router
  .get('/', function *(next){
    this.renderView(getGuideView(this, 'index'), pureQuery(this.query));
    yield next;
  })
  .get('/:category', function *(next){
    this.renderView(getGuideView(this, 'category'), Object.assign({}, this.params, pureQuery(this.query)));
    yield next;
  })
  .get('/views/:path*', function *(next){
    var component = findComponent(this.lds.structure.views, `/views/${this.params.path}`);

    if (component) {
      this.renderView(getGuideView(this, 'view'), component);
    }
    yield next;
  })
  .get('/:category/:path*', function *(next){
    var params = this.params;
    var component = findComponent(this.lds.structure[params.category], `/${params.category}/${params.path}`);

    if (component) {
      this.renderView(getGuideView(this, 'single'), component);
    }
    yield next;
  });

app
  .use(updateState)
  .use(mount(config.path.public, serve(path.join(config.path.dirname, config.path.dist))))
  .use(engine.setup(config.namespace, config.prefix))
  .use(defaultData)
  .use(router.routes());

module.exports = app;
