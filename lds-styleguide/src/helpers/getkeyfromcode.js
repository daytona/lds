export default function getKeyFromCode(keyCode) {
  let key;
  switch (keyCode) {
    case 8 : key = 'Backspace'; break;
    case 9 : key = 'Tab'; break;
    case 13 : key = 'Enter'; break;
    case 16 : key = 'Shift'; break;
    case 17 : key = 'Control'; break;
    case 18 : key = 'Alt'; break;
    case 27 : key = 'Escape'; break;
    case 37 : key = 'ArrowLeft'; break;
    case 38 : key = 'ArrowUp'; break;
    case 39 : key = 'ArrowRight'; break;
    case 40 : key = 'ArrowDown'; break;
    case 46 : key = 'Delete'; break;
    case 91 : key = 'Command'; break;
    default:
      key = 'Unknown';
  }
  return key;
}
