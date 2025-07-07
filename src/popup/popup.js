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
    const words = await sendMessageAsync({ type: 'getAllWords' });

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
        urlLink.textContent = word.first_source.replace(/^https?:\/\//, '').slice(0, 20) + word.first_source.length > 40 ? '…' : '';

        meta.appendChild(urlLink);

        wordDiv.appendChild(wordSpan);
        wordDiv.appendChild(meta);
        list.appendChild(wordDiv);
    }
} catch (err) {
    console.error('Error loading words:', err);
    list.innerHTML = '<li>Failed to load words</li>';
}