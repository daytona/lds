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
    this.renderView('start', pureQuery(this.query));
  })
  .get('/:category', function *(next){
    yield next;
    this.renderView('category', Object.assign(this.params, pureQuery(this.query)));
  })
  .get('/views/:component', function *(next){
    yield next;
    this.renderView('view', Object.assign(this.params, pureQuery(this.query)));
  })
  .get('/:category/:component', function *(next){
    yield next;
    this.renderView('single', Object.assign(this.params, pureQuery(this.query)));
  });

app
  .use(mount(config.path.public, serve(path.join(config.path.dirname, config.path.dist))))
  .use(parseLds(config))
  .use(engine.setup(config.namespace, config.prefix))
  .use(defaultData)
  .use(router.routes());

module.exports = app;

function mainNav(data) {
  return {
    items: Object.keys(data).filter((groupName) => {
      return data[groupName] && Object.keys(data[groupName]).length;
    }).map((groupName) => {
      var group = data[groupName];

      return {
        name: groupName,
        url: `/styleguide/${groupName}`,
        items: Object.keys(data[groupName]).filter((compName)=>{
          return (typeof group[compName] === 'object');
        }).map((compName) => {
          var component = group[compName];
          return {
            name: component.name,
            url: `/styleguide/${groupName}/${compName}`,
          };
        })
      };
    })
  };
}
