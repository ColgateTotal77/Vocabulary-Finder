import { adjective, verb, noun } from 'wink-lemmatizer';
import exceptions from './exceptions.json';

export function lemmatize(word) {
    const lowerWord = word.toLowerCase();

    if (exceptions[word]) return exceptions[word];

    const nounResult = noun(lowerWord);
    if (nounResult !== lowerWord) return nounResult;

    const verbResult = verb(lowerWord);
    if (verbResult !== lowerWord) return verbResult;

    const adjResult = adjective(lowerWord);
    if (adjResult !== lowerWord) return adjResult;

    return lowerWord;
}
