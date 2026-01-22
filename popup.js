const overrideBtn = document.getElementById("override-btn");
const passInput = document.getElementById("pass");
const overrideStatus = document.getElementById("override-status");
const viewLogBtn = document.getElementById("view-log");
const logStatus = document.getElementById("log-status");

const ADMIN_PASS = "Lacey26!"; // must match background.js

// Enable override
overrideBtn.onclick = () => {
  if (passInput.value === ADMIN_PASS) {
    chrome.storage.local.set({ override: true }, () => {
      overrideStatus.textContent = "Override enabled!";
    });
  } else {
    overrideStatus.textContent = "Incorrect password.";
  }
};

// View blocked log
viewLogBtn.onclick = () => {
  let log = JSON.parse(localStorage.getItem("blockedLog") || "[]");
  if (!log.length) {
    logStatus.textContent = "No blocked sites yet.";
    return;
  }
  alert(log.map(e => `${e.time} → ${e.url} (${e.category})`).join("\n"));
};