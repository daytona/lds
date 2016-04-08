import controller from '../../helpers/controller';
import {store, addReducer} from '../../helpers/store';

import demoReducer from './reducer';
import {initComponent as initComponentAction} from './actions';

function initDemoComponent(el, options = { data: {} }) {
  const id = el.dataset.id;
  const {data} = options;

  store.dispatch(initComponentAction(id, data));
}

addReducer('demo', demoReducer);
controller.add('Demo', initDemoComponent);

