import { addOrUpdateWord } from './utils/storage.js';
import { YoutubeSubsParser } from './utils/youtubeSubsParser';
import { parseWebsite } from './utils/parseWebsite';

import { lemmatize } from './utils/lemmatize.js';

const browserAPI = (typeof browser === "undefined") ? chrome : browser;

function updateWordCounts(words) {
    const source = window.location.href;
    words.forEach(async rawWord => {
        const word = lemmatize(rawWord);
        if(word) await addOrUpdateWord({word, source});
    });
}
function isYouTubeVideo() {
    console.log(window.location.href);
    return (
        window.location.hostname.includes('youtube.com') &&
        window.location.pathname === '/watch'
    );
}

if (isYouTubeVideo()) YoutubeSubsParser(updateWordCounts);
else parseWebsite(updateWordCounts);