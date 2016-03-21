/* eslint no-use-before-define: [2, "nofunc"] */

/**
 * Match el and all its parents up to a specific parentNode
 * returns true if match is found elsewise false
 */

function isParentOf(child, nodes, root = document.body) {
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

export function addListener(eventType, node, callback, {selector, useCapture = false} = {}, thisArg){
  const element = node || document.documentElement;

  function handler(event) {
    if (typeof callback === 'function') {
      if (selector && isParentOf(event.target, selector, element) || !selector) {
        callback.call(thisArg, event, event.detail);
      }
    }
  }
  handler.destroy = function(){
    return element.removeEventListener(eventType, handler, useCapture);
  };


  if (typeof callback !== 'function') {
    handler.then = function(eventCallback) {
      callback = eventCallback;
      handler.then = undefined;
    };
  }

  element.addEventListener(eventType, handler, useCapture);

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
