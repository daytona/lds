import controller from '../../helpers/controller';
import {store} from '../../helpers/store';
import {OVERLAY_TYPES, actions} from '../overlay';

const isPagePaneOpen = state => state.pane;

const PagePane = {
  initialize: function(el) {
    this.el = el;
    this.isInitialized = true;
    this.state = null;

    this.setState({
      isActive: isPagePaneOpen(store.getState().overlay)
    });

    store.subscribe(() => {
      this.setState({
        isActive: isPagePaneOpen(store.getState().overlay)
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

  render: function(state) {
    if(!this.isInitialized)
      return;

    if(this.state.isActive) {
      this.el.classList.add('is-open');
    } else {
      this.el.classList.remove('is-open');
    }
  }
};

export default function createPagePane(el, options) {
  const pagePane = Object.create(PagePane);

  pagePane.initialize(el);

  return pagePane;
};

controller.add('PagePane', createPagePane);
