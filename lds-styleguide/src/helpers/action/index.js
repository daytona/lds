/**
 * Action dispatcher, to handle event subscriptions and event broadcasting throughout the application
 * action.on('eventName', 'value', callback);
 * action.off('eventName', 'value', callback);
 * action.emit('eventName', 'value');
 on('foundElement', '.js-teaser', teaser.init(el, options));
 emit('findElement', '.js-teaser');
 emit('foundElement', '.js-teaser', el, options);
 */

function actionDispatcher() {
  const subscriptions = {
    newDOM: [],        // New unexplored content to parse
  };

  // Add an subscription for eventname with optional value and a callback
  function on(name, value, callback) {
    // Value is optional, so if second argument is a function treat is as the callback
    const eventObject = {
      callback: typeof(value) === 'function' ? value : callback,
      value: typeof(value) === 'function' ? undefined : value,
    };

    if (!subscriptions[name]) {
      subscriptions[name] = [];
    }

    subscriptions[name].push(eventObject);
  }

  // Remove listener for certain event, value and callback
  function off(name, value, callback) {
    if (subscriptions[name]) {
      subscriptions[name].reduce((obj) => {
        return (!value || (obj.value === value)) && (!callback || (obj.callback === callback));
      });
    }
  }

  // Trigger a new event to let all who listens for it do their thing
  function emit(name, value, ...params) {
    if (!typeof(subscriptions[name])) {
      return false; // No event subscription
    }

    subscriptions[name].forEach( (subscriber) => {
      if (!subscriber.value || subscriber.value === value) {
        subscriber.callback.apply(null, [value, ...params]);
      }
    });
  }

  return {
    on,
    off,
    emit,
  };
}

// Run only once, make all importers part of the same subscription list
export default actionDispatcher();
