import wink_lemmatizer from 'wink-lemmatizer';
import exceptions from './exceptions.json';

export function lemmatize(word) {
    const lowerWord = word.toLowerCase();

    if (exceptions[word]) return exceptions[word];

    const nounResult = wink_lemmatizer.noun(lowerWord);
    if (nounResult !== lowerWord) return nounResult;

    const verbResult = wink_lemmatizer.verb(lowerWord);
    if (verbResult !== lowerWord) return verbResult;

    const adjResult = wink_lemmatizer.adjective(lowerWord);
    if (adjResult !== lowerWord) return adjResult;

    return lowerWord;
}

