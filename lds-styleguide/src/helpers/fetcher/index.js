import controller from '../controller';
import XMLHttpRequestPromise from 'xhr-promise';

export default function fetcher(el) {
  const url = el.dataset.url;
  const xhr = new XMLHttpRequestPromise();

  function update(response) {
    el.innerHTML = typeof response.responseText === 'object' ? JSON.stringify(response.responseText, false, 2) : response.responseText;
  }
  function send(url) {
    xhr.send({
      method: 'get',
      url,
    })
    .then(update);
  }
  function init() {
    if (url) {
      send(url);
    }
  }
  return {
    init,
    fetch: send
  };
}
controller.add('fetcher', fetcher);
