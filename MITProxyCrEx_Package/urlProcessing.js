/**
 * Adds the MIT Libraries proxy string to the supplied url
 *
 * @param {string} url - the url to add the proxy string to
 * @returns {string} - the new URL
 */
function proxify(url) {
    "use strict";
    var proxyString = "http://libproxy.mit.edu/login?url=";
    return proxyString + url;
}


// by lewdev (https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string)
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

// by lewdev (https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string)
function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.');
    //console.log(splitArr);
    //extracting the root domain here
    if (splitArr[0].includes("www") && splitArr[0].length < 5) {
        splitArr.splice(0,1);
    }
    domain = splitArr.join(".");
    return domain;
}

function successCheckUrl(url) {
    if (typeof url !== "string") return false;
    
    const domain = extractRootDomain(url);
    const includeList = ["libproxy.mit.edu"];
    const domExcludeList = ["s446"];
    
    var item, i;
    for (i = 0; i < domExcludeList.length; ++i) {
        item = domExcludeList[i];
        if (domain.includes(item)) return false;
    }
    
    for (i = 0; i < includeList.length; ++i) {
        item = includeList[i];
        if (!(url.includes(item))) return false;
    }
    
    if (domain.length <= 16) return false;
    
    return true;
}