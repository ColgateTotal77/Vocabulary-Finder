import { addOrUpdateWord } from './utils/storage.js';
import { lemmatize } from "./utils/lemmatize";

const browserAPI = (typeof browser === "undefined") ? chrome : browser;

browserAPI.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'addOrUpdateWords') {
        const source = msg.data.source;
        msg.data.words.forEach(async rawWord => {
            const word = lemmatize(rawWord);
            if (word && word.length > 2) {
                await addOrUpdateWord({word, source});
            }
        })
        return true;
    }
});
