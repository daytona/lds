// Setup component playground to run component in standalone mode and modify its
// template, css, js, json, readme and save into LDS
var fs = require('mz/fs');
var koa = require('koa');
var path = require('path');
var mount = require('koa-mount');
var serve = require('koa-static');
var Router = require('koa-router');

var app = koa();
var router = new Router();

router
  .get('/:category/:name', function *(next){
    yield next;
    var component = this.lds.structure[this.params.category][this.params.name];
    this.body = JSON.stringify(component, false, 2);
  });

app.use(router.routes());

module.exports = app;
