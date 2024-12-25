import { splitter } from '../dist';
import { expect } from 'chai';
import fs from 'fs';

describe('Text splitters', () => {
    const text = fs.readFileSync('samples/lorem-ipsum.txt', 'utf-8');
    const markdown = fs.readFileSync(
        'samples/artificial-intelligence.md',
        'utf-8'
    );
    const fewSentences =
        'This is the first sentence. This is the second, slightly longer sentence. And a final short one.';

    const {md_ovelap_50, txt_overlap_5_maxlength_30} = JSON.parse(
        fs.readFileSync('test/expect-overlap.json', 'utf-8')
    );

    /**
     * TESTS
     */
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

    it('Markdown text should be splitted into 7 topics with an overlap of arround 50 caracters.', async () => {
        const paragraphs = splitter(markdown, {
            splitter: 'markdown',
            overlap: 50,
        });
        expect(paragraphs.length).to.equal(7);

        md_ovelap_50.forEach((chunk: string, i: number) => {
            expect(chunk).to.equal(paragraphs[i]);
        });

    });

    it('Short text should be splitted into 5 sentences of maximum 30 characters and an overlap of arround 5 characters.', async () => {
        const sentences = splitter(fewSentences, {
            splitter: 'sentence',
            maxLength: 30,
            overlap: 5,
        });
        expect(sentences.length).to.equal(5);
        txt_overlap_5_maxlength_30.forEach((chunk: string, i: number) => {
            expect(chunk).to.equal(sentences[i]);
        });
    });
});
