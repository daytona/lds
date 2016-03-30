import controller from '../../helpers/controller';
import eventListener from '../../helpers/eventListener';
import {addClass, removeClass} from '../../helpers/classList';

function DevicePark(el, opt) {
  const options = Object.assign({}, opt, el.dataset);
  const viewportButtons = el.querySelectorAll('.js-viewportButton');
  let activeViewport = 'all';

  function changeViewport(event) {
    event.preventDefault();
    removeClass(el, `DevicePark--${activeViewport}`);
    if (event.target.dataset.device !== activeViewport) {
      activeViewport = event.target.dataset.device;
    } else {
      activeViewport = 'all';
    }
    Array.prototype.forEach.call(viewportButtons, (button) => {
      button.setAttribute('aria-pressed', button.dataset.device === activeViewport ? 'true' : 'false');
    });
    addClass(el, `DevicePark--${activeViewport}`);
    eventListener.emit(document, 'iframeResize');
  }
  function bindEvents() {
    eventListener.addListener('click', el, changeViewport, {
      selector: '.js-viewportButton'
    });
  }
  function init() {
    bindEvents();
  }
  return {
    init,
  };
}
controller.add('DevicePark', DevicePark);
