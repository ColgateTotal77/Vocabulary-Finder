import {
    addWords,
    addExceptions,
    getAllExceptions,
    getAllWords,
    isAlreadyProcessed,
    markAsProcessed
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

    else if (msg.type === 'getAllWords') {
        (async () => {
            try {
                const words = await getAllWords();
                console.log('[DB] Got words', words);
                sendResponse({ words });
            } catch (err) {
                console.error('[DB] Failed to get words', err);
                sendResponse({ words: [] });
            }
        })();

        return true;
    }

    else if (msg.type === 'getAllExceptions') {
        (async () => {
            try {
                const exceptions = await getAllExceptions();
                console.log('[DB] Got exceptions', exceptions);
                sendResponse({ exceptions });
            } catch (err) {
                console.error('[DB] Failed to get exceptions', err);
                sendResponse({ exceptions: [] });
            }
        })();

        return true;
    }
});