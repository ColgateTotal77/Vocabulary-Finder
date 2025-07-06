import { Readability } from '@mozilla/readability';
import { wordParser } from './wordParser.js';

export function parseWebsite(callback) {
    const article = new Readability(document).parse();
    if (article?.textContent) {
        const words = wordParser(article.textContent);
        callback(words);
    }
}