var Router = require('koa-router');
var plain = require('../controllers/styleguide/plain-component');
var styleguide = require('../controllers/styleguide');
var viewPage = require('../controllers/view');

var router = new Router();

router
  .get('/', viewPage)
  .get('/styleguide', styleguide)
  .get('/styleguide/:category', styleguide)
  .get('/styleguide/:category/:unit', styleguide)
  .get('/component/:name', plain)
  .get('/:view', viewPage);

module.exports = router;
