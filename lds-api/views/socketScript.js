<script>
  var socket = new WebSocket("{{socketUrl}}");
  socket.onmessage = function (event) {
    try {
      var data = JSON.parse(event);
      if (data.type && data.type === 'reload') {
        if (!data.url || data.url.match(new RegExp(window.location.pathname + '$', 'i'))) {
          window.location.reload();
        }
      }
    } catch (err) {

    }
  };
  window.socket = socket;
</script>
