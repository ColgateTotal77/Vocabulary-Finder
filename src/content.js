import { YoutubeSubsParser } from './utils/youtubeSubsParser.js';
import { parseWebsite } from './utils/parseWebsite.js';

const browserAPI = (typeof browser === "undefined") ? chrome : browser;

function updateWordCounts(words) {
    console.log("callback")
    browserAPI.runtime.sendMessage({
        type: 'addOrUpdateWords',
        data: {
            words: words,
            source: window.location.href
        }
    });
}

function isYouTubeVideo() {
    return (
        window.location.hostname.includes('youtube.com') &&
        window.location.pathname === '/watch'
    );
}
try {
    if (isYouTubeVideo()) YoutubeSubsParser(updateWordCounts);
    else parseWebsite(updateWordCounts);
}
catch (err) {
    console.error(err);
}