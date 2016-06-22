var Router = require('koa-router');

var viewPage = require('../controllers/view');
var auth = require('./auth');
var router = new Router();

router
  .get('/', viewPage)

module.exports = router;
