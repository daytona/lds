import eventListener from '../../helpers/eventListener';
import controller from '../../helpers/controller';
import getKeyFromCode from '../../helpers/getkeyfromcode';

function Tab(el) {
  var panel = document.querySelector('#' + el.getAttribute('aria-controls')) || document.createElement('div');

  function activate(event) {
    panel.setAttribute('aria-hidden', false);
    el.setAttribute('aria-selected', true);
    el.focus();
  }

  function inactivate(event) {
    panel.setAttribute('aria-hidden', true);
    el.setAttribute('aria-selected', false);
  }

  function init() {
    if (!panel) {
      return false;
    }
    //   panel.addEventListener('tab-activate', activate);
    //   panel.addEventListener('tab-inactivate', inactivate);

    el.addEventListener('tab-activate', activate);
    el.addEventListener('tab-inactivate', inactivate);
  }

  return init();
}

var inits = 0;

export default function Tablist(el, options) {
  const tabs = el.querySelectorAll('.js-tab');
  let activeTab = el.querySelector('.js-tab[aria-selected=true]');

  function activate(tab) {
    if (!tab) {
      return false;
    }

    if (options.toggle && tab === activeTab) {
      eventListener.dispatchEvent(tab, 'tab-inactivate');
      activeTab = false;
    } else {
      activeTab && eventListener.dispatchEvent(activeTab, 'tab-inactivate');
      eventListener.dispatchEvent(tab, 'tab-activate');
      activeTab = tab;
    }
  }

  function click(e) {
    e.preventDefault();
    let tab = e.target;
    activate(tab);
  }

  function keydown(event) {
    let tab = event.target;
    let key = event.key || getKeyFromCode(event.keyCode);
    let activeIndex = Array.prototype.indexOf.call(tabs, activeTab);

    switch (key) {
      case 'ArrowRight':
        event.preventDefault();
        activate(tabs[activeIndex + 1]);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        activate(tabs[activeIndex - 1]);
        break;
      case 'Enter':
        activate(tab);
        break;
      default:
        return;
    }
  }

  function bindEvents() {
    eventListener.addListener('click', el, click, {
      selector: '.js-tab'
    });
    eventListener.addListener('keydown', el, keydown, {
      selector: '.js-tab',
    });
  }

  function init() {
    // Initiate each tab
    Array.prototype.forEach.call(tabs, (tabEl) => {
      new Tab(tabEl);
    });

    if (!activeTab && !options.toggle) {
      activate(tabs[0]);
    }

    bindEvents();
  }

  return {
    init,
  };
}
controller.add('Tablist', Tablist);
