import controller from '../../../helpers/controller';
import formParse from 'form-parse';
import object2query from '../../../helpers/object2query';
import {store, connectToStore} from '../../../helpers/store';

export default function initDemoForm(el, options = {}) {
  const {id} = options;
  const iframe = el.querySelector('.js-iframe');

  const handleChange = e => store.dispatch(updateComponentParam(id, formParse(e)));

  const selectState = state => ({
    values: state.demo[id] && state.demo[id].params
  });

  connectToStore(selectState, ({params}) => {

  });

  el.addEventListener('change', handleChange);
};

controller.add('DemoForm', initDemoForm);
