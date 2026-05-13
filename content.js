const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast");

let data = [];

/* better code detection */
function isCode(text = "") {
  return (
    text.includes("{") ||
    text.includes("function") ||
    text.includes("=>") ||
    text.includes(";") ||
    text.includes("\n") ||
    text.length > 80
  );
}

/* toast function */
function showToast() {
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

/* render UI */
function render(items = []) {

  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = `<div style="opacity:0.6;font-size:13px;">No clipboard history</div>`;
    return;
  }

  items.forEach(item => {

    const div = document.createElement("div");
    div.className = "card";

    const content = isCode(item.text)
      ? `<div class="code">${item.text}</div>`
      : `<div>${item.text}</div>`;

    div.innerHTML = `
      ${content}
      <div class="time">${item.time || "Unknown time"}</div>
    `;

    div.onclick = async () => {
      try {
        await navigator.clipboard.writeText(item.text);
        showToast();
      } catch (err) {
        console.log("Copy failed:", err);
      }
    };

    list.appendChild(div);
  });
}

/* load data */
chrome.storage.local.get(["history"], (res) => {
  data = res.history || [];
  render(data);
});

/* search */
search.addEventListener("input", (e) => {

  const val = e.target.value.toLowerCase();

  const filtered = data.filter(i =>
    (i.text || "").toLowerCase().includes(val)
  );

  render(filtered);
});