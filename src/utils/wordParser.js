export function wordParser(text) {
    return text
        .toLowerCase()
        .replace(/[\n\r?!.,:;"]/g, ' ')
        // .replace(/[^a-zA-Z0-9\s']/g, '')
        .split(/\s+/)
        .filter(word => /^[a-zA-Z]{2,}$/.test(word))
}