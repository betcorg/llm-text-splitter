import { splitter } from '../dist'
import { expect } from 'chai';
import fs from 'fs';



describe('Text splitter', () => {
    const text = fs.readFileSync('samples/lorem.txt', 'utf-8');

    it('should be splitted into 795 sentences', async () => {
        const sentences = splitter(text);
        expect(sentences.length).to.equal(795);
    });

    it('should be splitted into 63 paragraphs', async () => {
        const paragraphs = splitter(text, { splitter: "paragraph" });
        expect(paragraphs.length).to.equal(63);
    });

});