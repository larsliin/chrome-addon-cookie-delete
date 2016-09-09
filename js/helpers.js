// update browser history object
function updateBrowserHistory(maxdays, callback) {
    var fromDate = (new Date).getTime() - (1000 * 60 * 60 * 24 * maxdays);

    chrome.history.search({ text: '', maxResults: 5000, startTime: fromDate, endTime: (new Date()).getTime() }, function(e) {
        for (var i = 0; i < e.length; i++) {
            var historyItem = e[i];
            var url = historyItem.url;
            var domain = stripWWW(extractDomain(url));
            var date = new Date(historyItem.lastVisitTime);
            var datePretty = getWeekdayStr(date.getDay()) + ', ' + date.getDate() + nth(date.getDate()) + ' of ' + getMonthStr(date.getMonth()) + ', ' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes();
            var obj;

            obj = { url: extractDomain(url), domain: domain, host: getHost(url), last_visit_time: historyItem.lastVisitTime, last_visit_time_pretty: datePretty };

            browserHistory.push(obj);

            if (i == e.length - 1) {
                if (callback) {
                    callback();
                }
            }
        }
    });
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

function getHost(url) {
    var host;
    var protocol;
    var tmparr;

    if (url.indexOf("://") > -1) {
        tmparr = url.split('/');
        host = tmparr[2];
        protocol = tmparr[0] + '//';
    } else {
        host = url.split('/')[0];
    }

    host = host.split(':')[0];

    if (url.indexOf("://") > -1) {
        host = protocol + host;
    }
    return host;
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