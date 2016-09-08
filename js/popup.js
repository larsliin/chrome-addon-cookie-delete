var deleteCookiesStr = 'Remove';
var cookiedelElem = document.getElementById('cookiedel');
var domainElem = document.getElementById('curr_domain');
var submitElem = document.getElementById('curr_domain_submit');
var historyElem = document.getElementById('history_list');
var settingsBtn = document.getElementById('settings_btn');
var removeAllCookiesBtn = document.getElementById('remove_all_btn');
var clearListBtn = document.getElementById('clr_btn');
var maxItemsInHistory = 5;

chrome.storage.sync.get('settings', function (result) {
    maxItemsInHistory = result.settings.history_length;

    renderHistoryList();
});

chrome.tabs.getSelected(null, function (tab) {
    var url = new URL(tab.url);
    domain = stripWWW(url.hostname);
    domainElem.value = domain;
});

addDefaultClickHandler();

// render history list

settingsBtn.addEventListener('click', function (e) {
    if (chrome.runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        chrome.runtime.openOptionsPage();
    } else {
        // Reasonable fallback.
        window.open(chrome.runtime.getURL('options.html'));
    }
});

clearListBtn.addEventListener('click', function (e) {
    clearHistory(historyElem, cookiedelElem);
});

removeAllCookiesBtn.addEventListener('click', function (e) {
    removeAllCookies();
});

function addDefaultClickHandler() {
    submitElem.addEventListener('click', onDefaultClick);
}

function addHistoryClickHandler() {
    var elements = document.querySelectorAll('.cookiedel__sbmt--hstr');
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', onHistoryClick);
    }
}

function onDefaultClick(e) {
    if (!hasClass(cookiedelElem, 'cookiedel__hstr--active') && maxItemsInHistory > 0) {
        cookiedelElem.className += cookiedelElem.className ? ' cookiedel__hstr--active' : 'cookiedel__hstr--active';
    }

    chrome.tabs.getSelected(null, function (tab) {
        var url = new URL(tab.url);
        addDomainToHistory(url);
        removeCookies(url);
    });
}

// on history buttons click (add/remove domain from history)
function onHistoryClick(e) {
}

// add domain to history
function addDomainToHistory(url) {
    var domainStrippedWWW = stripWWW(url.hostname);
    var id = stripDot(domainStrippedWWW);
    var div = document.createElement('div');
    var elems = historyElem.getElementsByClassName('cookiedel__frm--group');

    div.className = 'cookiedel__frm--group';
    div.id = 'hstr_' + id;
    div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" value="' + domainStrippedWWW + '" /><input class="cookiedel__sbmt cookiedel__sbmt--hstr" id="hstr_sbmt_' + id + '" type="button" value="' + deleteCookiesStr + '">';

    historyElem.insertBefore(div, historyElem.firstChild);

    if (elems.length > maxItemsInHistory) {
        historyElem.removeChild(elems[elems.length - 1]);
    }

    chrome.storage.sync.get('history', function (result) {
        var tmparr = result.history;
        var obj = { id: id, domain: domainStrippedWWW, origin: url.origin, button_elem: document.getElementById('hstr_sbmt_' + id), text_elem: document.getElementById('hstr_txt_' + id) };

        tmparr.push(obj);

        chrome.storage.sync.set({ 'history': tmparr }, function (result) { });

    });

    addHistoryClickHandler();
}

// render whitelisted domain history
function renderHistoryList() {
    if (maxItemsInHistory > 0) {

        chrome.storage.sync.get('history', function (result) {
            var c = 0;
            for (var i = result.history.length - 1; i >= 0; i--) {
                if (c < maxItemsInHistory) {
                    var div = document.createElement('div');
                    var id = result.history[i].id;
                    div.className = 'cookiedel__frm--group';
                    div.id = 'hstr_' + id;
                    div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" id="hstr_txt_' + id + '" value="' + result.history[i].domain + '" />';
                    historyElem.appendChild(div);

                    c++;
                }
            }

            if (result.history.length > 0) {
                cookiedelElem.className += cookiedelElem.className ? ' cookiedel__hstr--active' : 'cookiedel__hstr--active';
            }

            addHistoryClickHandler();
        });
    }
}


function removeCookies(url) {
    // delete cookies
    chrome.cookies.getAll({ domain: url.hostname }, function (cookies) {
        var c = 0;

        if (cookies.length > 0) {
            for (var i = 0; i < cookies.length; i++) {
                chrome.cookies.remove({ url: url.origin + cookies[i].path, name: cookies[i].name }, function (e) {
                    if (c == (cookies.length - 1)) {
                        chrome.cookies.getAll({ domain: url.origin }, function (cookies2) {
                            notify('Cookies deleted', cookies.length + ' cookies deleted from ' + url.hostname);
                        });
                    }

                    c++;

                });
            }
        } else {
            notify('No cookies deleted', 'No cookies set by ' + url.hostname);
        }
    });
}

function removeAllCookies() {
    var cookiesTotal;
    var c = 0;

    chrome.cookies.getAll({}, function (cookies) {
        cookiesTotal = cookies.length;
        if (cookies.length > 0) {
            for (var i = 0; i < cookies.length; i++) {
                
                chrome.cookies.remove({ url: extrapolateUrlFromCookie(cookies[i]), name: cookies[i].name }, function (e) {
                    if (c == (cookies.length - 1)) {
                        chrome.cookies.getAll({}, function (cookies2) {
                            notify('All Cookies deleted', cookiesTotal + ' cookies deleted. ' + cookies2.length + ' cookies left');
                        });
                    }

                    c++;

                });
            }
        }
    });

    clearHistory(historyElem, cookiedelElem);
}

function notify(title, body) {
    chrome.storage.sync.get('settings', function (result) {
        console.log(result);
        if (result.settings.show_notifications) {
            chrome.notifications.create('notification.warning', {
                iconUrl: ('images/icon-notification-48.png'),
                title: title,
                message: body,
                type: 'basic',
                buttons: [{ title: 'Settings' }],
                isClickable: true,
                priority: 0,
            }, function () { });
        }
    });
}