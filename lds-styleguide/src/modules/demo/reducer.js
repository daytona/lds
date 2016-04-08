import createReducer from '../../helpers/createReducer';

import {INIT_COMPONENT, UPDATE_COMPONENT_PARAM} from './actionTypes';

const defaultState = {};

const updateComponent = (state, id, modifier) => Object.assign({}, state, {
  [id]: Object.assign({}, state[id], modifier(state[id]))
});

const setParamValue = (key, value, params) => Object.assign({}, params, {
  [key]: value
});

const demoReducer = createReducer(defaultState, {
  [INIT_COMPONENT]: (state, action) => Object.assign({}, state, {
    [action.id]: {
      id: action.id,
      params: action.defaultValues
    }
  }),

  [UPDATE_COMPONENT_PARAM]: (state, action) => updateComponent(state, action.id, component => ({
    params: setParamValue(action.key, action.value, component.params)
  }))
});

export default demoReducer;