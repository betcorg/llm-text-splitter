import fs from 'fs';
import { splitter, SplitOptions } from '../dist';

const text = fs.readFileSync('samples/article.md', 'utf-8');

const options: SplitOptions = {
    // minLength: 0,
    maxLength: 1000,
    splitter: 'markdown',
    // overlap: 5,
    // regex: '',
    // removeExtraSpaces: true,
};

const chunks = splitter(text, options);

console.log(chunks.length, 'chunks\n');

for (const chunk of chunks) {
    console.log(chunk);
    console.log('\n*********************************\n');
}
