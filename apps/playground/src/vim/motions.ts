/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/**
 * typedef {Object{line:number,ch:number}} Cursor An object containing the
 *     position of the cursor.
 */

import EditorAdapter from './adapter';
import {
  copyCursor,
  cursorEqual,
  cursorIsBefore,
  cursorIsBetween,
  cursorMax,
  cursorMin,
  findFirstNonWhiteSpaceCharacter,
  isEndOfSentenceSymbol,
  isLowerCase,
  isWhiteSpaceString,
  makePos
} from './common';
import { vimGlobalState } from './global';
import { InputState } from './input-state';
import {
  bigWordCharTest,
  clipCursorToContent,
  expandWordUnderCursor,
  findNext,
  getMarkPos,
  highlightSearchMatches,
  keywordCharTest,
  lineLength,
  offsetCursor
} from './keymap_vim';
import { getSearchState } from './search';

import type { Pos } from './common';
import type { MotionArgs, VimState } from './types';

// All of the functions below return Cursor objects.
export type MotionFunc = (
  adapter: EditorAdapter,
  head: Pos,
  motionArgs: MotionArgs,
  vim: VimState,
  previousInputState: InputState
) => MotionResult;
type MotionResult = [Pos, Pos] | Pos | undefined;

export const motions: { [key: string]: MotionFunc } = {
  expandToLine: function (_cm, head, motionArgs) {
    // Expands forward to end of line, and then to next line if repeat is
    // >1. Does not handle backward motion!
    return makePos(head.line + motionArgs.repeat! - 1, Infinity);
  },
  /**
   * Find and select the next occurrence of the search query. If the cursor is currently
   * within a match, then find and select the current match. Otherwise, find the next occurrence in the
   * appropriate direction.
   *
   * This differs from `findNext` in the following ways:
   *
   * 1. Instead of only returning the "from", this returns a "from", "to" range.
   * 2. If the cursor is currently inside a search match, this selects the current match
   *    instead of the next match.
   * 3. If there is no associated operator, this will turn on visual mode.
   */
  findAndSelectNextInclusive: function (adapter, _head, motionArgs, vim, prevInputState) {
    const state = getSearchState(adapter);
    const query = state.getQuery();

    if (!query || !vim) {
      return;
    }

    let prev = !motionArgs.forward;
    prev = state.isReversed() ? !prev : prev;

    // next: [from, to] | null
    const next = findNextFromAndToInclusive(adapter, prev, query, motionArgs.repeat!, vim);

    // No matches.
    if (!next || !vim) {
      return;
    }

    // If there's an operator that will be executed, return the selection.
    if (prevInputState?.operator) {
      return next;
    }

    // At this point, we know that there is no accompanying operator -- let's
    // deal with visual mode in order to select an appropriate match.

    const from = next[0];
    // For whatever reason, when we use the "to" as returned by searchcursor.js directly,
    // the resulting selection is extended by 1 char. Let's shrink it so that only the
    // match is selected.
    const to = makePos(next[1].line, next[1].ch - 1);

    if (vim.visualMode) {
      // If we were in visualLine or visualBlock mode, get out of it.
      if (vim.visualLine || vim.visualBlock) {
        vim.visualLine = false;
        vim.visualBlock = false;
        adapter.dispatch('vim-mode-change', {
          mode: 'visual',
          subMode: ''
        });
      }

      // If we're currently in visual mode, we should extend the selection to include
      // the search result.
      const anchor = vim.sel.anchor;
      if (anchor) {
        if (state.isReversed()) {
          if (motionArgs.forward) {
            return [anchor, from];
          }

          return [anchor, to];
        } else {
          if (motionArgs.forward) {
            return [anchor, to];
          }

          return [anchor, from];
        }
      }
    } else {
      // Let's turn visual mode on.
      vim.visualMode = true;
      vim.visualLine = false;
      vim.visualBlock = false;
      adapter.dispatch('vim-mode-change', {
        mode: 'visual',
        subMode: ''
      });
    }

    return prev ? [to, from] : [from, to];
  },
  findNext: function (adapter, _head, motionArgs) {
    const state = getSearchState(adapter);
    const query = state.getQuery();
    if (!query) {
      return;
    }
    let prev = !motionArgs.forward;
    // If search is initiated with ? instead of /, negate direction.
    prev = state.isReversed() ? !prev : prev;
    highlightSearchMatches(adapter, query);
    return findNext(adapter, prev /** prev */, query, motionArgs.repeat);
  },
  goToMark: function (adapter, _head, motionArgs, vim) {
    const pos = getMarkPos(adapter, vim, motionArgs.selectedCharacter!);
    if (pos) {
      return motionArgs.linewise ? makePos(pos.line, findFirstNonWhiteSpaceCharacter(adapter.getLine(pos.line))) : pos;
    }
    return;
  },
  jumpToMark: function (adapter, head, motionArgs, vim) {
    if (!vim) {
      return;
    }
    let best = head;
    for (let i = 0; i < motionArgs.repeat!; i++) {
      let cursor = best;
      for (const key in vim.marks) {
        if (!isLowerCase(key)) {
          continue;
        }
        const mark = vim.marks[key].find();
        const isWrongDirection = motionArgs.forward ? cursorIsBefore(mark, cursor) : cursorIsBefore(cursor, mark);

        if (isWrongDirection) {
          continue;
        }
        if (motionArgs.linewise && mark.line == cursor.line) {
          continue;
        }

        const equal = cursorEqual(cursor, best);
        const between = motionArgs.forward ? cursorIsBetween(cursor, mark, best) : cursorIsBetween(best, mark, cursor);

        if (equal || between) {
          best = mark;
        }
      }
    }

    if (motionArgs.linewise) {
      // Vim places the cursor on the first non-whitespace character of
      // the line if there is one, else it places the cursor at the end
      // of the line, regardless of whether a mark was found.
      best = makePos(best.line, findFirstNonWhiteSpaceCharacter(adapter.getLine(best.line)));
    }
    return best;
  },
  moveByCharacters: function (_cm, head, motionArgs) {
    const cur = head;
    const repeat = motionArgs.repeat || 0;
    const ch = motionArgs.forward ? cur.ch + repeat : cur.ch - repeat;
    return makePos(cur.line, ch);
  },
  moveByDisplayLines: function (adapter, head, motionArgs, vim) {
    const cur = head;
    switch (vim.lastMotion) {
      case this.moveByDisplayLines:
      case this.moveByScroll:
      case this.moveByLines:
      case this.moveToColumn:
      case this.moveToEol:
        break;
      default:
        vim.lastHSPos = adapter.charCoords(cur, 'div').left;
    }
    const repeat = motionArgs.repeat || 0;
    let res = adapter.findPosV(
      cur,
      motionArgs.forward ? repeat : -repeat,
      'line'
      // vim.lastHSPos
    );
    vim.lastHPos = res.ch;
    return res;
  },
  moveByLines: function (adapter, head, motionArgs, vim, prevInputState) {
    const cur = head;
    let endCh = cur.ch;
    // Depending what our last motion was, we may want to do different
    // things. If our last motion was moving vertically, we want to
    // preserve the HPos from our last horizontal move.  If our last motion
    // was going to the end of a line, moving vertically we should go to
    // the end of the line, etc.
    switch (vim.lastMotion) {
      case this.moveByLines:
      case this.moveByDisplayLines:
      case this.moveByScroll:
      case this.moveToColumn:
      case this.moveToEol:
        endCh = vim.lastHPos;
        break;
      default:
        vim.lastHPos = endCh;
    }
    const repeat = (motionArgs.repeat || 0) + (motionArgs.repeatOffset || 0);
    let line = motionArgs.forward ? cur.line + repeat : cur.line - repeat;
    const first = adapter.firstLine();
    const last = adapter.lastLine();
    const posV = adapter.findPosV(
      cur,
      motionArgs.forward ? repeat : -repeat,
      'line'
      // vim.lastHSPos
    );
    const hasMarkedText = motionArgs.forward ? posV.line > line : posV.line < line;
    if (hasMarkedText) {
      line = posV.line;
      endCh = posV.ch;
    }
    // Vim go to line begin or line end when cursor at first/last line and
    // move to previous/next line is triggered.
    if (line < first && cur.line == first) {
      return this.moveToStartOfLine(adapter, head, motionArgs, vim, prevInputState);
    } else if (line > last && cur.line == last) {
      return moveToEol(adapter, head, motionArgs, vim, true);
    }
    if (motionArgs.toFirstChar) {
      endCh = findFirstNonWhiteSpaceCharacter(adapter.getLine(line));
      vim.lastHPos = endCh;
    }
    vim.lastHSPos = adapter.charCoords(makePos(line, endCh), 'div').left;
    return makePos(line, endCh);
  },
  moveByPage: function (adapter, head, motionArgs) {
    // EditorAdapter only exposes functions that move the cursor page down, so
    // doing this bad hack to move the cursor and move it back. evalInput
    // will move the cursor to where it should be in the end.
    const curStart = head;
    const repeat = motionArgs.repeat!;
    return adapter.findPosV(curStart, motionArgs.forward ? repeat : -repeat, 'page');
  },
  moveByParagraph: function (adapter, head, motionArgs) {
    const dir = motionArgs.forward ? 1 : -1;
    return findParagraph(adapter, head, motionArgs.repeat!, dir);
  },
  moveByScroll: function (adapter, head, motionArgs, vim, prevInputState) {
    const scrollbox = adapter.getScrollInfo();
    let repeat = motionArgs.repeat;
    if (!repeat) {
      repeat = scrollbox.clientHeight / (2 * adapter.defaultTextHeight());
    }
    const orig = adapter.charCoords(head, 'local');
    motionArgs.repeat = repeat;
    const curEnd = motions.moveByDisplayLines(adapter, head, motionArgs, vim, prevInputState);
    if (!curEnd) {
      return;
    }
    const dest = adapter.charCoords(curEnd as Pos, 'local');
    adapter.scrollTo(undefined, scrollbox.top + dest.top - orig.top);
    return curEnd;
  },
  moveBySentence: function (adapter, head, motionArgs) {
    const dir = motionArgs.forward ? 1 : -1;
    return findSentence(adapter, head, motionArgs.repeat!, dir);
  },
  moveByWords: function (adapter, head, motionArgs) {
    return moveToWord(
      adapter,
      head,
      motionArgs.repeat!,
      !!motionArgs.forward,
      !!motionArgs.wordEnd,
      !!motionArgs.bigWord
    );
  },
  moveTillCharacter: function (adapter, _head, motionArgs) {
    const repeat = motionArgs.repeat || 0;
    const curEnd = moveToCharacter(adapter, repeat, !!motionArgs.forward, motionArgs.selectedCharacter!);
    const increment = motionArgs.forward ? -1 : 1;
    recordLastCharacterSearch(increment, motionArgs);
    if (!curEnd) return;
    curEnd.ch += increment;
    return curEnd;
  },
  moveToBottomLine: function (adapter, _head, motionArgs) {
    const line = getUserVisibleLines(adapter).bottom - motionArgs.repeat! + 1;
    return makePos(line, findFirstNonWhiteSpaceCharacter(adapter.getLine(line)));
  },
  moveToCharacter: function (adapter, head, motionArgs) {
    const repeat = motionArgs.repeat || 0;
    recordLastCharacterSearch(0, motionArgs);
    return moveToCharacter(adapter, repeat, !!motionArgs.forward, motionArgs.selectedCharacter!) || head;
  },
  moveToColumn: function (adapter, head, motionArgs, vim) {
    const repeat = motionArgs.repeat || 0;
    // repeat is equivalent to which column we want to move to!
    vim.lastHPos = repeat - 1;
    vim.lastHSPos = adapter.charCoords(head, 'div').left;
    return moveToColumn(adapter, repeat);
  },
  moveToEndOfDisplayLine: function (adapter) {
    adapter.execCommand('goLineRight');
    return adapter.getCursor();
  },
  moveToEol: function (adapter, head, motionArgs, vim) {
    return moveToEol(adapter, head, motionArgs, vim, false);
  },
  moveToFirstNonWhiteSpaceCharacter: function (adapter, head) {
    // Go to the start of the line where the text begins, or the end for
    // whitespace-only lines
    const cursor = head;
    return makePos(cursor.line, findFirstNonWhiteSpaceCharacter(adapter.getLine(cursor.line)));
  },
  moveToLineOrEdgeOfDocument: function (adapter, _head, motionArgs) {
    let lineNum = motionArgs.forward ? adapter.lastLine() : adapter.firstLine();
    if (motionArgs.repeatIsExplicit) {
      lineNum = motionArgs.repeat! - adapter.getOption('firstLineNumber');
    }
    return makePos(lineNum, findFirstNonWhiteSpaceCharacter(adapter.getLine(lineNum)));
  },
  moveToMatchedSymbol: function (adapter, head) {
    const lineText = adapter.getLine(head.line);
    // var symbol;
    // for (; ch < lineText.length; ch++) {
    //   symbol = lineText.charAt(ch);
    //   if (symbol && isMatchableSymbol(symbol)) {
    //     var style = adapter.getTokenTypeAt(new Pos(line, ch + 1));
    //     if (style !== "string" && style !== "comment") {
    //       break;
    //     }
    //   }
    // }
    if (head.ch < lineText.length) {
      const matched = adapter.findMatchingBracket(head);
      if (matched) {
        return matched.pos;
      }
    } else {
      return head;
    }
    return;
  },
  moveToMiddleLine: function (adapter) {
    const range = getUserVisibleLines(adapter);
    const line = Math.floor((range.top + range.bottom) * 0.5);
    return makePos(line, findFirstNonWhiteSpaceCharacter(adapter.getLine(line)));
  },
  moveToOtherHighlightedEnd: function (adapter, _head, motionArgs, vim) {
    if (!vim) {
      return;
    }
    if (vim.visualBlock && motionArgs.sameLine) {
      const sel = vim.sel;
      return [
        clipCursorToContent(adapter, makePos(sel.anchor.line, sel.head.ch)),
        clipCursorToContent(adapter, makePos(sel.head.line, sel.anchor.ch))
      ];
    } else {
      return [vim.sel.head, vim.sel.anchor];
    }
  },
  moveToStartOfDisplayLine: function (adapter) {
    adapter.execCommand('goLineLeft');
    return adapter.getCursor();
  },
  moveToStartOfLine: function (_cm, head) {
    return makePos(head.line, 0);
  },
  moveToSymbol: function (adapter, head, motionArgs) {
    const repeat = motionArgs.repeat || 0;
    return findSymbol(adapter, repeat, !!motionArgs.forward, motionArgs.selectedCharacter!) || head;
  },
  moveToTopLine: function (adapter, _head, motionArgs) {
    const line = getUserVisibleLines(adapter).top + motionArgs.repeat! - 1;
    return makePos(line, findFirstNonWhiteSpaceCharacter(adapter.getLine(line)));
  },
  repeatLastCharacterSearch: function (adapter, head, motionArgs) {
    const lastSearch = vimGlobalState.lastCharacterSearch;
    const repeat = motionArgs.repeat || 0;
    const forward = motionArgs.forward === lastSearch.forward;
    const increment = (lastSearch.increment ? 1 : 0) * (forward ? -1 : 1);
    adapter.moveH(-increment, 'char');
    motionArgs.inclusive = forward ? true : false;
    const curEnd = moveToCharacter(adapter, repeat, forward, lastSearch.selectedCharacter);
    if (!curEnd) {
      adapter.moveH(increment, 'char');
      return head;
    }
    curEnd.ch += increment;
    return curEnd;
  },

  textObjectManipulation: function (adapter, head, motionArgs, vim) {
    // TODO: lots of possible exceptions that can be thrown here. Try da(
    //     outside of a () block.
    const mirroredPairs: { [key: string]: string } = {
      '(': ')',
      ')': '(',
      '<': '>',
      '>': '<',
      '[': ']',
      ']': '[',
      '{': '}',
      '}': '{'
    };
    const selfPaired: { [key: string]: boolean } = {
      '"': true,
      "'": true,
      '`': true
    };

    let character = motionArgs.selectedCharacter!;
    // 'b' refers to  '()' block.
    // 'B' refers to  '{}' block.
    if (character == 'b') {
      character = '(';
    } else if (character == 'B') {
      character = '{';
    }

    // Inclusive is the difference between a and i
    // TODO: Instead of using the additional text object map to perform text
    //     object operations, merge the map into the defaultKeyMap and use
    //     motionArgs to define behavior. Define separate entries for 'aw',
    //     'iw', 'a[', 'i[', etc.
    const inclusive = !motionArgs.textObjectInner;

    let tmp: [Pos, Pos] | undefined;
    if (mirroredPairs[character]) {
      tmp = selectCompanionObject(adapter, head, character, inclusive);
    } else if (selfPaired[character]) {
      tmp = findBeginningAndEnd(adapter, head, character, inclusive);
    } else if (character === 'W') {
      tmp = expandWordUnderCursor(adapter, inclusive, true /** forward */, true /** bigWord */);
    } else if (character === 'w') {
      tmp = expandWordUnderCursor(adapter, inclusive, true /** forward */, false /** bigWord */);
    } else if (character === 'p') {
      const para = findParagraph(adapter, head, motionArgs.repeat!, 0, inclusive);
      tmp = Array.isArray(para) ? para : [para, para];
      motionArgs.linewise = true;
      if (vim.visualMode) {
        if (!vim.visualLine) {
          vim.visualLine = true;
        }
      } else {
        const operatorArgs = vim.inputState.operatorArgs;
        if (operatorArgs) {
          operatorArgs.linewise = true;
        }
        tmp[1].line--;
      }
    } else if (character === 't') {
      tmp = expandTagUnderCursor(adapter, head, inclusive);
    } else {
      // No text object defined for this, don't move.
      return;
    }

    if (!tmp) {
      return;
    }

    if (!adapter.state.vim.visualMode) {
      return tmp;
    } else {
      return expandSelection(adapter, tmp[0], tmp[1]);
    }
  }
};

export const defineMotion = (name: string, fn: MotionFunc) => (motions[name] = fn);

function getUserVisibleLines(adapter: EditorAdapter) {
  const scrollInfo = adapter.getScrollInfo();
  const occludeToleranceTop = 6;
  const occludeToleranceBottom = 10;
  const from: Pos = { ch: 0, line: occludeToleranceTop + scrollInfo.top };
  const bottomY = scrollInfo.clientHeight - occludeToleranceBottom + scrollInfo.top;
  const to: Pos = { ch: 0, line: bottomY };
  return { bottom: to.line, top: from.line };
}

/**
 * Pretty much the same as `findNext`, except for the following differences:
 *
 * 1. Before starting the search, move to the previous search. This way if our cursor is
 * already inside a match, we should return the current match.
 * 2. Rather than only returning the cursor's from, we return the cursor's from and to as a tuple.
 */
function findNextFromAndToInclusive(
  adapter: EditorAdapter,
  prev: boolean,
  query: RegExp,
  repeat: number,
  vim: VimState
): [Pos, Pos] | undefined {
  if (repeat === undefined) {
    repeat = 1;
  }
  const pos = adapter.getCursor();
  let cursor = adapter.getSearchCursor(query, pos);

  // Go back one result to ensure that if the cursor is currently a match, we keep it.
  let found = cursor.find(!prev);

  // If we haven't moved, go back one more (similar to if i==0 logic in findNext).
  if (!vim.visualMode && found && cursorEqual(cursor.from(), pos)) {
    cursor.find(!prev);
  }

  for (let i = 0; i < repeat; i++) {
    found = cursor.find(prev);
    if (!found) {
      // SearchCursor may have returned null because it hit EOF, wrap
      // around and try again.
      cursor = adapter.getSearchCursor(query, makePos(prev ? adapter.lastLine() : adapter.firstLine(), 0));
      if (!cursor.find(prev)) {
        return;
      }
    }
  }
  return [cursor.from(), cursor.to()];
}

/**
 * @param {EditorAdapter} adapter EditorAdapter object.
 * @param {Pos} cur The position to start from.
 * @param {int} repeat Number of words to move past.
 * @param {boolean} forward True to search forward. False to search
 *     backward.
 * @param {boolean} wordEnd True to move to end of word. False to move to
 *     beginning of word.
 * @param {boolean} bigWord True if punctuation count as part of the word.
 *     False if only alphabet characters count as part of the word.
 * @return {Cursor} The position the cursor should move to.
 */
function moveToWord(
  adapter: EditorAdapter,
  cur: Pos,
  repeat: number,
  forward: boolean,
  wordEnd: boolean,
  bigWord: boolean
): Pos {
  const curStart = copyCursor(cur);
  const words: { from: number; line: number; to: number }[] = [];
  if ((forward && !wordEnd) || (!forward && wordEnd)) {
    repeat++;
  }
  // For 'e', empty lines are not considered words, go figure.
  const emptyLineIsWord = !(forward && wordEnd);
  for (let i = 0; i < repeat; i++) {
    const word = findWord(adapter, cur, forward, bigWord, emptyLineIsWord);
    if (!word) {
      const eodCh = lineLength(adapter, adapter.lastLine());
      words.push(forward ? { from: eodCh, line: adapter.lastLine(), to: eodCh } : { from: 0, line: 0, to: 0 });
      break;
    }
    words.push(word);
    cur = makePos(word.line, forward ? word.to - 1 : word.from);
  }
  const shortCircuit = words.length != repeat;
  const firstWord = words[0];
  let lastWord = words.pop()!;
  if (forward && !wordEnd) {
    // w
    if (!shortCircuit && (firstWord.from != curStart.ch || firstWord.line != curStart.line)) {
      // We did not start in the middle of a word. Discard the extra word at the end.
      lastWord = words.pop()!;
    }
    return makePos(lastWord.line, lastWord.from);
  } else if (forward && wordEnd) {
    return makePos(lastWord.line, lastWord.to - 1);
  } else if (!forward && wordEnd) {
    // ge
    if (!shortCircuit && (firstWord.to != curStart.ch || firstWord.line != curStart.line)) {
      // We did not start in the middle of a word. Discard the extra word at the end.
      lastWord = words.pop()!;
    }
    return makePos(lastWord.line, lastWord.to);
  } else {
    // b
    return makePos(lastWord.line, lastWord.from);
  }
}

function moveToEol(adapter: EditorAdapter, head: Pos, motionArgs: MotionArgs, vim: VimState, keepHPos: boolean) {
  const cur = head;
  const retval = makePos(cur.line + motionArgs.repeat! - 1, Infinity);
  const end = adapter.clipPos(retval);
  end.ch--;
  if (!keepHPos) {
    vim.lastHPos = Infinity;
    vim.lastHSPos = adapter.charCoords(end, 'div').left;
  }
  return retval;
}

function moveToCharacter(adapter: EditorAdapter, repeat: number, forward: boolean, character: string) {
  const cur = adapter.getCursor();
  let start = cur.ch;
  let idx = 0;
  for (let i = 0; i < repeat; i++) {
    const line = adapter.getLine(cur.line);
    idx = charIdxInLine(start, line, character, forward, true);
    if (idx == -1) {
      return null;
    }
    start = idx;
  }
  return makePos(adapter.getCursor().line, idx);
}

function moveToColumn(adapter: EditorAdapter, repeat: number) {
  // repeat is always >= 1, so repeat - 1 always corresponds
  // to the column we want to go to.
  const line = adapter.getCursor().line;
  return clipCursorToContent(adapter, makePos(line, repeat - 1));
}

function findParagraph(
  adapter: EditorAdapter,
  head: Pos,
  repeat: number,
  dir: -1 | 0 | 1,
  inclusive?: boolean
): [Pos, Pos] | Pos {
  let line = head.line;
  let min = adapter.firstLine();
  let max = adapter.lastLine();
  let i = line;
  const isEmpty = (i: number) => {
    return !adapter.getLine(i);
  };
  const isBoundary = (i: number, dir: -1 | 1, any?: boolean) => {
    if (any) {
      return isEmpty(i) != isEmpty(i + dir);
    }
    return !isEmpty(i) && isEmpty(i + dir);
  };
  if (dir) {
    while (min <= i && i <= max && repeat > 0) {
      if (isBoundary(i, dir)) {
        repeat--;
      }
      i += dir;
    }
    return makePos(i, 0);
  }

  const vim = adapter.state.vim;
  if (vim.visualLine && isBoundary(line, 1, true)) {
    const anchor = vim.sel.anchor;
    if (isBoundary(anchor.line, -1, true)) {
      if (!inclusive || anchor.line != line) {
        line += 1;
      }
    }
  }
  let startState = isEmpty(line);
  for (i = line; i <= max && repeat; i++) {
    if (isBoundary(i, 1, true)) {
      if (!inclusive || isEmpty(i) != startState) {
        repeat--;
      }
    }
  }
  const end = makePos(1, 0);
  // select boundary before paragraph for the last one
  if (i > max && !startState) {
    startState = true;
  } else {
    inclusive = false;
  }
  for (i = line; i > min; i--) {
    if (!inclusive || isEmpty(i) == startState || i == line) {
      if (isBoundary(i, -1, true)) {
        break;
      }
    }
  }
  const start = makePos(i, 0);
  return [start, end];
}

type Index = {
  dir: -1 | 1;
  line?: string;
  ln?: number;
  pos?: number;
};

function findSentence(adapter: EditorAdapter, cur: Pos, repeat: number, dir: -1 | 1): Pos {
  /*
        Takes an index object
        {
          line: the line string,
          ln: line number,
          pos: index in line,
          dir: direction of traversal (-1 or 1)
        }
        and modifies the line, ln, and pos members to represent the
        next valid position or sets them to null if there are
        no more valid positions.
       */
  const nextChar = (adapter: EditorAdapter, idx: Index) => {
    if (idx.line === undefined || idx.ln === undefined || idx.pos === undefined) {
      idx.line = undefined;
      idx.ln = undefined;
      idx.pos = undefined;
      return;
    }
    if (idx.pos + idx.dir < 0 || idx.pos + idx.dir >= idx.line.length) {
      idx.ln += idx.dir;
      if (!isLine(adapter, idx.ln)) {
        idx.line = undefined;
        idx.ln = undefined;
        idx.pos = undefined;
        return;
      }
      idx.line = adapter.getLine(idx.ln);
      idx.pos = idx.dir > 0 ? 0 : idx.line.length - 1;
    } else {
      idx.pos += idx.dir;
    }
  };

  /*
        Performs one iteration of traversal in forward direction
        Returns an index object of the new location
       */
  const forward = (adapter: EditorAdapter, ln: number, pos: number, dir: -1 | 1) => {
    let line = adapter.getLine(ln);
    let stop = line === '';

    const curr: Index = {
      dir: dir,
      line: line,
      ln: ln,
      pos: pos
    };

    const last_valid: Pick<Index, 'ln' | 'pos'> = {
      ln: curr.ln,
      pos: curr.pos
    };

    const skip_empty_lines = curr.line === '';

    // Move one step to skip character we start on
    nextChar(adapter, curr);

    while (curr.line === undefined && curr.pos !== undefined) {
      last_valid.ln = curr.ln;
      last_valid.pos = curr.pos;

      if (curr.line === '' && !skip_empty_lines) {
        return { ln: curr.ln, pos: curr.pos };
      } else if (stop && curr.line && !isWhiteSpaceString(curr.line[curr.pos])) {
        return { ln: curr.ln, pos: curr.pos };
      } else if (
        isEndOfSentenceSymbol(curr.line![curr.pos]) &&
        !stop &&
        (curr.pos === curr.line!.length - 1 || isWhiteSpaceString(curr.line![curr.pos + 1]))
      ) {
        stop = true;
      }

      nextChar(adapter, curr);
    }

    /*
          Set the position to the last non whitespace character on the last
          valid line in the case that we reach the end of the document.
        */
    line = adapter.getLine(last_valid.ln!);
    last_valid.pos = 0;
    for (let i = line.length - 1; i >= 0; --i) {
      if (!isWhiteSpaceString(line[i])) {
        last_valid.pos = i;
        break;
      }
    }

    return last_valid;
  };

  /*
        Performs one iteration of traversal in reverse direction
        Returns an index object of the new location
       */
  const reverse = (adapter: EditorAdapter, ln: number, pos: number, dir: -1 | 1) => {
    let line = adapter.getLine(ln);

    const curr: Index = {
      dir: dir,
      line: line,
      ln: ln,
      pos: pos
    };

    let last_valid: Pick<Index, 'ln' | 'pos'> = {
      ln: curr.ln,
      pos: undefined
    };

    let skip_empty_lines = curr.line === '';

    // Move one step to skip character we start on
    nextChar(adapter, curr);

    while (curr.line !== undefined && curr.pos !== undefined) {
      if (curr.line === '' && !skip_empty_lines) {
        if (last_valid.pos !== undefined) {
          return last_valid;
        } else {
          return { ln: curr.ln, pos: curr.pos };
        }
      } else if (
        isEndOfSentenceSymbol(curr.line[curr.pos]) &&
        last_valid.pos !== undefined &&
        !(curr.ln === last_valid.ln && curr.pos + 1 === last_valid.pos)
      ) {
        return last_valid;
      } else if (curr.line !== '' && !isWhiteSpaceString(curr.line[curr.pos])) {
        skip_empty_lines = false;
        last_valid = { ln: curr.ln, pos: curr.pos };
      }

      nextChar(adapter, curr);
    }

    /*
          Set the position to the first non whitespace character on the last
          valid line in the case that we reach the beginning of the document.
        */
    line = adapter.getLine(last_valid.ln!);
    last_valid.pos = 0;
    for (let i = 0; i < line.length; ++i) {
      if (!isWhiteSpaceString(line[i])) {
        last_valid.pos = i;
        break;
      }
    }
    return last_valid;
  };

  let curr_index: Pick<Index, 'ln' | 'pos'> = {
    ln: cur.line,
    pos: cur.ch
  };

  while (repeat > 0) {
    if (dir < 0) {
      curr_index = reverse(adapter, curr_index.ln!, curr_index.pos!, dir);
    } else {
      curr_index = forward(adapter, curr_index.ln!, curr_index.pos!, dir);
    }
    repeat--;
  }

  return makePos(curr_index.ln!, curr_index.pos!);
}

// TODO: perhaps this finagling of start and end positions belongs
// in codemirror/replaceRange?
function selectCompanionObject(adapter: EditorAdapter, head: Pos, symb: string, inclusive: boolean): [Pos, Pos] {
  const cur = head;

  const bracketRegexpMatcher: { [key: string]: RegExp } = {
    '(': /[()]/,
    ')': /[()]/,
    '<': /[<>]/,
    '>': /[<>]/,
    '[': /[[\]]/,
    ']': /[[\]]/,
    '{': /[{}]/,
    '}': /[{}]/
  };
  const bracketRegexp = bracketRegexpMatcher[symb];
  const openSymMatcher: { [key: string]: string } = {
    '(': '(',
    ')': '(',
    '<': '<',
    '>': '<',
    '[': '[',
    ']': '[',
    '{': '{',
    '}': '{'
  };
  const openSym = openSymMatcher[symb];
  const curChar = adapter.getLine(cur.line).charAt(cur.ch);
  // Due to the behavior of scanForBracket, we need to add an offset if the
  // cursor is on a matching open bracket.
  const offset = curChar === openSym ? 1 : 0;

  const startRes = adapter.scanForBracket(makePos(cur.line, cur.ch + offset), 0, bracketRegexp);
  const endRes = adapter.scanForBracket(makePos(cur.line, cur.ch + offset), 1, bracketRegexp);

  if (!startRes || !endRes) {
    return [cur, cur];
  }

  let start = startRes.pos;
  let end = endRes.pos;

  if ((start.line == end.line && start.ch > end.ch) || start.line > end.line) {
    const tmp = start;
    start = end;
    end = tmp;
  }

  if (inclusive) {
    end.ch += 1;
  } else {
    start.ch += 1;
  }

  return [start, end];
}

// Takes in a symbol and a cursor and tries to simulate text objects that
// have identical opening and closing symbols
// TODO support across multiple lines
function findBeginningAndEnd(adapter: EditorAdapter, head: Pos, symb: string, inclusive: boolean): [Pos, Pos] {
  const cur = copyCursor(head);
  const line = adapter.getLine(cur.line);
  const chars = line.split('');
  const firstIndex = chars.indexOf(symb);

  let end: number | undefined = undefined;
  // the decision tree is to always look backwards for the beginning first,
  // but if the cursor is in front of the first instance of the symb,
  // then move the cursor forward
  if (cur.ch < firstIndex) {
    cur.ch = firstIndex;
    // Why is this line even here???
    // adapter.setCursor(cur.line, firstIndex+1);
  }
  // otherwise if the cursor is currently on the closing symbol
  else if (firstIndex < cur.ch && chars[cur.ch] == symb) {
    end = cur.ch; // assign end to the current cursor
    --cur.ch; // make sure to look backwards
  }

  let start: number | undefined = undefined;

  // if we're currently on the symbol, we've got a start
  if (chars[cur.ch] == symb && !end) {
    start = cur.ch + 1; // assign start to ahead of the cursor
  } else {
    // go backwards to find the start
    for (let i = cur.ch; i > -1 && !start; i--) {
      if (chars[i] == symb) {
        start = i + 1;
      }
    }
  }

  // look forwards for the end symbol
  if (start && !end) {
    for (let i = start; i < chars.length && !end; i++) {
      if (chars[i] == symb) {
        end = i;
      }
    }
  }

  // nothing found
  if (!start || !end) {
    return [cur, cur];
  }

  // include the symbols
  if (inclusive) {
    --start;
    ++end;
  }

  return [makePos(cur.line, start), makePos(cur.line, end)];
}

function recordLastCharacterSearch(increment: number, args: MotionArgs) {
  vimGlobalState.lastCharacterSearch.increment = increment;
  vimGlobalState.lastCharacterSearch.forward = !!args.forward;
  vimGlobalState.lastCharacterSearch.selectedCharacter = args.selectedCharacter!;
}

/**
 * Depends on the following:
 *
 * - editor mode should be htmlmixedmode / xml
 * - mode/xml/xml.js should be loaded
 * - addon/fold/xml-fold.js should be loaded
 *
 * If any of the above requirements are not true, this function noops.
 *
 * This is _NOT_ a 100% accurate implementation of vim tag text objects.
 * The following caveats apply (based off cursory testing, I'm sure there
 * are other discrepancies):
 *
 * - Does not work inside comments:
 *   ```
 *   <!-- <div>broken</div> -->
 *   ```
 * - Does not work when tags have different cases:
 *   ```
 *   <div>broken</DIV>
 *   ```
 * - Does not work when cursor is inside a broken tag:
 *   ```
 *   <div><brok><en></div>
 *   ```
 */
function expandTagUnderCursor(_adapter: EditorAdapter, head: Pos, _inclusive: boolean): [Pos, Pos] {
  return [head, head];
}

const ForwardSymbolPairs: { [key: string]: string } = { ')': '(', '}': '{' };
const ReverseSymbolPairs: { [key: string]: string } = { '(': ')', '{': '}' };

function findSymbol(adapter: EditorAdapter, repeat: number, forward: boolean, symb: string) {
  const cur = copyCursor(adapter.getCursor());
  const increment = forward ? 1 : -1;
  const endLine = forward ? adapter.lineCount() : -1;
  const curCh = cur.ch;
  let line = cur.line;
  const lineText = adapter.getLine(line);
  const state: FindSymbolState = {
    curMoveThrough: false,
    depth: 0,
    forward: forward,
    index: curCh,
    lastCh: '',
    lineText: lineText,
    nextCh: lineText.charAt(curCh),
    reverseSymb: (forward ? ForwardSymbolPairs : ReverseSymbolPairs)[symb],
    symb: symb
  };
  const mode = symbolToMode[symb];
  if (!mode) return cur;
  const modeHandler = (findSymbolModes as any)[mode];
  modeHandler.init(state);
  while (line !== endLine && repeat) {
    state.index += increment;
    state.nextCh = state.lineText.charAt(state.index);
    if (!state.nextCh) {
      line += increment;
      state.lineText = adapter.getLine(line) || '';
      if (increment > 0) {
        state.index = 0;
      } else {
        const lineLen = state.lineText.length;
        state.index = lineLen > 0 ? lineLen - 1 : 0;
      }
      state.nextCh = state.lineText.charAt(state.index);
    }
    if (modeHandler.isComplete(state)) {
      cur.line = line;
      cur.ch = state.index;
      repeat--;
    }
  }
  if (state.nextCh || state.curMoveThrough) {
    return makePos(line, state.index);
  }
  return cur;
}

type SymbolMode = 'bracket' | 'comment' | 'method' | 'preprocess' | 'section';

const symbolToMode: { [key: string]: SymbolMode } = {
  '#': 'preprocess',
  '(': 'bracket',
  ')': 'bracket',
  '*': 'comment',
  '/': 'comment',
  '[': 'section',
  ']': 'section',
  '{': 'bracket',
  '}': 'bracket',
  M: 'method',
  m: 'method'
};

type FindSymbolState = {
  curMoveThrough: boolean;
  depth: number;
  forward: boolean;
  index: number;
  lastCh: string;
  lineText: string;
  nextCh: string;
  reverseSymb: string;
  symb: string;
};

type SymbolModeHandler = {
  init: (state: FindSymbolState) => void;
  isComplete: (state: FindSymbolState) => boolean;
};

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
const findSymbolModes: Record<SymbolMode, SymbolModeHandler> = {
  bracket: {
    init: function (_state) {},
    isComplete: function (state) {
      if (state.nextCh === state.symb) {
        state.depth++;
        if (state.depth >= 1) return true;
      } else if (state.nextCh === state.reverseSymb) {
        state.depth--;
      }
      return false;
    }
  },
  comment: {
    init: () => {},
    isComplete: function (state: any) {
      const found = state.lastCh === '*' && state.nextCh === '/';
      state.lastCh = state.nextCh;
      return found;
    }
  },
  // therefore it operates on any levels.
  method: {
    init: function (state: any) {
      state.symb = state.symb === 'm' ? '{' : '}';
      state.reverseSymb = state.symb === '{' ? '}' : '{';
    },
    isComplete: function (state: any) {
      if (state.nextCh === state.symb) return true;
      return false;
    }
  },
  // TODO: The original Vim implementation only operates on level 1 and 2.
  // The current implementation doesn't check for code block level and
  preprocess: {
    init: function (state: any) {
      state.index = 0;
    },
    isComplete: function (state: any) {
      if (state.nextCh === '#') {
        const token = state.lineText.match(/^#(\w+)/)![1];
        if (token === 'endif') {
          if (state.forward && state.depth === 0) {
            return true;
          }
          state.depth++;
        } else if (token === 'if') {
          if (!state.forward && state.depth === 0) {
            return true;
          }
          state.depth--;
        }
        if (token === 'else' && state.depth === 0) return true;
      }
      return false;
    }
  },
  section: {
    init: function (state: any) {
      state.curMoveThrough = true;
      state.symb = (state.forward ? ']' : '[') === state.symb ? '{' : '}';
    },
    isComplete: function (state: any) {
      return state.index === 0 && state.nextCh === state.symb;
    }
  }
};

/*
 * Returns the boundaries of the next word. If the cursor in the middle of
 * the word, then returns the boundaries of the current word, starting at
 * the cursor. If the cursor is at the start/end of a word, and we are going
 * forward/backward, respectively, find the boundaries of the next word.
 *
 * @param {EditorAdapter} adapter CodeMirror object.
 * @param {Cursor} cur The cursor position.
 * @param {boolean} forward True to search forward. False to search
 *     backward.
 * @param {boolean} bigWord True if punctuation count as part of the word.
 *     False if only [a-zA-Z0-9] characters count as part of the word.
 * @param {boolean} emptyLineIsWord True if empty lines should be treated
 *     as words.
 * @return {Object{from:number, to:number, line: number}} The boundaries of
 *     the word, or null if there are no more words.
 */
function findWord(adapter: EditorAdapter, cur: Pos, forward: boolean, bigWord: boolean, emptyLineIsWord: boolean) {
  let lineNum = cur.line;
  let pos = cur.ch;
  let line = adapter.getLine(lineNum);
  const dir = forward ? 1 : -1;
  const charTests = bigWord ? bigWordCharTest : keywordCharTest;

  if (emptyLineIsWord && line == '') {
    lineNum += dir;
    line = adapter.getLine(lineNum);
    if (!isLine(adapter, lineNum)) {
      return null;
    }
    pos = forward ? 0 : line.length;
  }

  while (true) {
    if (emptyLineIsWord && line == '') {
      return { from: 0, line: lineNum, to: 0 };
    }
    const stop = dir > 0 ? line.length : -1;
    let wordStart = stop;
    let wordEnd = stop;
    // Find bounds of next word.
    while (pos != stop) {
      let foundWord = false;
      for (let i = 0; i < charTests.length && !foundWord; ++i) {
        if (charTests[i](line.charAt(pos))) {
          wordStart = pos;
          // Advance to end of word.
          while (pos != stop && charTests[i](line.charAt(pos))) {
            pos += dir;
          }
          wordEnd = pos;
          foundWord = wordStart != wordEnd;
          if (wordStart == cur.ch && lineNum == cur.line && wordEnd == wordStart + dir) {
            // We started at the end of a word. Find the next one.
            continue;
          } else {
            return {
              from: Math.min(wordStart, wordEnd + 1),
              line: lineNum,
              to: Math.max(wordStart, wordEnd)
            };
          }
        }
      }
      if (!foundWord) {
        pos += dir;
      }
    }
    // Advance to next/prev line.
    lineNum += dir;
    if (!isLine(adapter, lineNum)) {
      return null;
    }
    line = adapter.getLine(lineNum);
    pos = dir > 0 ? 0 : line.length;
  }
}

function charIdxInLine(start: number, line: string, character: string, forward: boolean, includeChar: boolean) {
  // Search for char in line.
  // motion_options: {forward, includeChar}
  // If includeChar = true, include it too.
  // If forward = true, search forward, else search backwards.
  // If char is not found on this line, do nothing
  let idx;
  if (forward) {
    idx = line.indexOf(character, start + 1);
    if (idx != -1 && !includeChar) {
      idx -= 1;
    }
  } else {
    idx = line.lastIndexOf(character, start - 1);
    if (idx != -1 && !includeChar) {
      idx += 1;
    }
  }
  return idx;
}

function expandSelection(adapter: EditorAdapter, start: Pos, end: Pos): [Pos, Pos] {
  const vim = adapter.state.vim as VimState;
  const sel = vim.sel;
  let head = sel.head;
  let anchor = sel.anchor;
  if (cursorIsBefore(end, start)) {
    const tmp = end;
    end = start;
    start = tmp;
  }
  if (cursorIsBefore(head, anchor)) {
    head = cursorMin(start, head);
    anchor = cursorMax(anchor, end);
  } else {
    anchor = cursorMin(start, anchor);
    head = cursorMax(head, end);
    head = offsetCursor(head, 0, -1);
    if (head.ch == -1 && head.line != adapter.firstLine()) {
      head = makePos(head.line - 1, lineLength(adapter, head.line - 1));
    }
  }
  return [anchor, head];
}

function isLine(adapter: EditorAdapter, line: number) {
  return line >= adapter.firstLine() && line <= adapter.lastLine();
}
