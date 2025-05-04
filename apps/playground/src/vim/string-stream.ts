/* eslint-disable */

export class StringStream {
  lastColumnPos = 0;
  lastColumnValue = 0;
  lineStart = 0;
  pos = 0;
  start = 0;
  str: string;
  tabSize: number;

  constructor(str: string, tabSize?: number) {
    this.str = str;
    this.tabSize = tabSize || 8;
  }

  backUp(n: number) {
    this.pos -= n;
  }

  column() {
    throw new Error('not implemented');
  }

  current() {
    return this.str.slice(this.start, this.pos);
  }

  eat(match: ((ch: string) => boolean) | RegExp | string) {
    const ch = this.str.charAt(this.pos);
    const ok = typeof match === 'string' ? ch === match : ch && (match instanceof RegExp ? match.test(ch) : match(ch));

    if (ok) {
      ++this.pos;
      return ch;
    }

    return;
  }

  eatSpace() {
    const start = this.pos;
    while (/[\s\u00a0]/.test(this.str.charAt(this.pos))) {
      ++this.pos;
    }
    return this.pos > start;
  }

  eatWhile(match: ((ch: string) => boolean) | RegExp | string) {
    const start = this.pos;
    while (this.eat(match)) {
      /* empty */
    }
    return this.pos > start;
  }

  eol() {
    return this.pos >= this.str.length;
  }

  hideFirstChars(n: number, inner: () => NonNullable<unknown>) {
    this.lineStart += n;
    try {
      return inner();
    } finally {
      this.lineStart -= n;
    }
  }

  indentation() {
    throw new Error('not implemented');
  }

  match(pattern: string, consume?: boolean, caseInsensitive?: boolean): boolean | string;
  match(pattern: RegExp, consume?: boolean): RegExpMatchArray;
  match(
    pattern: RegExp | string,
    consume?: boolean,
    caseInsensitive?: boolean
  ): boolean | null | RegExpMatchArray | string {
    if (typeof pattern == 'string') {
      const cased = (str: string) => {
        return caseInsensitive ? str.toLowerCase() : str;
      };
      const substr = this.str.substring(this.pos, this.pos + pattern.length);
      if (cased(substr) == cased(pattern)) {
        if (consume !== false) {
          this.pos += pattern.length;
        }
        return true;
      }
      return null;
    } else {
      const match = this.str.slice(this.pos).match(pattern);
      if (match?.index && match.index > 0) {
        return null;
      }
      if (match && consume !== false) {
        this.pos += match[0].length;
      }
      return match;
    }
  }

  next() {
    if (this.pos < this.str.length) {
      return this.str.charAt(this.pos++);
    }
    return;
  }

  peek() {
    return this.str.charAt(this.pos) || undefined;
  }

  skipTo(ch: string) {
    const found = this.str.indexOf(ch, this.pos);
    if (found > -1) {
      this.pos = found;
      return true;
    }
    return;
  }

  skipToEnd() {
    this.pos = this.str.length;
  }

  sol() {
    return this.pos == this.lineStart;
  }
}
