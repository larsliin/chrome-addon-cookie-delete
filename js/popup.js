var deleteCookiesStr = 'Remove';
var cookiedelElem = document.getElementById('cookiedel');
var domainElem = document.getElementById('curr_domain');
var submitElem = document.getElementById('curr_domain_submit');
var historyElem = document.getElementById('history_list');
var settingsBtn = document.getElementById('settings_btn');
var removeAllCookiesBtn = document.getElementById('remove_all_btn');
var clearListBtn = document.getElementById('clr_btn');
var browserHistory = [];

addRemoveDomainCookiesClickHandler();

chrome.storage.sync.get('settings', function(result) {
    getBrowserHistory(result.settings.browser_history_max_days);

    renderHistoryList(result.settings.history_length);
});

function getBrowserHistory(maxdays) {
    var fromDate = (new Date).getTime() - (1000 * 60 * 60 * 24 * maxdays);

    chrome.history.search({ text: '', maxResults: 5000, startTime: fromDate, endTime: (new Date()).getTime() }, function(e) {
        for (var i = 0; i < e.length; i++) {
            var url = extractDomain(e[i].url);
            var date = new Date(e[i].lastVisitTime);
            var datePretty = getWeekdayStr(date.getDay()) + ', ' + date.getDate() + nth(date.getDate()) + ' of ' + getMonthStr(date.getMonth()) + ', ' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes();
            var obj;

            url = stripWWW(url);
            obj = { url: url, lastVisitTime: e[i].lastVisitTime, lastVisitTimePretty: datePretty };

            browserHistory.push(obj);
        }
    });
}

chrome.tabs.getSelected(null, function(tab) {
    var url = new URL(tab.url);
    domainElem.value = stripWWW(url.hostname);
});

// settings button clickhandler
settingsBtn.addEventListener('click', function(e) {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});

// clear popup history button 
clearListBtn.addEventListener('click', function(e) {
    clearHistory(historyElem, cookiedelElem);
});

// delete all stored cookies button
removeAllCookiesBtn.addEventListener('click', function(e) {
    removeCookies();
    clearHistory(historyElem, cookiedelElem);
});

// remove site specific cookies button event handler
function addRemoveDomainCookiesClickHandler() {
    submitElem.addEventListener('click', onRemoveDomainCookies);
}

// remove site specific cookies click handler
function onRemoveDomainCookies(e) {
    if (!hasClass(cookiedelElem, 'cookiedel__hstr--active') && maxItemsInHistory > 0) {
        cookiedelElem.className += cookiedelElem.className ? ' cookiedel__hstr--active' : 'cookiedel__hstr--active';
    }

    // get tab url
    chrome.tabs.getSelected(null, function(tab) {
        var url = new URL(tab.url);
        addDomainToHistory(url);
        removeCookies(url);
    });
}

// add domain to history
function addDomainToHistory(url) {
    var domainStrippedWWW = stripWWW(url.hostname);
    var id = stripDot(domainStrippedWWW);
    var div = document.createElement('div');
    var elems = historyElem.getElementsByClassName('cookiedel__frm--group');

    div.className = 'cookiedel__frm--group';
    div.id = 'hstr_' + id;
    div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" value="' + domainStrippedWWW + '" />';

    historyElem.insertBefore(div, historyElem.firstChild);

    // remove last item from history list
    if (elems.length > maxItemsInHistory) {
        historyElem.removeChild(elems[elems.length - 1]);
    }

    // add to plugin history list
    chrome.storage.sync.get('history', function(result) {
        var tmparr = result.history;
        var obj = { id: id, domain: domainStrippedWWW, origin: url.origin, button_elem: document.getElementById('hstr_sbmt_' + id), text_elem: document.getElementById('hstr_txt_' + id) };

        tmparr.push(obj);

        chrome.storage.sync.set({ 'history': tmparr }, function(result) {});
    });
}

// render whitelisted domain history
function renderHistoryList(max) {
    if (max > 0) {

        // get all domains from plugin history list
        chrome.storage.sync.get('history', function(result) {
            var c = 0;
            for (var i = result.history.length - 1; i >= 0; i--) {
                if (c < max) {
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
        });
    }
}

function removeCookies(url /* url object */ ) {
    var deleteall = url == null ? true : false,
        cookiesTotal,
        cookieurl,
        counter = 0;

    // get cookies from domain or all stored cookies
    chrome.cookies.getAll(deleteall ? {} : { domain: url.hostname }, function(cookies) {
        cookiesTotal = cookies.length;

        if (cookies.length > 0) {
            for (var i = 0; i < cookies.length; i++) {

                cookieurl = deleteall ? extrapolateUrlFromCookie(cookies[i]) : url.origin + cookies[i].path;

                // reomove cookies
                chrome.cookies.remove({ url: cookieurl, name: cookies[i].name }, function(e) {
                    if (counter == (cookies.length - 1)) {

                        chrome.cookies.getAll(deleteall ? {} : { domain: url.origin }, function(cookies2) {

                            // notify user about deleted cookies
                            if (deleteall) {
                                notify('All Cookies deleted', cookiesTotal + ' cookies deleted. ' + cookies2.length + ' cookies left');
                            } else {
                                notify('Cookies deleted', cookies.length + ' cookies deleted from ' + url.hostname);
                            }
                        });
                    }

                    counter++;

                });
            }
        } else {
            // if no ccokies to delete
            if (deleteall) {
                notify('No cookies to delete', '');
            } else {
                notify('No cookies deleted', 'No cookies set by ' + url.hostname);
            }
        }
    });
}

function searchHistory(str) {
    chrome.history.search({ text: str, maxResults: 10 }, function(e) {
        console.log(e);
    });
}

// notification helper
function notify(title, body) {
    chrome.storage.sync.get('settings', function(result) {

        if (result.settings.show_notifications) {
            chrome.notifications.create('notification.warning', {
                iconUrl: ('images/icon-notification-48.png'),
                title: title,
                message: body,
                type: 'basic',
                //buttons: [{ title: 'Settings' }],
                isClickable: true,
                priority: 0,
            }, function() {});
        }
    });
}