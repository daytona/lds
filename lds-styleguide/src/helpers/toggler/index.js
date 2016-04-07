import controller from '../controller';
import {addClass, removeClass} from '../classList';

function Toggler(el, opt) {
  const options = Object.assign({}, el.dataset, opt);
  const textLabel = options.textSelector ? el.querySelector(options.textSelector) : el;
  const targets = document.querySelectorAll(el.dataset.target);
  let isActive = el.getAttribute('aria-pressed') === 'true';

  function onExpandTransitionEnd(e) {
    // if (typeof e !== 'undefined' &&
    //     e.target !== this.elements.inner)
    //   return;
    const el = e.target;

    el.style.height = '';

    el.removeEventListener('transitionend', onExpandTransitionEnd);
    el.removeEventListener('webkittransitionend', onExpandTransitionEnd);
  }

  function onCollapseTransitionEnd(e) {
    const el = e.target;

    el.style.height = '';
    setCollapsedAttrs(el);

    el.removeEventListener('transitionend', onCollapseTransitionEnd);
    el.removeEventListener('webkittransitionend', onCollapseTransitionEnd);
  }

  function setExpandedAttrs(el) {
    addClass(el, 'is-active');
    el.setAttribute('aria-hidden', 'false');

    if (el.hasAttribute('aria-expanded')) {
      el.setAttribute('aria-expanded', 'true');
    }
  }

  function setCollapsedAttrs(el) {
    removeClass(el, 'is-active');
    el.setAttribute('aria-hidden', 'true');

    if (el.hasAttribute('aria-expanded')) {
      el.setAttribute('aria-expanded', 'false');
    }
  }

  function setHeight(el, height) {
    el.style.height = `${height}px`;
  }

  function expandTarget(el) {
    const collapsedHeight = el.getBoundingClientRect().height;

    setExpandedAttrs(el);

    const expandedHeight = el.getBoundingClientRect().height;

    setHeight(el, collapsedHeight);

    let readValue = el.offsetTop;

    setHeight(el, expandedHeight);

    el.addEventListener('transitionend', onExpandTransitionEnd);
    el.addEventListener('webkittransitionend', onExpandTransitionEnd);
  }

  function collapseTarget(el) {
    const expandedHeight = el.getBoundingClientRect().height;
    // setCollapsedAttrs(el);

    // const collapsedHeight = el.getBoundingClientRect().height;

    setHeight(el, expandedHeight);

    let readValue = el.offsetTop;

    setHeight(el, 0);

    el.addEventListener('transitionend', onCollapseTransitionEnd);
    el.addEventListener('webkittransitionend', onCollapseTransitionEnd);
  }

  function activate() {
    if (textLabel && options.activeText) {
      textLabel.innerText = options.activeText;
    }

    Array.prototype.forEach.call(targets, (target) => {
      expandTarget(target);
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
      collapseTarget(target);
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
