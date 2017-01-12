import isJSON from '../isJSON';

function socket() {
  let socket;
  let isConnected = false;
  const stylesheeturl = '/assets/style.css';
  const stylesheet = document.querySelector('link[rel="stylesheet"][href="'+stylesheeturl+'"]');
  const sendQueue = [];
  const listeners = {};
  let cssversion = 0;

  function connect() {
    socket = new WebSocket(`${window.location.prototcol === 'https' ? 'wws' : 'ws'}://${window.location.host}`);
  }
  function close() {
    if (socket && isConnected) {
      socket.close();
    }
  }
  function updateCss() {
    console.log('replace css');
    cssversion++;
    stylesheet.setAttribute('href', stylesheeturl + '?v=' + cssversion);
  }

  function reload() {
    console.log('reload');
    window.location.reload();
  }

  function send (msg) {
    if (socket && isConnected) {
      socket.send(typeof(msg) === 'object' ? JSON.stringify(msg) : msg);
    } else {
      sendQueue.push(msg);
    }
  }

  function callListeners(type, msg) {
    if (listeners[type] && listeners[type].length) {
      listeners[type].forEach(cb => {
        cb(msg);
      })
    }
  }

  function addListener (type, callback) {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push(callback);
  }

  function removeListener (type, callback) {
    if (listeners[type]) {
      return;
    }
    listeners[type].filter(cb => {
      return callback && cb !== callback;
    })
  }

  function init () {
    connect();
    socket.onopen = function (event) {
      console.log('Established connection with server');
      if (sendQueue.length) {
        sendQueue.filter(msg => {
          send(msg);
          return false;
        });
      }
      isConnected = true;
    }
    socket.onclose = function (event) {
      console.log('Socket connection with server closed');
      isConnected = false;
    }

    socket.onmessage = function (event) {
      let msg = isJSON(event.data);

      if (msg.type) {
        switch (msg.type) {
          case 'reload':
            reload();
            break;
          case 'updatecss':
            updatecss();
            break;
          default:
            callListeners(msg.type, msg);
        }
      } else {
        console.log('message:', event.data);
      }
    }

    return {
      connected: isConnected,
      on: addListener,
      off: removeListener,
      send
    };
  }

  return init();
}

export default socket();
