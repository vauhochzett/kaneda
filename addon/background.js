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
    });
}


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
