import controller from '../controller';
import {addClass, removeClass} from '../classList';

function Toggler(el, opt) {
  const options = Object.assign({}, el.dataset, opt);
  const textLabel = options.textSelector ? el.querySelector(options.textSelector) : el;
  const targets = document.querySelectorAll(el.dataset.target);
  let isActive = el.getAttribute('aria-pressed') === 'true';

  function activate() {
    if (textLabel && options.activeText) {
      textLabel.innerText = options.activeText;
    }
    Array.prototype.forEach.call(targets, (target) => {
      target.setAttribute('aria-hidden', 'false');
      if (target.hasAttribute('aria-expanded')) {
        target.setAttribute('aria-expanded', 'true');
      }
    });
    el.setAttribute('aria-pressed', 'true');
    addClass(el, 'is-active');
    isActive = true;
  }
  function inactivate() {
    if (textLabel && options.inactiveText) {
      textLabel.innerText = options.inactiveText;
    }
    Array.prototype.forEach.call(targets, (target) => {
      target.setAttribute('aria-hidden', 'true');
      if (target.hasAttribute('aria-expanded')) {
        target.setAttribute('aria-expanded', 'false');
      }
    });
    el.setAttribute('aria-pressed', 'false');
    removeClass(el, 'is-active');
    isActive = false;
  }

  function onClick(event) {
    event.preventDefault();
    if (isActive) {
      inactivate();
    } else {
      activate();
    }
  }
  function init() {
    bindEvents();
  }
  function bindEvents() {
    el.addEventListener('click', onClick);
  }
  return {
    init,
  };
}
controller.add('Toggler', Toggler);
