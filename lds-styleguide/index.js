var fs = require('mz/fs');
var koa = require('koa');
var path = require('path');
var mount = require('koa-mount');
var serve = require('koa-static');
var Router = require('koa-router');
var objectDeepMap = require('./lib/object-deep-map');
var Engine = require('lds-engine');
var pureQuery = require('./lib/pure-query');

var config = require('./lds.config');
var app = koa();
var parseLds = require('lds-parser');
var router = new Router();

function *defaultData(next) {
  this.defaultData = Object.assign(this.lds.structure, {
    mainNav: mainNav(this.lds.structure),
    prefix: config.prefix ? `${config.prefix}-` : ''
  });

  yield next;
}
function *view(next) {
  var component;
  objectDeepMap(this.lds.structure, (value) => {
    if (value && value.isLDSObject && value.id === this.request.url) {
      component = value;
    }
    return value;
  });
  if (component) {
    this.renderView(this[config.namespace].structure.views['single'], component);
  } else {
    this.renderView(this[config.namespace].structure.views['start'], this.lds.structure);
  }
  yield next;
}
if (!config.engine || !config.engine.render) {
  throw new Error('No templating engine specified');
}
var engine = new Engine(config.engine);

if (!config.namespace) {
  config.namespace = 'styleguide';
}

router
  .get('/', function *(next){
    yield next;
    this.renderView(this[config.namespace].structure.views['start'], pureQuery(this.query));
  })
  .get('/:category', function *(next){
    yield next;
    this.renderView(this[config.namespace].structure.views['category'], Object.assign(this.params, pureQuery(this.query)));
  })
  .get('/views/:component', function *(next){
    yield next;
    this.renderView(this[config.namespace].structure.views['view'], Object.assign(this.params, pureQuery(this.query)));
  })
  .get('/:category/:component', function *(next){
    yield next;
    this.renderView(this[config.namespace].structure.views['single'], Object.assign(this.params, pureQuery(this.query)));
  });

app
  .use(mount(config.path.public, serve(path.join(config.path.dirname, config.path.dist))))
  .use(parseLds(config))
  .use(engine.setup(config.namespace, config.prefix))
  .use(defaultData)
  //.use(router.routes());
  .use(view);

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
