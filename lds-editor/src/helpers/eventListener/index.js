/* eslint no-use-before-define: [2, "nofunc"] */

/**
 * Match el and all its parents up to a specific parentNode
 * returns true if match is found elsewise false
 */

function isParentOf(child, selector, root = document.body) {
  let hasMatch = false;
  let node = child;
  let nodelist = typeof selector === 'string' ? root.querySelectorAll(selector) : selector;
  while (node !== root && node.parentNode) {
    if (!hasMatch && (nodelist.length && Array.prototype.indexOf.call(nodelist, node)) > -1 || node === nodelist) {
      hasMatch = true;
      break;
    }
    node = node.parentNode;
  }
  return hasMatch;
}

export function addListener(eventType, node, callback, {selector, useCapture = false} = {}, thisArg) {
  function handler(event) {
    if (typeof callback === 'function') {
      if (selector && isParentOf(event.target, selector, node) || !selector) {
        callback.call(thisArg, event, event.detail);
      }
    }
  }
  handler.destroy = function(){
    return node.removeEventListener(eventType, handler, useCapture);
  };


  if (typeof callback !== 'function') {
    handler.then = function(eventCallback) {
      callback = eventCallback;
      handler.then = undefined;
    };
  }

  node.addEventListener(eventType, handler, useCapture);

  return handler;
}

export function dispatchEvent(node, eventName, details) {
  const customEvent = new Event(eventName, {
    view: window,
    bubbles: true,
    cancelable: true,
    detail: details
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
  dispatchEvent,
  on: addListener,
  emit: dispatchEvent,
};
