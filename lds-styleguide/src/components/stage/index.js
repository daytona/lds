import controller from '../../helpers/controller';
import XMLHttpRequestPromise from 'xhr-promise';
import action from '../../helpers/action';

function Stage(el, opt) {
  const xhr = new XMLHttpRequestPromise();
  const actionSubscriber = el.dataset.action;

  function update(response) {
    el.innerHTML = response.responseText;
    action.emit('newDom', el);
  }
  function queryUrl(url, queries) {
    var split = url.split('?');
    var params = {};
    split[1].split('&').map((query)=>{
      let keypair = pair.split('=');
      params[keypair[0]] = keypair[1];
    });
    params = Object.assign({}, params, queries);

    return url + '?' + Object.keys(params).map((key)=> {
      return key + '=' + params[key];
    });
  }
  function fetch(url) {
    xhr.send({
      url: queryUrl(url, {layout: ''}),
      method: 'get'
    }).then(update);
  }
  function init() {
    store.subscribe('HISTORY/PUSH', fetch);
  }
  return {
    init
  }
}
controller.add('Stage', Stage);
