(function connectToLDS() {
  var socket = new WebSocket('{{socketUrl}}');
  var stylesheeturl = '/assets/style.css';
  var stylesheet = document.querySelector('link[rel="stylesheet"][href="'+stylesheeturl+'"]');
  var version = 0;

  socket.onmessage = function (event) {
    if (event.data === 'reload') {
      window.location.reload();
    } else if (event.data === 'updatecss') {
      // Hot css reload
      version++;
      stylesheet.setAttribute('href', stylesheeturl + '?v=' + version);
    }
  };
}());
