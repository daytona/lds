import controller from '../../helpers/controller';
import {store} from '../../helpers/store';
import {OVERLAY_TYPES, actions} from '../overlay';

const OPEN_CLASSNAME = 'is-open';
const TRANSPARENT_CLASSNAME = 'Backdrop--transparent';
const CLOSE_BACKDROP_DURATION = 666;

const identify = x => x;
const values = obj => Object.keys(obj).map(key => obj[key]);
const any = arr => arr.filter(identify).length > 0;
const pick = (keys, obj) => keys.reduce((res, key) => {
  if(key in obj)
    res[key] = obj[key];

  return res;
}, {});

const isAnyOverlayOpen = overlayState => any(values(pick(values(OVERLAY_TYPES), overlayState)));

const pickOverlayState = overlayState => ({
  isActive: overlayState && isAnyOverlayOpen(overlayState),
  isTransparent: overlayState && overlayState.transparent
});

const BackdropHost = {
  initialize: function(el) {
    this.el = el;
    this.backdropEl = el.querySelector('.js-backdrop');
    this.isInitialized = true;
    this.state = null;

    window.addEventListener('resize', () => store.dispatch(actions.hideOverlay()));
    el.addEventListener('mousedown', () => store.dispatch(actions.hideOverlay()));

    // this.onCloseTransitionEnd = this.onCloseTransitionEnd.bind(this);

    this.setState(pickOverlayState(store.getState().overlay));

    store.subscribe(() => {
      this.setState(pickOverlayState(store.getState().overlay));
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

  // onCloseTransitionEnd: function(e) {
  //   if(this.backdropEl.classList.contains(TRANSPARENT_CLASSNAME)) {
  //     this.backdropEl.classList.remove(TRANSPARENT_CLASSNAME);
  //   }

  //   this.el.removeEventListener('transitionend', this.onCloseTransitionEnd);
  //   this.el.removeEventListener('webkittransitionend', this.onCloseTransitionEnd);
  // },

  render: function(state) {
    if(!this.isInitialized)
      return;

    if(this.state.isActive) {
      if(this.state.isTransparent) {
        this.backdropEl.classList.add(TRANSPARENT_CLASSNAME);
      } else if(this.backdropEl.classList.contains(TRANSPARENT_CLASSNAME)) {
        this.backdropEl.classList.remove(TRANSPARENT_CLASSNAME);
      }

      this.el.classList.add(OPEN_CLASSNAME);
    } else {
      // this.el.addEventListener('transitionend', this.onCloseTransitionEnd);
      // this.el.addEventListener('webkittransitionend', this.onCloseTransitionEnd);

      if(this.el.classList.contains(OPEN_CLASSNAME))
        this.el.classList.remove(OPEN_CLASSNAME);
    }
  }
};

const backdropHost = Object.create(BackdropHost);

export default function createBackdropHost(el, options) {
  backdropHost.initialize(el);

  return backdropHost;
};

controller.add('BackdropHost', createBackdropHost);
