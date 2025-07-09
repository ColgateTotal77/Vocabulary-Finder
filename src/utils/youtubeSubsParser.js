import { wordParser } from './wordParser.js';

let curLine = '';
let prevLine = '';
export function YoutubeSubsParser(callback) {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.TEXT_NODE) return;
                const text = node.wholeText;
                if (!text || prevLine === text || curLine === text) return;
                if (!curLine || text.includes(curLine)) {
                    curLine = text;
                    return;
                }

                const words = wordParser(prevLine);
                prevLine = curLine;
                curLine = text;
                callback(words);
            });
        });
    });

    let observedElement = null;

    function tryObserveCaptions() {
        const ytp_caption_window_container  = document.querySelector('.ytp-caption-window-container');
        if (ytp_caption_window_container  && ytp_caption_window_container  !== observedElement) {
            if (observedElement) {
                observer.disconnect();
            }
            observedElement = ytp_caption_window_container;

            observer.observe(observedElement, {
                childList: true,
                subtree: true
            });
        }

        setTimeout(tryObserveCaptions, 1000);
    }
    tryObserveCaptions();
}
