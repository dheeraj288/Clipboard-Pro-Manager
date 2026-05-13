console.log("Clipboard Pro Loaded");

document.addEventListener("copy", () => {

  setTimeout(() => {

    const text = window.getSelection()?.toString()?.trim();

    if (!text) return;

    chrome.runtime.sendMessage({
      type: "ADD",
      text
    });

  }, 0);

});