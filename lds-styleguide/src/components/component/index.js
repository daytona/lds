import XMLHttpRequestPromise from 'xhr-promise';
import formParse from 'form-parse';
import controller from '../../helpers/controller';
import eventListener from '../../helpers/eventListener';
import viewport from '../../helpers/viewport';
import object2query from '../../helpers/object2query';

export default function Component(el, options = {}) {
  const xhr = new XMLHttpRequestPromise();
  const url = options.url || el.dataset.url;
  const data = options.data || {};
  const containerEl = el.querySelector('.js-container');
  const iframe = el.querySelector('.js-iframe');
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
    iframe.setAttribute('src', `${url}?standalone=true&iframeid=${iframe.getAttribute('id')}&${object2query(state)}`);

    dataEl.innerText = JSON.stringify(state, false, 4);
    // xhr.send({
    //   method: 'get',
    //   url: `${url}?${object2query(state)}`,
    // }).then((response) => {
    //   state = data;
    //   drawComponent(response);
    // }).catch((err) => {
    //   throw err;
    // });
  }

  // Add params to state and update component
  function submitForm(event) {
    event.preventDefault();
    update(formParse(formEl));
  }

  function changeViewportClick(event) {
    event.preventDefault();
    const button = event.target;
    setViewportWidth(button.dataset.width);
  }
  // function setViewportWidth(width) {
  //   iframeWidth = width;
  //   iframe.style.width = iframeWidth + 'px';
  //   resize();
  // }
  function resizeIframe(event) {
    if (event.detail.id === iframe.getAttribute('id')) {
      iframe.style.height = event.detail.height + 'px';
      //resize();
    }
  }
  function bindEvents() {
    //el.addEventListener('updateComponent', update);
    // eventListener.addListener('click', el, changeViewportClick, {
    //   selector: '.js-viewportButton'
    // });

    document.addEventListener('iframeResize', resizeIframe);

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
