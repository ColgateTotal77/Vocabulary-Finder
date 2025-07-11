import {
    getWordsChunk,
    getExceptionChunk,
    addWords,
    addExceptions,
    deleteExceptions,
    isAlreadyProcessed,
    markAsProcessed,
    clearDB,
    getExportWords
} from "./utils/storage";

const browserAPI = (typeof browser === 'undefined') ? chrome : browser;

browserAPI.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.type === 'isAlreadyProcessed') {
        (async () => {
            try {
                const processed = await isAlreadyProcessed(msg.data.url);
                sendResponse({ processed });
            }
            catch (err) {
                console.error(err);
                sendResponse({ processed: false });
            }
        })();

        return true;
    }

    else if (msg.type === 'addWords') {
        (async () => {
            try {
                console.log('[DB] Saving ', msg.data.words);
                await addWords(msg.data);
                await markAsProcessed(msg.data.source);
            } catch (err) {
                console.error('[DB] failed to save', msg.data, err);
            }
        })();

        return false;
    }

    else if (msg.type === 'addExceptions') {
        (async () => {
            try {
                console.log('[DB] Saving ', msg.data.exceptions);
                await addExceptions(msg.data.exceptions);
                sendResponse({ processed: true });
            } catch (err) {
                console.error('[DB] failed to save', msg.data, err);
                sendResponse({ processed: false });
            }
        })();

        return true;
    }

    else if (msg.type === 'deleteExceptions') {
        (async () => {
            try {
                console.log('[DB] Deleting ', msg.data.exceptions);
                await deleteExceptions(msg.data.exceptions);
                sendResponse({ processed: true });
            } catch (err) {
                console.error('[DB] failed to save', msg.data, err);
                sendResponse({ processed: false });
            }
        })();

        return true;
    }

    else if (msg.type === 'getWordsChunk') {
        (async () => {
            try {
                const wordsData = await getWordsChunk(msg.data?.limit || 50, msg.data?.lastKey || null);
                console.log('[DB] Got words', wordsData);
                sendResponse(wordsData);
            } catch (err) {
                console.error('[DB] Failed to get words', err);
                sendResponse({ exceptions: [], nextKey: null, hasMore: false });
            }
        })();

        return true;
    }

    else if (msg.type === 'getExceptionChunk') {
        (async () => {
            try {
                const exceptionsData = await getExceptionChunk(msg.data?.limit || 50, msg.data?.lastKey || null);
                console.log('[DB] Got exceptions', exceptionsData);
                sendResponse(exceptionsData);
            } catch (err) {
                console.error('[DB] Failed to get exceptions', err);
                sendResponse({ exceptions: [], nextKey: null, hasMore: false });
            }
        })();

        return true;
    }

    else if (msg.type === 'clearDB') {
        (async () => {
            try {
                await clearDB();
                sendResponse({ processed: true });
            } catch (err) {
                console.error('[DB] Failed to clear DB', err);
                sendResponse({ processed: false });
            }
        })();

        return true;
    }

    else if (msg.type === 'getExportWords') {
        (async () => {
            try {
                const wordsData = await getExportWords(msg.data?.minCount, msg.data?.maxCount);
                console.log('[DB] Got export words', wordsData);
                sendResponse(wordsData);
            } catch (err) {
                console.error('[DB] Failed to get words', err);
                sendResponse({ exceptions: [], nextKey: null, hasMore: false });
            }
        })();
        return true;
    }

});