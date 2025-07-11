import { openDB } from 'idb';
import { lemmatize } from "./lemmatize";

let dbPromiseInstance = null;
export function dbPromise() {
    if (dbPromiseInstance) return dbPromiseInstance;

    dbPromiseInstance = openDB('vocab-db', 1, {
        upgrade(db) {
            const wordsStore = db.createObjectStore('words', { keyPath: 'word' });
            wordsStore.createIndex('by_exception_and_count', ['exception', 'count']);
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

export async function addWords(data) {
    const db = await dbPromise();
    const tx = db.transaction('words', 'readwrite');
    const source = data.source;

    for (const rawWord of data.words) {
        const word = lemmatize(rawWord);

        if (!word || word.length <= 2) continue;

        const existingWord = await tx.store.get(word);
        if (existingWord) {
            existingWord.count++;
            if(existingWord.first_source === '') existingWord.first_source = source;
            await tx.store.put(existingWord);
        } else {
            await tx.store.add({
                word: word,
                count: 1,
                first_source: source,
                exception: 0
            });
        }
    }
    await tx.done;
}

export async function addExceptions(exceptions) {
    const db = await dbPromise();
    const tx = db.transaction('words', 'readwrite');

    for (const rawWord of exceptions) {
        const word = lemmatize(rawWord);

        if (!word || word.length <= 2) continue;

        const existingWord = await tx.store.get(word);
        if (existingWord) {
            existingWord.exception = 1;
            await tx.store.put(existingWord);
        } else {
            await tx.store.add({
                word: word,
                count: 1,
                first_source: '',
                exception: 1
            });
        }
    }
    await tx.done;
}

export async function deleteExceptions(exceptions) {
    const db = await dbPromise();
    const tx = db.transaction('words', 'readwrite');

    for (const word of exceptions) {
        const existingWord = await tx.store.get(word);
        if (existingWord) {
            existingWord.exception = 0;
            await tx.store.put(existingWord);
        }
    }
    await tx.done;
}

export async function getWordsChunk(limit, lastKey) {
    const db = await dbPromise();
    const tx = db.transaction('words', 'readonly');
    const index = tx.store.index('by_exception_and_count');

    const range = IDBKeyRange.bound([0, 0], [0, Infinity]);
    let cursor = await index.openCursor(range, 'prev');

    let skipped = false;

    if (lastKey && cursor) {
        while (cursor && !skipped) {
            if (cursor.primaryKey === lastKey) {
                skipped = true;
                cursor = await cursor.continue();
                break;
            }
            cursor = await cursor.continue();
        }
    }

    const results = [];
    while (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor = await cursor.continue();
    }

    return {
        words: results,
        nextKey: results.length > 0 ? results[results.length - 1].word : null,
        hasMore: cursor !== null
    };
}

export async function getExceptionChunk(limit, lastKey) {
    const db = await dbPromise();
    const tx = db.transaction('words', 'readonly');
    const index = tx.store.index('by_exception_and_count');

    const range = IDBKeyRange.bound([1, 0], [1, Infinity]);
    let cursor = await index.openCursor(range, 'prev');

    let skipped = false;

    if (lastKey && cursor) {
        while (cursor && !skipped) {
            if (cursor.primaryKey === lastKey) {
                skipped = true;
                cursor = await cursor.continue();
                break;
            }
            cursor = await cursor.continue();
        }
    }

    const results = [];
    while (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor = await cursor.continue();
    }

    return {
        exceptions: results,
        nextKey: results.length > 0 ? results[results.length - 1].word : null,
        hasMore: cursor !== null
    };
}

export async function clearDB() {
    const db = await dbPromise();
    const tx = db.transaction(['words', 'processed'], 'readwrite');
    await tx.objectStore('words').clear();
    await tx.objectStore('processed').clear();
    await tx.done;
}

export async function getExportWords(minCount, maxCount, withException = false) {
    const db = await dbPromise();
    const tx = db.transaction('words', 'readonly');
    const index = tx.store.index('by_exception_and_count');

    const result = [];

    const range0 = IDBKeyRange.bound([0, minCount], [0, maxCount]);
    let cursor = await index.openCursor(range0, 'prev');
    while (cursor) {
        result.push(cursor.value);
        cursor = await cursor.continue();
    }

    if(withException) {
        const range1 = IDBKeyRange.bound([1, minCount], [1, maxCount]);
        let cursor = await index.openCursor(range1, 'prev');
        while (cursor) {
            result.push(cursor.value);
            cursor = await cursor.continue();
        }
    }

    return {
        words: result
    };
}