console.log("Background Running");

/* API CONFIG */
const API_BASE_URL = "http://localhost:3000/api/v1";

const TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.XzMXe6mosyQyDkynFFqMXpggArBY8q9qrErV_OuVbgk";

/* GLOBAL DEBOUNCE STORE (FIX FOR MULTI COPY ISSUE) */
const recentClips = new Map();

/* CHECK DUPLICATE (GLOBAL LEVEL) */
function isDuplicate(text) {
  const now = Date.now();

  if (recentClips.has(text)) {
    const lastTime = recentClips.get(text);

    if (now - lastTime < 2000) {
      return true;
    }
  }

  recentClips.set(text, now);
  return false;
}

/* SYNC TO SERVER */
async function syncClipToServer(text) {
  try {
    const response = await fetch(`${API_BASE_URL}/clips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        clip: {
          title: text.substring(0, 20),
          content: text,
          source: "chrome-extension",
          copied_at: new Date().toISOString(),
          is_favorite: false,
        },
      }),
    });

    const data = await response.json();
    console.log("SYNCED:", data);
  } catch (error) {
    console.error("SYNC ERROR:", error);
  }
}

/* INJECT CONTENT SCRIPT */
async function injectContentScript() {
  const tabs = await chrome.tabs.query({});

  for (const tab of tabs) {
    if (
      tab.url &&
      (tab.url.startsWith("http://") ||
        tab.url.startsWith("https://"))
    ) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });

        console.log("Injected into:", tab.id);
      } catch (error) {
        // ignore invalid tabs
      }
    }
  }
}

injectContentScript();

/* MESSAGE HANDLER */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ADD") {
    if (!msg.text) return;

    /* GLOBAL DUPLICATE PREVENTION */
    if (isDuplicate(msg.text)) {
      sendResponse({ success: false, duplicate: true });
      return;
    }

    chrome.storage.local.get(["clips"], (res) => {
      let clips = res.clips || [];

      /* remove duplicates */
      clips = clips.filter((i) => i.text !== msg.text);

      /* add new */
      clips.unshift({
        id: Date.now(),
        text: msg.text,
        time: new Date().toLocaleString(),
        pinned: false,
      });

      clips = clips.slice(0, 300);

      chrome.storage.local.set({ clips }, async () => {
        await syncClipToServer(msg.text);

        chrome.runtime.sendMessage({
          type: "CLIP_UPDATED",
        });

        sendResponse({ success: true });
      });
    });

    return true;
  }
});