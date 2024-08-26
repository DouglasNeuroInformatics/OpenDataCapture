/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { actions } from './actions';
import EditorAdapter, { CmSelection } from './adapter';
import { cursorMin, isUpperCase, isWhiteSpaceString, makePos } from './common';
import { vimGlobalState } from './global';
import { clipCursorToContent, lineLength, offsetCursor } from './keymap_vim';
import { motions } from './motions';

import type { Pos } from './common';
import type { OperatorArgs, VimState } from './types';

/**
 * An operator acts on a text selection. It receives the list of selections
 * as input. The corresponding EditorAdapter selection is guaranteed to
 * match the input selection.
 */
export type OperatorFunc = (
  adapter: EditorAdapter,
  args: OperatorArgs,
  ranges: CmSelection[],
  oldAnchor: Pos,
  newHead: Pos
) => Pos | void;
export const operators: { [key: string]: OperatorFunc } = {
  change: function (adapter, args, ranges) {
    const vim = adapter.state.vim as VimState;
    const anchor = ranges[0]!.anchor;
    let head = ranges[0]!.head;
    let finalHead: Pos;
    let text: string;
    if (!vim.visualMode) {
      text = adapter.getRange(anchor, head);
      const lastState = vim.lastEditInputState;
      if (lastState && lastState.motion === 'moveByWords' && !isWhiteSpaceString(text)) {
        // Exclude trailing whitespace if the range is not all whitespace.
        const match = /\s+$/.exec(text);
        if (match && lastState.motionArgs?.forward) {
          head = offsetCursor(head, 0, -match[0].length);
          text = text.slice(0, -match[0].length);
        }
      }
      const prevLineEnd = makePos(anchor.line - 1, Infinity);
      const wasLastLine = adapter.firstLine() == adapter.lastLine();
      if (head.line > adapter.lastLine() && args.linewise && !wasLastLine) {
        adapter.replaceRange('', prevLineEnd, head);
      } else {
        adapter.replaceRange('', anchor, head);
      }
      if (args.linewise) {
        // Push the next line back down, if there is a next line.
        if (!wasLastLine) {
          adapter.setCursor(prevLineEnd);
          EditorAdapter.commands.newlineAndIndent!(adapter, {});
        }
        // make sure cursor ends up at the end of the line.
        anchor.ch = Number.MAX_VALUE;
      }
      finalHead = anchor;
    } else if (args.fullLine) {
      head.ch = Number.MAX_VALUE;
      head.line--;
      adapter.setSelection(anchor, head);
      text = adapter.getSelection();
      adapter.replaceSelections(['']);
      finalHead = anchor;
    } else {
      text = adapter.getSelection();
      const replacement = new Array<string>(ranges.length).fill('');
      adapter.replaceSelections(replacement);
      finalHead = cursorMin(ranges[0]!.head, ranges[0]!.anchor);
    }
    vimGlobalState.registerController.pushText(args.registerName!, 'change', text, args.linewise, ranges.length > 1);
    actions.enterInsertMode!(adapter, { head: finalHead }, adapter.state.vim);
  },
  changeCase: function (adapter, args, ranges, oldAnchor, newHead) {
    const selections = adapter.getSelections();
    const toLower = args.toLower;

    const swapped = selections.map((toSwap) => {
      if (toLower === true) {
        return toSwap.toLowerCase();
      } else if (toLower === false) {
        return toSwap.toUpperCase();
      } else {
        return Array.from(toSwap)
          .map((character) => (isUpperCase(character) ? character.toLowerCase() : character.toUpperCase()))
          .join('');
      }
    });
    adapter.replaceSelections(swapped);
    if (args.shouldMoveCursor) {
      return newHead;
    } else if (!adapter.state.vim.visualMode && args.linewise && ranges[0]!.anchor.line + 1 == ranges[0]!.head.line) {
      const vim = adapter.state.vim as VimState;
      const res = motions.moveToFirstNonWhiteSpaceCharacter!(adapter, oldAnchor, {}, vim, vim.inputState);
      return Array.isArray(res) ? res[0] : res;
    } else if (args.linewise) {
      return oldAnchor;
    } else {
      return cursorMin(ranges[0]!.anchor, ranges[0]!.head);
    }
  },
  // delete is a javascript keyword.
  delete: function (adapter, args, ranges) {
    // Add to the undo stack explicitly so that this delete is recorded as a
    // specific action instead of being bundled with generic other edits.
    adapter.pushUndoStop();
    let finalHead: Pos;
    let text: string;
    const vim = adapter.state.vim as VimState;
    if (!vim.visualBlock) {
      let anchor = ranges[0]!.anchor,
        head = ranges[0]!.head;
      if (
        args.linewise &&
        head.line != adapter.firstLine() &&
        anchor.line == adapter.lastLine() &&
        anchor.line == head.line - 1
      ) {
        // Special case for dd on last line (and first line).
        if (anchor.line == adapter.firstLine()) {
          anchor.ch = 0;
        } else {
          anchor = makePos(anchor.line - 1, lineLength(adapter, anchor.line - 1));
        }
      }
      text = adapter.getRange(anchor, head);
      adapter.replaceRange('', anchor, head);
      finalHead = anchor;
      if (args.linewise) {
        const vim = adapter.state.vim as VimState;
        const res = motions.moveToFirstNonWhiteSpaceCharacter!(adapter, anchor, {}, vim, vim.inputState)!;
        finalHead = Array.isArray(res) ? res[0] : res;
      }
    } else {
      text = adapter.getSelection();
      const replacement = new Array<string>(ranges.length).fill('');
      adapter.replaceSelections(replacement);
      finalHead = cursorMin(ranges[0]!.head, ranges[0]!.anchor);
    }
    vimGlobalState.registerController.pushText(args.registerName!, 'delete', text, args.linewise, vim.visualBlock);
    return clipCursorToContent(adapter, finalHead);
  },
  indent: function (adapter, args, ranges) {
    const vim = adapter.state.vim as VimState;
    const startLine = ranges[0]!.anchor.line;
    let endLine = vim.visualBlock ? ranges[ranges.length - 1]!.anchor.line : ranges[0]!.head.line;
    // In visual mode, n> shifts the selection right n times, instead of
    // shifting n lines right once.
    let repeat = vim.visualMode ? args.repeat || 0 : 1;
    if (args.linewise) {
      // The only way to delete a newline is to delete until the start of
      // the next line, so in linewise mode evalInput will include the next
      // line. We don't want this in indent, so we go back a line.
      endLine--;
    }
    adapter.pushUndoStop();
    for (let i = startLine; i <= endLine; i++) {
      for (let j = 0; j < repeat; j++) {
        adapter.indentLine(i, args.indentRight);
      }
    }
    adapter.pushUndoStop();
    const res = motions.moveToFirstNonWhiteSpaceCharacter!(adapter, ranges[0]!.anchor, {}, vim, vim.inputState);
    return Array.isArray(res) ? res[0] : res;
  },
  indentAuto: function (adapter, _args, ranges) {
    adapter.execCommand('indentAuto');
    const vim = adapter.state.vim as VimState;
    const res = motions.moveToFirstNonWhiteSpaceCharacter!(adapter, ranges[0]!.anchor, {}, vim, vim.inputState);
    return Array.isArray(res) ? res[0] : res;
  },
  yank: function (adapter, args, ranges, oldAnchor) {
    const vim = adapter.state.vim as VimState;
    const text = adapter.getSelection();
    const endPos = vim.visualMode
      ? cursorMin(vim.sel.anchor, vim.sel.head, ranges[0]!.head, ranges[0]!.anchor)
      : oldAnchor;
    vimGlobalState.registerController.pushText(args.registerName!, 'yank', text, args.linewise, vim.visualBlock);
    return endPos;
  }
};

export const defineOperator = (name: string, fn: OperatorFunc) => (operators[name] = fn);
