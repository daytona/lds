var fs = require('mz/fs');
var koa = require('koa');
var path = require('path');
var mount = require('koa-mount');
var serve = require('koa-static');
var Router = require('koa-router');
var objectDeepMap = require('./lib/object-deep-map');

var config = require('./lds.config');
var app = koa();
var parseLdsComponents = require('./lib/parseComponents');
var router = new Router();

function *parseComponents(next) {
  this.styleguide = {
    structure: parseLdsComponents(config),
    config: config
  };
  yield next;
}

function *defaultData(next) {
  this.defaultData = Object.assign(this.lds.structure, {
    mainNav: mainNav(this.lds.structure),
    prefix: config.prefix ? `${config.prefix}-` : ''
  });
  yield next;
}

router
  .get('/', function *(next){
    yield next;
    this.renderView('start');
  })
  .get('/:category', function *(next){
    yield next;
    this.renderView('category', this.params);
  })
  .get('/:category/:component', function *(next){
    yield next;
    this.renderView('single', this.params);
  });

app
  //.use(screenshots)
  .use(mount(config.path.public, serve(path.join(config.path.dirname, config.path.dist))))
  .use(parseComponents)
  .use(config.engine.setup('styleguide', config.prefix))
  .use(defaultData)
  .use(router.routes());

module.exports = app;

function mainNav(data) {
  return {
    items: Object.keys(data).map((groupName) => {
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
