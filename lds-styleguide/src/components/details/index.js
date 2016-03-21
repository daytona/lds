import controller from '../../helpers/controller';
import eventListener from '../../helpers/eventListener';

export default function Details(el, options) {
  const summary = el.querySelector('.js-summary');
  const content = el.querySelector('.js-content');
  let isOpen = false;

  function expand() {
    summary.setAttribute('aria-expanded', true);
    content.setAttribute('aria-hidden', false);
    isOpen = true;
  }

  function collapse() {
    summary.setAttribute('aria-expanded', false);
    content.setAttribute('aria-hidden', true);
    isOpen = false;
  }

  function click(event) {
    event.preventDefault();
    if (isOpen) {
      collapse();
    } else {
      expand();
    }
  }

  function bindEvents() {
    eventListener.addListener('click', el, click, {
      selector: summary
    });
  }

  function init() {
    console.log('init Details');
    bindEvents();
  }
  return {
    init,
  };
}
controller.add('Details', Details);
