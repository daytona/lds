import XMLHttpRequestPromise from 'xhr-promise';
import formParse from 'form-parse';
import controller from '../../helpers/controller';
import object2query from '../../helpers/object2query';
import eventListener from '../../helpers/eventListener';

export default function View(el, options) {
  const xhr = new XMLHttpRequestPromise();
  const url = options.url || el.dataset.url;
  const data = options.data || {};
  const exampleEl = el.querySelector('.js-example');
  const dataEl = el.querySelector('.js-data');
  const formEl = el.querySelector('.js-editForm');
  let state = data;

  function drawView(response) {
    exampleEl.innerHTML = response.responseText;
    eventListener.dispatchEvent(exampleEl, 'newDom');

    if (dataEl) {
      dataEl.innerText = JSON.stringify(state, false, 4);
    }
  }

  function update(params = {}) {
    state = Object.assign(state, params);

    xhr.send({
      method: 'get',
      url: `${url}?${object2query(Object.assign({}, state, {'layout': 'styleguide:none'}))}`,
    }).then((response) => {
      state = data;
      drawView(response);
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

  function init(){
    if (url) {
      bindEvents();
    }

    if (exampleEl) {
      update();
    }
  }
  return {
    init,
  };
};
controller.add('View', View);
