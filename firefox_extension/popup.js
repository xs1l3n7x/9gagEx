// popup.js
document.getElementById('applyButton').addEventListener('click', () => {
  // Get input values
  const forbiddenTitleWords = document.getElementById('forbiddenTitleWords').value
    .split(',')
    .map(word => word.trim().toLowerCase())
    .filter(word => word.length > 0);

  const forbiddenTags = document.getElementById('forbiddenTags').value
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0);

  // Save the data to Firefox's storage (browser API)
  browser.storage.sync.set({ forbiddenTitleWords, forbiddenTags }).then(() => {
    console.log('Forbidden lists saved.');
  });

  // Send the data to the content script
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      action: 'updateForbiddenLists',
      forbiddenTitleWords,
      forbiddenTags
    });
  });
});

// Load saved data when the popup opens
browser.storage.sync.get(['forbiddenTitleWords', 'forbiddenTags']).then((data) => {
  if (data.forbiddenTitleWords) {
    document.getElementById('forbiddenTitleWords').value = data.forbiddenTitleWords.join(', ');
  }
  if (data.forbiddenTags) {
    document.getElementById('forbiddenTags').value = data.forbiddenTags.join(', ');
  }
});
