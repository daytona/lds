import isJSON from './isJSON';
/**
 * Controller manager, for finding and initializing javascript controllers
 */

// List of all selectors to look for
const controllers = {};

// Look for instances of [data-controller=""] where the value can either be a string or
// JSON with options
// eg. data-controller="MyComponent", data-controller="[{\"MyComponent\": {\"argument1\": true}}]"
function parseDom(dom) {
  const foundElements = dom.querySelectorAll('[data-controller]');

  if (foundElements.length) {
    Array.prototype.forEach.call(foundElements, (node) => {
      const attribute = node.dataset.controller;

      if (isJSON(attribute)) {
        const json = JSON.parse(attribute);

        json.forEach((controller) => {
          const name = Object.keys(controller);

          if (controllers[name]) {
            const instance = controllers[name](node, controller[name]);

            // Since some controllers might return an API for other controllers to use by importing
            // it's a good rule to also return an init method for initializing the controller
            if (instance && 'init' in instance) {
              instance.init();
            }
          }
        });
      } else if (controllers.hasOwnProperty(attribute)) {
        if (controllers[attribute]) {
          const instance = controllers[attribute](node);

          // Since some controllers might return an API for other controllers to use by importing
          // it's a good rule to also return an init method for initializing the controller
          if (instance && 'init' in instance) {
            instance.init();
          }
        }
      }
    });
  }
}

// Add a selector to look for and a constructor to call with the result
function addController(name, constructor) {

  // Add selector to list of selectors to look for
  if (!controllers.hasOwnProperty(name)) {
    controllers[name] = constructor;
  }
}

// Remove selector from element to look for
function removeController(name) {
  if (!controllers.hasOwnProperty(name)) {
    delete controllers[name];
  }
}

export default {
  add: addController,
  remove: removeController,
  parse: parseDom,
};

// Trigger an initial newDom on content ready
document.addEventListener('DOMContentLoaded', (event) => {
  parseDom(event.target);
});
document.addEventListener('newDom', (event) => {
  parseDom(event.target);
});
