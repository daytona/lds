import controller from '../../helpers/controller';

const defaultState = {
  popover: null
};

const ACTION_TYPES = {
  SHOW_POPOVER: 'SHOW_POPOVER',
  HIDE_POPOVER: 'HIDE_POPOVER'
};

const actions = {
  showPopover: function(id, options) {
    return {
      type: ACTION_TYPES.SHOW_POPOVER,
      popover: {
        id: id,
        options: options
      }
    };
  },

  hidePopover: function() {
    return {
      type: ACTION_TYPES.HIDE_POPOVER
    };
  }
};

const popoverReducer = (state = defaultState, action) => {
  switch(action.type) {
    case ACTION_TYPES.SHOW_POPOVER:
      return {
        // ...state,
        popover: action.popover
      };

    case ACTION_TYPES.HIDE_POPOVER:
      return defaultState;
  }

  return state;
};

const createStore = (reducer, initialState) => {
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
    type: '@INIT'
  });

  return {
    getState,
    subscribe,
    dispatch
  };
};

const combineReducers = reducers => {
  return function combinedReducer(state = {}, action) {
    // let state = state || {};
    const newState = {};
    let hasChanged = false;

    Object.keys(reducers).forEach(key => {
      const reducer = reducers[key];
      const currentStateForKey = state[key];
      const nextStateForKey = reducer(currentStateForKey, action);

      if(typeof nextStateForKey === 'undefined')
        throw new Error('The reducer must return an object.');

      newState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== currentStateForKey;
    });

    return hasChanged ? newState : state;
  };
};

const store = createStore(combineReducers({
  popover: popoverReducer
}), {});

const PopoverHost = {
  initialize: function(el) {
    this.el = el;
    this.isInitialized = true;
    this.state = null;

    this.setState(store.getState().popover);

    store.subscribe(() => {
      this.setState(store.getState().popover);
    });
  },

  mergeState: function(oldState, newState) {
    return Object.assign({}, oldState, newState);
  },

  setState: function(newState) {
    if(this.shouldUpdate(this.state, newState)) {
      this.state = this.mergeState(this.state, newState);
      this.render(this.state);
    }
  },

  shouldUpdate: function(oldState, newState) {
    return oldState !== newState;
  },

  render: function(state) {
    if(!this.isInitialized)
      return;

    if(this.state.popover) {
      this.el.innerHTML = `<p>${this.state.popover.id}</p>`;
    } else {
      this.el.innerHTML = "";
    }
  }
};

const popoverHost = Object.create(PopoverHost);

export default function createPopoverHost(el, options) {
  popoverHost.initialize(el);

  window.setTimeout(function() {
    store.dispatch(actions.showPopover('whatdafak', {}));

    window.setTimeout(function() {
      store.dispatch(actions.hidePopover('whatdafak', {}));
    }, 10000);

  }, 1000);

  return popoverHost;
};

controller.add('PopoverHost', createPopoverHost);
