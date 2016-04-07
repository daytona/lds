import * as ACTION_TYPES from './actionTypes';

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
    type: UPDATE_PARAM,
    id,
    key,
    value
  };
}
