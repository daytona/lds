/**
 * Helper to manage className attribute on node or nodelist
 * eg.
 *  removeClass(el, 'myClass'); or
 *  addClass(document.querySelectorAll('li'), 'list-item'); or
 *  hasClass(el, 'is-open');
 */

export function addClass(node, classString) {
  if (node.length) {
    return Array.prototype.forEach(node, (el) => {
      addClass(el, classString);
    });
  }

  const classList = node.className.split(' ');
  const classNames = classString.split(' ');
  classNames.forEach((className) => {
    if (classList.indexOf(className) < 0) {
      classList.push(className);
    }
  });
  node.setAttribute('class', classList.join(' '));
}

export function removeClass(node, classString) {
  if (node.length) {
    return Array.prototype.forEach(node, (el) => {
      removeClass(el, classString);
    });
  }
  const classNames = classString.split(' ');
  const classList = node.className.split(' ').filter((className) => {
    const match = (classNames.indexOf(className) > -1);
    return !match;
  });
  node.setAttribute('class', classList.join(' '));
}

export function hasClass(node, classString) {
  const classList = node.className.split(' ');
  const classNames = classString.split(' ');
  let exists = true;

  classNames.forEach((className) => {
    if (classList.indexOf(className) < 0) {
      exists = false;
    }
  });
  return exists;
}

export default {
  addClass,
  removeClass,
  hasClass,
  add: addClass,
  remove: removeClass,
  has: hasClass,
};
