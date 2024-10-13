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

  // TODO: Consider keeping a list of maybe just allowing any element to be void
  // Note that this information is not exposed in the `Element` web interface
  isVoid: boolean;

  append(element: Element) {
    this.children.push(element);
    element.parentNode = this;
    element.parentElement = this;
    element.ownerDocument = this.ownerDocument;
  }

  get outerHTML() {
    let html = `<${this.tagName}`;
    if (this.isVoid) {
      // TODO: Replace with `this.childNodes.length > 0` once `childNodes` exist
      if (this.children.length > 0) {
        throw new Error('Void elements cannot have children');
      }

      html += ` />`;
      return html;
    }

    html += `>`;
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

// Note that the `HTMLRewriter` tag names are always lowercase despite source HTML
const autoClosingTags: { [tag: string]: string[] } = {
  'dd': ['dt'],
  'dt': ['dd'],
  'p': ['dd', 'p'],
  'dl': ['p'],
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

      // Beware of `HTMLRewriter` silently swallowing errors!
      // See https://github.com/oven-sh/bun/issues/6124
      new HTMLRewriter()
        .on('*', {
          element(element) {
            // TODO: Carry over the HTML element attributes
            if (element.tagName === 'HTML' || element.tagName === 'html') {
              if (document.activeElement) {
                reject(new Error('Only one HTML element is allowed'));
              }

              return;
            }

            if (element.tagName === 'HEAD' || element.tagName === 'head') {
              if (document.head) {
                reject(new Error('Only one HEAD element is allowed'));
              }

              document.head = document.createElement('head');
              document.activeElement = document.head;
              return;
            }

            if (element.tagName === 'BODY' || element.tagName === 'body') {
              if (document.body) {
                reject(new Error('Only one BODY element is allowed'));
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

            // Handle an unclosed element being followed by an opening tag for another element
            if (autoClosingTags[element.tagName]?.includes(document.activeElement.tagName)) {
              document.activeElement = document.activeElement.parentElement;
            }

            const activeElement = document.createElement(element.tagName);
            document.activeElement.append(activeElement);
            document.activeElement = activeElement;

            element.onEndTag((tag) => {
              // Handle an unclosed element being followed by a closing tag for another element
              // Keep closing the element chain as void elements until we find the matching tag
              while (document.activeElement?.parentElement && tag.name !== document.activeElement.tagName) {
                // Mark as void only if there are no children, otherwise it is a
                // case of an element with no closing tag closed by another
                // element's opening tag via `autoClosingTags`
                document.activeElement.isVoid = document.activeElement.children.length === 0;
                document.activeElement = document.activeElement.parentElement;
              }

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
