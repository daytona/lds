import XMLHttpRequestPromise from 'xhr-promise';
import formParse from 'form-parse';
import controller from '../../helpers/controller';
import eventListener from '../../helpers/eventListener';
import object2query from '../../helpers/object2query';

export default function Component(el, options = {}) {
  const xhr = new XMLHttpRequestPromise();
  const url = options.url || el.dataset.url;
  const data = options.data || {};
  const containerEl = el.querySelector('.js-container');
  const formEl = el.querySelector('.js-editForm');
  const dataEl = el.querySelector('.js-data');

  let state = data;

  function drawComponent(response) {
    containerEl.innerHTML = response.responseText;
    eventListener.dispatchEvent(containerEl, 'newDom');

    dataEl.innerText = JSON.stringify(state, false, 4);
  }

  function update(params) {
    state = Object.assign(state, params);

    xhr.send({
      method: 'get',
      url: `${url}?${object2query(state)}`,
    }).then((response) => {
      state = data;
      drawComponent(response);
    }).catch((err) => {
      throw err;
    });
  }

  // Add params to state and update component
  function submitForm(event) {
    event.preventDefault();
    update(formParse(formEl));
  }

  function bindEvents() {
    el.addEventListener('updateComponent', update);

    if (formEl) {
      formEl.addEventListener('formSubmit', submitForm);
      formEl.addEventListener('change', submitForm);
    }
  }

  function init() {
    if (url) {
      bindEvents();
      update();
    }
  }

  return {
    init,
  };
}
controller.add('Component', Component);
