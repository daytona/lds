import controller from '../../../helpers/controller';
import object2query from '../../../helpers/object2query';
import {store, connectToStore} from '../../../helpers/store';

const createUrlFromId = id => id.split(':').join('/');
const createDemoUrl = (baseUrl, params) => `${baseUrl}?standalone=true&iframeid=${id}&${object2query(params)}`;
const setIframeHeight = (iframe, height) => iframe.style.height = `${event.detail.height}px`;

export default function initDemoExample(el, options = {}) {
  const {id} = options;
  const iframe = el.querySelector('.js-iframe');
  const baseUrl = createUrlFromId(id);

  const selectState = state => ({
    url: state.demo[id] && createDemoUrl(baseUrl, state.demo[id].params),
    iframeHeight: state.demo[id] && state.demo[id].iframeHeight
  });

  connectToStore(selectState, ({url, iframeHeight}) => {
    iframe.setAttribute('src', url);
    setIframeHeight(iframe, iframeHeight);
  });
};

controller.add('DemoExample', initDemoExample);

