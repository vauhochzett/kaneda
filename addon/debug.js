// Kaneda Debug

function message(text) {
    let messagesList = document.getElementById("messages-list");
    let msg = document.createElement("p");
    msg.textContent = text;
    messagesList.appendChild(msg);
};

function clearMessages() {
    let messagesList = document.getElementById("messages-list");
    while (messagesList.childElementCount > 0) {
        messagesList.removeChild(messagesList.children[0]);
    }
}

function doShit() {
    browser.tabs.query({})
        .then((tabs) => {
            let numId = tabs[5].id;
            browser.tabs.update(numId, { active: true });
            // if (type === OTHER_WINDOW_TAB_TYPE) {
            //   focusWindow(windowId);
            // }
            // window.close();
        });
};

document.getElementById("do-shit").onclick = doShit;
document.getElementById("clear-shit").onclick = clearMessages;
