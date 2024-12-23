// import fs from 'fs';
import { splitter, SplitOptions } from '../dist';

// const text = fs.readFileSync('samples/lorem.txt', 'utf-8');
const text =
    'Item 1; Item 2; Item 3; Item 4';

const options: SplitOptions = {
    // minLength: 0,
    // maxLength: 10000,
    // splitter: 'markdown',
    // overlap: 5,
    regex: /[.]/,
    // removeExtraSpaces: true,
};

const chunks = splitter(text, options);

console.log(chunks.length, 'chunks\n');

for (const chunk of chunks) {
    console.log(chunk);
    console.log('\n*********************************\n');
}


// const text =  'Item 1. Item 2. Item 3. Item 4.';
// console.log(text.split('. '));