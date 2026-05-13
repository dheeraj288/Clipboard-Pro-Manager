const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast"); // 👈 ADD THIS

let data = [];

/* detect code */
function isCode(text) {
  return text.includes("{") ||
         text.includes("function") ||
         text.includes("=>") ||
         text.includes(";") ||
         text.includes("\n");
}

/* 🔥 TOAST FUNCTION (ADD THIS) */
function showToast() {
  if (!toast) return;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

/* render UI */
function render(items) {

  list.innerHTML = "";

  items.forEach(item => {

    const div = document.createElement("div");
    div.className = "card";

    const content = isCode(item.text)
      ? `<div class="code">${item.text}</div>`
      : `<div>${item.text}</div>`;

    div.innerHTML = `
      ${content}
      <div class="time">${item.time}</div>
    `;

    /* 🔥 COPY + TOAST */
    div.onclick = async () => {
      try {
        await navigator.clipboard.writeText(item.text);
        showToast(); // 👈 ADD THIS
      } catch (err) {
        console.log(err);
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

  render(
    data.filter(i => i.text.toLowerCase().includes(val))
  );

});