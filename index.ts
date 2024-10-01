// TODO: Use the same API as https://developer.mozilla.org/en-US/docs/Web/API/Node
class Node {

}

// TODO: Use the same API as https://developer.mozilla.org/en-US/docs/Web/API/Element
class Document {
  #parentMap: WeakMap<Element, Element>;
  constructor() {
    this.#parentMap = new WeakMap<Element, Element>();
  }

  get parentMap() {
    return this.#parentMap;
  }

  body: Element;
}

// TODO: Use the same API as https://developer.mozilla.org/en-US/docs/Web/API/Document
class Element {
  #document: Document;
  constructor(document: Document, parentElement: Element | undefined, tagName: string) {
    this.#document = document;
    if (parentElement) {
      this.#document.parentMap.set(this, parentElement);
    }

    this.tagName = tagName;
  }

  tagName: string;
  children: Element[] = [];

  // TODO: Get this from `Node`
  get parentElement() {
    return this.#document.parentMap.get(this);
  };
}

// TODO: See if we can use some API from `HTMLRewriter` to not have to keep this
const autoClosingTags: { [tag: string]: string[] } = {
  'DD': ['DT'],
  'DT': ['DD'],
  'P': ['DD', 'P'],
  'DL': ['P'],
};

/**
 * Implements the `DOMParser` class.
 * Note that `parseFromString` method is `async` because the underlying
 * `HTMLRewriter` is event-based.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 * @see https://bun.sh/docs/api/html-rewriter
 * @see https://developers.cloudflare.com/workers/runtime-apis/html-rewriter
 */
export default class DOMParser {
  /**
   * Parses the HTML text and returns a `Document` object.
   * Note that this method is `async` because the underlying `HTMLRewriter` is
   * event-based.
   * 
   * @param string The HTML string to parse.
   * @param mimeType The `text/html` MIME type.
   * @returns A `Document` object representing the HTML document.
   */
  parseFromString(string: string, mimeType: 'text/html') {
    if (mimeType !== 'text/html') {
      throw new TypeError('Only text/html is supported');
    }

    const htmlRewriter = new HTMLRewriter();
    const elements: Element[] = [];
    let pivot: Element | undefined;

    function getPath(element: Element) {
      const path = [element.tagName.toUpperCase()];
      let pivot = element.parentElement;
      while (pivot) {
        path.unshift(pivot.tagName.toUpperCase());
        pivot = pivot.parentElement;
      }

      return path.join(' > ');
    }

    return new Promise<Document>((resolve, reject) => {
      const document = new Document();
      htmlRewriter
        .on('*', {
          element(element) {
            if (pivot && autoClosingTags[element.tagName.toUpperCase()]?.includes(pivot.tagName.toUpperCase())) {
              pivot = pivot.parentElement;
              if (pivot) {
                console.log('auto-closed', getPath(pivot));

                const newElement = new Element(document, pivot, element.tagName);
                pivot.children.push(newElement);
                pivot = newElement;
                console.log('auto-opened', getPath(newElement));
              }
              else {
                reject('TODO1');
              }
            }
            else if (!element.selfClosing) {
              const newElement = new Element(document, pivot, element.tagName);
              if (pivot) {
                pivot.children.push(newElement);
              }
              else {
                elements.push(newElement);
              }

              pivot = newElement;
              console.log('opened', getPath(newElement));

              element.onEndTag(() => {
                if (pivot) {
                  pivot = pivot.parentElement;
                  console.log('closed', getPath(newElement), pivot);
                } else {
                  elements.push(newElement);
                  console.log('rooted', getPath(newElement));
                }
              });
            }
            else {
              const newElement = new Element(document, pivot, element.tagName);
              if (pivot) {
                pivot.children.push(newElement);
              }
              else {
                elements.push(newElement);
              }

              console.log('self-closed', getPath(newElement));
            }
          },
          comments(comment) {
            console.log('element comments', comment.text);
          },
          text(_text) {
            //console.log('element text', JSON.stringify(text.text));
          }
        })
        .onDocument({
          doctype() {
            console.log('doctype');
          },
          comments() {
            console.log('document comments');
          },
          text(_text) {
            //console.log('document text', JSON.stringify(text.text));
          },
          end(_end) {
            const tagNames = elements.map(e => e.tagName).join();
            switch (tagNames) {
              case 'body': {
                document.body = elements[0];
                resolve(document);
                return;
              }
              case 'head,body':
              case 'header,body': {
                document.body = elements[1];
                resolve(document);
                return;
              }
              default: {
                reject(`Expected head, body or both, got ${tagNames}`);
                return;
              }
            }

            reject('Unexpected end of document');
          }
        });

      htmlRewriter.transform(string);
    });
  }
}

if (import.meta.main) {
  const response = await fetch('http://info.cern.ch/hypertext/WWW/TheProject.html');
  const text = await response.text();

  const domParser = new DOMParser();
  const document = await domParser.parseFromString(text, 'text/html');

  function printElement(element: Element, level = 0) {
    console.log(' '.repeat(level * 2) + element.tagName);
    element.children.forEach(child => printElement(child, level + 1));
  }

  printElement(document.body);
}
