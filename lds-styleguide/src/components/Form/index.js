import controller from '../../helpers/controller';

function Form(el) {
  function init () {

  }
  return { init };
}
controller.add('Form', Form);


function Textarea(el) {
  const input = el.querySelector('.js-textarea');
  const pre = el.querySelector('.js-pre');

  function update() {
    pre.innerHTML = input.value;
  }

  function init () {
    input.addEventListener('click', update);
    input.addEventListener('keyup', update);
    input.addEventListener('focus', update);
  }
  return { init };
}
controller.add('Textarea', Textarea);
