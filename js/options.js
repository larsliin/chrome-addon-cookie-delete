var historyElem = document.getElementById('history_list');
var notificationsCb = document.getElementById('cookiedel_options_notifications_cb');
var historylengthSt = document.getElementById('cookiedel_options_historylength_st');
var submitBtn = document.getElementById('cookiedel_options_submit_btn');
var clearListBtn = document.getElementById('clr_btn');

// settings
// show/hide notifications
chrome.storage.sync.get('settings', function (result) {
    notificationsCb.checked = result.settings.show_notifications;
});

// max history items
chrome.storage.sync.get('settings', function (result) {
    historylengthSt.value = result.settings.history_length;
});

// submit settings
submitBtn.addEventListener('click', function (e) {
    var settings = { show_notifications: notificationsCb.checked, history_length: historylengthSt.value };

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