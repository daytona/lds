import controller from '../../../helpers/controller';
import object2query from '../../../helpers/object2query';
import {store, connectToStore} from '../../../helpers/store';

export default function initDemoCode(el, options = {}) {
  const id = el.dataset.id;
  const dataEl = el.querySelector('.js-data');

  const selectState = state => ({
    params: state.demo[id] && state.demo[id].params
  });

  connectToStore(selectState, ({params}) => {
    dataEl.innerText = JSON.stringify(params, false, 4);
  });
};

controller.add('DemoCode', initDemoCode);
