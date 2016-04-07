import {store, addReducer} from '../../helpers/store';
import createReducer from '../../helpers/createReducer';

import OVERLAY_TYPES from './overlayTypes';

const ACTION_TYPES = {
  SHOW_PANE: 'OVERLAY/SHOW_PANE',
  HIDE_PANE: 'OVERLAY/HIDE_PANE',
  SHOW_POPOVER: 'OVERLAY/SHOW_POPOVER',
  HIDE_POPOVER: 'OVERLAY/HIDE_POPOVER',
  HIDE_OVERLAY: 'OVERLAY/HIDE_OVERLAY'
};

const pick = (keys, obj) => keys.reduce((res, key) => {
  if(key in obj)
    res[key] = obj[key];

  return res;
}, {});

const actions = {
  hideOverlay() {
    return {
      type: ACTION_TYPES.HIDE_OVERLAY
    };
  },

  showPane(id, options) {
    return {
      type: ACTION_TYPES.SHOW_PANE
    };
  },

  hidePane() {
    return {
      type: ACTION_TYPES.HIDE_PANE
    };
  },

  showPopover(options) {
    let anchorRect =  pick(
      ['top', 'bottom', 'right', 'left', 'width', 'height'],
      options.anchorEl.getBoundingClientRect()
    );

    Array.prototype.forEach.call(Object.keys(anchorRect), (key) =>  {
      anchorRect[key] = Math.round(anchorRect[key]);
    });

    // if(typeof options.content == "object" && "nodeType" in options.content &&
    //   options.content.nodeType === 1 && options.content.cloneNode){
    //   // most probably this is a DOM node, we can clone it safely
    //   options.content = options.content.cloneNode(true);
    // }

    return {
      type: ACTION_TYPES.SHOW_POPOVER,
      popover: Object.assign({}, options, {
        anchorRect
      })
    };
  },

  hidePopover() {
    return {
      type: ACTION_TYPES.HIDE_POPOVER
    };
  }
};

export {OVERLAY_TYPES, ACTION_TYPES, actions};

const initialState = {
  pane: null,
  popover: null,
  transparent: false
};

const hidePane = (state) => Object.assign({}, state, {
  pane: null
});

const hidePopover = (state) => Object.assign({}, state, {
  popover: null
});

// stupid for now
const hideAll = () => ({
  pane: null,
  popover: null
});

const overlayReducer = createReducer(initialState, {
  [ACTION_TYPES.HIDE_OVERLAY]: (state, action) => hideAll(state),

  [ACTION_TYPES.SHOW_PANE]: (state, action) => {
    var state = hideAll(state);

    return Object.assign({}, state, {
      pane: true,
      transparent: false
    });
  },

  [ACTION_TYPES.HIDE_PANE]: (state, action) => hidePane(state),

  [ACTION_TYPES.SHOW_POPOVER]: (state, action) => {
    var state = hideAll(state);

    return Object.assign({}, state, {
      popover: action.popover,
      transparent: true
    });
  },
  [ACTION_TYPES.HIDE_POPOVER]: (state, action) => hidePane(state),
});

addReducer('overlay', overlayReducer);
