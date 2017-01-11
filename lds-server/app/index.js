var path = require('path');
var koa = require('koa');
var serve = require('koa-static');
var subdomain = require('koa-sub-domain');
var mount = require('koa-mount');
var session = require('koa-session');
var bodyParser = require('koa-bodyparser');
var randtoken = require('random-token').create('LDS'); // salt
var auth = require('./auth');
var router = require('./router');
var koaSocket = require('koa-websocket');
var route = require('koa-route');

var styleguide = require('@daytona/lds-styleguide');
var api = require('@daytona/lds-api');
var editor = require('@daytona/lds-editor');
var parseLds = require('@daytona/lds-parser');
var Engine = require('@daytona/lds-engine');

var view = require('../controllers/view');
var pageNotFound = require('../controllers/404');
var objectDeepMap = require('../lib/object-deep-map');

function Server(config) {
  if (!config.engine || !config.engine.render) {
    throw new Error('No templating engine specified');
  }

  var host = process.env.HOST || 'localhost';
  var port = process.env.PORT || config.port || 4000;

  //if (!config.namespace) {
    var namespace = 'lds';
  //}

  var engine = new Engine(config.engine);
  var app = koaSocket(koa());


  app.keys = ['secret lds project'];

  var lds = parseLds.sync(config);
  var token = randtoken(16);
  var socket;

  function reParse (callback) {
    console.log('Re-parsing structure');
    lds = parseLds.sync(config);

    if (typeof(callback) === 'function') {
      callback();
    }
    return;
  }

  app.ws.use(route.all('/', function* (next) {
    socket = {
      on: this.websocket.on,
      send: this.websocket.send,
      broadcast: function(message) {
        console.log('Broadcasting to all connected clients', message);
        app.ws.server.clients.forEach(function(client) {
          client.send(message);
        });
      }
    };

    this.websocket.on('message', function(message) {
      // print message from the client
      console.log(message);
    });

    // send a message to our client
    this.websocket.send('Hello Client!');
    this.ldssocket = socket;
    // yielding `next` will pass the context (this) on to the next ws middleware
    yield next;
  }));

  app.use(session(app));

  app.use(function* (next) {
    lds.host = this.request.host;
    this[namespace] = lds;
    this.parse = reParse;
    websocket = this.websocket;
    yield next;
  });

  app
    .use(bodyParser())
    // Serve static files from /dist folder
    .use(pageNotFound) // Handle 404 after parsing every other middleware, if no match trigger 404
    .use(mount(config.path.public, serve(path.join(config.path.dirname, config.path.dist))))
    .use(engine.setup(namespace));
    //.use(extendLds(config))

  if (config.login && process.env.NODE_ENV === 'production') {
    app.use(auth(config.login, token));
  }

  app
    .use(mount('/styleguide', styleguide))
    .use(mount('/api', api.app))
    .use(mount('/playground', editor))
    .use(mount('/info', function* infoView(next) {
      this.showinfo = true;
      yield next;
    }))
    .use(mount('/info', view))
    .use(view)

    .listen(port);

  console.log('HTTP-Server running at port ', port);
  objectDeepMap(lds.structure.views, (value) => {
    if (value && value.isLDSObject && value.template) {
      console.log(`${value.name}: http://${host}:${port}${value.id.replace(/^\/views/, '')}`);
    }
    return value;
  });
  console.log(`Styleguide: http://${host}:${port}/styleguide`);

  return {
    parse: reParse,
    reload(reason) {
      if (socket) {
        if (reason === 'css') {
          socket.broadcast('updatecss');
        } else {
          socket.broadcast('reload');
        }
      }
    },
    app
  };
};

module.exports = Server;
