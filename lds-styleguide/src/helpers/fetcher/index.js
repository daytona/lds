import controller from '../controller';
import XMLHttpRequestPromise from 'xhr-promise';
import Prism from 'prismjs';
import languages from 'prism-languages';

export default function fetcher(el, options = {}) {
  const url = el.dataset.url;
  const xhr = new XMLHttpRequestPromise();

  function update(response) {
    let text = typeof response.responseText === 'object' ? JSON.stringify(response.responseText, false, 2) : response.responseText;
    if (options.language) {
      text = Prism.highlight(text, languages[options.language]);
    }
    el.innerHTML = text;
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
