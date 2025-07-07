const browserAPI = (typeof browser === 'undefined') ? chrome : browser;

function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
        browserAPI.runtime.sendMessage(message, (response) => {
            if (browserAPI.runtime.lastError) {
                console.log('Error:', browserAPI.runtime.lastError);
                reject(browserAPI.runtime.lastError);
            }
            else resolve(response);
        });
    });
}

const list = document.getElementById('list');
try {
    const response = await sendMessageAsync({ type: 'getAllWords' });
    const words = response.words;

    if (!words || words.length === 0) {
        list.innerHTML = '<div class="word-div">No words yet</div>';
    }

    words.sort((a, b) => b.count - a.count);

    for (const word of words) {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-div';

        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.textContent = `${word.word} (${word.count})`;

        const meta = document.createElement('div');
        meta.className = 'meta';

        const urlLink = document.createElement('a');
        urlLink.className = 'url';
        urlLink.href = word.first_source;
        urlLink.target = '_blank';
        urlLink.title = word.first_source;

        const cleanUrl = word.first_source.replace(/^https?:\/\//, '');
        urlLink.textContent = cleanUrl.length > 40 ? cleanUrl.slice(0, 40) + '…' : cleanUrl;

        meta.appendChild(urlLink);

        wordDiv.appendChild(wordSpan);
        wordDiv.appendChild(meta);
        list.appendChild(wordDiv);
    }
} catch (err) {
    console.error('Error loading words:', err);
    list.innerHTML = '<li>Failed to load words</li>';
}