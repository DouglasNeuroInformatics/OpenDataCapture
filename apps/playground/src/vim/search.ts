/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import EditorAdapter from './adapter';
import { vimGlobalState } from './global';
import { StringStream } from './string-stream';

import type { VimState } from './types';

export class SearchOverlay {
  matchSol: boolean;
  query: RegExp;

  constructor(query: RegExp) {
    this.query = query;
    this.matchSol = query.source.startsWith('^');
  }

  token(stream: StringStream) {
    if (this.matchSol && !stream.sol()) {
      stream.skipToEnd();
      return;
    }
    const match = stream.match(this.query, false);
    if (match) {
      if (match[0].length == 0) {
        // Matched empty string, skip to next.
        stream.next();
        return 'searching';
      }
      if (!stream.sol()) {
        // Backtrack 1 to match \b
        stream.backUp(1);
        if (!this.query.exec(stream.next() + match[0])) {
          stream.next();
          return null;
        }
      }
      stream.match(this.query);
      return 'searching';
    }
    while (!stream.eol()) {
      stream.next();
      if (stream.match(this.query, false)) break;
    }
    return;
  }
}

export class SearchState {
  annotate: any;
  searchOverlay?: SearchOverlay;

  getOverlay() {
    return this.searchOverlay;
  }
  getQuery(): RegExp | undefined {
    return vimGlobalState.query;
  }
  getScrollbarAnnotate() {
    return this.annotate;
  }
  isReversed() {
    return vimGlobalState.isReversed;
  }
  setOverlay(overlay?: SearchOverlay) {
    this.searchOverlay = overlay;
  }
  setQuery(query: RegExp) {
    vimGlobalState.query = query;
  }
  setReversed(reversed: boolean) {
    vimGlobalState.isReversed = reversed;
  }
  setScrollbarAnnotate(annotate: any) {
    this.annotate = annotate;
  }
}

export const searchOverlay = (query: RegExp) => {
  return new SearchOverlay(query);
};

export const getSearchState = (adapter: EditorAdapter) => {
  const vim = adapter.state.vim as VimState;
  return vim.searchState_ || (vim.searchState_ = new SearchState());
};
