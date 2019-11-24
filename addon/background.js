function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({})
    .then((tabs) => {
      let length = tabs.length;

      // onRemoved fires too early and the count is one too many.
      // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
      if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
        length--;
      }


      browser.browserAction.setBadgeText({ text: length.toString() });
      if (length > 2) {
        browser.browserAction.setBadgeBackgroundColor({ 'color': 'green' });
      } else {
        browser.browserAction.setBadgeBackgroundColor({ 'color': 'red' });
      }
      var tablist = new Array();
      for (i=0; i < tabs.length; i++){
          tablist.push({id: tabs[i].id, windowId: tabs[i].id, title: tabs[i].title})
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

        browser.browserAction.setBadgeText({ text: "before"});
        data = new Blob( [text], {type: 'text/plain'} );
        browser.browserAction.setBadgeText({ text: "after"});
        textFile = window.URL.createObjectURL(data);


        const fname= "kaneda-tmp/test.txt";

        try{
            browser.downloads.download({url: textFile, filename: fname, saveAs:false, conflictAction: "overwrite"}).then((id)=>{textlock = false;browser.browserAction.setBadgeText({ text: "done"});});
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
            updateCount(tabId, false);
        }
        );


updateCount();

var pattern = "http://www.184213072193821491204721904321.xyz/*";

function redirect(requestDetails) {
    console.log("Kaneda: " + requestDetails.url);
    // var reqArr = requestDetails.url.split("/");
    // var tabId = reqArr[3];

    // TODO #1 Close this tab
    // TODO #2 Focus correct window

    browser.tabs.query({})
        .then((tabs) => {
            let numId = tabs[5].id;
            browser.tabs.update(numId, { active: true });
            // if (type === OTHER_WINDOW_TAB_TYPE) {
            //   focusWindow(windowId);
            // }
            // window.close();
        });


    return {
        cancel: true
    };
};

browser.webRequest.onBeforeRequest.addListener(
        redirect,
        { urls: [pattern] },
        ["blocking"]
        );


