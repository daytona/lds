export default function combineReducers(reducers) {
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
