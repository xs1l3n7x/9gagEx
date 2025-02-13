// Use `browser` namespace instead of `chrome` for better Firefox compatibility
browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed and running in the background.");
});

// Listen for tab updates (e.g., page load or navigation)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Inject the content script to remove articles
    browser.scripting.executeScript({
      target: { tabId: tabId },
      function: deleteArticlesWithForbiddenWords
    }).catch((error) => {
      console.error("Failed to execute script:", error);
    });
  }
});