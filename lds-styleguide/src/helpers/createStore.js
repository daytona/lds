const INIT_ACTION = '@init';

export default function createStore(reducer, initialState) {
  let listeners = [];
  let currentState = initialState;
  let isDispatching = false;

  function getState() {
    return currentState;
  }

  function subscribe(listener) {
    if(typeof listener !== 'function')
      throw new Error('Expected listener to be a function.');

    let isSubscribed = true;

    listeners.push(listener);

    return function unsubscribe() {
      if(!isSubscribed)
        return;

      isSubscribed = false;

      var idx = listeners.indexOf(listener);

      listeners.slice(idx, 1);
    };
  }

  function dispatch(action) {
    if(isDispatching)
      throw new Error('You can\'nt dispatch during a dispatch.');

    try {
      isDispatching = true;
      currentState = reducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    listeners.forEach(listener => listener());

    return action;
  }

  dispatch({
    type: INIT_ACTION
  });

  return {
    getState,
    subscribe,
    dispatch
  };
};