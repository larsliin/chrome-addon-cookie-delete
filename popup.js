var tmpHistoryDomainObj = {};
var deleteCookiesStr = 'Remove';
var keepCookiesStr = 'Add';
var domainElem = document.getElementById('curr_domain');
var submitElem = document.getElementById('curr_domain_submit');
var historyElem = document.getElementById('history');
var settingsBtn = document.getElementById('settings_btn');
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
    console.log('open settings');
})

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
    if (isWhitelisted) {
        removeFromStorage(currentDomain);

        document.getElementById('hstr_sbmt_' + currentDomain.replace('.', '_')).value = keepCookiesStr;
    } else {
        addToStorage(currentDomain);

        if (!document.getElementById('_hstr_sbmt_' +currentDomain.replace('.', '_'))) {
            addDomainToHistory(currentDomain);
        }else{
            document.getElementById('hstr_sbmt_' + currentDomain.replace('.', '_')).value = deleteCookiesStr;
        }
    }
}

function onHistoryClick(e) {
    var domain = e.target.previousSibling.value;
    var domainKey = stripWWW(domain);
    tmpHistoryDomainObj[domainKey] = true;
    console.log(tmpHistoryDomainObj);
    removeFromStorage(domain);
}

function addDomainToHistory(domain) {
    var div = document.createElement('div');

    if (historyElem.childNodes.length > historyLength - 1) {
        historyElem.removeChild(historyElem.lastChild);
    }

    div.className = 'cookiedel__frm--group';
    div.id = 'hstr_' + domain.replace('.', '_');
    div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" value="' + domain + '" /><input class="cookiedel__sbmt cookiedel__sbmt--hstr" id="hstr_sbmt_' + domain.replace('.', '_') + '" type="button" value="' + deleteCookiesStr + '">';

    historyElem.insertBefore(div, historyElem.firstChild);

    addHistoryClickHandler();
}

function clearHistory() {
    while (historyElem.hasChildNodes()) {
        historyElem.removeChild(historyElem.lastChild);
    }
}

function renderHistoryList() {
    console.log('renderHistoryList');
    chrome.storage.sync.get('whitelist', function (result) {
        var c = 0;
        for (var i = result.whitelist.length - 1; i > 0; i--) {
            if (c < historyLength) {
                var div = document.createElement('div');
                div.className = 'cookiedel__frm--group';
                div.id = 'hstr_' + result.whitelist[i].replace('.', '_');
                div.innerHTML = '<input type="text" disabled="disabled" class="cookiedel__txt cookiedel__txt--hstr" value="' + result.whitelist[i] + '" /><input class="cookiedel__sbmt cookiedel__sbmt--hstr" id="hstr_sbmt_' + result.whitelist[i].replace('.', '_') + '" type="button" value="' + deleteCookiesStr + '">';

                historyElem.appendChild(div);

                c++;
            }

            console.log(result.whitelist[i])
        }

        addHistoryClickHandler();
    });
}

function stripWWW(str) {
    return str.replace('www.', '')
}

function addToStorage(domain) {
    chrome.storage.sync.get('whitelist', function (result) {
        var arr = result.whitelist;
        arr.push(domain);

        chrome.storage.sync.set({ 'whitelist': arr }, function (result) {
            submitElem.value = deleteCookiesStr;
            isWhitelisted = true;
        });
    });
}

function removeFromStorage(domain) {
    chrome.storage.sync.get('whitelist', function (result) {
        var arr = result.whitelist;
        var index = arr.indexOf(domain);
        if (index > -1) {
            arr.splice(index, 1);
        }

        chrome.storage.sync.set({ 'whitelist': arr }, function (result) {
            submitElem.value = keepCookiesStr;
            isWhitelisted = false;
        });
    });
}
