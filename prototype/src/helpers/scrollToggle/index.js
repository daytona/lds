import controller from '../controller';
import viewport from '../viewport';
import {addClass, removeClass} from '../classList';

function ScrollToggle(el, opts) {
  const options = Object.assign({}, el.dataset, opts);
  const minPos = Number(options.minPos) || el.getBoundingClientRect().top + window.scrollY - window.innerHeight;
  const maxPos = Number(options.maxPos);// || el.getBoundingClientRect().top + window.scrollY + el.outerHeight;
  const goalClass = options.goalClass || 'in-viewport';
  let inThreshold = false;

  function onScroll() {
    if ((!minPos || (minPos && window.scrollY > minPos)) &&
        (!maxPos || (maxPos && window.scrollY < maxPos))) {
      if (!inThreshold) {
        addClass(el, goalClass);
        inThreshold = true;
      }
    } else if(inThreshold) {
      removeClass(el, goalClass);
      inThreshold = false;
    }
  }

  function bindEvents() {
    viewport.onScroll(onScroll);
  }

  function init() {
    bindEvents();
  }
  return {
    init,
  };
}

controller.add('ScrollToggle', ScrollToggle);
