// requestAnimationFrame polyfill
let ticker;
const requestAnimationFrame = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (callback) => {
  clearTimeout(ticker);
  ticker = setTimeout(callback, 100);
};
export default requestAnimationFrame;
