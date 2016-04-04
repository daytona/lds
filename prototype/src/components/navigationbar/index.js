import toggle from '../../helpers/toggler';
import controller from '../../helpers/controller';
import viewport from '../../helpers/viewport';
import {addClass, removeClass} from '../../helpers/classList';

function NavigationBar(el, options) {
  const navigationItems = el.querySelectorAll('.js-navigation-item');
  const overflowList = el.querySelector('.js-overflow-list')
  const overflowItems = el.querySelectorAll('.js-overflow-item');
  const croppedClass = 'NavigationBar--cropped';
  let isOutOfBounds = false;

  function init() {
    bindEvents();
    update();
  }

  function bindEvents() {
    viewport.onResize(update);
  }

  function update() {
    const bounds = el.getBoundingClientRect();
    isOutOfBounds = false;
    Array.prototype.forEach.call(navigationItems, (item, index) => {
      const itembound = item.getBoundingClientRect();

      if (itembound.top > bounds.top) {
        overflowItems[index].setAttribute('aria-hidden', 'false');
        isOutOfBounds = true;
      } else {
        overflowItems[index].setAttribute('aria-hidden', 'true');
      }
    });

    if (isOutOfBounds) {
      addClass(el, croppedClass);
    } else {
      removeClass(el, croppedClass);
    }
  }

  return {
    init,
  };
};

controller.add('NavigationBar', NavigationBar);
