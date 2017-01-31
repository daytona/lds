import controller from '../../helpers/controller';
import socket from '../../helpers/socket';


export default function Preview(el, options = {}) {
  const {id, component: componentId, url: baseUrl, querystring, data} = el.dataset;
  let sessionid = el.dataset.sessionid;
  let iframeversion = 0;
  const iframes = el.querySelectorAll('.js-iframe');
  const createDemoUrl = (baseUrl, params={}) => `${baseUrl}?${querystring ? querystring + '&' : ''}_iframeid=${encodeURI(id)}${sessionid}`;

  function iframeResize(event) {
    if (event.detail && event.detail.id === id) {
      Array.prototype.forEach.call(iframes, iframe => {
        iframe.style.height = event.detail.height + 'px';
      });
    }
  }

  function reloadIframe(msg) {
    if (msg.component  && msg.component === componentId) {
      sessionid = msg.session;
      iframeversion++;
      Array.prototype.forEach.call(iframes, iframe => {
        iframe.setAttribute('src', `${iframe.dataset.url}${querystring ? '&' : '?'}_session=${sessionid}&v=${iframeversion}`);
      });
    }
  }

  function bindEvents() {
    document.addEventListener('iframeResize', iframeResize);
  }
  function init() {
    console.log('Preview');
    socket.on('updated', reloadIframe);
    bindEvents();
  }
  return { init };
};

controller.add('Preview', Preview);
