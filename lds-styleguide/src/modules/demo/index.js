import controller from '../../helpers/controller';
import {store, addReducer, connectToStore} from '../../helpers/store';

import demoReducer from './reducer';
import {initComponent as initComponentAction} from './actions';
import fetcher from '../../helpers/fetcher';
import object2query from '../../helpers/object2query';

function initDemoComponent(el, options = { data: {} }) {
  const {id, url} = el.dataset;
  const {data} = options;
  const htmlEl = el.querySelector('.js-html');
  const htmlFetcher = new fetcher(htmlEl);
  const selectState = state => ({
    params: state.demo[id] && state.demo[id].params
  });

  store.dispatch(initComponentAction(id, data));

  connectToStore(selectState, ({params}) => {
    htmlFetcher.fetch(url + '?type=html&clean=true&' + object2query(params));
  });
}

addReducer('demo', demoReducer);
controller.add('Demo', initDemoComponent);
