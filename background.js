var currentDomain, previousUrl, currentTabId;

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
      console.log(stripWWW(previousUrl.hostname));
    });
  }
});

chrome.tabs.onRemoved.addListener(function (e) {
  removeCookies();
});

function removeCookies() {
  chrome.tabs.getSelected(null, function (tab) {
    var currentUrl = new URL(tab.url);
    var tmpURL = previousUrl;
    var previousDomain = tmpURL ? stripWWW(tmpURL.hostname) : '';
    var currentDomain = stripWWW(currentUrl.hostname);


    chrome.storage.sync.get('whitelist', function (result) {
      console.log('');
      console.log(previousDomain + ' is whitelisted: ' + getIsCurrentDomainWhitelisted(result, previousDomain));

      // delete cookies
      if (previousUrl && !getIsCurrentDomainWhitelisted(result, previousDomain)) {
        if (previousDomain != currentDomain) {
          console.group();


          chrome.cookies.getAll({ domain: previousDomain }, function (cookies) {
            var c = 0;
            console.log('Removing ' + cookies.length + ' cookies from domain: ' + previousDomain);

            for (var i = 0; i < cookies.length; i++) {

              chrome.cookies.remove({ url: tmpURL.origin + cookies[i].path, name: cookies[i].name }, function (e) {

                // for test only
                // start
                if (c == (cookies.length - 1)) {
                  chrome.cookies.getAll({ domain: previousDomain }, function (cookies2) {
                    console.log(cookies2.length + ' cookies left on domain: ' + previousDomain);
                    console.groupEnd();
                  });
                }
                c++;
                // end
                // for test only
              });
            }
          });
        }
      }

      // for test only
      // start

      chrome.cookies.getAll({ domain: previousDomain }, function (cookies) {
        console.group();
        console.log(cookies.length + ' cookies left on domain: ' + previousDomain);
        console.groupEnd();
      });

      // end
      // for test only

      previousUrl = currentUrl;
    });
  });
}

function getIsCurrentDomainWhitelisted(result, domain) {
  for (var index = 0; index < result.whitelist.length; index++) {
    //console.log(result.whitelist[index] + '==' + domain);
    if (result.whitelist[index] == domain) {
      return true;
    }
  }
  return false;
}
function stripWWW(str) {
  return str.replace('www.', '')
}