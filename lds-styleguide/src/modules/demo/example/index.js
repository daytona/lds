import controller from '../../../helpers/controller';
import object2query from '../../../helpers/object2query';
import {store, connectToStore} from '../../../helpers/store';

const createUrlFromId = id => id.split(':').join('/');
// const setIframeHeight = (iframe, height) => iframe.style.height = `${event.detail.height}px`;

export default function initDemoExample(el, options = {}) {
  const {id, url: baseUrl} = el.dataset;
  const iframe = el.querySelector('.js-iframe');

  const createDemoUrl = (baseUrl, params={}) => `${baseUrl}?standalone=true&iframeid=${id}&${object2query(params)}`;

  const selectState = state => ({
    params: state.demo[id] && state.demo[id].params
  });

  connectToStore(selectState, ({params, iframeHeight}) => {
    if(params) {
      const url = createDemoUrl(baseUrl, params);
      iframe.setAttribute('src', url);
    }
  });

  function iframeResize(event) {
    if (event.detail.id === id) {
      iframe.style.height = event.detail.height + 'px';
    }
  }
  document.addEventListener('iframeResize', iframeResize);
};

controller.add('DemoExample', initDemoExample);
