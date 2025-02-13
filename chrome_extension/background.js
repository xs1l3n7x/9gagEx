// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("9gagEx installed and running in the background.");
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

// event handler for requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchData") {
    fetch(request.url, {
      
    })
      .then(response => response.text()) // Parse the response as text
      .then(html => sendResponse({ html: html })) // Send the HTML content
      .catch(error => sendResponse({ error: error.message }));
    return true; // Required to use async sendResponse
  }
});