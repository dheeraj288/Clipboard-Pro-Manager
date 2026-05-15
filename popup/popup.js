import {
  fetchClips,
  deleteClipApi,
  toggleFavoriteApi,
} from "../services/api.js";

/* ELEMENTS */
const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast");

/* STATE */
let data = [];
let currentFilter = "all";

/* ESCAPE HTML (SAFE CODE RENDER) */
function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* TYPE DETECTION */
function getType(text = "") {
  const trimmed = text.trim();

  const urlRegex = /(https?:\/\/[^\s]+)/i;
  if (urlRegex.test(trimmed)) return "link";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) return "text";

  const strongCodePatterns = [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /class\s+\w+/,
    /=>/,
    /console\./,
    /document\./,
    /chrome\./,
    /\{\s*[\s\S]*\}/,
  ];

  if (strongCodePatterns.some((p) => p.test(trimmed))) {
    return "code";
  }

  return "text";
}

/* TOAST */
function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1200);
}

/* SAFE TIME */
function safeTime(item) {
  return new Date(item.created_at || Date.now()).toLocaleString();
}

/* FILTER */
function filterData(items) {
  if (currentFilter === "all") return items;

  return items.filter(
    (item) => getType(item.content) === currentFilter
  );
}

/* SORT */
function sortData(items) {
  return [...items].sort((a, b) => {
    return (b.is_favorite === true) - (a.is_favorite === true);
  });
}

/* 🔥 SYNTAX HIGHLIGHT FUNCTION */
function highlightCode(code) {
  if (!window.Prism) {
    return escapeHtml(code);
  }

  const escaped = escapeHtml(code);
  return Prism.highlight(
    escaped,
    Prism.languages.javascript,
    "javascript"
  );
}

/* RENDER */
function render(items = []) {
  list.innerHTML = "";

  const finalData = filterData(sortData(items));

  if (!finalData.length) {
    list.innerHTML = `<div class="empty">No clips found 🚀</div>`;
    return;
  }

  finalData.forEach((item) => {
    const type = getType(item.content);

    const card = document.createElement("div");
    card.className = "card";

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = type.toUpperCase();

    const actions = document.createElement("div");
    actions.className = "actions";

    /* DELETE */
    const del = document.createElement("button");
    del.className = "icon-btn delete";
    del.innerHTML = "✕";
    del.onclick = async (e) => {
      e.stopPropagation();
      await handleDelete(item.id);
    };

    /* FAVORITE */
    const pin = document.createElement("button");
    pin.className = "icon-btn pin";
    pin.innerHTML = item.is_favorite ? "⭐" : "☆";
    pin.onclick = async (e) => {
      e.stopPropagation();
      await handleFavorite(item.id);
    };

    actions.append(del, pin);

    const content = document.createElement("div");

    /* CODE (🔥 PRISM HIGHLIGHT) */
    if (type === "code") {

      content.className = "content code";

      content.innerHTML = `
        <pre><code class="language-javascript">${escapeHtml(item.content)}</code></pre>
      `;

      // IMPORTANT: re-run Prism after DOM update
      setTimeout(() => {
        if (window.Prism) {
          Prism.highlightAll();
        }
      }, 0);
    }

    /* LINK */
    else if (type === "link") {
      content.className = "content";
      content.innerHTML = `
        <a href="${item.content}" target="_blank" class="clip-link">
          ${item.content}
        </a>
      `;
    }

    /* TEXT */
    else {
      content.className = "content";
      content.textContent = item.content;
    }

    const time = document.createElement("div");
    time.className = "time";
    time.textContent = safeTime(item);

    /* COPY */
    card.onclick = async () => {
      await navigator.clipboard.writeText(item.content);
      showToast();
    };

    card.append(badge, actions, content, time);
    list.appendChild(card);
  });
}

/* LOAD */
async function load() {
  try {
    const response = await fetchClips();
    data = Array.isArray(response) ? response : [];
    render(data);
  } catch (error) {
    console.error(error);
    list.innerHTML = `<div class="empty">Failed to load clips ❌</div>`;
  }
}

/* DELETE */
async function handleDelete(id) {
  await deleteClipApi(id);
  await load();
}

/* FAVORITE */
async function handleFavorite(id) {
  await toggleFavoriteApi(id);
  await load();
}

/* SEARCH */
let t = null;
search?.addEventListener("input", (e) => {
  clearTimeout(t);

  t = setTimeout(() => {
    const value = e.target.value.toLowerCase();

    const filtered = data.filter((item) =>
      item.content?.toLowerCase().includes(value)
    );

    render(filtered);
  }, 150);
});

/* TABS */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((b) => b.classList.remove("active"));

    tab.classList.add("active");

    currentFilter = tab.dataset.type;
    render(data);
  });
});

/* LIVE UPDATE */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "CLIP_UPDATED") {
    load();
  }
});

/* INIT */
load();