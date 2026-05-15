console.log("Clipboard Pro Content Script Loaded");

/* GLOBAL STATE (prevents duplicate spam) */
let lastCopiedText = "";
let lastCopiedTime = 0;

/* CONFIG */
const COPY_COOLDOWN = 1200;

/* SAFE COPY HANDLER */
function handleCopy() {
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";

    if (!text) return;

    const now = Date.now();

    /* BLOCK DUPLICATE COPY */
    if (
      text === lastCopiedText &&
      now - lastCopiedTime < COPY_COOLDOWN
    ) {
      return;
    }

    lastCopiedText = text;
    lastCopiedTime = now;

    console.log("COPIED:", text);

    chrome.runtime.sendMessage(
      {
        type: "ADD",
        text,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Runtime Error:", chrome.runtime.lastError);
        }
      }
    );
  }, 80);
}

/* COPY EVENT */
document.addEventListener("copy", handleCopy);

/* EXTRA SAFETY: selection change reset (edge fix) */
document.addEventListener("selectionchange", () => {
  const text = window.getSelection()?.toString()?.trim();

  if (!text) {
    lastCopiedText = "";
  }
});