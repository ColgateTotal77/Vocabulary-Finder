import { YoutubeSubsParser } from './utils/youtubeSubsParser.js';
import { parseWebsite } from './utils/parseWebsite.js';

const browserAPI = (typeof browser === "undefined") ? chrome : browser;

function updateWordCounts(words) {
    browserAPI.runtime.sendMessage({
        type: 'addWords',
        data: {
            words: words,
            source: window.location.href
        }
    });
}

function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
        browserAPI.runtime.sendMessage(message, (response) => {
            if (browserAPI.runtime.lastError) {
                console.log('Error:', browserAPI.runtime.lastError);
                reject(browserAPI.runtime.lastError);
            }
            else resolve(response);
        });
    });
}

function isYouTubeVideo() {
    return (
        window.location.hostname.includes('youtube.com') &&
        window.location.pathname === '/watch'
    );
}

if (isYouTubeVideo()) YoutubeSubsParser(updateWordCounts);
else {
    (async () => {
        try {
            const response = await sendMessageAsync({type: 'isAlreadyProcessed', data: {url: window.location.href}});
            console.log(response);
            if (!response.processed) parseWebsite(updateWordCounts);
        } catch (err) {
            console.error(err);
        }
    })();
}