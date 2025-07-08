import { Readability } from '@mozilla/readability';
import { wordParser } from './wordParser.js';

export function parseWebsite(callback) {
    const docClone = document.cloneNode(true); // deep clone
    const article = new Readability(docClone).parse();
    console.log(article);
    if (article?.textContent) {
        const words = wordParser(article.textContent);
        console.log(words);
        callback(words);
    }
}