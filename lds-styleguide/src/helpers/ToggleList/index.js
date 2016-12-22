import controller from '../controller';

function ToggleList(el) {
  const togglerButtonGrid = el.querySelector('.js-toggler-grid');
  const togglerButtonList = el.querySelector('.js-toggler-list');
  const toggleList = el.querySelector('.js-toggleList');

  const gridClass = 'ComponentList--grid';
  const listClass = 'ComponentList--listed';

  function toggleListFormat (format) {
    toggleList.classList.remove(gridClass, listClass);
    if (format === 'list') {
      toggleList.classList.add(listClass);
    } else {
      toggleList.classList.add(gridClass);
    }
  }

  function init () {
    if (togglerButtonGrid && togglerButtonList && toggleList) {
      togglerButtonGrid.addEventListener('click', () => toggleListFormat('grid'));
      togglerButtonList.addEventListener('click', () => toggleListFormat('list'));
    }
  }
  return { init }
}

controller.add('ToggleList', ToggleList);
