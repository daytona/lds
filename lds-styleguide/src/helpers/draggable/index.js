import controller from '../controller';
import eventListener from '../eventListener';

function Draggable(el, opt) {
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
      outListener;

  function updatePosition() {
    el.style.transform = `translate(${-position.x}px, ${-position.y}px)`;
  }
  function onMouseMove(event) {
    position.x = startPosition.x - event.pageX;
    position.y = startPosition.y - event.pageY;
    updatePosition();
  }
  function onMouseUp(event) {
    moveListener.destroy();
    upListener.destroy();
    outListener.destroy();
  }
  function onMouseDown(event) {
    startPosition.x = position.x + event.pageX;
    startPosition.y = position.y + event.pageY;
    el.style.zIndex = '15';
    el.style.position = 'relative';
    moveListener = eventListener.addListener('mousemove', window, onMouseMove);
    upListener = eventListener.addListener('mouseup', window, onMouseUp);
    outListener = eventListener.addListener('mouseout', window, onMouseUp);
  }
  function bindEvents() {
    eventListener.addListener('mousedown', el, onMouseDown);
  }
  function init() {
    console.log('init draggable');
    bindEvents();
  }
  return init();
}

controller.add('Draggable', Draggable);
