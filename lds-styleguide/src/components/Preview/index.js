import controller from '../../helpers/controller';
import eventListener from '../../helpers/eventListener';
import viewport from '../../helpers/viewport';
import {store} from '../../helpers/store';

function Preview(el, opt) {
  const options = Object.assign(el.dataset, opt);
  const containerEl = el.querySelector('.js-container');
  const iframe = el.querySelector('.js-iframe');
  const previewScreen = el.querySelector('.js-screen');
  const previewDevice = el.querySelector('.js-device');
  const device = el.dataset.device;

  function update() {

  }

  function onResize() {
    let viewportScale = el.clientWidth / (previewDevice ? previewDevice.clientWidth : containerEl.clientWidth);

    if (viewportScale > 1.5) {
      viewportScale = 1.5;
    }

    containerEl.style.transform = `scale(${viewportScale})`;
    containerEl.style.width = 100/viewportScale + '%';
    el.style.height = containerEl.clientHeight * viewportScale + 'px';
  }

  function resizeIframe(event) {
    if (!device && event.detail.id === iframe.id) {
      iframe.style.height = event.detail.height + 'px';
    }

    onResize();
  }

  function bindEvents() {
    viewport.onResize(onResize);
    eventListener.addListener('iframeResize', document, resizeIframe);
  }

  function init() {
    bindEvents();
    onResize();
  }

  return {
    init,
  };

}

controller.add('Preview', Preview);
