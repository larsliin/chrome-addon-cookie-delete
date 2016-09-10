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
        var div = document.createElement('div');
        div.className = 'cookiedel__frm--group';
        div.id = 'hstr_' + result.history[i].id;
        div.innerHTML = '<div>' + result.history[i].domain + '</div>';
        historyElem.appendChild(div);
    }
});