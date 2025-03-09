import fs from 'fs';
import { expect } from 'chai';
import { Splitter } from '../dist';

describe('Text splitters', () => {
    const splitter = new Splitter();
    const text = fs.readFileSync('samples/lorem-ipsum.txt', 'utf-8');
    const markdown = fs.readFileSync(
        'samples/artificial-intelligence.md',
        'utf-8'
    );
    const fewSentences =
        'This is the first sentence. This is the second, slightly longer sentence. And a final short one.';

    const { md_ovelap_50, txt_overlap_5_maxlength_30 } = JSON.parse(
        fs.readFileSync('test/expect-overlap.json', 'utf-8')
    );

    /**
     * TESTS
     */
    it('Text should be splitted into 795 sentences.', async () => {
        const sentences = splitter.split(text);
        expect(sentences.length).to.equal(795);
    });

    it('Total sentences length sould be of 42446 characters.', async () => {
        const sentences = splitter.split(text);
        expect(sentences.join('').length).to.equal(text.length);
    });

    it('Text should be splitted into 63 paragraphs.', async () => {
        const paragraphs = splitter.split(text, { splitter: 'paragraph' });
        expect(paragraphs.length).to.equal(63);
    });

    it('Total paragraphs length sould be of 42446 characters.', async () => {
        const paragraphs = splitter.split(text, { splitter: 'paragraph' });
        expect(paragraphs.join('').length).to.equal(text.length);
    });

    it('Short text should be splitted into 5 sentences of maximum 30 characters and an overlap of arround 5 characters.', async () => {
        const sentences = splitter.split(fewSentences, {
            minLength: 0,
            splitter: 'sentence',
            maxLength: 30,
            overlap: 5,
        });
        expect(sentences.length).to.equal(5);
        txt_overlap_5_maxlength_30.forEach((chunk: string, i: number) => {
            expect(chunk).to.equal(sentences[i]);
        });
    });

    it('Markdown text should be splitted into 7 topics', async () => {
        const paragraphs = splitter.split(markdown, {
            splitter: 'markdown',
            minLength: 0,
            maxLength: 5000,
            overlap: 0,
        });
        expect(paragraphs.length).to.equal(7);
    });

    it('Markdown text should be splitted into 7 topics with an overlap of arround 50 caracters.', async () => {
        const paragraphs = splitter.split(markdown, {
            splitter: 'markdown',
            overlap: 50,
            minLength: 0,
            maxLength: 5000,
        });

        expect(paragraphs.length).to.equal(7);

        md_ovelap_50.forEach((chunk: string, i: number) => {
            expect(chunk).to.equal(paragraphs[i]);
        });
    });
});
