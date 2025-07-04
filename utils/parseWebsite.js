import { Readability } from '@mozilla/readability';
import wordParser from './wordParser';

export function parseWebsite(callback) {
    const article = new Readability(document).parse();
    console.log("article: ", article.textContent);
    const words = wordParser(article.textContent)
    console.log(words);
    callback(words);
}