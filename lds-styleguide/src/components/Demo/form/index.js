import controller from '../../../helpers/controller';
import formParse from 'form-parse';
import object2query from '../../../helpers/object2query';
import socket from '../../../helpers/socket';
import isJSON from '../../../helpers/isJSON';
import {store, connectToStore} from '../../../helpers/store';

import {updateComponentParam as updateComponentParamAction} from '../actions';

export default function initDemoForm(el, options = {}) {
  const id = el.dataset.id;
  const componentId = el.dataset.component;
  const inputs = el.querySelectorAll('select, input, textarea');
  const selectState = state => ({
    params: state.demo[id] && state.demo[id].params
  });
  let dataParams;
  let isChanged = false;


  connectToStore(selectState, ({params, iframeHeight}) => {
    updateParams(params);
  });

  function handleInputChange (event) {
    const {target} = event;
    const key = target.name;
    let value = target.value.replace(new RegExp('\"', 'g'), '"');
    if (target.getAttribute('type') === 'checkbox' || target.getAttribute('type') === 'radio') {
      value = target.checked;
    }
    switch (value) {
      case 'false':
        value = false;
        break;
      case 'undefined':
        value = undefined;
        break;
    }
    if (isJSON(value)) {
      value = JSON.parse(value);
    }

    store.dispatch(updateComponentParamAction(id, key, value));
  };
  function updateParams(params) {
    if (dataParams && dataParams !== params) {
      isChanged = true;
      el.classList.add('isChanged');
    }
    dataParams = params;
  }

  function saveChanges(event) {
    event.preventDefault();
    if (socket) {
      socket.send({
        action: 'writeData',
        component: componentId,
        data: dataParams
      });
      isChanged = false;
      el.classList.remove('isChanged');
    }
  }

  function init () {
    Array.prototype.forEach.call(inputs, input => input.addEventListener('change', handleInputChange));
  }
  return { init }
};

controller.add('DemoForm', initDemoForm);
