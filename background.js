console.log("Background Running");

/* INSTALL */

chrome.runtime.onInstalled.addListener(() => {

  chrome.storage.local.get(["clips"], (res) => {

    if (!res.clips) {
      chrome.storage.local.set({
        clips: []
      });
    }
  });
});

/* MESSAGE HANDLER */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === "ADD") {

    chrome.storage.local.get(["clips"], (res) => {

      let clips = res.clips || [];

      /* REMOVE DUPLICATE */

      clips = clips.filter(item =>
        item.text !== msg.text
      );

      /* ADD NEW */

      clips.unshift({
        id: Date.now(),
        text: msg.text,
        time: new Date().toLocaleString(),
        pinned: false
      });

      /* LIMIT */

      clips = clips.slice(0, 300);

      chrome.storage.local.set({ clips }, () => {

        sendResponse({
          success: true
        });
      });
    });

    return true;
  }
});