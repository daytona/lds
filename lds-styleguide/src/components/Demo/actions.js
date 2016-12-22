import {INIT_COMPONENT, UPDATE_COMPONENT_PARAM} from './actionTypes';

/**
 * @param {String} id
 * @param {Object} defaultValues
 */
export function initComponent(id, defaultValues = {}) {
  return {
    type: INIT_COMPONENT,
    id,
    defaultValues
  };
}

/**
 * @param {String} key
 * @param {Any} value
 */
export function updateComponentParam(id, key, value) {
  return {
    type: UPDATE_COMPONENT_PARAM,
    id,
    key,
    value
  };
}
