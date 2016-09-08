var settings = { show_notifications: true, history_length: 5 };

chrome.storage.sync.set({ 'settings': settings }, function (result) { });

chrome.storage.sync.get('history', function (result) {
  if (!result.history) {
    chrome.storage.sync.set({ 'history': [] }, function (result) { });
  }
});

chrome.notifications.onButtonClicked.addListener(function () {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
});

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

// load json
// loadJSON('../data.json',
//   function (data) { console.log(data); },
//   function (xhr) { console.error(xhr); }
// );

function loadJSON(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText));
      } else {
        if (error)
          error(xhr);
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}