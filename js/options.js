var historyElem = document.getElementById('history_list');
var simpleCb = document.getElementById('options_simple_cb');
var notificationsCb = document.getElementById('options_notifications_cb');
var historyListLengthSt = document.getElementById('options_historylist_length');
var historyDaysLengthSt = document.getElementById('options_historydays_length');
var submitBtn = document.getElementById('cookiedel_options_submit_btn');
var clearListBtn = document.getElementById('clr_btn');

// settings
chrome.storage.sync.get('settings', function (result) {
    // show/hide notifications
    simpleCb.checked = result.settings.simple;

    // show/hide notifications
    notificationsCb.checked = result.settings.show_notifications;

    // max history items
    historyListLengthSt.value = result.settings.history_length;

    // max browser history days
    historyDaysLengthSt.value = result.settings.browser_history_max_days;
});

// submit settings
submitBtn.addEventListener('click', function (e) {
    var settings = {
        simple: simpleCb.checked, 
        show_notifications: notificationsCb.checked,
        history_length: historyListLengthSt.value,
        browser_history_max_days: historyDaysLengthSt.value
     };
    chrome.storage.sync.set({ 'settings': settings }, function (result) {
        alert('settings updated');
    });
});

// history
clearListBtn.addEventListener('click', function (e) {
    clearHistory(historyElem);
});

chrome.storage.sync.get('history', function (result) {
    for (var i = result.history.length - 1; i >= 0; i--) {
        var li = document.createElement('li');
        li.className = 'cookiedel__hstr--item';
        li.id = 'hstr_' + result.history[i].id;
        li.innerHTML = '<span>' + result.history[i].domain + ' <span class="cookiedel__hstr--date">(<em>' + result.history[i].date_pretty +  ')</em></span></span>';
        historyElem.appendChild(li);
    }
});