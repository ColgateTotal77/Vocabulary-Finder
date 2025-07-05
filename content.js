import { addOrUpdateWord } from './utils/storage.js';
import { YoutubeSubsParser } from './utils/youtubeSubsParser.js';
import { parseWebsite } from './utils/parseWebsite.js';
import { lemmatize } from './utils/lemmatize.js';

function updateWordCounts(words) {
    const source = window.location.href;
    words.forEach(async rawWord => {
        const word = lemmatize(rawWord);
        if (word && word.length > 2) {
            await addOrUpdateWord({word, source});
        }
    });
}

function isYouTubeVideo() {
    return (
        window.location.hostname.includes('youtube.com') &&
        window.location.pathname === '/watch'
    );
}

if (isYouTubeVideo()) YoutubeSubsParser(updateWordCounts);
else parseWebsite(updateWordCounts);