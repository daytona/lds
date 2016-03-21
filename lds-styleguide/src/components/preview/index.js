import controller from '../../helpers/controller';
import eventListener from '../../helpers/eventListener';
import viewport from '../../helpers/viewport';

const viewports = {
  mobile: {
    width: 320,
    height: 528
  },
  tablet: {
    width: 800,
    height: 525
  },
  desktop: {
    width: 1440,
    height: 900
  }
};

function Preview(el, opt) {
  const options = Object.assign(el.dataset, opt);
  const containerEl = el.querySelector('.js-container');
  const iframe = el.querySelector('.js-iframe');
  const device = viewports[el.dataset.device];

  function onResize() {
    let viewportScale = el.clientWidth / device.width;
    if (viewportScale > 1.5) {
      viewportScale = 1.5;
    }
    containerEl.style.transform = `scale(${viewportScale})`;
    // containerEl.style.width = 100/viewportScale + '%';
    el.style.height = device.height * viewportScale + 'px';
  }
  function bindEvents() {
    viewport.onResize(onResize);
    //eventListener.addListener('iframeResize', document, resizeIframe);
  }

  function init(){
    bindEvents();
    onResize();
  }
  return {
    init,
  };

}
controller.add('Preview', Preview);
