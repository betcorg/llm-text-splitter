export type SplitterType = 'sentence' | 'paragraph' | 'markdown';

export interface SplitOptions {
    minLength?: number;
    maxLength?: number;
    overlap?: number;
    splitter?: SplitterType;
    regex?: RegExp | string;
    removeExtraSpaces?: boolean;
}

const findBreakPoint = (
    text: string,
    type: 'chunk' | 'overlap',
    overlap: number = 0
) => {
    let breakPoint = -1;

    const words = text.split(' ');
    const lastWord = words[words.length - 1];

    if (type === 'chunk') {
        breakPoint = text.length - lastWord.length - 1;
    } else if (type === 'overlap') {
        breakPoint = text.lastIndexOf(
            ' ',
            text.length - overlap + lastWord.length + 1
        );
        if (breakPoint === -1) {
            breakPoint = text.lastIndexOf(
                '\n',
                text.length - overlap + lastWord.length + 1
            );
        }
    }

    return breakPoint;
};

const getOverlapText = (subChunk: string, overlap: number) => {
    if (overlap <= 0 || !subChunk) {
        return '';
    } else if (overlap > subChunk.length) {
        throw new Error(
            'Overlap value is grater than the chunk size, try with a lower value'
        );
    }
    const breakPoint = findBreakPoint(subChunk, 'overlap', overlap);

    const overlapText =
        breakPoint === -1
            ? subChunk.substring(subChunk.length - overlap)
            : subChunk.substring(breakPoint);

    return overlapText.trim();
};

const splitChunk = (
    currChunks: string[],
    maxLength: number,
    overlap: number
) => {
    let chunkString = currChunks.join(' ');
    const subChunks: string[] = [];
    let tailLeftingText = '';

    do {
        let subChunk = chunkString.substring(0, maxLength);

        if (subChunk.trim() === '') continue;

        let leftingText = chunkString.substring(maxLength);

        const breakPoint = findBreakPoint(subChunk, 'chunk');
        if (breakPoint !== -1) {
            leftingText = subChunk.substring(breakPoint) + leftingText;
            subChunk = subChunk.substring(0, breakPoint);
        }

        subChunks.push(subChunk);

        if (leftingText.length <= maxLength) {
            tailLeftingText = leftingText;
            chunkString = '';
        }

        const overlapText = getOverlapText(subChunk, overlap);
        chunkString = overlapText + leftingText;
    } while (chunkString.length > maxLength);

    return { subChunks, leftingText: tailLeftingText };
};

const handleChunkSize = (baseChunks: string[], options: SplitOptions) => {
    const { minLength = 0, maxLength = 5000, overlap = 0 } = options;
    const chunks = [];
    let currChunks = [];
    let currChunksLength = 0;

    for (let i = 0; i < baseChunks.length; i++) {
        let subChunk = baseChunks[i];

        if (subChunk.trim() === '') continue;

        currChunks.push(subChunk);

        currChunksLength = currChunks.join(' ').length;

        if (currChunksLength >= minLength) {
            if (currChunksLength > maxLength) {
                const overlapText = getOverlapText(
                    chunks[chunks.length - 1],
                    overlap
                );
                currChunks.unshift(overlapText);
                const { subChunks, leftingText } = splitChunk(
                    currChunks,
                    maxLength,
                    overlap
                );

                chunks.push(...subChunks);
                currChunksLength = 0;
                currChunks = [];

                if (leftingText) currChunks.push(leftingText);
            } else {
                const overlapText = getOverlapText(
                    chunks[chunks.length - 1],
                    overlap
                );

                subChunk = overlapText + currChunks.join(' ');
                chunks.push(subChunk);
                currChunksLength = 0;
                currChunks = [];
            }
        }
    }

    if (currChunks.length) {
        let subChunk = currChunks.join(' ');

        const overlapText = getOverlapText(chunks[chunks.length - 1], overlap);
        subChunk = overlapText + currChunks.join(' ');
        chunks.push(subChunk);
        currChunksLength = 0;
        currChunks = [];
    }

    return chunks;
};

const getRegExp = (splitter: SplitterType) => {
    let regex: RegExp;
    switch (splitter) {
        case 'sentence':
            regex = /(?<=[.!?])(?=([\s\nA-Z]))/g;
            break;

        case 'paragraph':
            regex = /(?<=.(\n+|\s+))(?=\n+[A-Z]|#+)/g;
            break;

        case 'markdown':
            regex = /(?=(\n+|\s+)#+\s)/;
            break;

        default:
            throw new Error(
                `Invalid splitter type: ${splitter}. Use 'sentence', 'paragraph' or 'markdown' instead.`
            );
    }
    return regex;
};

export const splitter = (text: string, options: SplitOptions = {}) => {
    const {
        minLength,
        maxLength,
        splitter = 'sentence',
        regex = null,
        removeExtraSpaces = false,
    } = options;

    if (minLength && maxLength && minLength > maxLength)
        throw new Error('maxLength should be greater than minLength');

    let regExp = regex;
    let baseChunks: string[] = [];

    if (!regExp) {
        regExp = getRegExp(splitter);

        baseChunks = text.split(regExp);

        let chunks = handleChunkSize(baseChunks, options);

        if (removeExtraSpaces)
            chunks = chunks.map((chunk) => chunk.replace(/\s+/g, ' ').trim());

        return chunks;
    } else {
        baseChunks = text.split(regExp);

        let chunks = handleChunkSize(baseChunks, options);

        if (removeExtraSpaces)
            chunks = chunks.map((chunk) => chunk.replace(/\s+/g, ' ').trim());

        return chunks;
    }
};
