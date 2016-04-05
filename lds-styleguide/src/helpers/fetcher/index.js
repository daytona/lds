import controller from '../controller';
import XMLHttpRequestPromise from 'xhr-promise';

export default function fetch(el) {
  const url = el.dataset.url;
  const xhr = new XMLHttpRequestPromise();

  function update(response) {
    el.innerHTML = typeof response.responseText === 'object' ? JSON.stringify(response.responseText, false, 2) : response.responseText;
  }
  function send() {
    xhr.send({
      method: 'get',
      url,
    })
    .then(update);
  }
  function init() {
    if (url) {
      send();
    }
  }
  return {
    init
  };
}
controller.add('fetch', fetch);
