chrome.runtime.onMessage.addListener((msg) => {

  if (msg.type === "ADD") {

    chrome.storage.local.get(["clips"], (res) => {

      let clips = res.clips || [];

      clips = clips.filter(i => i.text !== msg.text);

      clips.unshift({
        id: Date.now(),
        text: msg.text,
        time: new Date().toLocaleString()
      });

      clips = clips.slice(0, 300);

      chrome.storage.local.set({ clips });

    });

  }

});