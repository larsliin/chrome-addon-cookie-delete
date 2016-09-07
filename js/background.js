var currentDomain, previousUrl, currentTabId;

chrome.history.onVisited.addListener(function (e){
  console.log('browser history updated', e);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var currentUrl = new URL(tab.url);
  var previousDomain = previousUrl ? (previousUrl.hostname).replace('www.', '') : '';

  currentDomain = (currentUrl.hostname).replace('www.', '');
  
  if (changeInfo.status == 'loading' && previousDomain != currentDomain) {
    removeCookies();
  }
});

chrome.tabs.onActivated.addListener(function (tabId, changeInfo, tab) {
  if (currentTabId != tabId) {
    currentTabId = tabId;

    chrome.tabs.getSelected(null, function (tab) {
      previousUrl = new URL(tab.url);
    });
  }
});

chrome.tabs.onRemoved.addListener(function (e) {
  removeCookies();
});

function removeCookies() {
  //console.log('remove cookies');
  chrome.tabs.getSelected(null, function (tab) {
    var currentUrl = new URL(tab.url);
    var tmpURL = previousUrl;
    var previousDomain = tmpURL ? stripWWW(tmpURL.hostname) : '';
    var currentDomain = stripWWW(currentUrl.hostname);

    chrome.storage.sync.get('whitelist', function (result) {
      // delete cookies
      if (previousUrl && !getIsCurrentDomainWhitelisted(result, previousDomain)) {
        if (previousDomain != currentDomain) {

          chrome.cookies.getAll({ domain: previousDomain }, function (cookies) {
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
      }

      previousUrl = currentUrl;

    });
  });
}

function getIsCurrentDomainWhitelisted(result, domain) {
  for (var index = 0; index < result.whitelist.length; index++) {
    if (result.whitelist[index] == domain) {
      return true;
    }
  }
  return false;
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