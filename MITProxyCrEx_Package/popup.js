// MIT Proxifier Extension
// popup.js
// Corban Swain 2017

/**
 * @returns 
 */

async function getCurrentTab() {
    "use strict";
    const queryInfo = {
        active: true,
       lastFocusedWindow: true
    };
    // New Syntax
    const tabs = await new Promise(resolve => chrome.tabs.query(queryInfo, tabs => resolve(tabs)))
    var currentTab = tabs[0];
    if (currentTab === undefined) {
        throw "ERROR: Cannot get the current tab, it is not defined!";
    } else {
        return currentTab;
    }
}


/**
 * @returns {string} the URL of the current tab
 */
function getUrlFromTab(tab) {
    "use strict";
    const url = tab.url;
    const type = typeof url; 
    if (typeof url !== "string") {
        throw "ERROR: The URL is not of type string, of unexpected type: " + type + ".";
    }
    //console.log("Tab ID# " + tab.id + " <" + url + ">");
    return url;
}


/**
 * Set the status message in the popup's frame.
 *
 * @param {string} statusText - the new text to place.
 */
function renderStatus(statusText) {
    "use strict";
    document.getElementById("status").textContent = statusText;
}



function hide(element, time = 0) {
    if (element.style.visibility !== "hidden") {
        var hideAction = function () {
            element.style.visibility = "hidden";
        };
    setTimeout(hideAction, time);
    }
}

function show(element, time = 0) {
    if (element.style.visibility !== "visible") {
        var showAction = function () {
            element.style.visibility = "visible";
        };
        setTimeout(showAction, time);
    }
}

function closeLoader() {
    "use strict";
    var loader = document.getElementById("loaderContainer1");
    loader.style.animation = "minimize 0.2s ease-in ";
    hide(loader, 190);
}

function presentIcon(img) {
    "use strict";
    var icon = document.getElementById("statusIcon");
    icon.src = "images/" + img + "20px.png";
    icon.srcset = "images/" + img + "20px.png" + " 1x, " + "images/" + img + "40px.png 2x";
    icon.style.animation = "minimize 0.22s linear 0.1s reverse";
    show(icon, 120);
}

function renderUnknown(message = "Possible Error.") {
    renderStatus(message);
    document.getElementById("status").style.color = "rgb(253,242,110)";
    closeLoader();
    presentIcon("unkn");
}

function renderFailure(failMessage = "Failed.") {
    renderStatus(failMessage);
    document.getElementById("status").style.color = "rgb(235,80,50)";
    closeLoader();
    presentIcon("bad");
    // FIXME: Add support to go back
}

function renderSuccess() {
    "use strict";
    renderStatus("Success!");
    document.getElementById("status").style.color = "rgb(172,207,163)";
    closeLoader();
    presentIcon("good");
    setTimeout(window.close, 1200);
}

async function initiate() {
    "use strict";
    const elipsis = "\u2026";
    renderStatus("Getting URL " + elipsis);
    let tab, url;
    try {
        tab = await getCurrentTab();
        url = getUrlFromTab(tab);
    }
    catch (error) {
        console.log("CAUGHT-" + error);
        renderFailure("Can\u2019t get the current URL.");
        return;
    }
    
    const id = tab.id;
    if (!(url.includes("http"))) {
        renderFailure("Invalid Website.");
        return;
    }
    
    if (url.includes("libproxy.mit.edu")) {
        let searchStr = "libproxy.mit.edu/login?url=";
        if (url.includes(searchStr)) {
            const i = url.indexOf(searchStr);
            url = url.substring(i + searchStr.length, url.length);
            renderStatus("Trying Again " + elipsis);            
        } else {
            renderStatus("Refreshing Access " + elipsis);
        }
    } else {
        renderStatus("Getting Access " + elipsis);
    }
    chrome.tabs.update({url: proxify(url)});
    addListener(id, extractRootDomain(url));
}

// this function is called as the tab is updating
function addListener(expectedTabId, rootName) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (tabId !== expectedTabId) {
            // Another tab updated.
            return;
        }
        //console.log("Page Status: " + changeInfo.status);
        if (changeInfo.status === "loading") {
            let currentMessage =  document.getElementById("status").textContent;
            if (!(currentMessage.includes("Getting") ||
                  currentMessage.includes("Refreshings") ||
                  currentMessage.includes("Trying"))) {
                renderStatus("Getting Access \u2026");
                document.getElementById("status").style.color = "#fff";
            }
            hide(document.getElementById("statusIcon"));
            show(document.getElementById("loaderContainer1"));
        } else if (changeInfo.status === "complete") {
            let url;
            
            // this line requires the "tabs" permision
            try { url = getUrlFromTab(tab); }
            catch (error) {
                console.log("CAUGHT-" + error);
                renderUnknown("Can\u2019t confirm access.");
                return;
            }
            let loginCheck = url.includes("idp.mit.edu");
            let redirectCheck = url.toLowerCase().includes("redirect");
            let failCheck1 = url.includes("libproxy.mit.edu/login?url=");
            let failCheck2 = url.includes("libproxy.mit.edu/menu") && url.length < 30;
            let failCheck3 = url.includes("libproxy.mit.edu/connect?session");
            if (loginCheck) {
                if (redirectCheck) {
                    // an expected redirect
                    //console.log("URL indicates redirect.");
                } else {
                    //console.log("URL indicates login.");
                    renderStatus("Provide your MIT credentials.");
                    closeLoader();
                    presentIcon("lock");
                }
            } else if (failCheck1 || failCheck2 || failCheck3) {
                //console.log("URL indicates failure.");
                renderFailure(rootName + " is not a supported proxy site."); 
            } else if (successCheckUrl(url)) {
                //console.log("URL indicates success.");
                renderSuccess();
            } else {
                //console.log("URL was unexpected.");
                renderUnknown("Unexpected redirect.");
            }                
        }
    });
}
 // this function is called when the popup's content loads
document.addEventListener("DOMContentLoaded", initiate);
