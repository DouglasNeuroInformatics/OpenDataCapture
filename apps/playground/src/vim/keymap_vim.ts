/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
MIT License

Copyright (C) 2017 by Marijn Haverbeke <marijnh@gmail.com> and others

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
import EditorAdapter, { CmSelection } from './adapter';
import { commandDispatcher } from './command-dispatcher';
import {
  copyCursor,
  cursorEqual,
  cursorIsBefore,
  cursorMax,
  cursorMin,
  getEventKeyName,
  inArray,
  isLowerCase,
  isNumber,
  isPos,
  isUpperCase,
  isWhiteSpaceString,
  makePos,
  stopEvent
} from './common';
import { defaultKeymap } from './default-key-map';
import { ExCommandDispatcher } from './ex-command-dispatcher';
import { vimGlobalState } from './global';
import { InputState } from './input-state';
import { MacroModeState } from './macro-mode-state';
import { defineOption, getOption, getOptionType, setOption } from './options';
import { Register } from './register-controller';
import { getSearchState, searchOverlay } from './search';
import { StringStream } from './string-stream';
import { VimApi } from './vim-api';

import type { BindingFunction, Change, KeyMapEntry } from './adapter';
import type { Pos } from './common';
import type { OptionConfig } from './options';
import type { StatusBarInputOptions } from './statusbar';
import type {
  ActionArgs,
  Context,
  ExArgs,
  KeyMapping,
  MappableArgType,
  MappableCommandType,
  MotionArgs,
  OperatorArgs,
  OperatorMotionArgs,
  SearchArgs,
  VimState
} from './types';

function enterVimMode(adapter: EditorAdapter) {
  adapter.setOption('disableInput', true);
  adapter.setOption('showCursorWhenSelecting', false);
  adapter.dispatch('vim-mode-change', { mode: 'normal' });
  adapter.on('cursorActivity', onCursorActivity);
  maybeInitVimState(adapter);
  // EditorAdapter.on(adapter.getInputField(), 'paste', getOnPasteFn(adapter));
  adapter.enterVimMode();
}

function leaveVimMode(adapter: EditorAdapter) {
  adapter.setOption('disableInput', false);
  adapter.off('cursorActivity', onCursorActivity);
  // EditorAdapter.off(adapter.getInputField(), 'paste', getOnPasteFn(adapter));
  adapter.state.vim = null;
  if (highlightTimeout) clearTimeout(highlightTimeout);
  adapter.leaveVimMode();
}

function detachVimMap(adapter: EditorAdapter, next?: KeyMapEntry) {
  adapter.attached = false;

  if (!next || next.attach != attachVimMap) leaveVimMode(adapter);
}
function attachVimMap(
  this: {
    attach: (adapter: EditorAdapter, prev?: KeyMapEntry) => void;
    call: (key: string, adapter: EditorAdapter) => (() => boolean) | false | undefined;
    detach: (adapter: EditorAdapter, next?: KeyMapEntry) => void;
    fallthrough?: string[];
    keys?: { Backspace: string };
  },
  adapter: EditorAdapter,
  prev?: KeyMapEntry
) {
  if ((this as KeyMapEntry) === EditorAdapter.keyMap.vim) {
    adapter.attached = true;
    if (adapter.curOp) {
      adapter.curOp.selectionChanged = true;
    }
  }

  if (!prev || prev.attach != attachVimMap) enterVimMode(adapter);
}

function cmKey(key: string, adapter: EditorAdapter) {
  if (!adapter) {
    return undefined;
  }
  const vimKey = cmKeyToVimKey(key);
  if (!vimKey) {
    return false;
  }
  const cmd = vimApi.findKey(adapter, vimKey);
  if (typeof cmd == 'function') {
    adapter.dispatch('vim-keypress', vimKey);
  }
  return cmd;
}

const modifiers: { [key: string]: string } = {
  Alt: 'A',
  CapsLock: '',
  Cmd: 'D',
  Ctrl: 'C',
  Mod: 'A',
  Shift: 'S'
};
const specialKeys: { [key: string]: string } = {
  Backspace: 'BS',
  Delete: 'Del',
  Enter: 'CR',
  Insert: 'Ins'
};
function cmKeyToVimKey(key: string) {
  if (key.startsWith("'")) {
    // Keypress character binding of format "'a'"
    return key.charAt(1);
  }
  if (key === 'AltGraph') {
    return false;
  }
  const pieces = key.split(/-(?!$)/);
  const lastPiece = pieces[pieces.length - 1]!;
  if (pieces.length == 1 && pieces[0]!.length == 1) {
    // No-modifier bindings use literal character bindings above. Skip.
    return false;
  } else if (pieces.length == 2 && pieces[0] == 'Shift' && lastPiece.length == 1) {
    // Ignore Shift+char bindings as they should be handled by literal character.
    return false;
  }
  let hasCharacter = false;
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]!;
    if (piece in modifiers) {
      pieces[i] = modifiers[piece]!;
    } else {
      hasCharacter = true;
    }
    if (piece in specialKeys) {
      pieces[i] = specialKeys[piece]!;
    }
  }
  if (!hasCharacter) {
    // Vim does not support modifier only keys.
    return false;
  }
  // TODO: Current bindings expect the character to be lower case, but
  // it looks like vim key notation uses upper case.
  if (isUpperCase(lastPiece)) {
    pieces[pieces.length - 1] = lastPiece.toLowerCase();
  }
  return '<' + pieces.join('-') + '>';
}

// function getOnPasteFn(adapter) {
//   var vim = adapter.state.vim;
//   if (!vim.onPasteFn) {
//     vim.onPasteFn = function () {
//       if (!vim.insertMode) {
//         adapter.setCursor(offsetCursor(adapter.getCursor(), 0, 1));
//         actions.enterInsertMode(adapter, {}, vim);
//       }
//     };
//   }
//   return vim.onPasteFn;
// }

export const keywordCharTest = [
  (ch: string) => isKeywordTest(ch),
  function (ch: string) {
    return !!(ch && !isKeywordTest(ch) && !/\s/.test(ch));
  }
];
export const bigWordCharTest = [
  function (ch: string) {
    return /\S/.test(ch);
  }
];
function makeKeyRange(start: number, size: number) {
  const keys = [];
  for (let i = start; i < start + size; i++) {
    keys.push(String.fromCharCode(i));
  }
  return keys;
}
const upperCaseAlphabet = makeKeyRange(65, 26);
const lowerCaseAlphabet = makeKeyRange(97, 26);
const numbers = makeKeyRange(48, 10);
export const validMarks = [...upperCaseAlphabet, ...lowerCaseAlphabet, ...numbers, '<', '>'];
export const validRegisters = [...upperCaseAlphabet, ...lowerCaseAlphabet, ...numbers, '-', '"', '.', ':', '_', '/'];

defineOption('filetype', undefined, 'string', ['ft'], function (name, adapter) {
  // Option is local. Do nothing for global.
  if (adapter === undefined) {
    return;
  }
  // The 'filetype' option proxies to the EditorAdapter 'mode' option.
  if (name === undefined) {
    const mode = adapter.getOption('mode');
    return mode == 'null' ? '' : mode;
  } else {
    const mode = name == '' ? 'null' : name;
    adapter.setOption('mode', mode);
  }
});

export type InsertModeChanges = {
  changes: string[];
  expectCursorActivityForChange: boolean;
  ignoreCount?: number;
  maybeReset?: boolean;
  visualBlock?: number;
};

// Returns an object to track the changes associated insert mode.  It
// clones the object that is passed in, or creates an empty object one if
// none is provided.
export const createInsertModeChanges = (c?: InsertModeChanges) =>
  c
    ? // Copy construction
      { ...c }
    : {
        // Change list
        changes: [],
        // Set to true on change, false on cursorActivity.
        expectCursorActivityForChange: false
      };

export function maybeInitVimState(adapter: EditorAdapter): VimState {
  if (!adapter.state.vim) {
    // Store instance state in the EditorAdapter object.
    const vimState: VimState = {
      inputState: new InputState(),
      // Vim's input state that triggered the last edit, used to repeat
      insertMode: false,
      // Vim's action command before the last edit, used to repeat actions
      // sequences like 3,i. Only exists when insertMode is true.
      insertModeRepeat: undefined,
      // When using jk for navigation, if you move from a longer line to a
      // shorter line, the cursor may clip to the end of the shorter line.
      // If j is pressed again and cursor goes to the next line, the
      // cursor should go back to its horizontal position on the longer
      // with '.' and insert mode repeat.
      lastEditActionCommand: undefined,
      // motions and operators with '.'.
      lastEditInputState: undefined,
      // The last motion command run. Cleared if a non-motion command gets
      // line if it can. This is to keep track of the horizontal position.
      lastHPos: -1,
      // Doing the same with screen-position for gj/gk
      lastHSPos: -1,
      // executed in between.
      lastMotion: undefined,
      // Repeat count for changes made in insert mode, triggered by key
      lastPastedText: undefined,
      lastSelection: undefined,
      marks: {},
      // Buffer-local/window-local values of vim options.
      options: {},
      sel: new CmSelection(makePos(0, 0), makePos(0, 0)),
      visualBlock: false,
      // If we are in visual line mode. No effect if visualMode is false.
      visualLine: false,
      visualMode: false
    };
    adapter.state.vim = vimState;
  }
  return adapter.state.vim as VimState;
}

export function clearInputState(adapter: EditorAdapter, reason?: string) {
  (adapter.state.vim as VimState).inputState = new InputState();
  adapter.dispatch('vim-command-done', reason);
}

/*
 * Below are miscellaneous utility functions used by vim.js
 */

/**
 * Clips cursor to ensure that line is within the buffer's range
 * If includeLineBreak is true, then allow cur.ch == lineLength.
 */
export function clipCursorToContent(adapter: EditorAdapter, cur: Pos) {
  const vim = adapter.state.vim as VimState;
  const includeLineBreak = vim.insertMode || vim.visualMode;
  const line = Math.min(Math.max(adapter.firstLine(), cur.line), adapter.lastLine());
  const maxCh = lineLength(adapter, line) - 1 + (includeLineBreak ? 1 : 0);
  const ch = Math.min(Math.max(0, cur.ch), maxCh);
  return makePos(line, ch);
}

export const copyArgs = <T>(args: T): T => ({ ...args });

export function offsetCursor(cur: Pos, offsetLine: Pos): Pos;
export function offsetCursor(cur: Pos, offsetLine: number, offsetCh: number): Pos;
export function offsetCursor(cur: Pos, offsetLine: number | Pos, offsetCh?: number): Pos {
  if (isPos(offsetLine)) {
    return makePos(cur.line + offsetLine.line, cur.ch + offsetLine.ch);
  }
  return makePos(cur.line + offsetLine, cur.ch + offsetCh!);
}

export function commandMatches(keys: string, keyMap: KeyMapping[], context: Context, inputState: InputState) {
  // Partial matches are not applied. They inform the key handler
  // that the current key sequence is a subsequence of a valid key
  // sequence, so that the key buffer is not cleared.
  let match: 'full' | 'partial' | false;
  const partial: KeyMapping[] = [];
  const full: KeyMapping[] = [];

  keyMap.forEach((command) => {
    if (
      (context == 'insert' && command.context != 'insert') ||
      (command.context && command.context != context) ||
      (inputState.operator && command.type == 'action') ||
      !(match = commandMatch(keys, command.keys))
    ) {
      /* empty */
    } else if (match == 'partial') {
      partial.push(command);
    } else if (match == 'full') {
      full.push(command);
    }
  });
  return {
    full: full.length ? full : undefined,
    partial: partial.length ? partial : undefined
  };
}
function commandMatch(pressed: string, mapped: string) {
  if (mapped.endsWith('<character>')) {
    // Last character matches anything.
    const prefixLen = mapped.length - 11;
    const pressedPrefix = pressed.slice(0, prefixLen);
    const mappedPrefix = mapped.slice(0, prefixLen);
    return pressedPrefix == mappedPrefix && pressed.length > prefixLen
      ? 'full'
      : mappedPrefix.startsWith(pressedPrefix)
        ? 'partial'
        : false;
  } else {
    return pressed == mapped ? 'full' : mapped.startsWith(pressed) ? 'partial' : false;
  }
}

export function lastChar(keys: string): string {
  const match = /^.*(<[^>]+>)$/.exec(keys);
  let selectedCharacter = match ? match[1]! : keys.slice(-1);
  if (selectedCharacter.length > 1) {
    switch (selectedCharacter) {
      case '<CR>':
        selectedCharacter = '\n';
        break;
      case '<Space>':
        selectedCharacter = ' ';
        break;
      default:
        selectedCharacter = '';
        break;
    }
  }
  return selectedCharacter;
}

export function lineLength(adapter: EditorAdapter, lineNum: number) {
  return adapter.getLine(lineNum).length;
}

export const trim = (s: string) => s.trim();

export function escapeRegex(s: string) {
  return s.replace(/([.?*+$[\]/\\(){}|-])/g, '\\$1');
}

export function selectForInsert(adapter: EditorAdapter, head: Pos, height: number) {
  const sel: CmSelection[] = [];
  for (let i = 0; i < height; i++) {
    const lineHead = offsetCursor(head, i, 0);
    sel.push(new CmSelection(lineHead, lineHead));
  }
  adapter.setSelections(sel, 0);
}

// Updates the previous selection with the current selection's values. This
// should only be called in visual mode.
export function updateLastSelection(adapter: EditorAdapter, vim: VimState) {
  const anchor = vim.sel.anchor;
  let head = vim.sel.head;
  // To accommodate the effect of lastPastedText in the last selection
  if (vim.lastPastedText) {
    head = adapter.posFromIndex(adapter.indexFromPos(anchor) + vim.lastPastedText.length);
    vim.lastPastedText = undefined;
  }
  vim.lastSelection = {
    anchor: copyCursor(anchor),
    anchorMark: adapter.setBookmark(anchor),
    head: copyCursor(head),
    headMark: adapter.setBookmark(head),
    visualBlock: vim.visualBlock,
    visualLine: vim.visualLine,
    visualMode: vim.visualMode
  };
}

export function updateMark(adapter: EditorAdapter, vim: VimState, markName: string, pos: Pos) {
  if (!validMarks.includes(markName)) {
    return;
  }
  if (vim.marks[markName]) {
    vim.marks[markName].clear();
  }
  vim.marks[markName] = adapter.setBookmark(pos);
}

/**
 * Updates the EditorAdapter selection to match the provided vim selection.
 * If no arguments are given, it uses the current vim selection state.
 */
export function updateCmSelection(adapter: EditorAdapter, sel?: CmSelection, mode?: 'block' | 'char' | 'line') {
  const vim = adapter.state.vim as VimState;
  sel = sel || vim.sel;
  mode = mode || vim.visualLine ? 'line' : vim.visualBlock ? 'block' : 'char';
  const cmSel = makeCmSelection(adapter, sel, mode);
  adapter.setSelections(cmSel.ranges, cmSel.primary);
}

export function makeCmSelection(
  adapter: EditorAdapter,
  sel: CmSelection,
  mode: 'block' | 'char' | 'line',
  exclusive?: boolean
): {
  primary: number;
  ranges: CmSelection[];
} {
  let head = copyCursor(sel.head);
  let anchor = copyCursor(sel.anchor);
  switch (mode) {
    case 'block':
      const top = Math.min(anchor.line, head.line);
      let fromCh = anchor.ch;
      const bottom = Math.max(anchor.line, head.line);
      let toCh = head.ch;
      if (fromCh < toCh) {
        toCh += 1;
      } else {
        fromCh += 1;
      }
      const height = bottom - top + 1;
      const primary = head.line == top ? 0 : height - 1;
      const ranges: CmSelection[] = [];
      for (let i = 0; i < height; i++) {
        ranges.push(new CmSelection(makePos(top + i, fromCh), makePos(top + i, toCh)));
      }
      return {
        primary: primary,
        ranges: ranges
      };
    case 'char':
      const headOffset = !exclusive && !cursorIsBefore(sel.head, sel.anchor) ? 1 : 0;
      const anchorOffset = cursorIsBefore(sel.head, sel.anchor) ? 1 : 0;
      head = offsetCursor(sel.head, 0, headOffset);
      anchor = offsetCursor(sel.anchor, 0, anchorOffset);
      return {
        primary: 0,
        ranges: [new CmSelection(anchor, head)]
      };
    case 'line':
      if (!cursorIsBefore(sel.head, sel.anchor)) {
        anchor.ch = 0;

        const lastLine = adapter.lastLine();
        if (head.line > lastLine) {
          head.line = lastLine;
        }
        head.ch = lineLength(adapter, head.line);
      } else {
        head.ch = 0;
        anchor.ch = lineLength(adapter, anchor.line);
      }
      return {
        primary: 0,
        ranges: [new CmSelection(anchor, head)]
      };
  }
}

function getHead(adapter: EditorAdapter) {
  const cur = adapter.getCursor('head');
  if (adapter.getSelection().length == 1) {
    // Small corner case when only 1 character is selected. The "real"
    // head is the left of head and anchor.
    return cursorMin(cur, adapter.getCursor('anchor'));
  }
  return cur;
}

/**
 * If moveHead is set to false, the EditorAdapter selection will not be
 * touched. The caller assumes the responsibility of putting the cursor
 * in the right place.
 */
export function exitVisualMode(adapter: EditorAdapter, moveHead?: boolean) {
  const vim = adapter.state.vim as VimState;
  if (moveHead !== false) {
    adapter.setCursor(clipCursorToContent(adapter, vim.sel.head));
  }
  updateLastSelection(adapter, vim);
  vim.visualMode = false;
  vim.visualLine = false;
  vim.visualBlock = false;
  if (!vim.insertMode) adapter.dispatch('vim-mode-change', { mode: 'normal' });
}

// Remove any trailing newlines from the selection. For
// example, with the caret at the start of the last word on the line,
// 'dw' should word, but not the newline, while 'w' should advance the
// caret to the first character of the next line.
export function clipToLine(adapter: EditorAdapter, curStart: Pos, curEnd: Pos) {
  const selection = adapter.getRange(curStart, curEnd);
  // Only clip if the selection ends with trailing newline + whitespace
  if (/\n\s*$/.test(selection)) {
    const lines = selection.split('\n');
    // We know this is all whitespace.
    lines.pop();

    // Cases:
    // 1. Last word is an empty line - do not clip the trailing '\n'
    // 2. Last word is not an empty line - clip the trailing '\n'
    let line;
    // Find the line containing the last word, and clip all whitespace up
    // to it.
    for (line = lines.pop(); lines.length > 0 && line && isWhiteSpaceString(line); line = lines.pop()) {
      curEnd.line--;
      curEnd.ch = 0;
    }
    // If the last word is not an empty line, clip an additional newline
    if (line) {
      curEnd.line--;
      curEnd.ch = lineLength(adapter, curEnd.line);
    } else {
      curEnd.ch = 0;
    }
  }
}

// Expand the selection to line ends.
export function expandSelectionToLine(_cm: EditorAdapter, curStart: Pos, curEnd: Pos) {
  curStart.ch = 0;
  curEnd.ch = 0;
  curEnd.line++;
}

export function expandWordUnderCursor(
  adapter: EditorAdapter,
  inclusive: boolean,
  _forward: boolean,
  bigWord: boolean,
  noSymbol?: boolean
): [Pos, Pos] | undefined {
  const cur = getHead(adapter);
  const line = adapter.getLine(cur.line);
  let idx = cur.ch;

  // Seek to first word or non-whitespace character, depending on if
  // noSymbol is true.
  let test: (ch: string) => boolean = noSymbol ? keywordCharTest[0]! : bigWordCharTest[0]!;
  while (!test(line.charAt(idx))) {
    idx++;
    if (idx >= line.length) {
      return;
    }
  }

  if (bigWord) {
    test = bigWordCharTest[0]!;
  } else {
    test = isKeywordTest;
    if (!test(line.charAt(idx))) {
      test = keywordCharTest[1]!;
    }
  }

  let end = idx;
  let start = idx;
  while (test(line.charAt(end)) && end < line.length) {
    end++;
  }
  while (test(line.charAt(start)) && start >= 0) {
    start--;
  }
  start++;

  if (inclusive) {
    // If present, include all whitespace after word.
    // Otherwise, include all whitespace before word, except indentation.
    const wordEnd = end;
    while (/\s/.test(line.charAt(end)) && end < line.length) {
      end++;
    }
    if (wordEnd == end) {
      const wordStart = start;
      while (/\s/.test(line.charAt(start - 1)) && start > 0) {
        start--;
      }
      if (!start) {
        start = wordStart;
      }
    }
  }
  return [makePos(cur.line, start), makePos(cur.line, end)];
}

export function recordJumpPosition(adapter: EditorAdapter, oldCur: Pos, newCur: Pos) {
  if (!cursorEqual(oldCur, newCur)) {
    vimGlobalState.jumpList.add(adapter, oldCur, newCur);
  }
}

// Search functions
defineOption('pcre', true, 'boolean');

function splitBySlash(argString: string) {
  return splitBySeparator(argString, '/');
}

function findUnescapedSlashes(argString: string) {
  return findUnescapedSeparators(argString, '/');
}

function splitBySeparator(argString: string, separator: string) {
  const slashes = findUnescapedSeparators(argString, separator) || [];
  if (!slashes.length) return [];
  // in case of strings like foo/bar
  if (slashes[0] !== 0) return;

  return slashes.map((s, i) => (i < slashes.length - 1 ? argString.substring(s + 1, slashes[i + 1]) : ''));
}

function findUnescapedSeparators(str: string, separator?: string) {
  if (!separator) separator = '/';

  let escapeNextChar = false;
  const slashes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i);
    if (!escapeNextChar && c == separator) {
      slashes.push(i);
    }
    escapeNextChar = !escapeNextChar && c == '\\';
  }
  return slashes;
}

// Translates a search string from ex (vim) syntax into javascript form.
function translateRegex(str: string) {
  // When these match, add a '\' if unescaped or remove one if escaped.
  const specials = '|(){';
  // Remove, but never add, a '\' for these.
  const unescape = '}';
  let escapeNextChar = false;
  const out: string[] = [];
  for (let i = -1; i < str.length; i++) {
    const c = str.charAt(i) || '';
    const n = str.charAt(i + 1) || '';
    let specialComesNext = n && specials.includes(n);
    if (escapeNextChar) {
      if (c !== '\\' || !specialComesNext) {
        out.push(c);
      }
      escapeNextChar = false;
    } else {
      if (c === '\\') {
        escapeNextChar = true;
        // Treat the unescape list as special for removing, but not adding '\'.
        if (n && unescape.includes(n)) {
          specialComesNext = true;
        }
        // Not passing this test means removing a '\'.
        if (!specialComesNext || n === '\\') {
          out.push(c);
        }
      } else {
        out.push(c);
        if (specialComesNext && n !== '\\') {
          out.push('\\');
        }
      }
    }
  }
  return out.join('');
}

// Translates the replace part of a search and replace from ex (vim) syntax into
// javascript form.  Similar to translateRegex, but additionally fixes back references
// (translates '\[0..9]' to '$[0..9]') and follows different rules for escaping '$'.
const charUnescapes: { [key: string]: string } = {
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t'
};
function translateRegexReplace(str: string) {
  let escapeNextChar = false;
  const out: string[] = [];
  for (let i = -1; i < str.length; i++) {
    const c = str.charAt(i) || '';
    const n = str.charAt(i + 1) || '';
    if (charUnescapes[c + n]) {
      out.push(charUnescapes[c + n]!);
      i++;
    } else if (escapeNextChar) {
      // At any point in the loop, escapeNextChar is true if the previous
      // character was a '\' and was not escaped.
      out.push(c);
      escapeNextChar = false;
    } else {
      if (c === '\\') {
        escapeNextChar = true;
        if (isNumber(n) || n === '$') {
          out.push('$');
        } else if (n !== '/' && n !== '\\') {
          out.push('\\');
        }
      } else {
        if (c === '$') {
          out.push('$');
        }
        out.push(c);
        if (n === '/') {
          out.push('\\');
        }
      }
    }
  }
  return out.join('');
}

// Unescape \ and / in the replace part, for PCRE mode.
const unescapes: { [key: string]: string } = {
  '\\&': '&',
  '\\/': '/',
  '\\\\': '\\',
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t'
};
function unescapeRegexReplace(str: string) {
  const stream = new StringStream(str);
  const output: string[] = [];
  while (!stream.eol()) {
    // Search for \.
    while (stream.peek() && stream.peek() != '\\') {
      output.push(stream.next()!);
    }
    let matched = false;
    for (const matcher in unescapes) {
      if (stream.match(matcher, true)) {
        matched = true;
        output.push(unescapes[matcher]!);
        break;
      }
    }
    if (!matched) {
      // Don't change anything
      output.push(stream.next()!);
    }
  }
  return output.join('');
}

/**
 * Extract the regular expression from the query and return a Regexp object.
 * Returns null if the query is blank.
 * If ignoreCase is passed in, the Regexp object will have the 'i' flag set.
 * If smartCase is passed in, and the query contains upper case letters,
 *   then ignoreCase is overridden, and the 'i' flag will not be set.
 * If the query contains the /i in the flag part of the regular expression,
 *   then both ignoreCase and smartCase are ignored, and 'i' will be passed
 *   through to the Regex object.
 */
function parseQuery(query: RegExp | string, ignoreCase: boolean, smartCase: boolean) {
  // First update the last search register
  const lastSearchRegister = vimGlobalState.registerController.getRegister('/');
  lastSearchRegister.setText(typeof query === 'string' ? query : query.source);
  // Check if the query is already a regex.
  if (query instanceof RegExp) {
    return query;
  }
  // First try to extract regex + flags from the input. If no flags found,
  // extract just the regex. IE does not accept flags directly defined in
  // the regex string in the form /regex/flags
  const slashes = findUnescapedSlashes(query);
  let regexPart: string;
  let forceIgnoreCase: boolean | undefined;
  if (!slashes.length) {
    // Query looks like 'regexp'
    regexPart = query;
  } else {
    // Query looks like 'regexp/...'
    regexPart = query.substring(0, slashes[0]);
    const flagsPart = query.substring(slashes[0]!);
    forceIgnoreCase = flagsPart.includes('i');
  }
  if (!regexPart) {
    return null;
  }
  if (!getOption('pcre')) {
    regexPart = translateRegex(regexPart);
  }
  if (smartCase) {
    ignoreCase = /^[^A-Z]*$/.test(regexPart);
  }
  return new RegExp(regexPart, ignoreCase || forceIgnoreCase ? 'im' : 'm');
}

export function showConfirm(adapter: EditorAdapter, template: string) {
  adapter.openNotification(template);
}

type PromptOptions = {
  desc?: string;
  onClose: (value: string) => void;
  prefix: string;
} & StatusBarInputOptions;

export function showPrompt(adapter: EditorAdapter, options: PromptOptions) {
  adapter.openPrompt(options.prefix, options.desc || '', {
    onClose: options.onClose,
    onKeyDown: options.onKeyDown,
    onKeyUp: options.onKeyUp,
    selectValueOnOpen: false,
    value: options.value
  });
}

function regexEqual(r1: RegExp | string, r2: RegExp | string) {
  if (r1 instanceof RegExp && r2 instanceof RegExp) {
    return (
      r1.global === r2.global &&
      r1.multiline === r2.multiline &&
      r1.ignoreCase === r2.ignoreCase &&
      r1.source === r2.source
    );
  }
  return false;
}
// Returns true if the query is valid.
export function updateSearchQuery(adapter: EditorAdapter, rawQuery: string, ignoreCase?: boolean, smartCase?: boolean) {
  if (!rawQuery) {
    return;
  }
  const state = getSearchState(adapter);
  const query = parseQuery(rawQuery, !!ignoreCase, !!smartCase);
  if (!query) {
    return;
  }
  highlightSearchMatches(adapter, query);
  if (regexEqual(query, state.getQuery()!)) {
    return query;
  }
  state.setQuery(query);
  return query;
}

let highlightTimeout: ReturnType<typeof setTimeout>;

export function highlightSearchMatches(adapter: EditorAdapter, query: RegExp) {
  clearTimeout(highlightTimeout);
  highlightTimeout = setTimeout(() => {
    if (!adapter.state.vim) return;
    const searchState = getSearchState(adapter);
    let overlay = searchState.getOverlay();
    if (!overlay || query != overlay.query) {
      if (overlay) {
        adapter.removeOverlay();
      }
      overlay = searchOverlay(query);
      adapter.addOverlay(overlay.query);
      searchState.setOverlay(overlay);
    }
  }, 50);
}

export function findNext(adapter: EditorAdapter, prev: boolean, query: RegExp, repeat?: number) {
  if (repeat === undefined) {
    repeat = 1;
  }
  const pos = adapter.getCursor();
  let cursor = adapter.getSearchCursor(query, pos);
  for (let i = 0; i < repeat; i++) {
    let found = cursor.find(prev);
    if (i == 0 && found && cursorEqual(cursor.from(), pos)) {
      const lastEndPos = prev ? cursor.from() : cursor.to();
      found = cursor.find(prev);
      if (found && cursorEqual(cursor.from(), lastEndPos)) {
        if (adapter.getLine(lastEndPos.line).length == lastEndPos.ch) {
          found = cursor.find(prev);
        }
      }
    }
    if (!found) {
      // SearchCursor may have returned null because it hit EOF, wrap
      // around and try again.
      cursor = adapter.getSearchCursor(query, makePos(prev ? adapter.lastLine() : adapter.firstLine(), 0));
      if (!cursor.find(prev)) {
        return;
      }
    }
  }
  return cursor.from();
}

export function clearSearchHighlight(adapter: EditorAdapter) {
  const state = getSearchState(adapter);
  adapter.removeOverlay();
  state.setOverlay(undefined);
  if (state.getScrollbarAnnotate()) {
    state.getScrollbarAnnotate().clear();
    state.setScrollbarAnnotate(null);
  }
}
/**
 * Check if pos is in the specified range, INCLUSIVE.
 * Range can be specified with 1 or 2 arguments.
 * If the first range argument is an array, treat it as an array of line
 * numbers. Match pos against any of the lines.
 * If the first range argument is a number,
 *   if there is only 1 range argument, check if pos has the same line
 *       number
 *   if there are 2 range arguments, then check if pos is in between the two
 *       range arguments.
 */
function isInRange(pos: number | Pos, start: number | number[], end?: number) {
  if (isPos(pos)) {
    // Assume it is a cursor position. Get the line number.
    pos = pos.line;
  }
  if (start instanceof Array) {
    return inArray(pos, start);
  } else {
    if (typeof end === 'number') {
      return pos >= start && pos <= end;
    } else {
      return pos == start;
    }
  }
}

export function getMarkPos(adapter: EditorAdapter, vim: VimState, markName: string) {
  if (markName == "'" || markName == '`') {
    return vimGlobalState.jumpList.find(adapter, -1) || makePos(0, 0);
  } else if (markName == '.') {
    return null;
  }

  const mark = vim.marks[markName];
  return mark && mark.find();
}

export type ExCommandOptionalParameters = {
  args?: string[];
  argString?: string;
  callback?: () => void;
  commandName?: string;
  input?: string;
  line?: number;
  lineEnd?: number;
};

type ExCommandParams = {
  input: string;
  setCfg?: OptionConfig;
} & ExCommandOptionalParameters;

export type ExCommandFunc = (adapter: EditorAdapter, params: ExCommandParams, ctx?: Context) => void;

export const exCommands: { [key: string]: ExCommandFunc } = {
  colorscheme: function (adapter, params) {
    if (!params.args || params.args.length < 1) {
      showConfirm(adapter, adapter.getOption('theme'));
      return;
    }
    adapter.setOption('theme', params.args[0]!);
  },
  delmarks: function (adapter, params) {
    if (!params.argString || !trim(params.argString)) {
      showConfirm(adapter, 'Argument required');
      return;
    }

    const state = adapter.state.vim as VimState;
    const stream = new StringStream(trim(params.argString));
    while (!stream.eol()) {
      stream.eatSpace();

      // Record the streams position at the beginning of the loop for use
      // in error messages.
      let count = stream.pos;

      if (!stream.match(/[a-zA-Z]/, false)) {
        showConfirm(adapter, 'Invalid argument: ' + params.argString.substring(count));
        return;
      }

      const sym = stream.next();
      // Check if this symbol is part of a range
      if (stream.match('-', true)) {
        // This symbol is part of a range.

        // The range must terminate at an alphabetic character.
        if (!stream.match(/[a-zA-Z]/, false)) {
          showConfirm(adapter, 'Invalid argument: ' + params.argString.substring(count));
          return;
        }

        const startMark = sym!;
        const finishMark = stream.next()!;
        // The range must terminate at an alphabetic character which
        // shares the same case as the start of the range.
        if (
          (isLowerCase(startMark) && isLowerCase(finishMark)) ||
          (isUpperCase(startMark) && isUpperCase(finishMark))
        ) {
          const start = startMark.charCodeAt(0);
          const finish = finishMark.charCodeAt(0);
          if (start >= finish) {
            showConfirm(adapter, 'Invalid argument: ' + params.argString.substring(count));
            return;
          }

          // Because marks are always ASCII values, and we have
          // determined that they are the same case, we can use
          // their char codes to iterate through the defined range.
          for (let j = 0; j <= finish - start; j++) {
            const mark = String.fromCharCode(start + j);
            delete state.marks[mark];
          }
        } else {
          showConfirm(adapter, 'Invalid argument: ' + startMark + '-');
          return;
        }
      } else {
        // This symbol is a valid mark, and is not part of a range.
        delete state.marks[sym!];
      }
    }
  },
  edit: function (adapter, params) {
    if (EditorAdapter.commands.open) {
      // If an open command is defined, call it.
      EditorAdapter.commands.open(adapter, params);
    }
  },
  global: function (adapter, params) {
    // a global command is of the form
    // :[range]g/pattern/[cmd]
    // argString holds the string /pattern/[cmd]
    const argString = params.argString;
    if (!argString) {
      showConfirm(adapter, 'Regular Expression missing from global');
      return;
    }
    const inverted = params.commandName!.startsWith('v');
    // range is specified here
    const lineStart = params.line !== undefined ? params.line : adapter.firstLine();
    const lineEnd = params.lineEnd || params.line || adapter.lastLine();
    // get the tokens from argString
    const tokens = splitBySlash(argString);
    let regexPart = argString;
    let cmd: string | undefined;
    if (tokens?.length) {
      regexPart = tokens[0]!;
      cmd = tokens.slice(1, tokens.length).join('/');
    }
    if (regexPart) {
      // If regex part is empty, then use the previous query. Otherwise
      // use the regex part as the new query.
      try {
        updateSearchQuery(adapter, regexPart, true /** ignoreCase */, true /** smartCase */);
      } catch {
        showConfirm(adapter, 'Invalid regex: ' + regexPart);
        return;
      }
    }
    // now that we have the regexPart, search for regex matches in the
    // specified range of lines
    const query = getSearchState(adapter).getQuery()!;
    const matchedLines: { line: number; text: string }[] = [];
    for (let i = lineStart; i <= lineEnd; i++) {
      const line = adapter.getLine(i);
      const matched = query.test(line);
      if (matched !== inverted) {
        matchedLines.push({ line: i, text: line });
      }
    }
    // if there is no [cmd], just display the list of matched lines
    if (!cmd) {
      showConfirm(adapter, matchedLines.map((el) => el.text).join('\n'));
      return;
    }
    let index = 0;
    const nextCommand = () => {
      if (index < matchedLines.length) {
        const line = matchedLines[index++]!;
        const command = `${line.line + 1}${cmd}`;
        exCommandDispatcher.processCommand(adapter, command, {
          callback: nextCommand
        });
      }
    };
    nextCommand();
  },
  imap: function (adapter, params) {
    this.map!(adapter, params, 'insert');
  },
  map: function (adapter, params, ctx) {
    const mapArgs = params.args;
    if (!mapArgs || mapArgs.length < 2) {
      if (adapter) {
        showConfirm(adapter, 'Invalid mapping: ' + params.input);
      }
      return;
    }
    exCommandDispatcher.map(mapArgs[0]!, mapArgs[1]!, ctx);
  },
  move: function (adapter, params) {
    commandDispatcher.processCommand(adapter, adapter.state.vim, {
      keys: '',
      motion: 'moveToLineOrEdgeOfDocument',
      motionArgs: { explicitRepeat: true, forward: false, linewise: true },
      repeatOverride: params.line! + 1,
      type: 'motion'
    });
  },
  nmap: function (adapter, params) {
    this.map!(adapter, params, 'normal');
  },
  nohlsearch: function (adapter) {
    clearSearchHighlight(adapter);
  },
  redo: EditorAdapter.commands.redo!,
  registers: function (adapter, params) {
    const regArgs = params.args;
    const registers = vimGlobalState.registerController.registers;
    const regInfo = ['----------Registers----------', ''];
    if (!regArgs) {
      for (const registerName in registers) {
        const text = registers[registerName]!.toString();
        if (text.length) {
          regInfo.push(`"${registerName}"     ${text}`);
        }
      }
    } else {
      const reglist = regArgs.join('');
      for (let i = 0; i < reglist.length; i++) {
        const registerName = reglist.charAt(i);
        if (!vimGlobalState.registerController.isValidRegister(registerName)) {
          continue;
        }
        const register = registers[registerName] || new Register();
        regInfo.push(`"#{registerName}"     ${register.toString()}`);
      }
    }
    showConfirm(adapter, regInfo.join('\n'));
  },
  save: function (adapter, params) {
    if (!params.args || params.args.length !== 1) {
      showConfirm(adapter, `save requires a single argument`);
      return;
    } else {
      params.argString = params.args[0];
    }
    if (EditorAdapter.commands.save) {
      // If a save command is defined, call it.
      EditorAdapter.commands.save(adapter, params);
    }
  },
  set: function (adapter, params) {
    const setArgs = params.args;
    // Options passed through to the setOption/getOption calls. May be passed in by the
    // local/global versions of the set command
    const setCfg = params.setCfg || {};
    if (!setArgs || setArgs.length < 1) {
      if (adapter) {
        showConfirm(adapter, 'Invalid mapping: ' + params.input);
      }
      return;
    }
    const expr = setArgs[0]!.split('=');
    let optionName = expr[0]!;
    let value: boolean | string = expr[1]!;
    let forceGet = false;

    if (optionName.endsWith('?')) {
      // If post-fixed with ?, then the set is actually a get.
      if (value) {
        throw Error('Trailing characters: ' + params.argString);
      }
      optionName = optionName.substring(0, optionName.length - 1);
      forceGet = true;
    } else if (optionName.endsWith('-')) {
      optionName = optionName.substring(0, optionName.length - 1);
      setCfg.remove = true;
    } else if (optionName.endsWith('+')) {
      optionName = optionName.substring(0, optionName.length - 1);
      setCfg.append = true;
    }
    if (value === undefined && optionName.startsWith('no')) {
      // To set boolean options to false, the option name is prefixed with
      // 'no'.
      optionName = optionName.substring(2);
      value = false;
    }

    const optionIsBoolean = getOptionType(optionName) === 'boolean';
    if (optionIsBoolean && value == undefined) {
      // Calling set with a boolean option sets it to true.
      value = true;
    }
    // If no value is provided, then we assume this is a get.
    if ((!optionIsBoolean && value === undefined) || forceGet) {
      const oldValue = getOption(optionName, adapter, setCfg);
      if (oldValue instanceof Error) {
        showConfirm(adapter, oldValue.message);
      } else if (oldValue === true || oldValue === false) {
        showConfirm(adapter, `${oldValue ? '' : 'no'}${optionName}`);
      } else {
        showConfirm(adapter, `${optionName}=${oldValue}`);
      }
    } else {
      const setOptionReturn = setOption(optionName, value, adapter, setCfg);
      if (setOptionReturn instanceof Error) {
        showConfirm(adapter, setOptionReturn.message);
      }
    }
  },
  setglobal: function (adapter, params) {
    // setCfg is passed through to setOption
    params.setCfg = { scope: 'global' };
    this.set!(adapter, params);
  },
  setlocal: function (adapter, params) {
    // setCfg is passed through to setOption
    params.setCfg = { scope: 'local' };
    this.set!(adapter, params);
  },
  sort: function (adapter, params) {
    let reverse: boolean | undefined;
    let ignoreCase: boolean | undefined;
    let unique: boolean | undefined;
    let number: 'decimal' | 'hex' | 'octal' | undefined;
    let pattern: RegExp | undefined;
    const parseArgs = () => {
      if (params.argString) {
        const args = new StringStream(params.argString);
        if (args.eat('!')) {
          reverse = true;
        }
        if (args.eol()) {
          return;
        }
        if (!args.eatSpace()) {
          return 'Invalid arguments';
        }
        const opts = args.match(/([dinuox]+)?\s*(\/.+\/)?\s*/, false);
        if (!opts && !args.eol()) {
          return 'Invalid arguments';
        }
        if (opts[1]) {
          ignoreCase = opts[1].includes('i');
          unique = opts[1].includes('u');
          const decimal = opts[1].includes('d') || opts[1].includes('n') ? 1 : 0;
          const hex = opts[1].includes('x') ? 1 : 0;
          const octal = opts[1].includes('o') ? 1 : 0;
          if (decimal + hex + octal > 1) {
            return 'Invalid arguments';
          }
          number = decimal ? 'decimal' : hex ? 'hex' : octal ? 'octal' : undefined;
        }
        if (opts[2]) {
          pattern = new RegExp(opts[2].substring(1, opts[2].length - 1), ignoreCase ? 'i' : '');
        }
      }
      return;
    };
    const err = parseArgs();
    if (err) {
      showConfirm(adapter, err + ': ' + params.argString);
      return;
    }
    const lineStart = params.line || adapter.firstLine();
    const lineEnd = params.lineEnd || params.line || adapter.lastLine();
    if (lineStart == lineEnd) {
      return;
    }
    const curStart = makePos(lineStart, 0);
    const curEnd = makePos(lineEnd, lineLength(adapter, lineEnd));
    const text = adapter.getRange(curStart, curEnd).split('\n');
    const numberRegex = pattern
      ? pattern
      : number == 'decimal' || number === undefined
        ? /(-?)([\d]+)/
        : number == 'hex'
          ? /(-?)(?:0x)?([0-9a-f]+)/i
          : /([0-7]+)/;
    const radix = number == 'decimal' || number === undefined ? 10 : number == 'hex' ? 16 : 8;
    const numPart: (RegExpMatchArray | string)[] = [];
    const textPart: string[] = [];
    if (number || pattern) {
      for (let i = 0; i < text.length; i++) {
        const matchPart = pattern ? text[i]!.match(pattern) : null;
        if (matchPart && matchPart[0] != '') {
          numPart.push(matchPart);
        } else if (!pattern && numberRegex.exec(text[i]!)) {
          numPart.push(text[i]!);
        } else {
          textPart.push(text[i]!);
        }
      }
    } else {
      textPart.push(...text);
    }
    const compareFn = (a: string, b: string) => {
      if (reverse) {
        const tmp = a;
        a = b;
        b = tmp;
      }
      if (ignoreCase) {
        a = a.toLowerCase();
        b = b.toLowerCase();
      }
      const anum = number && numberRegex.exec(a);
      const bnum = number && numberRegex.exec(b);
      if (!anum || !bnum) {
        return a < b ? -1 : 1;
      }
      return (
        parseInt((anum[1]! + anum[2]!).toLowerCase(), radix) - parseInt((bnum[1]! + bnum[2]!).toLowerCase(), radix)
      );
    };
    const comparePatternFn = (a: string, b: string) => {
      if (reverse) {
        const tmp = a;
        a = b;
        b = tmp;
      }
      if (ignoreCase) {
        return a[0]!.toLowerCase() < b[0]!.toLowerCase() ? -1 : 1;
      } else {
        return a[0]! < b[0]! ? -1 : 1;
      }
    };
    (numPart as string[]).sort(pattern ? comparePatternFn : compareFn);
    if (pattern) {
      for (let i = 0; i < numPart.length; i++) {
        const np = numPart[i]!;
        if (typeof np !== 'string') {
          numPart[i] = np.input!;
        }
      }
    } else if (!number) {
      textPart.sort(compareFn);
    }
    text.splice(0, text.length);
    if (!reverse) {
      text.push(...textPart);
      text.push(...numPart.map((el) => (typeof el === 'string' ? el : el.toString())));
    } else {
      text.push(...numPart.map((el) => (typeof el === 'string' ? el : el.toString())));
      text.push(...textPart);
    }
    if (unique) {
      // Remove duplicate lines
      let lastLine = '';
      for (let i = text.length - 1; i >= 0; i--) {
        if (text[i] == lastLine) {
          text.splice(i, 1);
        } else {
          lastLine = text[i]!;
        }
      }
    }
    adapter.replaceRange(text.join('\n'), curStart, curEnd);
  },
  substitute: function (adapter, params) {
    if (!adapter.getSearchCursor) {
      throw new Error(
        'Search feature not available. Requires searchcursor.js or ' + 'any other getSearchCursor implementation.'
      );
    }
    const argString = params.argString;
    const tokens = argString ? splitBySeparator(argString, argString[0]!) : [];
    let regexPart: string | undefined;
    let replacePart: string | undefined = '';
    let trailing: string[] | undefined;
    let count: number | undefined;
    let confirm = false; // Whether to confirm each replace.
    let global = false; // True to replace all instances on a line, false to replace only 1.
    if (tokens?.length) {
      regexPart = tokens[0];
      if (getOption('pcre') && regexPart !== '') {
        regexPart = new RegExp(regexPart!).source; //normalize not escaped characters
      }
      replacePart = tokens[1];
      if (replacePart !== undefined) {
        if (getOption('pcre')) {
          replacePart = unescapeRegexReplace(replacePart.replace(/([^\\])&/g, '$1$$&'));
        } else {
          replacePart = translateRegexReplace(replacePart);
        }
        vimGlobalState.lastSubstituteReplacePart = replacePart;
      }
      trailing = tokens[2] ? tokens[2].split(' ') : [];
    } else {
      // either the argString is empty or its of the form ' hello/world'
      // actually splitBySlash returns a list of tokens
      // only if the string starts with a '/'
      if (argString?.length) {
        showConfirm(adapter, 'Substitutions should be of the form ' + ':s/pattern/replace/');
        return;
      }
    }
    // After the 3rd slash, we can have flags followed by a space followed
    // by count.
    if (trailing) {
      const flagsPart = trailing[0];
      count = parseInt(trailing[1]!);
      if (flagsPart) {
        if (flagsPart.includes('c')) {
          confirm = true;
        }
        if (flagsPart.includes('g')) {
          global = true;
        }
        if (getOption('pcre')) {
          regexPart = regexPart! + '/' + flagsPart;
        } else {
          regexPart = regexPart!.replace(/\//g, '\\/') + '/' + flagsPart;
        }
      }
    }
    if (regexPart) {
      // If regex part is empty, then use the previous query. Otherwise use
      // the regex part as the new query.
      try {
        updateSearchQuery(adapter, regexPart, true /** ignoreCase */, true /** smartCase */);
      } catch {
        showConfirm(adapter, 'Invalid regex: ' + regexPart);
        return;
      }
    }
    replacePart = replacePart || vimGlobalState.lastSubstituteReplacePart;
    if (replacePart === undefined) {
      showConfirm(adapter, 'No previous substitute regular expression');
      return;
    }
    const state = getSearchState(adapter);
    const query = state.getQuery()!;
    let lineStart = params.line !== undefined ? params.line : adapter.getCursor().line;
    let lineEnd = params.lineEnd || lineStart;
    if (lineStart == adapter.firstLine() && lineEnd == adapter.lastLine()) {
      lineEnd = Infinity;
    }
    if (count) {
      lineStart = lineEnd;
      lineEnd = lineStart + count - 1;
    }
    const startPos = clipCursorToContent(adapter, makePos(lineStart, 0));
    const cursor = adapter.getSearchCursor(query, startPos);
    adapter.pushUndoStop();
    doReplace(adapter, confirm, global, lineStart, lineEnd, cursor, query, replacePart, params.callback);
  },
  undo: EditorAdapter.commands.undo!,
  unmap: function (adapter, params, ctx) {
    const mapArgs = params.args;
    if (!mapArgs || mapArgs.length < 1 || !exCommandDispatcher.unmap(mapArgs[0]!, ctx)) {
      if (adapter) {
        showConfirm(adapter, 'No such mapping: ' + params.input);
      }
    }
  },
  vglobal: function (adapter, params) {
    // global inspects params.commandName
    this.global!(adapter, params);
  },
  vmap: function (adapter, params) {
    this.map!(adapter, params, 'visual');
  },
  write: function (adapter, params) {
    if (EditorAdapter.commands.save) {
      // If a save command is defined, call it.
      EditorAdapter.commands.save(adapter, params);
    }
  },
  yank: function (adapter) {
    const cur = copyCursor(adapter.getCursor());
    const line = cur.line;
    const lineText = adapter.getLine(line);
    vimGlobalState.registerController.pushText('0', 'yank', lineText, true, true);
  }
};

export const exCommandDispatcher = new ExCommandDispatcher();

/**
 * @param {EditorAdapter} adapter EditorAdapter instance we are in.
 * @param {boolean} confirm Whether to confirm each replace.
 * @param {Cursor} lineStart Line to start replacing from.
 * @param {Cursor} lineEnd Line to stop replacing at.
 * @param {RegExp} query Query for performing matches with.
 * @param {string} replaceWith Text to replace matches with. May contain $1,
 *     $2, etc for replacing captured groups using JavaScript replace.
 * @param {function()} callback A callback for when the replace is done.
 */
function doReplace(
  adapter: EditorAdapter,
  confirm: boolean,
  global: boolean,
  lineStart: number,
  lineEnd: number,
  searchCursor: ReturnType<InstanceType<typeof EditorAdapter>['getSearchCursor']>,
  query: RegExp,
  replaceWith: string,
  callback?: () => void
) {
  const vim = adapter.state.vim as VimState;
  // Set up all the functions.
  vim.exMode = true;

  let done = false;
  let lastPos: Pos;
  let modifiedLineNumber: number;
  let joined: boolean;
  const replaceAll = () => {
    while (!done) {
      replace();
      next();
    }
    stop();
  };
  const replace = () => {
    const text = adapter.getRange(searchCursor.from(), searchCursor.to());
    const newText = text.replace(query, replaceWith);
    const unmodifiedLineNumber = searchCursor.to().line;
    searchCursor.replace(newText);
    modifiedLineNumber = searchCursor.to().line;
    lineEnd += modifiedLineNumber - unmodifiedLineNumber;
    joined = modifiedLineNumber < unmodifiedLineNumber;
  };
  const findNextValidMatch = () => {
    const lastMatchTo = lastPos && copyCursor(searchCursor.to());
    let match = searchCursor.findNext();
    if (match && lastMatchTo && cursorEqual(searchCursor.from(), lastMatchTo)) {
      match = searchCursor.findNext();
    }
    return match;
  };
  const next = () => {
    // The below only loops to skip over multiple occurrences on the same
    // line when 'global' is not true.
    while (findNextValidMatch() && isInRange(searchCursor.from(), lineStart, lineEnd)) {
      if (!global && searchCursor.from().line == modifiedLineNumber && !joined) {
        continue;
      }
      adapter.scrollIntoView(searchCursor.from(), 30);
      adapter.setSelection(searchCursor.from(), searchCursor.to());
      lastPos = searchCursor.from();
      done = false;
      return;
    }
    done = true;
  };
  const stop = (close?: () => void) => {
    if (close) {
      close();
    }
    adapter.focus();
    if (lastPos) {
      adapter.setCursor(lastPos);
      const vim = adapter.state.vim as VimState;
      vim.exMode = false;
      vim.lastHPos = vim.lastHSPos = lastPos.ch;
    }
    if (callback) {
      callback();
    }
  };
  const onPromptKeyDown = (e: KeyboardEvent, _value: any, close: () => void) => {
    // Swallow all keys.
    stopEvent(e);
    const keyName = getEventKeyName(e);
    switch (keyName) {
      case 'Y':
        replace();
        next();
        break;
      case 'N':
        next();
        break;
      case 'A':
        // replaceAll contains a call to close of its own. We don't want it
        // to fire too early or multiple times.
        const savedCallback = callback;
        callback = undefined;
        replaceAll();
        callback = savedCallback;
        break;
      // @ts-expect-error - maintain behavior of legacy code
      case 'L':
        replace();
      // fall through and exit.
      case 'Q':
      case 'Esc':
      case 'Ctrl-C':
      case 'Ctrl-[':
        stop(close);
        break;
    }
    if (done) {
      stop(close);
    }
    return true;
  };

  // Actually do replace.
  next();
  if (done) {
    showConfirm(adapter, 'No matches for ' + query.source);
    return;
  }
  if (!confirm) {
    replaceAll();
    if (callback) {
      callback();
    }
    return;
  }
  showPrompt(adapter, {
    desc: '',
    onClose: () => {},
    onKeyDown: onPromptKeyDown,
    prefix: `replace with **${replaceWith}** (y/n/a/q/l)`
  });
}

export function exitInsertMode(adapter: EditorAdapter) {
  const vim = adapter.state.vim as VimState;
  const macroModeState = vimGlobalState.macroModeState;
  const insertModeChangeRegister = vimGlobalState.registerController.getRegister('.');
  const isPlaying = macroModeState.isPlaying;
  const lastChange = macroModeState.lastInsertModeChanges;
  if (!isPlaying) {
    adapter.off('change', onChange);
  }
  if (!isPlaying && vim.insertModeRepeat! > 1) {
    // Perform insert mode repeat for commands like 3,a and 3,o.
    repeatLastEdit(adapter, vim, vim.insertModeRepeat! - 1, true /** repeatForInsert */);
    vim.lastEditInputState!.repeatOverride = vim.insertModeRepeat;
  }
  delete vim.insertModeRepeat;
  vim.insertMode = false;
  vim.insertDigraph = undefined;
  adapter.setCursor(adapter.getCursor().line, adapter.getCursor().ch - 1);
  adapter.setOption('keyMap', 'vim');
  adapter.setOption('disableInput', true);
  adapter.toggleOverwrite(false); // exit replace mode if we were in it.
  // update the ". register before exiting insert mode
  insertModeChangeRegister.setText(lastChange.changes.join(''));
  adapter.dispatch('vim-mode-change', { mode: 'normal' });
  if (macroModeState.isRecording) {
    logInsertModeChange(macroModeState);
  }
  adapter.enterVimMode();
}

export function _mapCommand(command: KeyMapping) {
  defaultKeymap.unshift(command);
}

export function mapCommand(keys: string, type: MappableCommandType, name: string, args: MappableArgType, extra: any) {
  const command: KeyMapping = { keys: keys, type: type };
  switch (type) {
    case 'action':
      command.action = name;
      command.actionArgs = args as ActionArgs;
      break;
    case 'ex':
      command.ex = name;
      command.exArgs = args as ExArgs;
      break;
    case 'motion':
      command.motion = name;
      command.motionArgs = args as MotionArgs;
      break;
    case 'operator':
      command.operator = name;
      command.operatorArgs = args as OperatorArgs;
      break;
    case 'operatorMotion':
      command.operatorMotion = name;
      command.operatorMotionArgs = args as OperatorMotionArgs;
      break;
    case 'search':
      command.search = name;
      command.searchArgs = args as SearchArgs;
      break;
  }
  for (const key of Object.keys(extra)) {
    (command as any)[key] = extra[key];
  }
  _mapCommand(command);
}

// The timeout in milliseconds for the two-character ESC keymap should be
// adjusted according to your typing speed to prevent false positives.
defineOption('insertModeEscKeysTimeout', 200, 'number');

export function logKey(macroModeState: MacroModeState, key: string) {
  if (macroModeState.isPlaying) {
    return;
  }
  const registerName = macroModeState.latestRegister!;
  const register = vimGlobalState.registerController.getRegister(registerName);
  if (register) {
    register.pushText(key);
  }
}

function logInsertModeChange(macroModeState: MacroModeState) {
  if (macroModeState.isPlaying) {
    return;
  }
  const registerName = macroModeState.latestRegister!;
  const register = vimGlobalState.registerController.getInternalRegister(registerName);
  if (register && register.pushInsertModeChanges) {
    register.pushInsertModeChanges(macroModeState.lastInsertModeChanges);
  }
}

export function logSearchQuery(macroModeState: MacroModeState, query: string) {
  if (macroModeState.isPlaying) {
    return;
  }
  const registerName = macroModeState.latestRegister!;
  const register = vimGlobalState.registerController.getInternalRegister(registerName);
  if (register && register.pushSearchQuery) {
    register.pushSearchQuery(query);
  }
}

/**
 * Listens for changes made in insert mode.
 * Should only be active in insert mode.
 */
export function onChange(adapter: EditorAdapter, change: Change): void {
  let changeObj: Change | undefined = change;
  const macroModeState = vimGlobalState.macroModeState;
  const lastChange = macroModeState.lastInsertModeChanges;
  if (!macroModeState.isPlaying) {
    while (changeObj) {
      lastChange.expectCursorActivityForChange = true;
      if (lastChange.ignoreCount! > 1) {
        lastChange.ignoreCount!--;
      } else if (
        changeObj.origin == '+input' ||
        changeObj.origin == 'paste' ||
        changeObj.origin === undefined /* only in testing */
      ) {
        const selectionCount = adapter.listSelections().length;
        if (selectionCount > 1) lastChange.ignoreCount = selectionCount;
        const text = changeObj.text.join('\n');
        if (lastChange.maybeReset) {
          lastChange.changes = [];
          lastChange.maybeReset = false;
        }
        if (text) {
          if (adapter.state.overwrite && !text.includes('\n')) {
            lastChange.changes.push(text);
          } else {
            lastChange.changes.push(text);
          }
        }
      }
      // Change objects may be chained with next.
      changeObj = changeObj.next;
    }
  }
}

/**
 * Listens for any kind of cursor activity on EditorAdapter.
 */
function onCursorActivity(adapter: EditorAdapter) {
  const vim = adapter.state.vim as VimState;
  if (vim.insertMode) {
    // Tracking cursor activity in insert mode (for macro support).
    const macroModeState = vimGlobalState.macroModeState;
    if (macroModeState.isPlaying) {
      return;
    }
    const lastChange = macroModeState.lastInsertModeChanges;
    if (lastChange.expectCursorActivityForChange) {
      lastChange.expectCursorActivityForChange = false;
    } else {
      // Cursor moved outside the context of an edit. Reset the change.
      lastChange.maybeReset = true;
    }
  } else if (!adapter.curOp.isVimOp) {
    handleExternalSelection(adapter, vim);
  }
}
function handleExternalSelection(adapter: EditorAdapter, vim: VimState) {
  let anchor = adapter.getCursor('anchor');
  let head = adapter.getCursor('head');
  // Enter or exit visual mode to match mouse selection.
  if (vim.visualMode && !adapter.somethingSelected()) {
    exitVisualMode(adapter, false);
  } else if (!vim.visualMode && !vim.insertMode && adapter.somethingSelected()) {
    vim.visualMode = true;
    vim.visualLine = false;
    adapter.dispatch('vim-mode-change', { mode: 'visual' });
  }
  if (vim.visualMode) {
    // Bind EditorAdapter selection model to vim selection model.
    // Mouse selections are considered visual characterwise.
    const headOffset = !cursorIsBefore(head, anchor) ? -1 : 0;
    const anchorOffset = cursorIsBefore(head, anchor) ? -1 : 0;
    head = offsetCursor(head, 0, headOffset);
    anchor = offsetCursor(anchor, 0, anchorOffset);
    vim.sel = new CmSelection(anchor, head);
    updateMark(adapter, vim, '<', cursorMin(head, anchor));
    updateMark(adapter, vim, '>', cursorMax(head, anchor));
  } else if (!vim.insertMode) {
    // Reset lastHPos if selection was modified by something outside of vim mode e.g. by mouse.
    vim.lastHPos = adapter.getCursor().ch;
  }
}

/** Wrapper for special keys pressed in insert mode */
export class InsertModeKey {
  readonly keyName: string;
  constructor(keyName: string) {
    this.keyName = keyName;
  }
}

/**
 * Repeats the last edit, which includes exactly 1 command and at most 1
 * insert. Operator and motion commands are read from lastEditInputState,
 * while action commands are read from lastEditActionCommand.
 *
 * If repeatForInsert is true, then the function was called by
 * exitInsertMode to repeat the insert mode changes the user just made. The
 * corresponding enterInsertMode call was made with a count.
 */
export function repeatLastEdit(adapter: EditorAdapter, vim: VimState, repeat: number, repeatForInsert: boolean) {
  const macroModeState = vimGlobalState.macroModeState;
  macroModeState.isPlaying = true;
  const isAction = !!vim.lastEditActionCommand;
  const cachedInputState = vim.inputState;
  const repeatCommand = () => {
    if (isAction) {
      commandDispatcher.processAction(adapter, vim, vim.lastEditActionCommand!);
    } else {
      commandDispatcher.evalInput(adapter, vim);
    }
  };
  const repeatInsert = (repeat: number) => {
    if (macroModeState.lastInsertModeChanges.changes.length > 0) {
      // For some reason, repeat cw in desktop VIM does not repeat
      // insert mode changes. Will conform to that behavior.
      repeat = !vim.lastEditActionCommand ? 1 : repeat;
      const changeObject = macroModeState.lastInsertModeChanges;
      repeatInsertModeChanges(adapter, changeObject.changes, repeat);
    }
  };
  vim.inputState = vim.lastEditInputState!;
  if (isAction && vim.lastEditActionCommand!.interlaceInsertRepeat) {
    // o and O repeat have to be interlaced with insert repeats so that the
    // insertions appear on separate lines instead of the last line.
    for (let i = 0; i < repeat; i++) {
      repeatCommand();
      repeatInsert(1);
    }
  } else {
    if (!repeatForInsert) {
      // Hack to get the cursor to end up at the right place. If I is
      // repeated in insert mode repeat, cursor will be 1 insert
      // change set left of where it should be.
      repeatCommand();
    }
    repeatInsert(repeat);
  }
  vim.inputState = cachedInputState;
  if (vim.insertMode && !repeatForInsert) {
    // Don't exit insert mode twice. If repeatForInsert is set, then we
    // were called by an exitInsertMode call lower on the stack.
    exitInsertMode(adapter);
  }
  macroModeState.isPlaying = false;
}

export function repeatInsertModeChanges(adapter: EditorAdapter, changes: (InsertModeKey | string)[], repeat: number) {
  const keyHandler = (binding: BindingFunction | string | string[]): boolean => {
    if (typeof binding == 'string') {
      EditorAdapter.commands[binding]!(adapter, {});
    } else if (Array.isArray(binding)) {
      /* empty */
    } else {
      binding(adapter);
    }
    return true;
  };
  const head = adapter.getCursor('head');
  const visualBlock = vimGlobalState.macroModeState.lastInsertModeChanges.visualBlock;
  if (visualBlock) {
    // Set up block selection again for repeating the changes.
    selectForInsert(adapter, head, visualBlock + 1);
    repeat = adapter.listSelections().length;
    adapter.setCursor(head);
  }
  for (let i = 0; i < repeat; i++) {
    if (visualBlock) {
      adapter.setCursor(offsetCursor(head, i, 0));
    }
    for (let j = 0; j < changes.length; j++) {
      const change = changes[j];
      if (change instanceof InsertModeKey) {
        EditorAdapter.lookupKey(change.keyName, 'vim-insert', keyHandler);
      } else if (typeof change == 'string') {
        adapter.replaceSelections([change]);
      }
    }
  }
  if (visualBlock) {
    adapter.setCursor(offsetCursor(head, 0, 1));
  }
}

export const initVimAdapter = () => {
  EditorAdapter.keyMap.vim = {
    attach: attachVimMap,
    call: cmKey,
    detach: detachVimMap
  };

  EditorAdapter.keyMap['vim-insert'] = {
    // TODO: override navigation keys so that Esc will cancel automatic
    attach: attachVimMap,
    call: cmKey,
    detach: detachVimMap,
    // indentation from o, O, i_<CR>
    fallthrough: ['default']
  };

  EditorAdapter.keyMap['vim-replace'] = {
    attach: attachVimMap,
    call: cmKey,
    detach: detachVimMap,
    fallthrough: ['vim-insert'],
    keys: { Backspace: 'goCharLeft' }
  };
};

type CharRange = {
  from: number;
  to: number;
};
const kDefaultIsKeyword = '@,48-57,_,192-255';
let isKeywordRanges: CharRange[] = [];
let isKeywordValue: string;

const isKeywordTest = (ch: string): boolean => {
  if (!ch) {
    return false;
  }
  const code = ch.charCodeAt(0);
  return isKeywordRanges.some((r) => code >= r.from && code <= r.to);
};

defineOption(
  'iskeyword',
  '@,48-57,_,192-255',
  'string',
  ['isk'],
  (value) => {
    if (typeof value !== 'string') {
      return isKeywordValue || kDefaultIsKeyword;
    }
    const parts = value.split(',');

    const ranges = parts.reduce((l: CharRange[], p) => {
      // @ represents alpha characters
      if (p === '@') {
        return [
          ...l,
          { from: 'A'.charCodeAt(0), to: 'Z'.charCodeAt(0) },
          { from: 'a'.charCodeAt(0), to: 'z'.charCodeAt(0) }
        ];
      }
      // @-@ represents the character @
      if (p === '@-@') {
        const at = '@'.charCodeAt(0);
        return [...l, { from: at, to: at }];
      }
      //  <num>-<num> is an inclusive range of characters
      const m = /^(\d+)-(\d+)$/.exec(p);
      if (m) {
        return [...l, { from: Number(m[1]), to: Number(m[2]) }];
      }
      // <num> is a single character code
      const n = Number(p);
      if (!isNaN(n)) {
        return [...l, { from: n, to: n }];
      }
      // any single character is itself
      if (p.length == 1) {
        const ch = p.charCodeAt(0);
        return [...l, { from: ch, to: ch }];
      }
      // ignore anything else
      return l;
    }, []);
    isKeywordRanges = ranges;
    isKeywordValue = value;
    return isKeywordValue;
  },
  {
    commas: true
  }
);

defineOption('background', 'dark', 'string', ['bg'], (value?: boolean | number | string, adapter?: EditorAdapter) => {
  if (typeof value !== 'string') {
    if (adapter) {
      const theme = adapter.getOption('theme').toString().toLowerCase();
      if (theme.endsWith('light')) {
        return 'light';
      } else if (theme.endsWith('dark')) {
        return 'dark';
      }
    }
    return '';
  }

  if (!adapter) {
    return '';
  }
  const theme = adapter.getOption('theme').toString();
  if (theme.toLowerCase().endsWith(value)) {
    return value;
  }

  switch (value) {
    case 'dark':
      adapter.setOption('theme', `${theme.substring(0, theme.length - 5)}Dark`);
      break;
    case 'light':
      adapter.setOption('theme', `${theme.substring(0, theme.length - 4)}Light`);
      break;
    default:
      new Error(`Invalid option: background=${value}`);
  }
  return value;
});

defineOption('expandtab', undefined, 'boolean', ['et'], (value, adapter) => {
  if (value === undefined) {
    if (adapter) {
      return !adapter.getOption('indentWithTabs');
    }
  } else if (adapter) {
    adapter.setOption('indentWithTabs', !value);
    return !!value;
  }
  return false;
});

defineOption('tabstop', undefined, 'number', ['ts'], (value, adapter) => {
  if (value === undefined) {
    if (adapter) {
      const current = adapter.getOption('tabSize');
      if (typeof current === 'number') {
        return current;
      } else if (!isNaN(Number(current))) {
        return Number(current);
      }
    }
  } else if (adapter) {
    if (typeof value !== 'number') {
      value = Number(value);
    }
    if (!isNaN(value)) {
      adapter.setOption('tabSize', value);
      return value;
    }
  }
  return 8;
});

export const vimApi = new VimApi();
