const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast");

let data = [];
let currentFilter = "all";

/* TYPE DETECTION */

function getType(text) {

  const trimmed = text.trim();

  /* 1. LINK (safe & correct) */
  const urlRegex = /(https?:\/\/[^\s]+)/i;

  if (urlRegex.test(trimmed)) {
    return "link";
  }

  /* 2. CODE (simple + practical) */
  const codeHints = [
    "function",
    "const ",
    "let ",
    "var ",
    "=>",
    "{",
    "}",
    "(",
    ")",
    ";",
    "console.",
    "document.",
    "chrome.",
    "xml.",
    "href =>",
    "class ",
    "def ",
    "end"
  ];

  const isCode = codeHints.some(hint =>
    text.includes(hint)
  );

  if (isCode) {
    return "code";
  }

  /* 3. DEFAULT TEXT */
  return "text";
}
/* TOAST */

function showToast() {

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1200);
}

/* FILTER */

function filterData(items) {

  if (currentFilter === "all") {
    return items;
  }

  return items.filter(item =>
    getType(item.text) === currentFilter
  );
}

/* SORT */

function sortData(items) {

  return [...items].sort(
    (a, b) =>
      (b.pinned === true) -
      (a.pinned === true)
  );
}

/* RENDER */

function render(items) {

  list.innerHTML = "";

  const finalData = filterData(
    sortData(items)
  );

  if (!finalData.length) {

    list.innerHTML = `
      <div class="empty">
        No clips found 🚀
      </div>
    `;

    return;
  }

  finalData.forEach(item => {

    const type = getType(item.text);

    /* CARD */

    const card = document.createElement("div");
    card.className = "card";

    /* BADGE */

    const badge = document.createElement("div");

    badge.className = "badge";

    badge.textContent =
      type.toUpperCase();

    /* ACTIONS */

    const actions =
      document.createElement("div");

    actions.className = "actions";

    /* DELETE BUTTON */

    const del =
      document.createElement("button");

    del.className =
      "icon-btn delete";

    del.innerHTML = "✕";

    del.onclick = (e) => {

      e.stopPropagation();

      deleteClip(item.id);
    };

    /* PIN BUTTON */

    const pin =
      document.createElement("button");

    pin.className =
      "icon-btn pin";

    pin.innerHTML =
      item.pinned ? "⭐" : "☆";

    pin.onclick = (e) => {

      e.stopPropagation();

      togglePin(item.id);
    };

    actions.append(del, pin);

    /* CONTENT */

    const content =
      document.createElement("div");

    /* CODE */

    if (type === "code") {

      content.className =
        "content code";

      /* IMPORTANT */

      content.textContent =
        item.text;

    }

    /* LINK */

    else if (type === "link") {

      content.className =
        "content";

      content.innerHTML = `
        <a
          href="${item.text}"
          target="_blank"
          class="clip-link"
        >
          ${item.text}
        </a>
      `;
    }

    /* TEXT */

    else {

      content.className =
        "content";

      content.textContent =
        item.text;
    }

    /* TIME */

    const time =
      document.createElement("div");

    time.className = "time";

    time.textContent =
      item.time;

    /* COPY */

    card.onclick = async () => {

      await navigator
        .clipboard
        .writeText(item.text);

      showToast();
    };

    /* APPEND */

    card.append(
      badge,
      actions,
      content,
      time
    );

    list.appendChild(card);
  });
}

/* LOAD */

function load() {

  chrome.storage.local.get(
    ["clips"],
    (res) => {

      data = res.clips || [];

      render(data);
    }
  );
}

/* DELETE */

function deleteClip(id) {

  chrome.storage.local.get(
    ["clips"],
    (res) => {

      let clips = res.clips || [];

      clips = clips.filter(
        item => item.id !== id
      );

      chrome.storage.local.set(
        { clips },
        load
      );
    }
  );
}

/* PIN */

function togglePin(id) {

  chrome.storage.local.get(
    ["clips"],
    (res) => {

      let clips = res.clips || [];

      clips = clips.map(item =>

        item.id === id
          ? {
              ...item,
              pinned: !item.pinned
            }
          : item
      );

      chrome.storage.local.set(
        { clips },
        load
      );
    }
  );
}

/* SEARCH */

search.addEventListener(
  "input",
  (e) => {

    const value =
      e.target.value.toLowerCase();

    const filtered = data.filter(
      item =>
        item.text
          .toLowerCase()
          .includes(value)
    );

    render(filtered);
  }
);

/* TABS */

document
  .querySelectorAll(".tab")
  .forEach(tab => {

    tab.onclick = () => {

      document
        .querySelectorAll(".tab")
        .forEach(btn =>
          btn.classList.remove("active")
        );

      tab.classList.add("active");

      currentFilter =
        tab.dataset.type;

      render(data);
    };
  });

/* LIVE UPDATE */

chrome.storage.onChanged.addListener(
  () => {
    load();
  }
);

/* INITIAL LOAD */

load();