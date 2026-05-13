const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast");

let data = [];

/* detect code */
function isCode(text) {
  return (
    text.includes("{") ||
    text.includes("function") ||
    text.includes("class") ||
    text.includes("=>") ||
    text.includes("\n") ||
    text.includes(";")
  );
}

/* toast */
function showToast() {
  if (!toast) return;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1200);
}

/* render UI */
function render(items) {

  list.innerHTML = "";

  items.forEach(item => {

    const div = document.createElement("div");
    div.className = "card";

    const content = document.createElement("div");

    if (isCode(item.text)) {
      content.className = "code";
      content.textContent = item.text; // preserve formatting
    } else {
      content.textContent = item.text;
    }

    const time = document.createElement("div");
    time.className = "time";
    time.textContent = item.time;

    div.appendChild(content);
    div.appendChild(time);

    div.addEventListener("click", async () => {
      await navigator.clipboard.writeText(item.text);
      showToast();
    });

    list.appendChild(div);
  });
}

/* load data (IMPORTANT: clips use karo) */
function loadData() {
  chrome.storage.local.get(["clips"], (res) => {
    data = res.clips || [];
    render(data);
  });
}

loadData();

/* search */
search.addEventListener("input", (e) => {

  const val = e.target.value.toLowerCase();

  render(
    data.filter(i =>
      i.text.toLowerCase().includes(val)
    )
  );

});