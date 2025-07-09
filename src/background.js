import {
    addOrUpdateExceptions,
    addOrUpdateWords,
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

    else if (msg.type === 'markAsProcessed') {
        (async () => {
            try {
                await markAsProcessed(msg.data.url);
            }
            catch (err) {
                console.error(err);
            }
        })();

        return false;
    }

    else if (msg.type === 'addOrUpdateWords') {
        (async () => {
            try {
                console.log('[DB] Saving ', msg.data.words);
                await addOrUpdateWords(msg.data);
            } catch (err) {
                console.error('[DB] failed to save', msg.data, err);
            }
            sendResponse({ success: true });
        })();

        return false;
    }

    else if (msg.type === 'addOrUpdateExceptions') {
            (async () => {
                try {
                    console.log('[DB] Saving ', msg.data.exceptions);
                    await addOrUpdateExceptions(msg.data.exceptions);
                } catch (err) {
                    console.error('[DB] failed to save', msg.data, err);
                }
                sendResponse({ success: true });
            })();

            return false;
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