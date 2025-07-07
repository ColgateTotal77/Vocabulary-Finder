import { openDB } from 'idb';

let dbPromiseInstance = null;
export function dbPromise() {
    if (!dbPromiseInstance) {
        dbPromiseInstance = openDB('vocab-db', 1, {
            upgrade(db) {
                db.createObjectStore('words', { keyPath: 'word' });
                db.createObjectStore('processed', { keyPath: 'url' });
            }
        });
    }
    return dbPromiseInstance;
}

export async function isAlreadyProcessed(url) {
    const db = await dbPromise();
    return !!(await db.get("processed", url));
}

export async function markAsProcessed(url) {
    const db = await dbPromise();
    await db.put('processed', { url, processed: true, timestamp: Date.now() });
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