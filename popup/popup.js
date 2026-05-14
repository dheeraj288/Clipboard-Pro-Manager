const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast");

let data = [];
let currentFilter = "all";

/* TYPE DETECT */
function getType(text) {
  const url = /(https?:\/\/[^\s]+)/;

  if (url.test(text)) return "link";
  if (text.includes("{") || text.includes("function") || text.includes("=>")) return "code";
  return "text";
}

/* TOAST */
function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1200);
}

/* FILTER */
function filterData(items) {
  if (currentFilter === "all") return items;
  return items.filter(i => getType(i.text) === currentFilter);
}

/* SORT (PIN FIRST) */
function sortData(items) {
  return items.sort((a, b) => (b.pinned === true) - (a.pinned === true));
}

/* RENDER */
function render(items) {
  list.innerHTML = "";

  const finalData = filterData(sortData(items));

  if (!finalData.length) {
    list.innerHTML = `<div class="empty">No clips found 🚀</div>`;
    return;
  }

  finalData.forEach(item => {

    const card = document.createElement("div");
    card.className = "card";

    const type = getType(item.text);

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = type.toUpperCase();

    const actions = document.createElement("div");
    actions.className = "actions";

    /* DELETE */
    const del = document.createElement("button");
    del.className = "icon-btn";
    del.innerHTML = "✕";

    del.onclick = (e) => {
      e.stopPropagation();
      deleteClip(item.id);
    };

    /* FAVORITE / PIN */
    const pin = document.createElement("button");
    pin.className = "icon-btn";
    pin.innerHTML = item.pinned ? "⭐" : "☆";

    pin.onclick = (e) => {
      e.stopPropagation();
      togglePin(item.id);
    };

    actions.appendChild(del);
    actions.appendChild(pin);

    /* CONTENT */
    const content = document.createElement("div");

    if (type === "code") {
      content.className = "content code";
      content.innerText = item.text; // IMPORTANT for code formatting
    } else if (type === "link") {
      content.className = "content";
      content.innerHTML = `<a href="${item.text}" target="_blank" class="clip-link">${item.text}</a>`;
    } else {
      content.className = "content";
      content.textContent = item.text;
    }

    const time = document.createElement("div");
    time.className = "time";
    time.textContent = item.time;

    /* COPY */
    card.onclick = async () => {
      await navigator.clipboard.writeText(item.text);
      showToast();
    };

    card.appendChild(badge);
    card.appendChild(actions);
    card.appendChild(content);
    card.appendChild(time);

    list.appendChild(card);
  });
}

/* LOAD */
function load() {
  chrome.storage.local.get(["clips"], (res) => {
    data = res.clips || [];
    render(data);
  });
}

/* ADD */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ADD") {

    chrome.storage.local.get(["clips"], (res) => {

      let clips = res.clips || [];

      clips = clips.filter(i => i.text !== msg.text);

      clips.unshift({
        id: Date.now(),
        text: msg.text,
        time: new Date().toLocaleString(),
        pinned: false
      });

      clips = clips.slice(0, 300);

      chrome.storage.local.set({ clips }, load);
    });
  }
});

/* DELETE */
function deleteClip(id) {
  chrome.storage.local.get(["clips"], (res) => {
    let clips = res.clips || [];
    clips = clips.filter(i => i.id !== id);
    chrome.storage.local.set({ clips }, load);
  });
}

/* PIN */
function togglePin(id) {
  chrome.storage.local.get(["clips"], (res) => {
    let clips = res.clips || [];

    clips = clips.map(i =>
      i.id === id ? { ...i, pinned: !i.pinned } : i
    );

    chrome.storage.local.set({ clips }, load);
  });
}

/* SEARCH */
search.addEventListener("input", (e) => {
  const v = e.target.value.toLowerCase();
  render(data.filter(i => i.text.toLowerCase().includes(v)));
});

/* TABS FIX */
document.getElementById("all").onclick = () => {
  currentFilter = "all";
  render(data);
};

document.getElementById("code").onclick = () => {
  currentFilter = "code";
  render(data);
};

document.getElementById("text").onclick = () => {
  currentFilter = "text";
  render(data);
};

document.getElementById("link").onclick = () => {
  currentFilter = "link";
  render(data);
};

load();