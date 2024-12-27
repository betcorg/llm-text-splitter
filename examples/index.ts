import * as fs from 'fs/promises';
import { splitter, SplitOptions } from '../dist';

(async () => {
    const text = await fs.readFile('samples/lorem-ipsum.txt', 'utf-8');

    const createFile = async (filePath: string, chunks: string[]) => {
        let chunkText = '';
        chunks.forEach((sentence, i) => {
            chunkText += `\nIndex: ${i}\n`;
            chunkText += `\n${sentence}\n`;
            chunkText += `\nChunck size: ${sentence.length}`;
            chunkText += '\n*****************************\n';
        });
        await fs.writeFile(filePath, chunkText);
    };

    /**
     * Default values.
     */
    let options: SplitOptions = {
        minLength: 0,
        maxLength: 5000,
        splitter: 'sentence',
        overlap: 0,
        regex: '',
        removeExtraSpaces: false,
    };

    /**
     * Split text into sentences.
     */
    const sentences = splitter(text, options);
    await createFile('examples/sentences.txt', sentences);

    /**
     * Split text into paragraphs.
     */
    options = {
        splitter: 'paragraph',
    };
    const paragraphs = splitter(text, options);
    await createFile('examples/paragraphs.txt', paragraphs);

    /**
     * Split text into paragraphs.
     */
    options = {
        splitter: 'markdown',
    };
    const topics = splitter(text, options);
    await createFile('examples/paragraphs.txt', topics);
})();
