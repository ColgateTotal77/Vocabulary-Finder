const browserAPI = (typeof browser === 'undefined') ? chrome : browser;

function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
        browserAPI.runtime.sendMessage(message, (response) => {
            if (browserAPI.runtime.lastError) reject(browserAPI.runtime.lastError);
            else resolve(response);
        });
    });
}

const list = document.getElementById('list');
try {
    const words = await sendMessageAsync({ type: 'getAllWords' });

    if (!words || words.length === 0) list.innerHTML = '<li>No words yet</li>';
    else {
        words.sort((a, b) => b.count - a.count);
        for (const word of words) {
            list.innerHTML += `<li>${word.word} - ${word.count} - ${word.first_source}</li>`;
        }
    }

} catch (err) {
    console.error('Error loading words:', err);
    list.innerHTML = '<li>Failed to load words</li>';
}