const browserAPI = (typeof browser === 'undefined') ? chrome : browser;

let curState = 'word-list';
const tabName = document.getElementById('tab-name');
function switchState(newState) {
    document.getElementById(curState).classList.remove('active')
    curState = newState;
    document.getElementById(curState).classList.add('active');
}

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

const wordListContainer = document.getElementById('word-list-container');

try {
    const response = await sendMessageAsync({ type: 'getAllWords' });
    const words = response.words;

    if (!words || words.length === 0) {
        wordListContainer.innerHTML = '<div class="word-div">No words yet</div>';
    }
    else wordListContainer.innerHTML = '';

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
        wordListContainer.appendChild(wordDiv);
    }
} catch (err) {
    console.error('Error loading words:', err);
    wordListContainer.innerHTML = '<li>Failed to load words</li>';
}

const moreBtn = document.getElementById('more');
const dropdown = document.getElementById('dropdown-menu');

const backBtn = document.getElementById('back');

backBtn.addEventListener('click', () => {
    switchState('word-list');
    backBtn.classList.remove('active');
    tabName.textContent = "Saved words";
})

document.addEventListener('click', (e) => {
    if (moreBtn.contains(e.target)) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    } else {
        dropdown.style.display = 'none';
    }
});

document.getElementById('add-exceptions').addEventListener('click', () => {
    switchState('add-exception-list');
    backBtn.classList.add('active');
    tabName.textContent = "Saved words";
});

document.getElementById('add-exception-manually').addEventListener('click', () => {
    switchState('add-exception-manually-window');
    backBtn.classList.add('active');
    tabName.textContent = "Add exception manually";
});

document.getElementById('list-of-exceptions').addEventListener('click', () => {
    switchState('exception-list');
    backBtn.classList.add('active');
    tabName.textContent = "Exceptions";
});

document.getElementById('clear-words').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all words?")) {
    }
});

document.getElementById('export-words').addEventListener('click', () => {
    switchState('export-words-window');
    backBtn.classList.add('active');
    tabName.textContent = "Export";
});