import requestAnimationFrame from '../requestAnimationFrame';
/**
 * Listens for all changes of viewport
 */
const subscriptions = {
  scroll: [],
  resize: [],
  change: [],
};

let lastScrollY = 0;
let lastWindowWidth = window.innerWidth;
let ticking = false;

// Run appropriate callbacks
function update(type) {
  // Concatinate callbacks of eventtype and change
  const callbacks = subscriptions[type].concat(subscriptions.change);

  callbacks.forEach((callback) => {
    callback.call();
  });

  // allow further rAFs to be called
  ticking = false;
}

// Calls rAF if it's not already been done already
function requestTick(type) {
  if (!ticking) {
    requestAnimationFrame(() => {
      update(type);
    });
    ticking = true;
  }
}

// Only call if there has actually been any change
function onResize() {
  if (lastWindowWidth !== window.innerWidth) {
    lastWindowWidth = window.innerWidth;
    requestTick('resize');
  }
}

// Only call if there has actually been any change
function onScroll() {
  if (lastScrollY !== window.scrollY) {
    lastScrollY = window.scrollY;
    requestTick('scroll');
  }
}

// Add new callback to subscriptionList
function addListener(eventType, callback) {
  subscriptions[eventType].push(callback);
}

// Remove callback from subscriptions
function removeListener(eventType, callback) {
  subscriptions[eventType].reduce((cb) => {
    return cb === callback;
  });
}

// Set up viewport listeners
window.addEventListener('resize', onResize, false);
window.addEventListener('scroll', onScroll, false);

export default {
  addListener,
  removeListener,
  onScroll: (callback) => {
    addListener('scroll', callback);
  },
  onResize: (callback) => {
    addListener('resize', callback);
  },
  onChange: (callback) => {
    addListener('change', callback);
  },
};
