export function wordParser(text) {
    return text
        .toLowerCase()
        .replace(/[\n\r]/g, ' ')
        .replace(/[^a-zA-Z0-9\s']/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2) // Filter out very short words
        .filter(word => !/^\d+$/.test(word)) // Filter out pure numbers
}