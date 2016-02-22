import Router from 'koa-router';
//import Styleguide from 'lds-styleguide';
import componentPage from './controllers/styleguide/component';
import componentsPage from './controllers/styleguide/components';
import viewPage from './controllers/view';

let router = new Router();

router
  .get('/', viewPage)
  .get('/styleguide', function *(next) {
    
  })
  // .get('/styleguide', Styleguide.start)
  // .get('/styleguide/views', Styleguide.views)
  // .get('/styleguide/base', Styleguide.base)
  // .get('/styleguide/components', Styleguide.components)
  .get('/components', componentsPage)
  .get('/component/:name', componentPage)
  .get('/:view', viewPage);

export default router;
