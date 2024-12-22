
# llm-text-splitter

A lightweight TypeScript library for splitting text into chunks based on various criteria, ideal for preparing text for Large Language Models (LLMs) and for RAG applications.

## Features

* **Multiple Splitting Methods:** Split text by sentences, paragraphs, markdown headings, or custom regular expressions.
* **Size Control:** Define minimum and maximum chunk lengths.
* **Overlap:**  Introduce overlapping text between chunks to maintain context.
* **Extra Space Removal:** Optionally remove extra whitespace within chunks.
* **Simple API:** Easy to integrate and use.

## Installation

```bash
npm install llm-text-splitter
```


## Usage

```typescript
import { splitter } from 'llm-text-splitter';

// Example 1: Splitting by sentences with overlap
const text = "This is the first sentence. This is the second, slightly longer sentence. And a final short one.";
const chunks = splitter(text, { maxLength: 30, overlap: 5, splitter: 'sentence' });
console.log(chunks);
// Expected output (may vary slightly depending on overlap handling):
// [
//   "This is the first sentence.",
//   "sentence. This is the second,",
//   "second, slightly longer sentence.",
//   "sentence. And a final short one."
// ]


// Example 2: Splitting by paragraphs
const text2 = "This is the first paragraph.\n\nThis is the second paragraph, which is a bit longer.\n\nShort paragraph.";
const chunks2 = splitter(text2, { maxLength: 50, splitter: 'paragraph' });
console.log(chunks2);
// Expected output:
// [
//   "This is the first paragraph.",
//   "This is the second paragraph, which is a bit longer.",
//   "Short paragraph."
// ]


// Example 3: Splitting by Markdown headings
const text3 = "# Heading 1\nThis is some text under heading 1.\n\n## Heading 2\nMore text here.\n\n### Heading 3\nAnd even more text.";
const chunks3 = splitter(text3, { splitter: 'markdown' });
console.log(chunks3);
// Expected output:
// [
//   "# Heading 1\nThis is some text under heading 1.",
//   "## Heading 2\nMore text here.",
//   "### Heading 3\nAnd even more text."
// ]


// Example 4: Custom regex splitter
const text4 = "Item 1; Item 2; Item 3; Item 4";
const chunks4 = splitter(text4, { regex: /;/ });
console.log(chunks4);
// Expected output:
// ["Item 1", " Item 2", " Item 3", " Item 4"]


// Example 5: Removing Extra Spaces
const text5 = "This  is   a   string   with   extra    spaces.";
const chunks5 = splitter(text5, { maxLength: 10, removeExtraSpaces: true });
console.log(chunks5);
// Expected output:
// "This is a string with extra spaces".
```

## API

```typescript
splitter(text: string, options: SplitOptions = {}): string[]
```

### Parameters

* `text`: The input text string.
* `options`: An optional object with the following properties:
    * `minLength`: The minimum length of a chunk (default: 0).
    * `maxLength`: The maximum length of a chunk (default: 5000).
    * `overlap`: The number of overlapping characters between chunks (default: 0).
    * `splitter`: The splitting method ('sentence', 'paragraph', 'markdown') (default: 'sentence').
    * `regex`: A custom regular expression for splitting.  Overrides `splitter` if provided.
    * `removeExtraSpaces`: Whether to remove extra spaces within chunks (default: false).


### Return Value

An array of strings, where each string is a chunk of the input text.


## Contributing

Contributions are welcome!  Please open an issue or submit a pull request.

