import { openDB } from 'idb';

export function dbPromise() {
    return openDB('vocab-db', 1, {
        upgrade(db) {
            db.createObjectStore('words', { keyPath: 'word' });
        }
    });
}

export async function addOrUpdateWord(wordEntry) {
    const db = await dbPromise();
    const existingWord = await db.get('words', wordEntry.word);
    console.log(wordEntry.word, " : : : ", existingWord);
    if (existingWord) {
        existingWord.count++;
        await db.put('words', existingWord);
    } else {
        await db.add('words', {
            word: wordEntry.word,
            count: 1,
            first_source: wordEntry.source,
            hidden: false
        });
    }
}

export async function getAllWords() {
    const db = await dbPromise();
    return db.getAll('words');
}

export async function deleteWord(word) {
    const db = await dbPromise();
    await db.delete('words', word);
}