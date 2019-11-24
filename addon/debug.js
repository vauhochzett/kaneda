// Kaneda Debug

var nomsg = true;

function message(text) {
    if (nomsg){return}
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

var textlock = false;

function storeTabs(tabs){
    let i;
    text = "";
    //const line = (tabs[0].windowId + "," + tabs[0].id) //+ ",\'" + escape(tabs[0].title) + "\'\n");
    //message(line)

    for (i = 0; i < tabs.length; ++i){
        text += (tabs[i].windowId + "," + tabs[i].id + ",'" + escape(tabs[i].title) + "\n");
    }

    if (textlock){return}
    textlock = true;

    var data = new Blob( [text], {type: 'text/plain'} );
    const textFile = window.URL.createObjectURL(data);

    const fname= "kaneda-tmp/test.txt"

    try{
        browser.downloads.download({url: textFile, filename: fname, saveAs:false, conflictAction: "overwrite"}).then((id)=>{message("dlId: " + id);textlock = false;});
    }catch(err){
        message(err);
    }

    message("wrote at " + fname);
};

function doShit() {

    alert("test")
    message("twerk");

    message("outside" );
    try{
        message("doShit");
        browser.tabs.query({}).then(function queryTabs(tabs) {
            //let numId = tabs[5].id;
            //browser.tabs.update(numId, { active: true });
            storeTabs( tabs.slice());

            // if (type === OTHER_WINDOW_TAB_TYPE) {
            //   focusWindow(windowId);
            // }
            // window.close();
        });
    }catch(err){
        message(err)
    }
};

var id = -1;

function generateId(){
    if (id === -1){
        id = parseInt(Math.random()*1000)
    }
}
message("yo")

//document.onload(generateId)

document.getElementById("do-shit").onclick = doShit;
document.getElementById("clear-shit").onclick = clearMessages;

browser.tabs.onCreated.addListener(doShit);
browser.tabs.onUpdated.addListener(doShit);
browser.tabs.onRemoved.addListener(doShit)
browser.tabs.onReplaced.addListener(doShit)
