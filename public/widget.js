(function() {
  'use strict';

  // Prevent multiple widget loads
  if (window.DoggyDanChatWidget) {
    return;
  }
  window.DoggyDanChatWidget = true;

  // Get the current script URL to determine the base URL for assets
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const scriptSrc = currentScript.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

  // Create iframe to load widget
  const iframe = document.createElement('iframe');
  iframe.id = 'doggy-chat-widget-iframe';
  iframe.src = baseUrl + '/widget-frame.html';
  iframe.style.cssText = [
    'position: fixed !important',
    'top: 0 !important',
    'left: 0 !important',
    'width: 100% !important',
    'height: 100% !important',
    'border: none !important',
    'z-index: 2147483647 !important',
    'pointer-events: none !important',
    'background: transparent !important'
  ].join(';');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowtransparency', 'true');

  // Initialize when DOM is ready
  function init() {
    document.body.appendChild(iframe);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
