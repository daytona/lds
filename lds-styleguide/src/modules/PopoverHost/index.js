import controller from '../../helpers/controller';
import {store} from '../../helpers/store';
import {actions as overlayActions} from '../../helpers/overlay';

const BASE_CLASSNAME = 'Popover';
const POPOVER_MARGIN = -2;
const POPOVER_WIDTH = 306; // TODO: remove this dependency...

const values = obj => Object.keys(obj).map(key => obj[key]);
const pick = (keys, obj) => keys.reduce((res, key) => {
  if(key in obj)
    res[key] = obj[key];

  return res;
}, {});

const PopoverHost = {
  initialize: function(el) {
    this.el = el;
    this.popoverEl = el.querySelector('.js-popover');
    this.titleEl = el.querySelector('.js-title');
    this.contentEl = el.querySelector('.js-content');
    this.closeButtonEl = el.querySelector('.js-closeButton');

    this.isInitialized = true;
    this.state = null;

    this.onOpenTransitionEnd = this.onOpenTransitionEnd.bind(this);
    this.onCloseTransitionEnd = this.onCloseTransitionEnd.bind(this);

    this.closeButtonEl.addEventListener('mousedown', this.onCloseClick);

    this.setState({
      popover: store.getState().overlay && store.getState().overlay.popover
    });

    store.subscribe(() => {
      this.setState({
        popover: store.getState().overlay && store.getState().overlay.popover
      });
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

  onCloseClick: function(e) {
    store.dispatch(overlayActions.hideOverlay());

    e.preventDefault();
  },

  onOpenTransitionEnd: function() {
    const el = this.popoverEl;

    el.removeEventListener('transitionend', this.onOpenTransitionEnd);
    el.removeEventListener('webkittransitionend', this.onOpenTransitionEnd);
  },

  onCloseTransitionEnd: function() {
    const el = this.popoverEl;

    this.resetRect(el);
    this.resetContent();

    el.removeEventListener('transitionend', this.onCloseTransitionEnd);
    el.removeEventListener('webkittransitionend', this.onCloseTransitionEnd);
  },

  setContent: function(title, content) {
    this.titleEl.innerHTML = title;

    if(typeof content == "object" && "nodeType" in content &&
      content.nodeType === 1 && content.cloneNode){
      this.contentEl.appendChild(content);
    } else {
      this.contentEl.innerHTML = content;
    }
  },

  resetContent: function() {
    this.setContent('', '');
  },

  calcRect: function(el, anchorRect) {
    if(!anchorRect)
      return;

    let popoverRect;

    popoverRect = {
      left: anchorRect.right,
      minWidth: anchorRect.width
    };

    if((popoverRect.left + POPOVER_WIDTH) > window.innerWidth) {
      popoverRect.right =  window.innerWidth - popoverRect.left;
      delete popoverRect.left;
    }

    if(anchorRect.top + anchorRect.height / 2 < window.innerHeight / 1.5) {
      popoverRect.top = anchorRect.bottom + POPOVER_MARGIN;
    } else {
      popoverRect.bottom = window.innerHeight - anchorRect.top + POPOVER_MARGIN;
    }

    return popoverRect;
  },

  setRect: function(el, rect) {
    if(!rect)
      return;

    Array.prototype.forEach.call(Object.keys(rect), (key) => {
      el.style[key] = `${rect[key]}px`;
    });
  },

  resetRect: function(el) {
    ['top', 'left', 'bottom', 'minWidth'].forEach(key => {
      el.style[key] = '';
    });
  },

  setTransformOrigin: function(el, rect) {
    const keys = Object.keys(pick(['top', 'bottom', 'left', 'right'], rect));

    el.style.transformOrigin = keys.join(' ');
  },

  render: function(state) {
    if(!this.isInitialized)
      return;

    const popover = this.state.popover;

    if(popover) {
      const popoverRect = this.calcRect(this.popoverEl, this.state.popover.anchorRect);

      this.setContent(popover.title, popover.content);
      this.setRect(this.popoverEl, popoverRect);
      this.setTransformOrigin(this.popoverEl, popoverRect);

      this.popoverEl.addEventListener('transitionend', this.onOpenTransitionEnd);
      this.popoverEl.addEventListener('webkittransitionend', this.onOpenTransitionEnd);

      this.popoverEl.classList.add('is-open');
    } else {
      if(this.popoverEl.classList.contains('is-open')) {
        this.popoverEl.classList.remove('is-open');

        this.popoverEl.addEventListener('transitionend', this.onCloseTransitionEnd);
        this.popoverEl.addEventListener('webkittransitionend', this.onCloseTransitionEnd);
      }
    }
  }
};

export default function createPopoverHost(el, options) {
  const popoverHost = Object.create(PopoverHost);

  popoverHost.initialize(el);

  return popoverHost;
};

controller.add('PopoverHost', createPopoverHost);
