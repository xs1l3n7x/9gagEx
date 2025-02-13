// content.js
let forbiddenTitleWords = [];
let forbiddenTags = [];

// Load saved data from Firefox's storage (browser API)
browser.storage.sync.get(['forbiddenTitleWords', 'forbiddenTags']).then((data) => {
  if (data.forbiddenTitleWords) {
    forbiddenTitleWords = data.forbiddenTitleWords;
  }
  if (data.forbiddenTags) {
    forbiddenTags = data.forbiddenTags;
  }
  deleteArticlesWithForbiddenWords(); // Apply the loaded filters
});

// Listen for messages from the popup
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateForbiddenLists') {
    forbiddenTitleWords = message.forbiddenTitleWords;
    forbiddenTags = message.forbiddenTags;
    deleteArticlesWithForbiddenWords(); // Re-run the filtering function
  }
});

function deleteArticlesWithForbiddenWords() {
  const articles = document.querySelectorAll('article');
  const deletedArticles = [];

  articles.forEach((article) => {
    let shouldRemove = false;

    // Check the article title
    const titleLink = article.querySelector('a[data-evt*="PostTitle"] h2');
    if (titleLink) {
      const titleText = titleLink.textContent.trim().toLowerCase();
      let wordCount = titleText.split(' ').length;

      // Check if the title contains any forbidden words
      const containsForbiddenTitleWord = forbiddenTitleWords.some((word) =>
        titleText.includes(word.toLowerCase())
      );

      if (containsForbiddenTitleWord) {
        shouldRemove = true;
      }
    }

    // Check the <div class="post-tags"> for forbidden tags
    const postTagsDiv = article.querySelector('div.post-tags');
    if (postTagsDiv) {
      const tagLinks = postTagsDiv.querySelectorAll('a');
      for (const link of tagLinks) {
        const tagText = link.textContent.trim().toLowerCase();
        if (forbiddenTags.includes(tagText)) {
          shouldRemove = true; // Article contains a forbidden tag
          break; // No need to check further
        }
      }
    }

    // If the article should be removed, add it to the results and remove it from the DOM
    if (shouldRemove) {
      deletedArticles.push({
        title: titleLink ? titleLink.textContent.trim() : 'No Title',
      });

      article.remove();
    }
  });

  return deletedArticles;
}

// Run the function initially
deleteArticlesWithForbiddenWords();

// Observe DOM changes to continuously remove articles
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      deleteArticlesWithForbiddenWords();
    }
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });
