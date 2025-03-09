# llm-text-splitter

A lightweight TypeScript library for splitting text into chunks based on various criteria, ideal for preparing text for Large Language Models (LLMs) and for RAG applications.

## Features

- **Multiple Splitting Methods:** Split text by sentences, paragraphs, markdown headings, or custom regular expressions.
- **Size Control:** Define minimum and maximum chunk lengths.
- **Overlap:** Introduce overlapping text between chunks to maintain context.
- **Extra Space Removal:** Optionally remove extra whitespace within chunks.
- **Robust API:** A class-based API for better configuration and error handling.

## Installation

```bash
npm install llm-text-splitter
```

## Usage

### Creating a Splitter Instance

To use the `Splitter`, first create an instance with your desired options:

```typescript
import { Splitter } from 'llm-text-splitter';

const splitter = new Splitter({
    maxLength: 30,
    overlap: 5,
    splitter: 'sentence',
});
```

### Splitting Text by Sentences with Overlap

```typescript
const text =
    'This is the first sentence. This is the second, slightly longer sentence. And a final short one.';
const chunks = splitter.split(text);

console.log(chunks);
// Expected output (may vary slightly depending on overlap handling):
// [
//   "This is the first sentence.",
//   "sentence.  This is the",
//   "the second, slightly longer",
//   "longer  sentence.  And a",
//   "And a final short one."
// ]
```

### Splitting Text by Paragraphs

```typescript
const text2 =
    'This is the first paragraph.\n\nThis is the second paragraph, which is a bit longer.\n\nShort paragraph.';
const chunks2 = splitter.split(text2, { splitter: 'paragraph' });
console.log(chunks2);
// Expected output:
// [
//   "This is the first paragraph.",
//   "This is the second paragraph, which is a bit longer.",
//   "Short paragraph."
// ]
```

### Splitting Text by Markdown Headings

```typescript
const text3 =
    '# Heading 1\nThis is some text under heading 1.\n\n## Heading 2\nMore text here.\n\n### Heading 3\nAnd even more text.';
const chunks3 = splitter.split(text3, { splitter: 'markdown' });
console.log(chunks3);
// Expected output:
// [
//   "# Heading 1\nThis is some text under heading 1.",
//   "## Heading 2\nMore text here.",
//   "### Heading 3\nAnd even more text."
// ]
```

### Custom Regex Splitter

```typescript
const text4 = 'Item 1; Item 2; Item 3; Item 4';
const chunks4 = splitter.split(text4, { regex: /[;]/ });
console.log(chunks4);
// Expected output:
// ["Item 1", " Item 2", " Item 3", " Item 4"]
```

### Removing Extra Spaces

```typescript
const text5 =
    'This  is   a   string   with   extra    spaces.    This  is   another   string   with   extra    spaces.';
const chunks5 = splitter.split(text5, { removeExtraSpaces: true });
console.log(chunks5);
// Expected output:
// [
//  "This is a string with extra spaces.",
//  "This is another string with extra spaces."
// ]
```

## API

### `Splitter`

The main class for splitting text.

#### Constructor

```typescript
constructor(options: SplitOptions = {})
```

- `options`: An optional object with the following properties:
    - `minLength`: The minimum length of a chunk (default: 0).
    - `maxLength`: The maximum length of a chunk (default: 5000).
    - `overlap`: The number of overlapping characters between chunks (default: 0).
    - `splitter`: The splitting method ('sentence', 'paragraph', 'markdown') (default: 'sentence').
    - `regex`: A custom regular expression for splitting. Overrides `splitter` if provided.
    - `removeExtraSpaces`: Whether to remove extra spaces within chunks (default: false).

#### Method

```typescript
split(text: string, options: SplitOptions = {}): string[]
```

- `text`: The input text string.
- `options`: An optional object to override the default options for this specific split.

### Return Value

An array of strings, where each string is a chunk of the input text.

## Error Handling

The `Splitter` class will throw an error if `minLength` is greater than `maxLength` during instantiation.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.