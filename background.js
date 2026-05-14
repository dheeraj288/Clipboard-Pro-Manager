console.log("Clipboard Pro background service worker running");

// Install event (first time extension install hota hai)
chrome.runtime.onInstalled.addListener(() => {
  console.log("Clipboard Pro installed successfully");

  // optional: initialize storage
  chrome.storage.local.get(["clips"], (res) => {
    if (!res.clips) {
      chrome.storage.local.set({ clips: [] });
    }
  });
});

// Message handler (future-proof)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // ADD CLIP (optional central handling)
  if (msg.type === "ADD") {

    chrome.storage.local.get(["clips"], (res) => {

      let clips = res.clips || [];

      // avoid duplicates
      clips = clips.filter(item => item.text !== msg.text);

      // add new clip
      clips.unshift({
        id: Date.now(),
        text: msg.text,
        time: new Date().toLocaleString()
      });

      // limit storage
      clips = clips.slice(0, 300);

      chrome.storage.local.set({ clips }, () => {
        sendResponse({ success: true });
      });

    });

    return true; // async response fix
  }

  // CLEAR ALL CLIPS (future feature ready)
  if (msg.type === "CLEAR_ALL") {
    chrome.storage.local.set({ clips: [] }, () => {
      sendResponse({ success: true });
    });

    return true;
  }

});