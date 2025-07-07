import { lemmatize } from "./utils/lemmatize";
import {addOrUpdateWord, getAllWords, isAlreadyProcessed, markAsProcessed} from "./utils/storage";

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

        return true;
    }

    else if (msg.type === 'addOrUpdateWords') {
        const source = msg.data.source;

        (async () => {
            for (const rawWord of msg.data.words) {
                const word = lemmatize(rawWord);
                if (word && word.length > 2) {
                    try {
                        await addOrUpdateWord({ word, source });
                        console.log('[DB] saved', word);
                    } catch (err) {
                        console.error('[DB] failed to save', word, err);
                    }
                }
            }
            sendResponse({ success: true });
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
});