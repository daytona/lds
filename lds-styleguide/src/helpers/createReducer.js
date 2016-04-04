/**
 * Create reducer utility. See examples below
 *
 * @param  {any}      initialState
 * @param  {object}   handlers
 * @return {function}
 *
 * @example - "Original" switch statement
 * export function counter(state = 0, action) {
 *   switch(action.type) {
 *     case INCREMENT:
 *       return state + 1;
 *     default:
 *       return state;
 *   }
 * }
 *
 * @example - createReducer
 * export const counter = createReducer(0, {
 *   [INCREMENT]: (state, action) => state + 1
 * });
 */
export default function createReducer(initialState, handlers) {
  return (state = initialState, action) =>
    handlers[action.type]
      ? handlers[action.type](state, action)
      : state;
}
