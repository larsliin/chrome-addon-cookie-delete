var historyElem = document.getElementById('history_list');

chrome.storage.sync.get('whitelist', function (result) {
    var c = 0;
    for (var i = result.whitelist.length - 1; i >= 0; i--) {

        var div = document.createElement('div');
        var id = stripDot(result.whitelist[i]);
        div.className = 'cookiedel__frm--group';
        div.id = 'hstr_' + id;
        div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" id="hstr_txt_' + id + '" value="' + result.whitelist[i] + '" />';
        historyElem.appendChild(div);

    }
});