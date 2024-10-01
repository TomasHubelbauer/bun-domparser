import { test, expect } from 'bun:test';

// TODO: Introduce `*Test` types which do not have the circular references as
// base types for the actually exposed types
import DOMParser from './index';

test('one element', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<body></body>', 'text/html');
  expect(document).toEqual({
    body: {
      tagName: 'body',
      children: [],
    }
  });
});

test('two elements', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<head></head><body></body>', 'text/html');
  expect(document).toEqual({
    body: {
      tagName: 'body',
      children: [],
    }
  });
});

test('normal element', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<body><a></a></body>', 'text/html');
  expect(document).toEqual({
    body: {
      tagName: 'body',
      children: [
        {
          tagName: 'a',
          children: [],
        }
      ],
    }
  });
});
