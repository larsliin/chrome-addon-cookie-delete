var deleteCookiesStr = 'Remove';
var currentDomain = '';
var maxHistoryItems = 0;
var cookiedelElem = document.getElementById('cookiedel');
var domainTxtWrp = document.getElementById('curr_domain_wrp');
var submitBtn = document.getElementById('curr_domain_submit');
var historyElem = document.getElementById('history_list');
var settingsBtn = document.getElementById('settings_btn');
var removeAllCookiesBtn = document.getElementById('remove_all_btn');
var clearListBtn = document.getElementById('clr_btn');
var browserHistoryArr = {};
var autocomplete;

// remove site specific cookies button event handler
submitBtn.addEventListener('click', onRemoveDomainCookies);

// get settings
chrome.storage.sync.get('settings', function (result) {
    maxHistoryItems = result.settings.history_length;
    
    if (result.settings.simple) {
        //removeCookies();
        //chrome.browserAction.setPopup({ popup: "" });
    }

    getBrowserHistory(result.settings.browser_history_max_days, function () {
        buildAutoComplete();
    });

    renderHistoryList(maxHistoryItems);
});

// get current URL and show in popup textfield
chrome.tabs.getSelected(null, function (tab) {
    var url = new URL(tab.url);
    currentDomain = stripWWW(url.hostname);
});

// settings button clickhandler
settingsBtn.addEventListener('click', function (e) {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});

// clear popup history button 
clearListBtn.addEventListener('click', function (e) {
    clearHistory(historyElem, cookiedelElem);
});

// delete all stored cookies button
removeAllCookiesBtn.addEventListener('click', function (e) {
    removeCookies();
    clearHistory(historyElem, cookiedelElem);
});

// build input autocomplete
function buildAutoComplete() {
    autocomplete = completely(domainTxtWrp, {});
    autocomplete.setText(currentDomain);
    autocomplete.options = getBrowserHistoryUrlArray(browserHistoryArr);
    autocomplete.repaint();
    autocomplete.dropDown.className = 'hidden';
    autocomplete.input.className = 'cookiedel__txt cookiedel__txt--dflt';
    autocomplete.hint.className = 'cookiedel__txt cookiedel__txt--dflt';
    autocomplete.input.id = 'completely_input';
    autocomplete.hint.id = 'completely_hint';

    autocomplete.input.addEventListener('focus', function (e) {
        document.addEventListener('keydown', onKeyDown, false);
        if (autocomplete.getText() == currentDomain) {
            autocomplete.setText('');
        }
    });

    autocomplete.input.addEventListener('blur', function (e) {
        document.removeEventListener('keydown', onKeyDown);
        if (autocomplete.getText() == '') {
            autocomplete.setText(currentDomain);
        }
    });
}

// remove site specific cookies click handler
function onRemoveDomainCookies(e) {
    var url;
    if (!hasClass(cookiedelElem, 'cookiedel__hstr--active') && maxHistoryItems > 0) {
        cookiedelElem.className += cookiedelElem.className ? ' cookiedel__hstr--active' : 'cookiedel__hstr--active';
    }

    if (autocomplete.getText() == currentDomain) {
        // get tab url
        chrome.tabs.getSelected(null, function (tab) {
            url = new URL(tab.url);
            addDomainToHistory(url);
            removeCookies(url);
        });
    } else {
        url = browserHistoryArr[urlToKey(autocomplete.getText())];
        addDomainToHistory(url);
        removeCookies(url);
    }
}

function onKeyDown(e) {
    if (e.keyCode == 13) {
        submitBtn.click();

        autocomplete.input.blur();
    }
}

// add domain to history
function addDomainToHistory(url) {
    var domainStrippedWWW = stripWWW(url.hostname);
    var id = urlToKey(domainStrippedWWW);
    var div = document.createElement('div');
    var elems = historyElem.getElementsByClassName('cookiedel__frm--group');

    div.className = 'cookiedel__frm--group';
    div.id = 'hstr_' + id;
    div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" value="' + domainStrippedWWW + '" />';

    historyElem.insertBefore(div, historyElem.firstChild);

    // remove last item from history list
    if (elems.length > maxHistoryItems) {
        historyElem.removeChild(elems[elems.length - 1]);
    }

    // add to plugin history list
    chrome.storage.sync.get('history', function (result) {
        var tmparr = result.history;
        var date = new Date();
        var datePretty = getWeekdayStr(date.getDay()) + ', ' + date.getDate() + nth(date.getDate()) + ' of ' + getMonthStr(date.getMonth()) + ', ' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes();
        var obj = { id: id, domain: domainStrippedWWW, origin: url.origin, text_elem: document.getElementById('hstr_txt_' + id), timestamp : date, date_pretty: datePretty };

        tmparr.push(obj);

        chrome.storage.sync.set({ 'history': tmparr }, function (result) { });
    });
}

// render whitelisted domain history
function renderHistoryList(max) {
    if (max > 0) {

        // get all domains from plugin history list
        chrome.storage.sync.get('history', function (result) {
            var c = 0;
            for (var i = result.history.length - 1; i >= 0; i--) {
                if (c < max) {
                    var li = document.createElement('li');
                    var id = result.history[i].id;
                    li.className = 'cookiedel__frm--group';
                    li.id = 'hstr_' + id;
                    li.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" id="hstr_txt_' + id + '" value="' + result.history[i].domain + '" />';
                    historyElem.appendChild(li);

                    c++;
                }
            }

            if (result.history.length > 0) {
                cookiedelElem.className += cookiedelElem.className ? ' cookiedel__hstr--active' : 'cookiedel__hstr--active';
            }
        });
    }
}

function removeCookies(url /* url object */) {
    var deleteall = url == null ? true : false,
        cookiesTotal,
        cookieurl,
        counter = 0;

    // get cookies from domain or all stored cookies
    chrome.cookies.getAll(deleteall ? {} : { domain: url.hostname }, function (cookies) {
        cookiesTotal = cookies.length;

        if (cookies.length > 0) {
            for (var i = 0; i < cookies.length; i++) {

                cookieurl = deleteall ? extrapolateUrlFromCookie(cookies[i]) : url.origin + cookies[i].path;

                // reomove cookies
                chrome.cookies.remove({ url: cookieurl, name: cookies[i].name }, function (e) {
                    if (counter == (cookies.length - 1)) {

                        chrome.cookies.getAll(deleteall ? {} : { domain: url.origin }, function (cookies2) {

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
    chrome.history.search({ text: str, maxResults: 10 }, function (e) { });
}

// notification helper
function notify(title, body) {
    chrome.storage.sync.get('settings', function (result) {

        if (result.settings.show_notifications) {
            chrome.notifications.create('notification.warning', {
                iconUrl: ('images/icon-notification-48.png'),
                title: title,
                message: body,
                type: 'basic',
                isClickable: true,
                priority: 0,
            }, function () { });
        }
    });
}

// get browser history object
function getBrowserHistory(maxdays, callback) {
    var fromDate = (new Date).getTime() - (1000 * 60 * 60 * 24 * maxdays);
    chrome.history.search({ text: '', maxResults: 5000, startTime: fromDate, endTime: (new Date()).getTime() }, function (e) {
        for (var i = 0; i < e.length; i++) {
            var historyItem = e[i];
            var url = historyItem.url;
            var domain = stripWWW(extractDomain(url));
            var date = new Date(historyItem.lastVisitTime);
            var datePretty = getWeekdayStr(date.getDay()) + ', ' + date.getDate() + nth(date.getDate()) + ' of ' + getMonthStr(date.getMonth()) + ', ' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes();
            var obj = { url: extractDomain(url), host: domain, hostname: domain, origin: getHost(url), last_visit_time: historyItem.lastVisitTime, last_visit_time_pretty: datePretty };
            var key = domain.replace(/\./g, '_');

            browserHistoryArr[key] = obj;

            if (i == e.length - 1) {
                if (callback) {
                    callback();
                }
            }
        }
    });
}

// get browser history as simple array for autocomplete
function getBrowserHistoryUrlArray(data) {
    var arr = [];
    for (var k in data) {
        if (data.hasOwnProperty(k)) {
            arr.push(data[k].host);
        }
    }
    return arr;
}