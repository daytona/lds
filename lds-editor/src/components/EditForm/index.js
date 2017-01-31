import controller from '../../helpers/controller';
import socket from '../../helpers/socket';
import isJSON from '../../helpers/isJSON';

export default function EditForm(el, options = {}) {
  const id = el.dataset.id;
  const sessionid = el.dataset.sessionid;
  const dataPath = el.dataset.datapath;
  const componentId = el.dataset.component;
  const inputs = el.querySelectorAll('select, input, textarea');

  let dataParams;
  let isChanged = false;

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
    let newState = Object.assign({}, dataParams);
    newState[key] = value;
    updateParams(newState);
  };
  function updateParams(params) {
    if (dataParams !== params) {
      isChanged = true;
      el.classList.add('isChanged');
      console.log('updateServer');
    }
    dataParams = params;
    updateServer();
  }

  function updateServer() {
    if (socket) {
      socket.send({
        action: 'update',
        session: sessionid,
        component: componentId,
        data: dataParams
      });
    }
  }

  function submit(event) {
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
    dataParams = {};
    Array.prototype.forEach.call(inputs, input => {
      dataParams[input.getAttribute('name')] = input.getAttribute('value');
      input.addEventListener('change', handleInputChange)
    });
    el.addEventListener('submit', submit);
    updateParams(dataParams);
  }
  return { init }
};

controller.add('EditForm', EditForm);
