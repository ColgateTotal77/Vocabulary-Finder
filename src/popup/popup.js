import { wordParser } from "./utils/wordParser";

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

let isLoading = false;
function scrollEventListener(list, isExceptionList) {
    list.addEventListener('scroll', async () => {
        const scrollTop = list.scrollTop;
        const scrollHeight = list.scrollHeight;
        const clientHeight = list.clientHeight;
        if ((scrollTop + clientHeight) / scrollHeight >= 0.8) {
            if(isLoading) return;

            isLoading = true;
            try {
                if (isExceptionList && exceptionsHasMore) {
                    const { words, nextKey, hasMore} = (await sendMessageAsync({ type: 'getExceptionChunk', data: { lastKey: exceptionsNextKey } }));
                    exceptionsNextKey = nextKey;
                    exceptionsHasMore = hasMore;
                    renderWords(words, list, true);
                }
                else if (wordsHasMore) {
                    const { words, nextKey, hasMore} = (await sendMessageAsync({ type: 'getWordsChunk', data: { lastKey: wordsNextKey } }));
                    wordsNextKey = nextKey;
                    wordsHasMore = hasMore;
                    renderWords(words, list, false);
                }
            } catch (err) {
                console.error('Error loading words:', err);
            } finally {
                isLoading = false;
            }
        }
    });
}

function renderWords(wordsArray, list, showCheckboxes = false, rerender = false) {
    if (rerender) {
        list.innerHTML = '';
        if (!wordsArray || wordsArray.length === 0) list.innerHTML = '<div class="word-div">No words yet</div>';
        if(list.innerHTML !== '') return;
    }

    for (const word of wordsArray) {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-div';

        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.textContent = `${word.word} (${word.count})`;

        const wordBlock = document.createElement('label');
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

        if(word.first_source) {
            const urlLink = document.createElement('a');
            urlLink.className = 'url';
            urlLink.href = word.first_source;
            urlLink.target = '_blank';
            urlLink.title = word.first_source;
            const cleanUrl = word.first_source.replace(/^https?:\/\//, '');
            urlLink.textContent = cleanUrl.length > 40 ? cleanUrl.slice(0, 40) + '…' : cleanUrl;
            meta.appendChild(urlLink);
        }

        wordDiv.appendChild(wordBlock);
        wordDiv.appendChild(meta);
        list.appendChild(wordDiv);
    }
}

const wordListContainer = document.getElementById('word-list-container');
const addExceptionListContainer = document.getElementById('add-exception-list-container')
const exceptionList = document.getElementById('exception-list')
scrollEventListener(wordListContainer, false);
scrollEventListener(addExceptionListContainer, true);
scrollEventListener(exceptionList, true);

let wordsNextKey = null;
let exceptionsNextKey = null;
let wordsHasMore = true;
let exceptionsHasMore = true;

async function fullRenderWords() {
    try {
        const wordsResponse = await sendMessageAsync({ type: 'getWordsChunk' });
        const exceptionsResponse = await sendMessageAsync({ type: 'getExceptionChunk' });

        const words = wordsResponse.words;
        const exceptionsData = exceptionsResponse.exceptions;

        wordsNextKey = wordsResponse.nextKey;
        exceptionsNextKey = exceptionsResponse.nextKey;
        wordsHasMore = wordsResponse.hasMore;
        exceptionsHasMore = exceptionsResponse.hasMore;

        renderWords(words, wordListContainer, false,true);
        renderWords(words, addExceptionListContainer, true, true);
        renderWords(exceptionsData, exceptionList, true, true);
    } catch (err) {
        console.error('Error loading words:', err);
    }
}

await fullRenderWords();

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
    tabName.textContent = "Saved words";
});
document.getElementById('add-exception-btn').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.word-checkbox:checked');
    const exceptions = Array.from(checkboxes).map(cb => cb.value);
    if (!exceptions || exceptions.length === 0) return;

    const response = await sendMessageAsync({
        type: 'addExceptions',
        data: {
            exceptions: exceptions
        }
    });
    if (response.processed) await fullRenderWords();
});

document.getElementById('add-exception-manually').addEventListener('click', () => {
    switchState('add-exception-manually-window');
    backBtn.classList.add('active');
    tabName.textContent = "Add exception manually";
});
document.getElementById('add-exception-manually-btn').addEventListener('click', async () => {
    const text = document.getElementById('add-exception-manually-input').value;

    const response = await sendMessageAsync({
        type: 'addExceptions',
        data: {
            exceptions: wordParser(text)
        }
    });
    if (response.processed) await fullRenderWords();
})

document.getElementById('list-of-exceptions').addEventListener('click', async () => {
    switchState('exception-list');
    backBtn.classList.add('active');
    tabName.textContent = "Exceptions";
});
// document.getElementById('delete-exceptions-btn').addEventListener('click', () => {
//     const checkboxes = document.querySelectorAll('.word-checkbox:checked');
//     const exceptions = Array.from(checkboxes).map(cb => cb.value);
//     checkboxes.forEach(cb => {
//         const wordDiv = cb.closest('.word-div');
//         if (wordDiv) wordDiv.style.display = 'none';
//     });
// });

document.getElementById('clear-words').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all words?")) {
    }
});

document.getElementById('export-words').addEventListener('click', () => {
    switchState('export-words-window');
    backBtn.classList.add('active');
    tabName.textContent = "Export";
});