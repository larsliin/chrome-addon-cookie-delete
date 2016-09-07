var tmpHistoryDomainObj = {};
var deleteCookiesStr = 'Remove';
var keepCookiesStr = 'Add';
var cookiedelElem = document.getElementById('cookiedel');
var domainElem = document.getElementById('curr_domain');
var submitElem = document.getElementById('curr_domain_submit');
var historyElem = document.getElementById('history_list');
var settingsBtn = document.getElementById('settings_btn');
var removeAllCookiesBtn = document.getElementById('remove_all_btn');
var clearListBtn = document.getElementById('clr_btn');
var historyLength = 5;
var isWhitelisted = false;

// set default cta
submitElem.value = keepCookiesStr;

addDefaultClickHandler();

// render history list
renderHistoryList();

// set default values
chrome.tabs.getSelected(null, function (tab) {
    var currentURL = new URL(tab.url);
    currentDomain = stripWWW(currentURL.hostname);
    domainElem.value = currentDomain;

    chrome.storage.sync.get('whitelist', function (result) {
        if (!result.whitelist) {
            chrome.storage.sync.set({ 'whitelist': [] }, function (result) { });
        } else {
            for (var index = 0; index < result.whitelist.length; index++) {
                if (result.whitelist[index] == currentDomain) {
                    isWhitelisted = true;
                    submitElem.value = deleteCookiesStr;
                }
            }
        }
    });
});

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
    clearHistory();
});

removeAllCookiesBtn.addEventListener('click', function (e) {
    
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
    var id = stripDot(currentDomain);

    if (!isWhitelisted) {
        // add current domain to whitelist
        addToStorage(currentDomain);

        // add class to wrapper if history length is 1 or more
        if (!hasClass(cookiedelElem, 'cookiedel__hstr--active')) {
            cookiedelElem.className += cookiedelElem.className ? ' cookiedel__hstr--active' : 'cookiedel__hstr--active';
        }

        if (!tmpHistoryDomainObj[id]) {
            addDomainToHistory(currentDomain);
        } else {
            tmpHistoryDomainObj[id].button.value = deleteCookiesStr;
            tmpHistoryDomainObj[id].added = true;
        }

        notify('Domain added', 'Cookies will be deleted when navigating to other domain.');

        isWhitelisted = true;
        submitElem.value = deleteCookiesStr;
    } else {
        // remove current domain from whitelist
        removeFromStorage(currentDomain);

        isWhitelisted = false;
        submitElem.value = keepCookiesStr;

        if (!tmpHistoryDomainObj[id]) {
            addDomainToHistory(currentDomain);

        }
        tmpHistoryDomainObj[id].button.value = keepCookiesStr;
        tmpHistoryDomainObj[id].button.added = false;
    }
}

// on history buttons click (add/remove domain from whitelist)
function onHistoryClick(e) {
    var domain = e.target.previousSibling.value;
    var domainKey = stripDot(domain);

    if (tmpHistoryDomainObj[domainKey].added) {
        removeFromStorage(domain);

        e.target.value = keepCookiesStr;

        if (domain == currentDomain) {
            submitElem.value = keepCookiesStr;
            isWhitelisted = false;
        }

        tmpHistoryDomainObj[domainKey].added = false;

    } else {
        addToStorage(domain);

        e.target.value = deleteCookiesStr;

        if (domain == currentDomain) {
            submitElem.value = deleteCookiesStr;
            isWhitelisted = true;
        }

        tmpHistoryDomainObj[domainKey].added = true;
    }
}

// add domain to whitelist
function addDomainToHistory(domain) {
    var div = document.createElement('div');
    var id = stripDot(domain);

    if (!document.getElementById('hstr_' + stripDot(currentDomain))) {
        if (historyElem.childNodes.length > historyLength - 1) {
            historyElem.removeChild(historyElem.lastChild);
        }

        div.className = 'cookiedel__frm--group';
        div.id = 'hstr_' + id;
        div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" value="' + domain + '" /><input class="cookiedel__sbmt cookiedel__sbmt--hstr" id="hstr_sbmt_' + id + '" type="button" value="' + deleteCookiesStr + '">';

        historyElem.insertBefore(div, historyElem.firstChild);

        tmpHistoryDomainObj[id] = { added: true, button: document.getElementById('hstr_sbmt_' + id), text: document.getElementById('hstr_txt_' + id) };

        addHistoryClickHandler();
    }
}

// clear history
function clearHistory() {
    while (historyElem.hasChildNodes()) {
        historyElem.removeChild(historyElem.lastChild);
    }

    chrome.storage.sync.set({ 'whitelist': [] }, function (result) { });

    tmpHistoryDomainObj = {};

    removeClass(cookiedelElem, 'cookiedel__hstr--active');

    isWhitelisted = false;

    submitElem.value = keepCookiesStr;
}

// render whitelisted domain history
function renderHistoryList() {
    chrome.storage.sync.get('whitelist', function (result) {
        var c = 0;
        for (var i = result.whitelist.length - 1; i >= 0; i--) {
            if (c < historyLength) {
                var div = document.createElement('div');
                var id = stripDot(result.whitelist[i]);
                div.className = 'cookiedel__frm--group';
                div.id = 'hstr_' + id;
                div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" id="hstr_txt_' + id + '" value="' + result.whitelist[i] + '" /><input class="cookiedel__sbmt cookiedel__sbmt--hstr" id="hstr_sbmt_' + id + '" type="button" value="' + deleteCookiesStr + '">';
                historyElem.appendChild(div);

                tmpHistoryDomainObj[id] = { added: true, button: document.getElementById('hstr_sbmt_' + id), text: document.getElementById('hstr_txt_' + id) }
                c++;
            }
        }

        console.log(tmpHistoryDomainObj);

        if (result.whitelist.length > 0) {
            cookiedelElem.className += cookiedelElem.className ? ' cookiedel__hstr--active' : 'cookiedel__hstr--active';
        }

        addHistoryClickHandler();
    });
}

function addToStorage(domain) {
    chrome.storage.sync.get('whitelist', function (result) {
        var arr = result.whitelist;
        arr.push(domain);

        chrome.storage.sync.set({ 'whitelist': arr }, function (result) { });
    });
}

function removeFromStorage(domain) {
    chrome.storage.sync.get('whitelist', function (result) {
        var arr = result.whitelist;
        var index = arr.indexOf(domain);
        if (index > -1) {
            arr.splice(index, 1);
        }

        chrome.storage.sync.set({ 'whitelist': arr }, function (result) { });
    });
}

function notify(title, body) {
    chrome.notifications.create('notification.warning', {
        iconUrl: ('icon-notification-48.png'),
        title: title,
        message: body,
        type: 'basic',
        //buttons: [{ title: 'Learn More' }],
        isClickable: true,
        priority: 0,
    }, function () { });
}

// helpers
function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function removeClass(el, name) {
    var regex = new RegExp('(^|\\s)' + name + '(\\s|$)', 'gi');
    var newClassName = el.className.replace(regex, ' ');
    el.className = trimStr(newClassName);
}

function trimStr(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

function stripWWW(str) {
    return str.replace('www.', '')
}

function stripDot(str) {
    return str.replace('.', '')
}

deleteAllNotWhitelistedCookies();


function deleteAllNotWhitelistedCookies() {
  chrome.cookies.getAll({  }, function (cookies) {
    console.log(cookies);
  });

  chrome.storage.sync.get('whitelist', function (result) {
    var arr = result.whitelist;
  });
}
