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
    return str.replace('.', '_')
}

// clear history
function clearHistory(elem, activeelem) {
    while (elem.hasChildNodes()) {
        elem.removeChild(historyElem.lastChild);
    }

    chrome.storage.sync.set({ 'history': [] }, null);

    if (activeelem) {
        removeClass(cookiedelElem, 'cookiedel__hstr--active');
    }
}