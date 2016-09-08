chrome.storage.sync.get('whitelist', function (result) {
  if (!result.whitelist) {
    chrome.storage.sync.set({ 'whitelist': [] }, function (result) { });
  }
});

function removeCookies(url) {
  // delete cookies
  chrome.cookies.getAll({ domain: domain }, function (cookies) {
    var c = 0;

    for (var i = 0; i < cookies.length; i++) {
      chrome.cookies.remove({ url: tmpURL.origin + cookies[i].path, name: cookies[i].name }, function (e) {
        if (c == (cookies.length - 1)) {
          chrome.cookies.getAll({ domain: previousDomain }, function (cookies2) {
            notify('Cookies deleted', cookies.length + ' cookies deleted from ' + previousDomain);
          });
        }

        c++;

      });
    }
  });
}

function notify(title, body) {
  chrome.notifications.create('notification.warning', {
    iconUrl: ('images/icon-notification-48.png'),
    title: title,
    message: body,
    type: 'basic',
    buttons: [{ title: 'Notification settings' }],
    isClickable: true,
    priority: 0,
    requireInteraction: false
  }, function () { });
}

function stripWWW(str) {
  return str.replace('www.', '')
}

chrome.notifications.onButtonClicked.addListener(function () {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
});