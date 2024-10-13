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

// See http://info.cern.ch/hypertext/WWW/TheProject.html
test('NEXTID', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString(`<HEADER><TITLE></TITLE><NEXTID></HEADER>`);
  expect(document.body.outerHTML).toEqual(`<body><header><title></title><nextid /></header></body>`);
});

// See http://info.cern.ch/hypertext/WWW/TheProject.html
test('DL & DT & DD', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString(`<DL><DT><A></A><DD><A></A><A></A><DT><A></A><DD><A></A></DL>`);
  expect(document.body.outerHTML).toEqual(`<body><dl><dt><a></a></dt><dd><a></a><a></a></dd><dt><a></a></dt><dd><a></a></dd></dl></body>`);
});

// See http://info.cern.ch/hypertext/WWW/TheProject.html
test('HEADER & BODY', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString(`<HEADER><TITLE></TITLE><NEXTID></HEADER><BODY><H1></H1></BODY>`);
  expect(document.body.outerHTML).toEqual(`<body><header><title></title><nextid /></header><h1></h1></body>`);
});

// See http://info.cern.ch/hypertext/WWW/TheProject.html
test('first WWW page', async () => {
  const domParser = new DOMParser();
  const document = await domParser.parseFromString(
    `
<HEADER>
<TITLE>The World Wide Web project</TITLE>
<NEXTID N="55">
</HEADER>
<BODY>
<H1>World Wide Web</H1>The WorldWideWeb (W3) is a wide-area<A
NAME=0 HREF="WhatIs.html">
hypermedia</A> information retrieval
initiative aiming to give universal
access to a large universe of documents.<P>
Everything there is online about
W3 is linked directly or indirectly
to this document, including an <A
NAME=24 HREF="Summary.html">executive
summary</A> of the project, <A
NAME=29 HREF="Administration/Mailing/Overview.html">Mailing lists</A>
, <A
NAME=30 HREF="Policy.html">Policy</A> , November's  <A
NAME=34 HREF="News/9211.html">W3  news</A> ,
<A
NAME=41 HREF="FAQ/List.html">Frequently Asked Questions</A> .
<DL>
<DT><A
NAME=44 HREF="../DataSources/Top.html">What's out there?</A>
<DD> Pointers to the
world's online information,<A
NAME=45 HREF="../DataSources/bySubject/Overview.html"> subjects</A>
, <A
NAME=z54 HREF="../DataSources/WWW/Servers.html">W3 servers</A>, etc.
<DT><A
NAME=46 HREF="Help.html">Help</A>
<DD> on the browser you are using
<DT><A
NAME=13 HREF="Status.html">Software Products</A>
<DD> A list of W3 project
components and their current state.
(e.g. <A
NAME=27 HREF="LineMode/Browser.html">Line Mode</A> ,X11 <A
NAME=35 HREF="Status.html#35">Viola</A> ,  <A
NAME=26 HREF="NeXT/WorldWideWeb.html">NeXTStep</A>
, <A
NAME=25 HREF="Daemon/Overview.html">Servers</A> , <A
NAME=51 HREF="Tools/Overview.html">Tools</A> ,<A
NAME=53 HREF="MailRobot/Overview.html"> Mail robot</A> ,<A
NAME=52 HREF="Status.html#57">
Library</A> )
<DT><A
NAME=47 HREF="Technical.html">Technical</A>
<DD> Details of protocols, formats,
program internals etc
<DT><A
NAME=40 HREF="Bibliography.html">Bibliography</A>
<DD> Paper documentation
on  W3 and references.
<DT><A
NAME=14 HREF="People.html">People</A>
<DD> A list of some people involved
in the project.
<DT><A
NAME=15 HREF="History.html">History</A>
<DD> A summary of the history
of the project.
<DT><A
NAME=37 HREF="Helping.html">How can I help</A> ?
<DD> If you would like
to support the web..
<DT><A
NAME=48 HREF="../README.html">Getting code</A>
<DD> Getting the code by<A
NAME=49 HREF="LineMode/Defaults/Distribution.html">
anonymous FTP</A> , etc.</A>
</DL>
</BODY>
`
  );

  expect(document.body.outerHTML).toEqual(`<body><header><title></title><nextid /></header><h1></h1><a></a><p><a></a><a></a><a></a><a></a><a></a></p><dl><dt><a></a></dt><dd><a></a><a></a></dd><dt><a></a></dt><dd></dd><dt><a></a></dt><dd><a></a><a></a><a></a><a></a><a></a><a></a><a></a></dd><dt><a></a></dt><dd></dd><dt><a></a></dt><dd></dd><dt><a></a></dt><dd></dd><dt><a></a></dt><dd></dd><dt><a></a></dt><dd></dd><dt><a></a></dt><dd><a></a></dd></dl></body>`);
});
