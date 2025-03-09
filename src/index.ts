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
type ChunkType = 'within_range' | 'oversize';

// Type alias for the breakpoint type.
type BreakPointOptions = {
    type: 'chunk' | 'overlap';
    maxLength?: number;
    overlap?: number;
};

export class Splitter {
    private options: Required<SplitOptions> = {
        regex: '',
        minLength: 0,
        maxLength: 5000,
        overlap: 0,
        splitter: 'sentence',
        removeExtraSpaces: false,
    };

    private static readonly REGEX = {
        sentence: /(?<=[.!?])(?=([\s\nA-Z]))/g,
        paragraph: /(?<=[.\s]+\n+\s?)(?=[A-Z1-9*-“]+)/g,
        markdown: /(?<=[.)\]}!;>`\s\n]+\n+\s?)(?=[#*]{2,}|[A-Z][a-z\s]+)/g,
    };

    constructor(options: SplitOptions = {}) {
        this.options = { ...this.options, ...options };

        if (
            this.options.minLength &&
            this.options.maxLength &&
            this.options.minLength > this.options.maxLength
        ) {
            throw new Error('maxLength should be greater than minLength');
        }
    }
    // Finds the breakpoint for splitting a chunk or calculating overlap.
    private findBreakPoint(text: string, options: BreakPointOptions): number {
        const textLength = text.length;
        const {
            type,
            overlap = this.options.overlap,
            maxLength = this.options.maxLength,
        } = options;

        if (type === 'chunk')
            return (
                text.lastIndexOf(' ', maxLength) || text.indexOf(' ', maxLength)
            );

        return (
            text.lastIndexOf(' ', textLength - overlap) ||
            text.indexOf(' ', textLength - overlap)
        );
    }
    // Extracts the overlap text from the previous chunk.
    private getOverlapText(subChunk: string, overlap: number): string {
        if (overlap <= 0 || !subChunk) return '';

        if (overlap >= subChunk.length)
            overlap = Math.floor(subChunk.length / 2);

        const breakPoint = this.findBreakPoint(subChunk, {
            type: 'overlap',
            overlap,
        });

        const overlapText =
            breakPoint === -1
                ? subChunk.slice(subChunk.length - overlap)
                : subChunk.slice(breakPoint);

        return overlapText.trimStart();
    }
    // Splits a chunk that exceeds maxLength into smaller sub-chunks.
    private splitChunk(
        currChunks: string[],
        maxLength: number,
        overlap: number
    ): { subChunks: string[]; remaining: string } {
        const subChunks: string[] = [];
        let remainingText = '';
        let chunkString = currChunks.join(' ');

        while (chunkString.length > maxLength) {
            if (chunkString.trim().length <= 1) continue;

            let breakPoint = -1;

            if (overlap >= maxLength) overlap = Math.floor(maxLength / 2);

            if (chunkString[maxLength] === ' ') {
                breakPoint = maxLength;
            } else {
                breakPoint = this.findBreakPoint(chunkString, {
                    type: 'chunk',
                    maxLength,
                });
            }

            if (breakPoint <= 0) breakPoint = maxLength;

            const subChunk = chunkString.slice(0, breakPoint);
            subChunks.push(subChunk);

            const remaining = chunkString.slice(breakPoint);

            if (remaining.length > maxLength) {
                const overlapText = this.getOverlapText(subChunk, overlap);
                chunkString = (overlapText + remaining).trim();
            } else {
                remainingText = remaining;
                break;
            }
        }

        if (chunkString.length > 0 && chunkString.length <= maxLength)
            subChunks.push(chunkString.trim());

        return { subChunks, remaining: remainingText };
    }

    private handleChunkSize(baseChunks: string[]): string[] {
        const { minLength, maxLength, overlap } = this.options;
        const chunks: string[] = [];
        let currChunks: string[] = [];
        let currChunksLength = 0;

        const resetState = () => {
            currChunksLength = 0;
            currChunks = [];
        };

        const buildChunks = (type: ChunkType) => {
            let remainingText = '';
            const builtChunks: string[] = [];
            const overlapChunk = chunks[chunks.length - 1];
            const overlapText = this.getOverlapText(overlapChunk, overlap);

            if (type === 'within_range') {
                const subChunk = overlapText + currChunks.join(' ');
                builtChunks.push(subChunk);
            }

            if (type === 'oversize') {
                currChunks.unshift(overlapText);
                const { subChunks, remaining } = this.splitChunk(
                    currChunks,
                    maxLength,
                    overlap
                );
                builtChunks.push(...subChunks);
                remainingText = remaining;
            }
            resetState();

            chunks.push(...builtChunks);

            if (remainingText) currChunks.push(remainingText);
        };

        for (let i = 0; i < baseChunks.length; i++) {
            const subChunk = baseChunks[i];

            if (subChunk.trim().length <= 1) continue;

            currChunks.push(subChunk);

            currChunksLength = currChunks.join('').length;

            if (currChunksLength >= minLength) {
                if (currChunksLength > maxLength) {
                    buildChunks('oversize');
                } else {
                    buildChunks('within_range');
                }
            }
        }

        if (currChunks.length) buildChunks('within_range');

        return chunks;
    }

    private getRegExp(splitter: SplitterType): RegExp {
        const regex = Splitter.REGEX[splitter];
        if (!regex)
            throw new Error(
                `Invalid splitter type: ${splitter}. Use 'sentence', 'paragraph' or 'markdown' instead.`
            );

        return regex;
    }

    /**
     * Splits a given text into chunks based on the options provided in the constructor.
     * @param text The text to split.
     * @returns An array of strings, where each string is a chunk of the original text.
     */
    public split(text: string, options: SplitOptions = {}): string[] {
        this.options = { ...this.options, ...options };
        const { splitter, regex, removeExtraSpaces } = this.options;

        // Adjust the minimum size to avoid chunks that are too small
        // when using the 'markdown' or 'paragraph' splitter.
        if (!regex && splitter !== 'sentence' && !this.options.minLength)
            this.options.minLength = 200;

        const regExp = regex || this.getRegExp(splitter);

        // Replaces multiple new lines with only two new lines.
        text = text.replace(/\n{2,}/g, '\n\n');

        const baseChunks = text.split(regExp);

        let chunks = this.handleChunkSize(baseChunks);

        if (removeExtraSpaces)
            chunks = chunks.map((chunk) => chunk.replace(/\s+/g, ' ').trim());

        return chunks;
    }
}
