import controller from '../../helpers/controller';

function Test(el, options) {
  function init() {
    console.log('You found me');
  }

  return {
    init
  };
}
controller.add('Test', Test);
