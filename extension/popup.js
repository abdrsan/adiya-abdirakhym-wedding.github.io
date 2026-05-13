const LOCAL = "http://127.0.0.1:8000/";
const PROD = "https://abdr-wedding.github.io/";

document.getElementById("open").addEventListener("click", () => {
  chrome.tabs.create({ url: LOCAL });
});

const prodLink = document.getElementById("prod");
prodLink.href = PROD;
prodLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: PROD });
});
