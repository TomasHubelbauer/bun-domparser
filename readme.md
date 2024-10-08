# Bun `DOMParser`

A `DOMParser`, `Node`, `Document`, `Element` and `Text` implementation for Bun.
The `DOMParser.parseFromString` method is asynchronous compared to the original
web API for practical reasons (the underlying `HTMLRewriter` is asynchronous).

## Usage

`bun add tomashubelbauer/bun-domparser`

```typescript
const domParser = new DOMParser();
const document = domParser.parseFromString('<html>…');
// Use `document` as per the usual
```

## Development

Use `bun test` to run the test suite.

## To-Do

### Look into integrating the Bun CSS parser

https://bun.sh/blog/bun-v1.1.30#experimental-css-parsing-bundling

Maybe wait until it is not experimental?
Maybe not muddy this package with it and instead use it alongside this package
where both HTML and CSS should be used?
