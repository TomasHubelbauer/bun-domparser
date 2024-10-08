// See https://developer.mozilla.org/en-US/docs/Web/API/Node
interface Node {
  ownerDocument: Document;
  parentNode: Node;
  parentElement: Element;
}

// See https://developer.mozilla.org/en-US/docs/Web/API/Element
class Document implements Node {
  head: Element;
  body: Element;
  activeElement: Element;
  ownerDocument: Document;
  parentNode: Node;
  parentElement: Element;

  createElement(tagName: string) {
    const element = new Element();
    element.tagName = tagName;
    element.parentNode = this;
    element.ownerDocument = this;
    return element;
  }
}

// See https://developer.mozilla.org/en-US/docs/Web/API/Document
class Element implements Node {
  tagName: string;
  children: Element[] = [];
  ownerDocument: Document;
  parentNode: Node;
  parentElement: Element;

  append(element: Element) {
    this.children.push(element);
    element.parentNode = this;
    element.parentElement = this;
    element.ownerDocument = this.ownerDocument;
  }

  get outerHTML() {
    let html = `<${this.tagName}>`;
    for (const child of this.children) {
      html += child.outerHTML;
    }

    html += `</${this.tagName}>`;
    return html;
  }
}

// See https://developer.mozilla.org/en-US/docs/Web/API/Text
class Text implements Node {
  textContent: string;
  ownerDocument: Document;
  parentNode: Node;
  parentElement: Element;
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
  parseFromString(string: string, mimeType = 'text/html') {
    if (mimeType !== 'text/html') {
      throw new TypeError('Only text/html is supported');
    }

    return new Promise<Document>((resolve, reject) => {
      const document = new Document();
      new HTMLRewriter()
        .on('*', {
          element(element) {
            // TODO: Carry over the HTML element attributes
            if (element.tagName === 'HTML' || element.tagName === 'html') {
              if (document.activeElement) {
                throw new Error('Only one HTML element is allowed');
              }

              return;
            }

            if (element.tagName === 'HEAD' || element.tagName === 'head') {
              if (document.head) {
                throw new Error('Only one HEAD element is allowed');
              }

              document.head = document.createElement('head');
              document.activeElement = document.head;
              return;
            }

            if (element.tagName === 'BODY' || element.tagName === 'body') {
              if (document.body) {
                throw new Error('Only one BODY element is allowed');
              }

              document.body = document.createElement('body');
              document.activeElement = document.body;
              return;
            }

            // Create a `body` in case the top-level element came before `body`
            if (!document.activeElement) {
              document.body = document.createElement('body');
              document.activeElement = document.body;
            }

            const activeElement = document.createElement(element.tagName);
            document.activeElement.append(activeElement);
            document.activeElement = activeElement;

            element.onEndTag(() => {
              document.activeElement = document.activeElement.parentElement;
            });
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
            if (!document.head) {
              document.head = document.createElement('head');
            }

            if (!document.body) {
              document.body = document.createElement('body');
            }

            resolve(document);
          }
        })
        .transform(string);
    });
  }
}
