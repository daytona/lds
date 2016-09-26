<script>
document.addEventListener('click', (event)=>{
  event.preventDefault();
});
function callMyParent(iframeID) {
  var documentHeight;
  var wrapper = document.querySelector('#Standalone-wrapper');

  function checkHeight() {
    if (wrapper.clientHeight !== documentHeight) {
      updateHeight();
    }
  }

  function updateHeight() {
    documentHeight = wrapper.clientHeight;
    if (typeof window.parent.updateIframeHeight === 'function') {
      window.parent.updateIframeHeight(iframeID, documentHeight);
    }
  }
  var resizeInterval = setInterval(checkHeight, 100);
}

if (window !== window.top) {
  callMyParent('{{iframeid}}');
}
</script>
