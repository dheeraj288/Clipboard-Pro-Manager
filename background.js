chrome.runtime.onMessage.addListener((msg) => {

  if (msg.type === "SAVE") {

    chrome.storage.local.get(["history"], (res) => {

      let history = res.history || [];

      // remove duplicates
      history = history.filter(i => i.text !== msg.text);

      history.unshift({
        id: Date.now(),
        text: msg.text,
        time: new Date().toLocaleString()
      });

      history = history.slice(0, 200);

      chrome.storage.local.set({ history });

    });

  }

});
