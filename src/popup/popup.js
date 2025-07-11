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
function scrollEventListener(list, isExceptionList = false, showCheckboxes = false) {
    list.addEventListener('scroll', async () => {
        const scrollTop = list.scrollTop;
        const scrollHeight = list.scrollHeight;
        const clientHeight = list.clientHeight;
        if ((scrollTop + clientHeight) / scrollHeight >= 0.8) {
            if(isLoading) return;

            isLoading = true;
            try {
                if (!isExceptionList && wordsHasMore) {
                    const { words, nextKey, hasMore} = (await sendMessageAsync({ type: 'getWordsChunk', data: { lastKey: wordsNextKey } }));
                    wordsNextKey = nextKey;
                    wordsHasMore = hasMore;
                    renderWords(words, list, showCheckboxes);
                }
                else if (isExceptionList && exceptionsHasMore) {
                    const { exceptions, nextKey, hasMore} = (await sendMessageAsync({ type: 'getExceptionChunk', data: { lastKey: exceptionsNextKey } }));
                    exceptionsNextKey = nextKey;
                    exceptionsHasMore = hasMore;
                    renderWords(exceptions, list, showCheckboxes);
                }

            } catch (err) {
                console.error('Error loading words:', err);
            } finally {
                isLoading = false;
            }
        }
    });
}

function showConfirmModal(onConfirm) {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('hidden');

    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');

    function closeModal() {
        modal.classList.add('hidden');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
    }

    function handleYes() {
        closeModal();
        onConfirm();
    }

    function handleNo() {
        closeModal();
    }

    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
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
        wordBlock.appendChild(wordSpan);
        if (showCheckboxes) {
            wordBlock.className = 'word-block';

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
const exceptionListContainer = document.getElementById('exception-list-container')
scrollEventListener(wordListContainer);
scrollEventListener(addExceptionListContainer, false, true);
scrollEventListener(exceptionListContainer, true, true);

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
        renderWords(exceptionsData, exceptionListContainer, true, true);
    } catch (err) {
        console.error('Error loading words:', err);
    }
}

await fullRenderWords();

let needToRender = false;

const moreBtn = document.getElementById('more');
const dropdown = document.getElementById('dropdown-menu');
const backBtn = document.getElementById('back');
backBtn.addEventListener('click', async () => {
    switchState('word-list');
    backBtn.classList.remove('active');
    tabName.textContent = "Saved words";
    if(needToRender) {
        await fullRenderWords();
        needToRender = false;
    }
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

    if(needToRender) {
        await fullRenderWords();
        needToRender = false;
    }
});
document.getElementById('add-exception-btn').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.word-checkbox:checked');
    const exceptions = Array.from(checkboxes).map(cb => cb.value);
    if (!exceptions || exceptions.length === 0) return;
    checkboxes.forEach(cb => cb.closest('.word-div').style.display = 'none' );
    const response = await sendMessageAsync({
        type: 'addExceptions',
        data: {
            exceptions: exceptions
        }
    });
    if (response.processed) needToRender = true;
});

document.getElementById('add-exception-manually').addEventListener('click', () => {
    switchState('add-exception-manually-window');
    backBtn.classList.add('active');
    tabName.textContent = "Add exception manually";
});
document.getElementById('add-exception-manually-btn').addEventListener('click', async () => {
    const addExceptionManuallyInput = document.getElementById('add-exception-manually-input');
    const text = addExceptionManuallyInput.value;

    const response = await sendMessageAsync({
        type: 'addExceptions',
        data: {
            exceptions: wordParser(text)
        }
    });
    addExceptionManuallyInput.value = '';
    if (response.processed) needToRender = true;
})

document.getElementById('list-of-exceptions').addEventListener('click', async () => {
    switchState('exception-list');
    backBtn.classList.add('active');
    tabName.textContent = "Exceptions";

    if(needToRender) {
        await fullRenderWords();
        needToRender = false;
    }
});
document.getElementById('delete-exceptions-btn').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.word-checkbox:checked');
    const exceptions = Array.from(checkboxes).map(cb => cb.value);
    checkboxes.forEach(cb => cb.closest('.word-div').style.display = 'none' );
    const response = await sendMessageAsync({
        type: 'deleteExceptions',
        data: {
            exceptions: exceptions
        }
    });
    if (response.processed) needToRender = true;
});

document.getElementById('clear-words').addEventListener('click', async () => {
    showConfirmModal(async () => {
        const response = await sendMessageAsync({ type: 'clearDB' });
        if(response.processed) await fullRenderWords();
    });
});

document.getElementById('export-words').addEventListener('click', () => {
    switchState('export-words-window');
    backBtn.classList.add('active');
    tabName.textContent = "Export";
});

document.getElementById('export-words-btn').addEventListener('click', async () => {
    const minCount = parseInt(document.getElementById('export-words-min-count').value, 10) || 0;
    const maxCount = parseInt(document.getElementById('export-words-max-count').value, 10) || Infinity;

    const response = await sendMessageAsync({
        type: 'getExportWords',
        data: {
            minCount: minCount,
            maxCount: maxCount,
        }
    });
    const words = response.words;

    if (!words || words.length === 0) {
        alert('No words found in the specified range.');
        return;
    }

    const wordsText = words.map(w => `${w.word} (${w.count})`).join('\n');

    const blob = new Blob([wordsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const now = new Date().toISOString();
    a.download = `exported_words_${now}.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 1000);
})