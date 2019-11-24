function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({})
    .then((tabs) => {
      let length = tabs.length;

      // onRemoved fires too early and the count is one too many.
      // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
      if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
        length--;
      }


      //browser.browserAction.setBadgeText({ text: length.toString() });
      if (length > 2) {
        browser.browserAction.setBadgeBackgroundColor({ 'color': 'green' });
      } else {
        browser.browserAction.setBadgeBackgroundColor({ 'color': 'red' });
      }
      var tablist = new Array();
      for (i=0; i < tabs.length; i++){
          tablist.push({id: tabs[i].id, windowId: tabs[i].windowId, title: tabs[i].title})
      }
      storeTabs(tablist );
    });
}
var data = null;
var textFile = null;
var textlock = false;

function storeTabs(tabs){
    let i;
    text = "";
    //const line = (tabs[0].windowId + "," + tabs[0].id) //+ ",\'" + escape(tabs[0].title) + "\'\n");
    //message(line)

    for (i = 0; i < tabs.length; ++i){
        text += (tabs[i].windowId + "," + tabs[i].id + ",'" + (tabs[i].title) + "\n");
    }

    if (!textlock){
        textlock = true;

        data = new Blob( [text], {type: 'text/plain'} );
        textFile = window.URL.createObjectURL(data);


        const fname= "kaneda-tmp/test.txt";

        try{
            browser.downloads.download({url: textFile, filename: fname, saveAs:false, conflictAction: "overwrite"}).then((id)=>{textlock = false;});
        }catch(err){
        }
    }

};



browser.tabs.onRemoved.addListener(
        (tabId) => {
            updateCount(tabId, true);
        }
        );

browser.tabs.onCreated.addListener(
        (tabId) => {
            updateCount(tabId, false);
        }
        );
browser.tabs.onUpdated.addListener(
        (tabId) => {
            if (todoRemoveCurrent){
                todoRemoveCurrent = false;
                browser.tabs.getCurrent().then((tab)=>{browser.browserAction.setBadgeText({ text: "w"+tabs });
})

            }
            updateCount(tabId, false);
        }
        );


updateCount();

function focusWindow(windowId) {
    browser.windows.update(
    parseInt(windowId, 10),
    {
      drawAttention: true,
      focused: true,
    },
  ).then(()=>{});
}

function focusTab(tabId) {
    browser.tabs.update(tabId, {
        active: true
    });
}


var pattern = "http://www.184213072193821491204721904321.xyz/*";

var directedTabId;
var directedWinId;

function update(numId, tabs) {
    browser.browserAction.setBadgeText({ text: numId});
    var i = 0;
    let tabId = +numId;
    for (i=0; i < tabs.length; i++){
        if (tabs[i].id === numId) {
            browser.tabs.update(tabId, {
                active: true
            });
        }
    }
	apiP(browser.tabs, 'update', numId, { active: true });

    //browser.tabs.update(numId, { active: true });
}

var todoRemoveCurrent = false;


function redirect(requestDetails) {
    console.log("Kaneda: " + requestDetails.url);
    var reqArr = requestDetails.url.split("/");
    const directedWinId = parseInt(reqArr[3], 10);
    const directedTabId = parseInt(reqArr[4], 10);
    browser.browserAction.setBadgeText({ text: "lo"});

    //browser.browserAction.setBadgeText({ text: tabId});
    focusWindow(directedWinId);

    browser.browserAction.setBadgeText({ text: "d"+directedTabId});

    // TODO #1 Close this tab
    // TODO #2 Focus correct window
    //
    todoRemoveCurrent = true;
    
         browser.tabs.update(directedTabId, {
            active: true
          });

         browser.tabs.query({}).then((tabs)=>{
             var i = 0;
             for (i=0;i<tabs.length;i++) {
                 let tab = tabs[i];
                //browser.browserAction.setBadgeText({ text: tab.id});
                 if (tab.title.includes("184213072193821491204721904321")){
                     browser.tabs.remove(tab.id)
                 }
             }
         })


         return {
             cancel: true
         };
};

// Promise that sends a rejection error if an API is undefined
function apiP(api, method, ...args) {
    return new Promise((resolve, reject) => {
        if (api) {
            resolve(api[method](...args));
        } else if (!api[method]) {
            reject(new Error(`Method ${method} doesn't exist on ${api}!`));
        } else {
            reject(new Error(`${api} API not available!`));
        }
    });
}

browser.webRequest.onBeforeRequest.addListener(
        redirect,
        { urls: [pattern] },
        ["blocking"]
        );


