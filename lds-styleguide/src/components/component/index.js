import XMLHttpRequestPromise from 'xhr-promise';
import formParse from 'form-parse';
import controller from '../../helpers/controller';
import eventListener from '../../helpers/eventListener';

export default function Component(el, options = {}) {
  const xhr = new XMLHttpRequestPromise();
  const url = options.url || el.dataset.url;
  const data = options.data || {};
  const containerEl = el.querySelector('.js-container');
  const formEl = el.querySelector('.js-editForm');


  let state = data;

  function drawComponent(response) {
    containerEl.innerHTML = response.responseText;
    eventListener.dispatchEvent(containerEl, 'newDom');
  }

  function object2query(obj) {
    const queries = [];
    Object.keys(obj).forEach((key) => {
      queries.push(`${key}=${(typeof obj[key] === 'object' ?
                              JSON.stringify(obj[key], null, 0) :
                              obj[key])}`);
    });
    return queries.join('&');
  }

  function update(params) {
    state = Object.assign(state, params, {layout: 'none'});

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

  return init();
}
controller.add('Component', Component);
