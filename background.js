const runtime = typeof browser !== "undefined" ? browser.runtime : chrome.runtime;
const storage = chrome.storage.local;

// ---- CONFIG ----
let config = {
  override: false,
  adminPassword: "Lacey26!"
};

// ---- BLOCKLIST ----
const PASTEBIN_URL = "https://pastebin.com/raw/G9JZvNCb"; // Replace with your raw Pastebin link
let rules = {};
let REASONS = {};

// Fetch Pastebin and parse categories
async function loadBlocklist() {
  let text = await fetch(PASTEBIN_URL).then(r => r.text());
  rules = {};
  REASONS = {};
  let currentCategory = "misc";
  text.split("\n").forEach(line => {
    line = line.trim();
    if (!line || line.startsWith("#")) {
      if (line.startsWith("# category:")) {
        currentCategory = line.split(":")[1].trim();
        if (!REASONS[currentCategory]) REASONS[currentCategory] = currentCategory;
        if (!rules[currentCategory]) rules[currentCategory] = [];
      }
      return;
    }
    if (!rules[currentCategory]) rules[currentCategory] = [];
    rules[currentCategory].push(line);
  });
}

// Match URL to category
function matchCategory(url) {
  for (let cat in rules) {
    for (let rule of rules[cat]) {
      let regex = new RegExp(rule.replace(/\*/g, ".*"), "i");
      if (regex.test(url)) return cat;
    }
  }
  return null;
}

// Block listener
chrome.webRequest.onBeforeRequest.addListener(
  details => {
    if (config.override) return {};

    let category = matchCategory(details.url);
    if (category) {
      let log = JSON.parse(localStorage.getItem("blockedLog") || "[]");
      log.push({ url: details.url, time: new Date().toISOString(), category });
      localStorage.setItem("blockedLog", JSON.stringify(log));

      return {
        redirectUrl: runtime.getURL("block.html") +
                     "?url=" + encodeURIComponent(details.url) +
                     "&reason=" + encodeURIComponent(REASONS[category])
      };
    }
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Load Pastebin initially
loadBlocklist();

// Optional: refresh every 10 minutes
setInterval(loadBlocklist, 10*60*1000);