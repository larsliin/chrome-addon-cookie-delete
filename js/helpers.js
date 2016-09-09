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

function extrapolateUrlFromCookie(cookie) {
    var prefix = cookie.secure ? "https://" : "http://";
    if (cookie.domain.charAt(0) == ".")
        prefix += "www";

    return prefix + cookie.domain + cookie.path;
}

function extractDomain(url) {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];
    return domain;
}

function getMonthStr(int, abr) {
    var mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return abr == true ? mS[int] : mL[int];
}

function nth(d) {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

function getWeekdayStr(int) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];;
    return days[int];
}