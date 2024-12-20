import fs from 'fs';

import { splitter } from '../dist';

const performanceLog = (
    title: string,
    startTime: number,
    endTime: number,
    count: number
) => {
    const elapsedTime = endTime - startTime;

    console.log(`\n----------`);
    console.log(title);
    console.log(`----------`);
    console.log(`Total: ${elapsedTime.toFixed(3)}ms`);
    console.log(`Average: ${(elapsedTime / count).toFixed(3)}ms`);
};

const chunkTest = (inputFile: string, outputFile: string) => {
    const text = fs.readFileSync(`samples/${inputFile}`, 'utf8');
    let chunks: string[] = [];

    const startTime = performance.now();
    for (let i = 0; i < 100; i++) {
        chunks = splitter(text);
    }
    performanceLog(
        `Chunk ${text.length} characters in ${chunks.length} chunks, 100 times.`,
        startTime,
        performance.now(),
        100
    );

    fs.writeFileSync(outputFile, chunks.join('\n\n-----------\n\n'), 'utf8');
};

chunkTest('lorem.txt', 'chunked.txt');
