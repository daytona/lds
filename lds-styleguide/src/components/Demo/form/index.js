import controller from '../../../helpers/controller';
import formParse from 'form-parse';
import object2query from '../../../helpers/object2query';
import {store, connectToStore} from '../../../helpers/store';

import {updateComponentParam as updateComponentParamAction} from '../actions';

export default function initDemoForm(el, options = {}) {
  const id = el.dataset.id;
  const inputs = el.querySelectorAll('select, input, textarea');

  const handleInputChange = ({target}) => {
    const key = target.name;
    let value = target.value;

    switch (value) {
      case 'false':
        value = false;
        break;
      case 'undefined':
        value = undefined;
        break;
    }

    store.dispatch(updateComponentParamAction(id, key, value));
  };

  // const selectState = state => ({
  //   params: state.demo[id] && state.demo[id].params
  // });

  // connectToStore(selectState, ({params}) => {
  //   Object.keys(params).forEach(() => {
  //   });
  // });

  Array.prototype.forEach.call(inputs, input => input.addEventListener('change', handleInputChange));
};

controller.add('DemoForm', initDemoForm);
