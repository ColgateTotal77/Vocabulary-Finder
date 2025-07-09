import { openDB } from 'idb';
// import { lemmatize } from "./utils/lemmatize";

let dbPromiseInstance = null;
export function dbPromise() {
    if (dbPromiseInstance) return dbPromiseInstance;

    dbPromiseInstance = openDB('vocab-db', 1, {
        upgrade(db) {
            db.createObjectStore('words', { keyPath: 'word' });
            db.createObjectStore('processed', { keyPath: 'url' });
        }
    });
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
    const tx = db.transaction('words', 'readwrite');
    const existingWord = await tx.store.get(wordEntry.word);
    if (existingWord) {
        existingWord.count++;
        await tx.store.put(existingWord);
    } else {
        await tx.store.add({
            word: wordEntry.word,
            count: 1,
            first_source: wordEntry.source,
            hidden: false
        });
    }
    await tx.done;
}

export async function addOrUpdateWords(data) {
    const db = await dbPromise();
    const tx = db.transaction('words', 'readwrite');
    const source = data.source;

    for (const rawWord of data.words) {
        const word = rawWord;

        if (!word || word.length <= 2) continue;

        const existingWord = await tx.store.get(word);
        if (existingWord) {
            existingWord.count++;
            await tx.store.put(existingWord);
        } else {
            await tx.store.add({
                word: word,
                count: 1,
                first_source: source,
                hidden: false
            });
        }
    }

    await tx.done;
}

export async function getAllWords() {
    const db = await dbPromise();
    return db.getAll('words');
}

export async function deleteWord(word) {
    const db = await dbPromise();
    await db.delete('words', word);
}