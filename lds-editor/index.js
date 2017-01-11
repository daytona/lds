// Setup component playground to run component in standalone mode and modify its
// template, css, js, json, readme and save into LDS
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

var namespace = 'editor';
var app = koa();
var router = new Router();

var lds = ldsParser.sync(config);
var engine = Engine(config.engine);

const getGuideView = (obj, view) => {
  return obj[namespace].structure.views[view];
}

/**
 * Middleware: Updates styleguide state if query string "live" is present
 */
function* updateState(next) {
  var shouldUpdate = this.query && this.query.ltrue;
  var currentState = this[namespace] || {};
  this[namespace] = shouldUpdate ? Object.assign({}, currentState, ldsParser.sync(config)) : lds;
  yield next;
}

router
  .get('/', function *(next){
    yield next;
    this.renderView(this[namespace].structure.views['start']);
  })
  .get('/:category/:name', function *(next){
    yield next;
    var component = this.lds.structure[this.params.category][this.params.name];
    this.renderView(this[namespace].structure.views['single'], { component });
  });

app
  .use(updateState)
  .use(mount(config.path.public, serve(path.join(config.path.dirname, config.path.dist))))
  .use(engine.setup(namespace, config.prefix))
  .use(router.routes());

module.exports = app;
