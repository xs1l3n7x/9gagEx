// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed and running in the background.");
  });
  
  // Listen for tab updates (e.g., page load or navigation)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      // Inject the content script to remove articles
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: deleteArticlesWithForbiddenWords
      });
    }
  });