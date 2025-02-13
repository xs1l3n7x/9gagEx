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


    const forbiddenAccountAge = document.getElementById('forbiddenAccountAge').value.trim()

    // Save the data to Chrome's storage
    chrome.storage.sync.set({ forbiddenTitleWords, forbiddenTags, forbiddenAccountAge }, () => {
        console.log('Forbidden lists saved.');
    });

    // Send the data to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateForbiddenLists',
            forbiddenTitleWords,
            forbiddenTags,
            forbiddenAccountAge
        });
    });
});

// Load saved data when the popup opens
chrome.storage.sync.get(['forbiddenTitleWords', 'forbiddenTags', 'forbiddenAccountAge'], (data) => {
    if (data.forbiddenTitleWords) {
        document.getElementById('forbiddenTitleWords').value = data.forbiddenTitleWords.join(', ');
    }
    if (data.forbiddenTags) {
        document.getElementById('forbiddenTags').value = data.forbiddenTags.join(', ');
    }
    if (data.forbiddenAccountAge) {
        document.getElementById('forbiddenAccountAge').value = data.forbiddenAccountAge;
    }
});