import controller from '../../helpers/controller';
import {store, addReducer} from '../../helpers/store';

import demoReducer from './reducer';
import {initDemo as initDemoAction} from './actions';

function initDemo(el, options = {}) {
  const {id} = options;
  // const components = store.getState().;

  store.dispatch(initDemoAction(id, options));
}

addReducer('demo', demoReducer);
controller.add('Demo', initDemo);

