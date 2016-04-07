import controller from '../../../helpers/controller';
import {store} from '../../../helpers/store';
import {actions as overlayActions} from '../../overlay';

const FORM_TITLE = 'EDIT';

export default function initPackage(el, options) {
  const editFormButton = el.querySelector('.js-showEditFormbutton');
  const editForm = el.querySelector('.js-editForm');

  editFormButton && editFormButton.addEventListener('mousedown', (e) => {
    store.dispatch(overlayActions.showPopover({
      anchorEl: e.target,
      title: FORM_TITLE,
      content: editForm
    }));
  });
};

controller.add('DemoHeader', initPackage);
