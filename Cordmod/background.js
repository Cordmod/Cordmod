// Handle CSP headers to allow our injections
chrome.webRequest.onHeadersReceived.addListener(
  ({ responseHeaders }) => {
    let cspHeader = responseHeaders.find(h => h.name.toLowerCase() === 'content-security-policy');
    
    if (cspHeader) {
      // Modify CSP to allow our injected content
      const cspDirectives = [
        'script-src',
        'style-src',
        'img-src',
        'connect-src',
        'font-src'
      ];

      for (const directive of cspDirectives) {
        cspHeader.value = cspHeader.value.replace(
          `${directive}`, 
          `${directive} 'unsafe-inline' blob: data: *`
        );
      }

      // Remove nonce restrictions
      cspHeader.value = cspHeader.value.replace(/'nonce-.*?'/g, '');
    }

    return { responseHeaders };
  },
  {
    urls: ['*://*.discord.com/*'],
    types: ['main_frame', 'sub_frame']
  },
  ['blocking', 'responseHeaders']
);

// Handle extension installation/updates
chrome.runtime.onInstalled.addListener(() => {
  console.log('Discord Enhancement Suite installed');
});