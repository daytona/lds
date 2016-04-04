import controller from '../../helpers/controller';
import {store} from '../../helpers/store';
import {actions as overlayActions} from '../overlay';

const POPOVER_MARGIN = -2;
const POPOVER_WIDTH = 306;

const PopoverHost = {
  initialize: function(el) {
    this.el = el;
    this.popoverEl = el.querySelector('.js-popover');
    this.titleEl = el.querySelector('.js-title');
    this.contentEl = el.querySelector('.js-content');
    this.closeButtonEl = el.querySelector('.js-closeButton');
    this.isInitialized = true;
    this.state = null;

    this.closeButtonEl.addEventListener('mousedown', this.handleCloseClick);

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

  handleCloseClick: function(e) {
    store.dispatch(overlayActions.hideOverlay());

    e.preventDefault();
  },

  setRect: function(el, anchorRect) {
    if(!anchorRect)
      return;

    let popoverRect;

    popoverRect = {
      left: anchorRect.right,
      minWidth: anchorRect.width
    };

    if((popoverRect.left + POPOVER_WIDTH) > window.innerWidth) {
      popoverRect.left = popoverRect.left - POPOVER_WIDTH;
    }

    if(anchorRect.top + anchorRect.height / 2 < window.innerHeight / 2) {
      popoverRect.top = anchorRect.bottom + POPOVER_MARGIN;
    } else {
      popoverRect.bottom = window.innerHeight - anchorRect.top + POPOVER_MARGIN;
    }

    Array.prototype.forEach.call(Object.keys(popoverRect), (key) => {
      el.style[key] = `${popoverRect[key]}px`;
    });
  },

  render: function(state) {
    if(!this.isInitialized)
      return;

    const popover = this.state.popover;

    if(popover) {
      this.titleEl.innerHTML = popover.title;
      this.contentEl.appendChild(popover.content);
      this.setRect(this.popoverEl, this.state.popover.anchorRect);
      this.popoverEl.classList.add('is-open');
    } else {
      this.popoverEl.classList.remove('is-open');
      this.contentEl.innerHTML = '';
    }
  }
};

const popoverHost = Object.create(PopoverHost);

export default function createPopoverHost(el, options) {
  popoverHost.initialize(el);

  return popoverHost;
};

controller.add('PopoverHost', createPopoverHost);
