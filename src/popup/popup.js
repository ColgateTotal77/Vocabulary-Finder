import { getAllWords } from '../../src/utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('list');
    const words = await getAllWords();

    if(words.length === 0) {
        list.innerHTML = '<li>No words yet</li>';
        return;
    }

    words.sort((a, b) => b.count - a.count);

    for (const word of words) {
        list.innerHTML += `<li>${word.word} - ${word.count} - ${word.first_source}</li>`;
    }
});