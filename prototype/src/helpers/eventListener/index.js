/* eslint no-use-before-define: [2, "nofunc"] */

/**
 * Match el and all its parents up to a specific parentNode
 * returns true if match is found elsewise false
 */

let activeListeners = [];

function findParentOf(child, nodes, root = document.body) {
  let hasMatch = false;
  let node = child;
  let nodelist = nodes;
  if (typeof nodelist === 'string') {
    nodelist = root.querySelectorAll(nodelist);
  }
  while (node !== root && node.parentNode) {
    if (!hasMatch && (nodelist.length && [].indexOf(nodelist, node)) || node === nodelist) {
      hasMatch = true;
      break;
    }
    node = node.parentNode;
  }
  return hasMatch;
}

const defaultEvents = [
  'mousedown', 'mouseup', 'mouseout', 'mouseover', 'mouseenter', 'mouseleave',
  'click', 'touchstart', 'touchmove', 'touchend',
  'resize', 'scroll',
  'play', 'pause',
  'keyup', 'keydown',
  'focus', 'blur', 'change',
  'drag', 'drop'];

const customEvents = {
  longclick(node, selector = false) {
    let longpressTimer;
    const onmousedown = () => {
      const target = selector ? node.querySelectorAll(selector) : node;
      longpressTimer = setTimeout(() => dispatchEvent(target, 'longclick'), 500);
    };
    const onmouseup = () => {
      clearTimeout(longpressTimer);
    };

    return {
      add() {
        addListener(node, selector, 'mousedown', onmousedown);
        addListener(node, selector, 'mouseup', onmouseup);
      },
      remove() {
        removeListener(node, selector, 'mousedown', onmousedown);
        removeListener(node, selector, 'mouseup', onmouseup);
      },
    };
  },
};

/**
 * Create a returning API when eventType is missing allowing for event-chaining
 * addListener(element, '.js-selector').click((e) => {...}).mouseup((e) => {...})
 * addListener(element).click().then((e) => {...})
 */
function eventList(node, selector) {
  const events = {};
  [...Object.keys(customEvents), ...defaultEvents].forEach((type) => {
    events[type] = function eventChain(callback) {
      if (!callback) {
        return {
          then: (promiseCallback) => {
            addListener(node, selector, type, promiseCallback);
            return this;
          },
        };
      }

      addListener(node, selector, type, callback);
      return this;
    };
  });
  return events;
}

/**
 * Add new listener, if parameters are missing, return alternative API like
 * chainable event methods .click()
 */
export function addListener(node, selector = false, eventType, callback) {
  if (!eventType) {
    return eventList(node, selector);
  }

  if (!callback) {
    return {
      then(methodCallback) {
        addListener(node, selector, eventType, methodCallback);
      },
    };
  }

  // Is custom event which needs to be specified? Run method to set necessary
  // listeners and dispatch custom event when ready
  let customEvent = false;
  if (customEvents[eventType]) {
    customEvent = customEvents[eventType](node, selector);
    customEvent.add();
  }
  const onEvent = (event) => {
    // If selector, make sure selector exists above event.target
    if (selector && findParentOf(event.target, selector, node) || !selector) {
      callback(event);
    }
  };

  activeListeners.push({
    type: eventType,
    node,
    selector,
    callback,
    onEvent,
    customEvent,
  });

  node.addEventListener(eventType, onEvent);

  // Allow further chaining
  return this;
}

export function removeListener(node, selector = false, eventType, callback) {
  activeListeners = activeListeners.filter((listener) => {
    if ((node === listener.node) &&
       (!selector || selector === listener.selector) &&
       (!eventType || eventType === listener.type) &&
       (!callback || callback === listener.callback)) {
      node.removeEventListener(listener.type, listener.onEvent);

      if (listener.customEvent) {
        listener.customEvent.remove();
      }
      return false;
    }
    return true;
  });
}

export function dispatchEvent(node, eventName) {
  const customEvent = new Event(eventName, {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  if (node.length) {
    Array.prototype.forEach.call(node, (el) => {
      el.dispatchEvent(customEvent);
    });
  } else {
    node.dispatchEvent(customEvent);
  }

  return this;
}

export default {
  addListener,
  removeListener,
  dispatchEvent,
  on: addListener,
  off: removeListener,
  emit: dispatchEvent,
};
