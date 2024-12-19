export type SplitterType = 'sentence' | 'paragraph' | 'markdown';
export interface SplitOptions {
    minLength?: number;
    maxLength?: number;
    overlap?: number;
    splitter?: SplitterType;
    regex?: RegExp | string;
    removeExtraSpaces?: boolean;
}
export declare const splitter: (text: string, options?: SplitOptions) => string[];
