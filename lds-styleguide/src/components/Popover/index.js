import controller from '../../helpers/controller';
import eventListener from '../../helpers/eventListener';
import {addClass, removeClass} from '../../helpers/classList';

const downClass = 'is-dragging';

function Popover(el, opt) {
  const position = {
    x: 0,
    y: 0
  };
  const startPosition = {
    x: 0,
    y: 0
  };
  let moveListener,
      upListener,
      isPressing;

  function updatePosition() {
    el.style.transform = `translate(${-position.x}px, ${-position.y}px)`;
  }
  function onMouseMove(event) {
    position.x = startPosition.x - event.pageX;
    position.y = startPosition.y - event.pageY;
    updatePosition();
    clearTimeout(isPressing);
    isPressing = setTimeout(onMouseUp, 200);
  }
  function onMouseUp() {
    moveListener.destroy();
    upListener.destroy();
    removeClass(el, downClass);
  }
  function onMouseDown(event) {
    startPosition.x = position.x + event.pageX;
    startPosition.y = position.y + event.pageY;

    moveListener = eventListener.addListener('mousemove', window, onMouseMove);
    upListener = eventListener.addListener('mouseup', window, onMouseUp);

    addClass(el, downClass);
  }
  function bindEvents() {
    eventListener.addListener('mousedown', el, onMouseDown);
  }
  function init() {
    bindEvents();
  }
  return init();
}

controller.add('Popover', Popover);
