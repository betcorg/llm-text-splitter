import { splitter } from '../dist';
import { expect } from 'chai';
import fs from 'fs';

describe('Text splitters', () => {
    const text = fs.readFileSync('samples/lorem-ipsum.txt', 'utf-8');
    const markdown = fs.readFileSync(
        'samples/artificial-intelligence.md',
        'utf-8'
    );

    const expectedOverlapedChunks = JSON.parse(fs.readFileSync(
        'test/expec-overlap.json',
        'utf-8',
    ));

    it('Text should be splitted into 795 sentences.', async () => {
        const sentences = splitter(text);
        expect(sentences.length).to.equal(795);
    });

    it('Text should be splitted into 63 paragraphs.', async () => {
        const paragraphs = splitter(text, { splitter: 'paragraph' });
        expect(paragraphs.length).to.equal(63);
    });

    it('Markdown text should be splitted into 7 topics', async () => {
        const paragraphs = splitter(markdown, { splitter: 'markdown' });
        expect(paragraphs.length).to.equal(7);
    });

    it('Markdown text should be splitted into 7 topics with arround 50 caracters of overlapping text', async () => {
        const paragraphs = splitter(markdown, { splitter: 'markdown', overlap: 50 });
        expect(paragraphs.length).to.equal(7);
        expect(expectedOverlapedChunks[0]).to.equal(paragraphs[0]);
        expect(expectedOverlapedChunks[1]).to.equal(paragraphs[1]);
        expect(expectedOverlapedChunks[2]).to.equal(paragraphs[2]);
        expect(expectedOverlapedChunks[3]).to.equal(paragraphs[3]);
        expect(expectedOverlapedChunks[4]).to.equal(paragraphs[4]);
        expect(expectedOverlapedChunks[5]).to.equal(paragraphs[5]);
        expect(expectedOverlapedChunks[6]).to.equal(paragraphs[6]);
    });
});
