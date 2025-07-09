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

function renderWords(words, list, showCheckboxes = false) {
    list.innerHTML = '';

    words.sort((a, b) => b.count - a.count);

    for (const word of words) {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-div';

        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.textContent = `${word.word} (${word.count})`;

        const wordBlock = document.createElement('div');
        wordBlock.className = 'word-block';
        wordBlock.appendChild(wordSpan);

        if (showCheckboxes) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'word-checkbox';
            checkbox.value = word.word;
            wordBlock.appendChild(checkbox);
        }

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

        wordDiv.appendChild(wordBlock);
        wordDiv.appendChild(meta);
        list.appendChild(wordDiv);
    }
}

const wordListContainer = document.getElementById('word-list-container');
try {
    const response = await sendMessageAsync({ type: 'getAllWords' });
    const words = response.words;

    if (!words || words.length === 0) wordListContainer.innerHTML = '<div class="word-div">No words yet</div>';
    else renderWords(words, wordListContainer);
} catch (err) {
    console.error('Error loading words:', err);
    wordListContainer.innerHTML = '<div>Failed to load words</div>';
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

document.getElementById('add-exceptions').addEventListener('click', async () => {
    switchState('add-exception-list');
    backBtn.classList.add('active');
    const addExceptionListContainer = document.getElementById('add-exception-list-container')
    try {
        const response = await sendMessageAsync({ type: 'getAllWords' });
        const words = response.words;

        if (!words || words.length === 0) addExceptionListContainer.innerHTML = '<div class="word-div">No words yet</div>';
        else renderWords(words, addExceptionListContainer, true);
    } catch (err) {
        console.error('Error loading words:', err);
        addExceptionListContainer.innerHTML = '<div>Failed to load words</div>';
    }

    tabName.textContent = "Saved words";
});

document.getElementById('add-exception-manually').addEventListener('click', () => {
    switchState('add-exception-manually-window');
    backBtn.classList.add('active');
    tabName.textContent = "Add exception manually";
});

document.getElementById('list-of-exceptions').addEventListener('click', async () => {
    switchState('exception-list');
    backBtn.classList.add('active');
    const exceptionList = document.getElementById('exception-list')

    try {
        const response = await sendMessageAsync({ type: 'getAllExceptions' });
        const words = response.exceptions;

        if (!words || words.length === 0) exceptionList.innerHTML = '<div class="word-div">No exceptions yet</div>';
        else renderWords(words, exceptionList, true);
    } catch (err) {
        console.error('Error loading words:', err);
        exceptionList.innerHTML = '<div>Failed to load words</div>';
    }
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