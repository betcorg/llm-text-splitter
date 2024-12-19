"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitter = void 0;
const findBreakPoint = (text, position, overlap = 0) => {
    let breakPoint = -1;
    if (position === 'first') {
        breakPoint = text.indexOf(' ');
        if (breakPoint === -1) {
            breakPoint = text.indexOf('\n');
        }
    }
    else {
        breakPoint = text.lastIndexOf(' ', text.length - overlap);
        if (breakPoint === -1) {
            breakPoint = text.lastIndexOf('\n', text.length - overlap);
        }
    }
    return breakPoint;
};
const getOverlapText = (subChunk, overlap) => {
    if (overlap <= 0) {
        return '';
    }
    const breakPoint = findBreakPoint(subChunk, 'last', overlap);
    const overlapText = breakPoint === -1
        ? subChunk.substring(subChunk.length - overlap)
        : subChunk.substring(breakPoint);
    return overlapText;
};
const splitChunk = (currChunks, maxLength, overlap) => {
    let chunkString = currChunks.join(' ');
    const subChunks = [];
    let restChunk = '';
    do {
        let subChunk = chunkString.substring(0, maxLength);
        if (subChunk.trim() === '')
            continue;
        let leftingText = chunkString.substring(maxLength);
        const breakPoint = findBreakPoint(leftingText, 'first');
        if (breakPoint !== -1) {
            subChunk += leftingText.substring(0, breakPoint);
            leftingText = leftingText.substring(breakPoint);
        }
        subChunks.push(subChunk);
        const overlapText = getOverlapText(subChunk, overlap);
        leftingText = overlapText + leftingText;
        chunkString = leftingText;
        if (leftingText.length <= maxLength) {
            restChunk = leftingText;
        }
    } while (chunkString.length > maxLength);
    return { subChunks, restChunk };
};
const getRegExp = (splitter) => {
    let regex;
    switch (splitter) {
        case 'sentence':
            regex = /(?<=[.!?])(?=([\s+A-Z]))/g;
            break;
        case 'paragraph':
            regex = /(?<=.)(?=\n+[A-Z]|#+)/g;
            break;
        case 'markdown':
            regex = /(?=\n+#+\s)/;
            break;
        default:
            throw new Error(`Invalid splitter name: ${splitter}.`);
    }
    return regex;
};
const handleChunkSize = (baseChunks, options) => {
    const { minLength = 0, maxLength = 5000, overlap = 0 } = options;
    const chunks = [];
    let currChunks = [];
    let currChunkLength = 0;
    for (let i = 0; i < baseChunks.length; i += 2) {
        let subChunk = baseChunks[i];
        if (baseChunks[i + 1]) {
            subChunk += baseChunks[i + 1];
        }
        currChunks.push(subChunk);
        currChunkLength += subChunk.length;
        if (currChunkLength >= minLength) {
            const { subChunks, restChunk } = splitChunk(currChunks, maxLength, overlap);
            chunks.push(...subChunks);
            currChunkLength = restChunk.length;
            currChunks = [];
            if (restChunk)
                currChunks.push(restChunk);
        }
    }
    if (currChunks.length) {
        const { subChunks, restChunk } = splitChunk(currChunks, maxLength, 0);
        if (subChunks.length)
            chunks.push(...subChunks);
        if (restChunk)
            chunks.push(restChunk);
    }
    return chunks;
};
const splitter = (text, options = {}) => {
    const { minLength, maxLength, splitter = 'sentence', regex = null, removeExtraSpaces = false, } = options;
    if (minLength && maxLength && minLength > maxLength)
        throw new Error('maxLength sould be greater than minLength');
    let regExp = regex;
    let baseChunks = [];
    if (!regExp) {
        regExp = getRegExp(splitter);
        baseChunks = text.split(regExp);
        let chunks = handleChunkSize(baseChunks, options);
        if (removeExtraSpaces)
            chunks = chunks.map((chunk) => chunk.replace(/\s+/g, ' ').trim());
        return chunks;
    }
    else {
        baseChunks = text.split(regExp);
        let chunks = handleChunkSize(baseChunks, options);
        if (removeExtraSpaces)
            chunks = chunks.map((chunk) => chunk.replace(/\s+/g, ' ').trim());
        return chunks;
    }
};
exports.splitter = splitter;
