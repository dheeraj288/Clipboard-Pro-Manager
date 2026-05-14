console.log("Clipboard Pro Loaded");

document.addEventListener("copy", () => {
  setTimeout(() => {
    const text = window.getSelection()?.toString()?.trim();
    if (!text) return;

    if (text.length < 1) return;

    chrome.runtime.sendMessage({
      type: "ADD",
      text
    });
  }, 50);
});