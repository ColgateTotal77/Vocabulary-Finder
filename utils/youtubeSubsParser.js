import { wordParser } from './wordParser';

export function YoutubeSubsParser(callback) {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                const text = node.textContent;
                const words = wordParser(text);
                console.log(words);
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
                console.log('Disconnected from old captions-text.');
            }
            observedElement = ytp_caption_window_container;

            observer.observe(observedElement , {
                childList: true,
                subtree: true
            });
            console.log('Observer connected to new captions-text.');
        }

        setTimeout(tryObserveCaptions, 1000);
    }
    tryObserveCaptions();
}
