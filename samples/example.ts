import fs from 'fs';
import { splitter, SplitOptions } from '../dist';

const text = fs.readFileSync('samples/alice.txt', 'utf-8');

const options: SplitOptions = {
    minLength: 0,
    maxLength: 5000,
    splitter: 'sentence',
    overlap: 0,
    regex: /(?<=[.!?])(?=([\s+A-Z]))/g,
    removeExtraSpaces: false,
};

const chunks = splitter(text, options);

console.log(chunks.length, 'chunks');

for (const chunk of chunks) {
    console.log(chunk);
    console.log('\n*********************************\n');
};
