import {createStore, combineReducers} from 'redux';
import createConnectToStore from './createConnectToStore';

const INIT_ACTION = 'DOM_CONTENT_LOADED';

const initialState = {
  loaded: false
};

const reducers = {
  app: (state = initialState, action) => {
    if(action.type === INIT_ACTION) {
      return {
        loaded: true
      };
    }

    return state;
  }
};

const store = createStore(combineReducers(reducers), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export function addReducer(name, reducer) {
  reducers[name] = reducer;

  store.replaceReducer(combineReducers(reducers));
}

export const connectToStore = createConnectToStore(store);

export {store};

document.addEventListener('DOMContentLoaded', () => store.dispatch({
  type: INIT_ACTION
}));
