/**
 * Enum representing the available splitter types.
 */
export type SplitterType = 'sentence' | 'paragraph' | 'markdown';

/**
 * Interface defining the options for the `splitter` function.
 */
export interface SplitOptions {
    /**
     * Minimum length of a chunk.
     * @default 0
     */
    minLength?: number;
    /**
     * Maximum length of a chunk.
     * @default 5000
     */
    maxLength?: number;
    /**
     * Number of characters to overlap between chunks.
     * @default 0
     */
    overlap?: number;
    /**
     * The type of splitter to use. Can be 'sentence', 'paragraph', or 'markdown'.
     * @default 'sentence'
     */
    splitter?: SplitterType;
    /**
     * Custom regular expression to use for splitting. If provided, `splitter` will be ignored.
     */
    regex?: RegExp | string;
    /**
     * Whether to remove extra spaces from the chunks.
     * @default false
     */
    removeExtraSpaces?: boolean;
}

// Type alias for the chunk type.
type ChunkType = 'within-range' | 'oversize' | 'remaining';

// Regular expressions for different splitter types.
const REGEX = {
    sentence: /(?<=[.!?])(?=([\s\nA-Z]))/g,
    paragraph: /(?<=.(\n+|\s+))(?=\n+[A-Z]|#+)/g,
    markdown: /(?=(\n+|\s+)#+\s)/,
};

// Finds the breakpoint for splitting a chunk or calculating overlap.
const findBreakPoint = (
    text: string,
    type: 'chunk' | 'overlap',
    overlap: number = 0
) => {
    const textLength = text.length;
    const words = text.split(' ');
    const lastWord = words[words.length - 1];

    if (type === 'chunk') {
        return textLength - lastWord.length - 1;
    }
    return text.lastIndexOf(' ', textLength - overlap + lastWord.length + 1);
};

// Extracts the overlap text from a chunk.
const getOverlapText = (subChunk: string, overlap: number) => {
    if (overlap <= 0 || !subChunk) {
        return '';
    } else if (overlap > subChunk.length) {
        throw new Error(
            'Overlap value is grater than the chunk size, try with a lower value'
        );
    }
    const breakPoint = findBreakPoint(subChunk, 'overlap', overlap);

    // Extract the overlap text based on the breakpoint.
    const overlapText =
        breakPoint === -1
            ? subChunk.substring(subChunk.length - overlap)
            : subChunk.substring(breakPoint);

    return overlapText.trim();
};

// Splits a chunk that exceeds maxLength into smaller sub-chunks.
const splitChunk = (
    currChunks: string[],
    maxLength: number,
    overlap: number
) => {
    const subChunks: string[] = [];
    let leftOverText = '';
    let chunkString = currChunks.join(' ');

    do {
        let subChunk = chunkString.substring(0, maxLength);

        if (subChunk.trim() === '') continue;

        let remaining = chunkString.substring(maxLength);

        // Find a breakpoint within maxLength to split at a word boundary.
        const breakPoint = findBreakPoint(subChunk, 'chunk');
        if (breakPoint !== -1) {
            remaining = subChunk.substring(breakPoint) + remaining;
            subChunk = subChunk.substring(0, breakPoint);
        }

        subChunks.push(subChunk);

        if (remaining.length <= maxLength) {
            leftOverText = remaining;
            chunkString = '';
        }

        const overlapText = getOverlapText(subChunk, overlap);
        chunkString = overlapText + remaining;
    } while (chunkString.length > maxLength);

    return { subChunks, remainigText: leftOverText };
};


// Handles chunk size based on minLength and maxLength, managing overlap.
const handleChunkSize = (baseChunks: string[], options: SplitOptions) => {
    const { minLength = 0, maxLength = 5000, overlap = 0 } = options;
    const chunks: string[] = [];
    let currChunks: string[] = [];
    let currChunksLength = 0;

    const resetState = () => {
        currChunksLength = 0;
        currChunks = [];
    };

    const buildChunks = (type: ChunkType) => {
        const builtChunks: string[] = [];
        let remainig = '';
        const overlapChunk = chunks[chunks.length - 1];
        const overlapText = getOverlapText(overlapChunk, overlap);

        if (type === 'within-range') {
            const subChunk = overlapText + currChunks.join(' ');
            builtChunks.push(subChunk);
        }

        if (type === 'oversize') {
            currChunks.unshift(overlapText);
            const { subChunks, remainigText } = splitChunk(
                currChunks,
                maxLength,
                overlap
            );
            builtChunks.push(...subChunks);
            remainig = remainigText;
        }

        if (type === 'remaining') {
            const subChunk = overlapText + currChunks.join(' ');
            builtChunks.push(subChunk);
        }

        chunks.push(...builtChunks);
        resetState();

        if (remainig) currChunks.push(remainig);
    };

    for (let i = 0; i < baseChunks.length; i++) {
        const subChunk = baseChunks[i];

        if (subChunk.trim() === '') continue;

        currChunks.push(subChunk);

        currChunksLength = currChunks.join(' ').length;

        if (currChunksLength >= minLength) {
            if (currChunksLength > maxLength) {
                buildChunks('oversize');
            } else {
                buildChunks('within-range');
            }
        }
    }

    if (currChunks.length) {
        buildChunks('remaining');
    }

    return chunks;
};

// Retrieves the regular expression for the specified splitter type.
const getRegExp = (splitter: SplitterType): RegExp => {
    const regex = REGEX[splitter];
    if (!regex) {
        throw new Error(
            `Invalid splitter type: ${splitter}. Use 'sentence', 'paragraph' or 'markdown' instead.`
        );
    }
    return regex;
};


/**
 * Splits a given text into chunks based on the provided options.
 * @param text The text to split.
 * @param options The options for splitting the text.
 * @param options.minLength Minimum length of a chunk. Defaults to 0.
 * @param options.maxLength Maximum length of a chunk. Defaults to 5000.
 * @param options.overlap Number of characters to overlap between chunks. Defaults to 0.
 * @param options.splitter The type of splitter to use ('sentence', 'paragraph', or 'markdown'). Defaults to 'sentence'.
 * @param options.regex Custom regular expression to use for splitting. If provided, `splitter` will be ignored.
 * @param options.removeExtraSpaces Whether to remove extra spaces from the chunks. Defaults to false.
 * @returns An array of strings, where each string is a chunk of the original text.
 */
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

    const regExp = regex || getRegExp(splitter);
    const baseChunks = text.split(regExp);
    let chunks = handleChunkSize(baseChunks, options);

    if (removeExtraSpaces) {
        chunks = chunks.map((chunk) => chunk.replace(/\s+/g, ' ').trim());
    }

    return chunks;
};

