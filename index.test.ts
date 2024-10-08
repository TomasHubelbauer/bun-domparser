import { test, expect } from 'bun:test';
import DOMParser from './index';

test('HTML', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<html></html>');
  expect(document.body.outerHTML).toEqual(`<body></body>`);
});

test('HEAD', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<head></head>');
  expect(document.head.outerHTML).toEqual(`<head></head>`);
  expect(document.body.outerHTML).toEqual(`<body></body>`);
});

test('BODY', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<body></body>');
  expect(document.head.outerHTML).toEqual(`<head></head>`);
  expect(document.body.outerHTML).toEqual(`<body></body>`);
});

test('HEAD & BODY', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<head></head><body></body>');
  expect(document.head.outerHTML).toEqual(`<head></head>`);
  expect(document.body.outerHTML).toEqual(`<body></body>`);
});

test('H1', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<h1></h1>');
  expect(document.body.outerHTML).toEqual(`<body><h1></h1></body>`);
});

test('H1 & H2 & H3', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString('<h1></h1><h2></h2><h3></h3>');
  expect(document.body.outerHTML).toEqual(`<body><h1></h1><h2></h2><h3></h3></body>`);
});

// TODO: Use http://info.cern.ch/hypertext/WWW/TheProject.html as one of the tests
