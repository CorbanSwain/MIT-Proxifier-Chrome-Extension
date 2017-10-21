chrome.webNavigation.onBeforeNavigate.addListener(details => {
    //console.log("Nav'ing to root: <" + extractRootDomain(details.url) + ">");
    if (urlDb.includes(extractRootDomain(details.url))) {
        //console.log("MATCH");
        if (!(details.url.includes('libproxy.mit.edu'))) {
            //console.log("Updating");
            chrome.tabs.update(details.tabId, {url: proxify(details.url)});
        }
    } else {
        //console.log("NO Match");
    }
});

chrome.tabs.onActivated.addListener(tabInfo => {
    //console.log("Tab # " + tabInfo.tabId + " activated.");
        chrome.tabs.get(tabInfo.tabId, tab => {
        var url = tab.url;
        //console.log("Tab # " + tabInfo.tabId + " <" + url + ">");
         //console.log("Tab # " + tabInfo.tabId + " ROOTNAME: <" + extractRootDomain(url) + ">");
        switchBrowserAction(url, tabInfo.tabId);
    }); 
});

chrome.webNavigation.onCompleted.addListener(details => {
    //console.log("Tab # " + details.tabId + " finished loading.");
    //console.log("Tab # " + details.tabId + " <" + details.url + ">");
    //console.log("Tab # " + details.tabId + " ROOTNAME: <" + extractRootDomain(details.url) + ">");
    switchBrowserAction(details.url, details.tabId); 
});

function switchBrowserAction(url, id) {
    if (typeof url === "string") {
         if (successCheckUrl(url)) {
            //console.log("Green Light");
            var greenIcon = {
                "16": "images/grn16px.png",
                "19": "images/grn19px.png",
                "48": "images/grn48px.png"
            };
            chrome.browserAction.setIcon({path: greenIcon, tabId: id });
            chrome.browserAction.setTitle({title: "You have access through MIT Libraries.", tabId: id});
            return;
         }
    }
    //console.log("Red Light");
    var normIcon = {
        "16": "images/16px.png",
        "19": "images/19px.png",
        "48": "images/48px.png"
    };
    chrome.browserAction.setIcon({path: normIcon, tabId: id });
    chrome.browserAction.setTitle({title: "Get access via MIT Libraries.", tabId: id});
}