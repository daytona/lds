import controller from '../../../helpers/controller';
import object2query from '../../../helpers/object2query';
import {store, connectToStore} from '../../../helpers/store';
import socket from '../../../helpers/socket';

const createUrlFromId = id => id.split(':').join('/');
// const setIframeHeight = (iframe, height) => iframe.style.height = `${event.detail.height}px`;

export default function initDemoExample(el, options = {}) {
  const {id, component: componentId, url: baseUrl, data} = el.dataset;
  let sessionid = id;
  let iframeversion = 0;
  const iframe = el.querySelector('.js-iframe');
  const createDemoUrl = (baseUrl, params={}) => `${baseUrl}?_standalone=true&_iframeid=${id}&${object2query(params)}`;

  function iframeResize(event) {
    if (event.detail.id === id) {
      iframe.style.height = event.detail.height + 'px';
    }
  }

  function reloadIframe(msg) {
    if (msg.component  && msg.component === componentId && msg.id === id) {
      sessionid = msg.session;
      iframeversion++;
      iframe.setAttribute('src', `${baseUrl}?_session=${sessionid}&v=${iframeversion}&_standalone=true&_iframeid=${id}`);
    }
  }

  function bindEvents() {
    document.addEventListener('iframeResize', iframeResize);
  }
  function init() {
    const selectState = state => ({
      params: state.demo[id] && state.demo[id].params
    });
    socket.on('updated', reloadIframe);

    connectToStore(selectState, ({params, iframeHeight}) => {
      if (params) {
        if (socket) {
          socket.send({
            id,
            action: 'update',
            component: componentId,
            data: params,
            session: sessionid
          });
        } else {
          const url = createDemoUrl(baseUrl, params);
          iframe.setAttribute('src', url);
        }
      }
    });

    bindEvents();
  }
  return init();
};

controller.add('DemoExample', initDemoExample);
