import controller from '../../helpers/controller';
import {store} from '../../helpers/store';
import {actions as overlayActions} from '../../helpers/overlay';

export default function initPageNavbar(el, options) {
  const toggleMenuButton = el.querySelector('.js-toggle-nav-button');

  toggleMenuButton.addEventListener('mousedown', function() {
    store.dispatch(overlayActions.showPane());
  });
};

controller.add('PageNavbar', initPageNavbar);
