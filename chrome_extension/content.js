// content.js
let forbiddenTitleWords = [];
let forbiddenTags = [];
let forbiddenAccountAge = 0;
let forbiddenUsers = new Map();
let removedPostCount = 0;
// Load saved data from Chrome's storage
chrome.storage.sync.get(['forbiddenTitleWords', 'forbiddenTags', 'forbiddenAccountAge'], (data) => {
    if (data.forbiddenTitleWords) {
        forbiddenTitleWords = data.forbiddenTitleWords;
    }
    if (data.forbiddenTags) {
        forbiddenTags = data.forbiddenTags;
    }
    if (data.forbiddenAccountAge) {
        forbiddenAccountAge = data.forbiddenAccountAge;
    }
    deleteArticlesWithForbiddenWords(); // Apply the loaded filters
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateForbiddenLists') {
        forbiddenTitleWords = message.forbiddenTitleWords;
        forbiddenTags = message.forbiddenTags;
        forbiddenAccountAge = message.forbiddenAccountAge;
        deleteArticlesWithForbiddenWords(); // Re-run the filtering function
    }
});

function deleteArticlesWithForbiddenWords() {
    const articles = document.querySelectorAll('article');
    const deletedArticles = [];

    articles.forEach((article) => {
        let shouldRemove = false;

        // get OP username
        const postAuthorElement = article.querySelector('.ui-post-creator__author');
        let usernameOP = null
        if (postAuthorElement) {
            usernameOP = postAuthorElement.textContent.trim()
            //console.log(usernameOP);
        }

        // make a request to the OP page to obtain accoutn age
        chrome.runtime.sendMessage({ action: "fetchData", url: "https://9gag.com/u/" + usernameOP }, (response) => {
            // i havent been able to parse the data correctly so REGEX
            const regex = /\\\"username\\\":\\\"(.*?)\\\".*?\\\"creationTs\\\":(\d+)/g;
            let matches;
            let results = [];
            let userMap = new Map(); // Use a Map instead of an array

            const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
            // i we got matches on the regex, parse the data
            while ((matches = regex.exec(response.html)) !== null) {
                const creationTs = parseInt(matches[2], 10);
                const accountAgeDays = Math.floor((currentTimestamp - creationTs) / (60 * 60 * 24)); // Convert seconds to days
                const username = matches[1]
                // check if user has enough age
                if (forbiddenAccountAge >= accountAgeDays) {
                    if (!userMap.has(username)) { // Prevent duplicates
                        // results.push({
                        //     username: username,
                        //     accountAge: accountAgeDays
                        // });
                        userMap.set(username, { username, accountAge: accountAgeDays });
                    }

                    // mark the post for removal

                }

            }
            forbiddenUsers = new Map([...forbiddenUsers, ...userMap]); // Overwrites duplicates
            //console.log(Array.from(forbiddenUsers.values()));

        });

        // if the list or map of forbidden users contains the current article author, remove it
        if (forbiddenUsers.has(usernameOP)){
            shouldRemove = true;
            console.log(`${usernameOP} removed due to age ${forbiddenUsers.get(usernameOP).accountAge}`)
        }
        // Check the article title
        const titleLink = article.querySelector('a[data-evt*="PostTitle"] h2');
        if (titleLink) {
            const titleText = titleLink.textContent.trim().toLowerCase();
            let wordCount = titleText.split(' ').length;

            // if (wordCount > 30) {
            //   shouldRemove = true;
            // }
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
            removedPostCount ++;
            console.log(removedPostCount + ' posts removed');
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


