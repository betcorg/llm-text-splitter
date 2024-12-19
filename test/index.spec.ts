import { splitter } from '../dist'

import { expect } from 'chai';

describe('Text splitter', () => {
    const text = "Hello World.\nThis is\n a test sentence! Have a good day? Haha. Haha";

    it('should be splitted into 5 splitters', async () => {
        const splitters = splitter(text);
        expect(splitters.length).to.equal(5)
    });

    it('should be splitted into 6 splitters', async () => {
        const splitters = splitter(text, { minLength: 5, maxLength: 10 });
        expect(splitters.length).to.equal(6)
    });

    it('should be splitted into 5 splitters', async () => {
        const splitters = splitter(text, { splitter: "sentence" });
        expect(splitters.length).to.equal(5)
    });

    it('should be splitted into 4 splitters', async () => {
        const splitters = splitter(text, { minLength: 10, splitter: "sentence" });
        expect(splitters.length).to.equal(4)
    });

    // it('should be overlapped 6 characters at least', async () => {
    //     const splitters = splitter(text, { overlap: 6, splitter: "sentence" });
    //     const firstWords = splitters[0].split(' ')
    //     const secondWords = splitters[1].split(' ')
    //     const thirdWords = splitters[2].split(' ')

    //     expect(splitters.length).to.equal(7)
    //     expect(firstWords[firstWords.length-1]).to.equal(secondWords[1])
    //     expect(secondWords[secondWords.length-1]).to.equal(thirdWords[1])
    // });
});