var Router = require('koa-router');
var plainComponent = require('../controllers/render');
//var styleguide = require('../controllers/styleguide');
var viewPage = require('../controllers/view');

var router = new Router();

router
  .get('/', viewPage)
  // .get('/styleguide', styleguide.parseComponents, styleguide.engine, styleguide.page)
  // .get('/styleguide/:category', styleguide.parseComponents, styleguide.engine, styleguide.page)
  // .get('/styleguide/:category/:unit', styleguide.parseComponents, styleguide.engine, styleguide.page)
  .get('/plain/:category/:name', plainComponent)
  .get('/:view', viewPage);

module.exports = router;
