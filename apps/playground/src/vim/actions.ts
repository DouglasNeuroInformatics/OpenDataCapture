/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import EditorAdapter, { CmSelection } from './adapter';
import {
  copyCursor,
  cursorEqual,
  cursorIsBefore,
  cursorMax,
  cursorMin,
  findFirstNonWhiteSpaceCharacter,
  makePos,
  type Pos
} from './common';
import { vimGlobalState } from './global';
import {
  clipCursorToContent,
  exCommandDispatcher,
  exitInsertMode,
  exitVisualMode,
  lineLength,
  offsetCursor,
  onChange,
  repeatInsertModeChanges,
  repeatLastEdit,
  selectForInsert,
  updateCmSelection,
  updateLastSelection,
  updateMark,
  vimApi
} from './keymap_vim';
import { MacroModeState } from './macro-mode-state';
import { motions } from './motions';

import type { ActionArgs, VimState } from './types';

export type ActionFunc = (adapter: EditorAdapter, actionArgs: ActionArgs, vim: VimState) => void;

export const actions: { [key: string]: ActionFunc } = {
  beginDigraph: function (_adapter, _actionArgs, vim) {
    vim.insertDigraph = true;
  },
  enterInsertMode: function (adapter, actionArgs, vim) {
    if (adapter.getOption('readOnly')) {
      return;
    }
    vim.insertMode = true;
    vim.insertModeRepeat = actionArgs?.repeat || 1;
    const insertAt = actionArgs ? actionArgs.insertAt : null;
    const sel = vim.sel;
    let head = actionArgs.head || adapter.getCursor('head');
    let height = adapter.listSelections().length;
    if (insertAt == 'eol') {
      head = makePos(head.line, lineLength(adapter, head.line));
    } else if (insertAt == 'bol') {
      head = makePos(head.line, 0);
    } else if (insertAt == 'charAfter') {
      head = offsetCursor(head, 0, 1);
    } else if (insertAt == 'firstNonBlank') {
      const res = motions.moveToFirstNonWhiteSpaceCharacter!(adapter, head, {}, vim, vim.inputState);
      head = Array.isArray(res) ? res[0] : res!;
    } else if (insertAt == 'startOfSelectedArea') {
      if (!vim.visualMode) return;
      if (!vim.visualBlock) {
        if (sel.head.line < sel.anchor.line) {
          head = sel.head;
        } else {
          head = makePos(sel.anchor.line, 0);
        }
      } else {
        head = makePos(Math.min(sel.head.line, sel.anchor.line), Math.min(sel.head.ch, sel.anchor.ch));
        height = Math.abs(sel.head.line - sel.anchor.line) + 1;
      }
    } else if (insertAt == 'endOfSelectedArea') {
      if (!vim.visualMode) return;
      if (!vim.visualBlock) {
        if (sel.head.line >= sel.anchor.line) {
          head = offsetCursor(sel.head, 0, 1);
        } else {
          head = makePos(sel.anchor.line, 0);
        }
      } else {
        head = makePos(Math.min(sel.head.line, sel.anchor.line), Math.max(sel.head.ch, sel.anchor.ch) + 1);
        height = Math.abs(sel.head.line - sel.anchor.line) + 1;
      }
    } else if (insertAt == 'inplace') {
      if (vim.visualMode) {
        return;
      }
    } else if (insertAt == 'lastEdit') {
      // do nothing.
      // head = getLastEditPos(adapter) || head;
    }
    adapter.setOption('disableInput', false);
    if (actionArgs?.replace) {
      // Handle Replace-mode as a special case of insert mode.
      adapter.toggleOverwrite(true);
      adapter.setOption('keyMap', 'vim-replace');
      adapter.dispatch('vim-mode-change', { mode: 'replace' });
    } else {
      adapter.toggleOverwrite(false);
      adapter.setOption('keyMap', 'vim-insert');
      adapter.dispatch('vim-mode-change', { mode: 'insert' });
    }
    if (!vimGlobalState.macroModeState.isPlaying) {
      // Only record if not replaying.
      adapter.on('change', onChange);
    }
    if (vim.visualMode) {
      exitVisualMode(adapter);
    }
    selectForInsert(adapter, head, height);
  },
  enterMacroRecordMode: function (adapter, actionArgs) {
    const macroModeState = vimGlobalState.macroModeState;
    const registerName = actionArgs.selectedCharacter!;
    if (vimGlobalState.registerController.isValidRegister(registerName)) {
      macroModeState.enterMacroRecordMode(adapter, registerName);
    }
  },
  exitInsertMode: exitInsertMode,
  incrementNumberToken: function (adapter, actionArgs) {
    const cur = adapter.getCursor();
    const lineStr = adapter.getLine(cur.line);
    const re = /(-?)(?:(0x)([\da-f]+)|(0b|0|)(\d+))/gi;
    const bases: { [key: string]: number } = {
      '': 10,
      '0': 8,
      '0b': 2,
      '0x': 16
    };
    let match: null | RegExpExecArray;
    let start: number | undefined;
    let end: number | undefined;
    while ((match = re.exec(lineStr)) !== null) {
      start = match.index;
      end = start + match[0].length;
      if (cur.ch < end) break;
    }
    if (!match || !end || !start) {
      return;
    }
    if (!actionArgs.backtrack && end <= cur.ch) return;
    const baseStr = match[2]! || match[4]!;
    const digits = match[3]! || match[5]!;
    const increment = actionArgs.increase ? 1 : -1;
    const base = bases[baseStr.toLowerCase()] || 10;
    const number = parseInt(match[1] + digits, base) + increment * actionArgs.repeat!;
    let numberStr = number.toString(base);
    const zeroPadding = baseStr ? new Array(digits.length - numberStr.length + 1 + match[1]!.length).join('0') : '';
    if (numberStr.startsWith('-')) {
      numberStr = '-' + baseStr + zeroPadding + numberStr.substr(1);
    } else {
      numberStr = baseStr + zeroPadding + numberStr;
    }
    const from = makePos(cur.line, start);
    const to = makePos(cur.line, end);
    adapter.replaceRange(numberStr, from, to);

    adapter.setCursor(makePos(cur.line, start + numberStr.length - 1));
  },
  indent: function (adapter, actionArgs) {
    adapter.indentLine(adapter.getCursor().line, actionArgs.indentRight);
  },
  joinLines: function (adapter, actionArgs, vim) {
    let curStart: Pos;
    let curEnd: Pos;
    if (vim.visualMode) {
      curStart = adapter.getCursor('anchor');
      curEnd = adapter.getCursor('head');
      if (cursorIsBefore(curEnd, curStart)) {
        const tmp = curEnd;
        curEnd = curStart;
        curStart = tmp;
      }
      curEnd.ch = lineLength(adapter, curEnd.line) - 1;
    } else {
      // Repeat is the number of lines to join. Minimum 2 lines.
      const repeat = Math.max(actionArgs.repeat!, 2);
      curStart = adapter.getCursor();
      curEnd = clipCursorToContent(adapter, makePos(curStart.line + repeat - 1, Infinity));
    }
    let finalCh = 0;
    for (let i = curStart.line; i < curEnd.line; i++) {
      finalCh = lineLength(adapter, curStart.line);
      const tmp = makePos(curStart.line + 1, lineLength(adapter, curStart.line + 1));
      let text = adapter.getRange(curStart, tmp);
      text = actionArgs.keepSpaces ? text.replace(/\r?\n\r?/g, '') : text.replace(/\r?\n\s*/g, ' ');
      adapter.replaceRange(text, curStart, tmp);
    }
    const curFinalPos = makePos(curStart.line, finalCh);
    if (vim.visualMode) {
      exitVisualMode(adapter, false);
    }
    adapter.setCursor(curFinalPos);
  },
  jumpListWalk: function (adapter, actionArgs, vim) {
    if (vim.visualMode) {
      return;
    }
    const repeat = actionArgs.repeat || 0;
    const forward = actionArgs.forward;
    const jumpList = vimGlobalState.jumpList;

    const mark = jumpList.move(adapter, forward ? repeat : -repeat);
    const markPos = mark ? mark.find() : adapter.getCursor();
    adapter.setCursor(markPos);
  },
  newLineAndEnterInsertMode: function (adapter, actionArgs, vim) {
    if (adapter.getOption('readOnly')) {
      return;
    }
    vim.insertMode = true;
    const insertAt = copyCursor(adapter.getCursor());
    if (insertAt.line === adapter.firstLine() && !actionArgs.after) {
      // Special case for inserting newline before start of document.
      adapter.replaceRange('\n', makePos(adapter.firstLine(), 0));
      adapter.setCursor(adapter.firstLine(), 0);
    } else {
      insertAt.line = actionArgs.after ? insertAt.line : insertAt.line - 1;
      insertAt.ch = lineLength(adapter, insertAt.line);
      adapter.setCursor(insertAt);
      const newlineFn =
        EditorAdapter.commands.newlineAndIndentContinueComment || EditorAdapter.commands.newlineAndIndent;
      newlineFn!(adapter, {});
    }
    this.enterInsertMode!(adapter, { repeat: actionArgs.repeat }, vim);
  },
  paste: function (adapter, actionArgs, vim) {
    const cur = copyCursor(adapter.getCursor());
    const register = vimGlobalState.registerController.getRegister(actionArgs.registerName!);
    let text: string = register.toString();
    let blockText: string[] = [];
    if (!text) {
      return;
    }
    if (actionArgs.matchIndent) {
      const tabSize = adapter.getOption('tabSize') as number;
      // length that considers tabs and tabSize
      const whitespaceLength = (str: string) => {
        const tabs = str.split('\t').length - 1;
        const spaces = str.split(' ').length - 1;
        return tabs * tabSize + spaces * 1;
      };
      const currentLine = adapter.getLine(adapter.getCursor().line);
      const indent = whitespaceLength(/^\s*/.exec(currentLine)![0]);
      // chomp last newline b/c don't want it to match /^\s*/gm
      const chompedText = text.replace(/\n$/, '');
      const wasChomped = text !== chompedText;
      const firstIndent = whitespaceLength(/^\s*/.exec(text)![0]);
      text = chompedText.replace(/^\s*/gm, (wspace: string) => {
        const newIndent = indent + (whitespaceLength(wspace) - firstIndent);
        if (newIndent < 0) {
          return '';
        } else if (adapter.getOption('indentWithTabs')) {
          const quotient = Math.floor(newIndent / tabSize);
          return Array(quotient + 1).join('\t');
        } else {
          return Array(newIndent + 1).join(' ');
        }
      });
      text += wasChomped ? '\n' : '';
    }
    if (actionArgs.repeat! > 1) {
      text = Array(actionArgs.repeat! + 1).join(text);
    }
    const linewise = register.linewise;
    const blockwise = register.blockwise;
    if (blockwise) {
      blockText = text.split('\n');
      if (linewise) {
        blockText.pop();
      }
      blockText = blockText.map((line) => (line == '' ? ' ' : line));
      cur.ch += actionArgs.after ? 1 : 0;
      cur.ch = Math.min(lineLength(adapter, cur.line), cur.ch);
    } else if (linewise) {
      if (vim.visualMode) {
        text = vim.visualLine ? text.slice(0, -1) : '\n' + text.slice(0, text.length - 1) + '\n';
      } else if (actionArgs.after) {
        // Move the newline at the end to the start instead, and paste just
        // before the newline character of the line we are on right now.
        text = '\n' + text.slice(0, text.length - 1);
        cur.ch = lineLength(adapter, cur.line);
      } else {
        cur.ch = 0;
      }
    } else {
      cur.ch += actionArgs.after ? 1 : 0;
    }
    let curPosFinal: Pos;
    let idx: number;
    if (vim.visualMode) {
      //  save the pasted text for reselection if the need arises
      vim.lastPastedText = text;
      let lastSelectionCurEnd: Pos | undefined;
      const selectedArea = getSelectedAreaRange(adapter, vim);
      const selectionStart = selectedArea[0];
      let selectionEnd = selectedArea[1];
      const selectedText = adapter.getSelection();
      const selections = adapter.listSelections();
      const emptyStrings = new Array(selections.length).fill('');
      // save the curEnd marker before it get cleared due to adapter.replaceRange.
      if (vim.lastSelection) {
        lastSelectionCurEnd = vim.lastSelection.headMark.find();
      }
      // push the previously selected text to unnamed register
      vimGlobalState.registerController.unnamedRegister.setText(selectedText);
      if (blockwise) {
        // first delete the selected text
        adapter.replaceSelections(emptyStrings);
        // Set new selections as per the block length of the yanked text
        selectionEnd = makePos(selectionStart.line + blockText.length - 1, selectionStart.ch);
        adapter.setCursor(selectionStart);
        selectBlock(adapter, selectionEnd);
        adapter.replaceSelections(blockText);
        curPosFinal = selectionStart;
      } else if (vim.visualBlock) {
        adapter.replaceSelections(emptyStrings);
        adapter.setCursor(selectionStart);
        adapter.replaceRange(text, selectionStart, selectionStart);
        curPosFinal = selectionStart;
      } else {
        adapter.replaceRange(text, selectionStart, selectionEnd);
        curPosFinal = adapter.posFromIndex(adapter.indexFromPos(selectionStart) + text.length - 1);
      }
      // restore the the curEnd marker
      if (vim.lastSelection && lastSelectionCurEnd) {
        vim.lastSelection.headMark = adapter.setBookmark(lastSelectionCurEnd);
      }
      if (linewise) {
        curPosFinal.ch = 0;
      }
    } else {
      if (blockwise) {
        adapter.setCursor(cur);
        for (let i = 0; i < blockText.length; i++) {
          const line = cur.line + i;
          if (line > adapter.lastLine()) {
            adapter.replaceRange('\n', makePos(line, cur.ch));
          }
          const lastCh = lineLength(adapter, line);
          if (lastCh < cur.ch) {
            extendLineToColumn(adapter, line, cur.ch);
          }
        }
        adapter.setCursor(cur);
        selectBlock(adapter, makePos(cur.line + text.length - 1, cur.ch));
        adapter.replaceSelections(blockText);
        curPosFinal = cur;
      } else {
        adapter.replaceRange(text, cur);
        // Now fine tune the cursor to where we want it.
        if (linewise && actionArgs.after) {
          curPosFinal = makePos(cur.line + 1, findFirstNonWhiteSpaceCharacter(adapter.getLine(cur.line + 1)));
        } else if (linewise && !actionArgs.after) {
          curPosFinal = makePos(cur.line, findFirstNonWhiteSpaceCharacter(adapter.getLine(cur.line)));
        } else if (!linewise && actionArgs.after) {
          idx = adapter.indexFromPos(cur);
          curPosFinal = adapter.posFromIndex(idx + text.length - 1);
        } else {
          idx = adapter.indexFromPos(cur);
          curPosFinal = adapter.posFromIndex(idx + text.length);
        }
      }
    }
    if (vim.visualMode) {
      exitVisualMode(adapter, false);
    }
    adapter.setCursor(curPosFinal);
  },
  redo: function (adapter, actionArgs) {
    repeatFn(() => EditorAdapter.commands.redo!(adapter, {}), actionArgs.repeat!)();
  },
  repeatLastEdit: function (adapter, actionArgs, vim) {
    const lastEditInputState = vim.lastEditInputState;
    if (!lastEditInputState) {
      return;
    }
    let repeat = actionArgs.repeat;
    if (repeat && actionArgs.repeatIsExplicit) {
      vim.lastEditInputState!.repeatOverride = repeat;
    } else {
      repeat = vim.lastEditInputState!.repeatOverride || repeat;
    }
    repeatLastEdit(adapter, vim, repeat!, false /** repeatForInsert */);
  },
  replace: function (adapter, actionArgs, vim) {
    const replaceWith = actionArgs.selectedCharacter!;
    let curStart = adapter.getCursor();
    let replaceTo: number;
    let curEnd: Pos;
    const selections = adapter.listSelections();
    if (vim.visualMode) {
      curStart = adapter.getCursor('start');
      curEnd = adapter.getCursor('end');
    } else {
      const line = adapter.getLine(curStart.line);
      replaceTo = curStart.ch + actionArgs.repeat!;
      if (replaceTo > line.length) {
        replaceTo = line.length;
      }
      curEnd = makePos(curStart.line, replaceTo);
    }
    if (replaceWith == '\n') {
      if (!vim.visualMode) adapter.replaceRange('', curStart, curEnd);
      // special case, where vim help says to replace by just one line-break
      (EditorAdapter.commands.newlineAndIndentContinueComment || EditorAdapter.commands.newlineAndIndent)!(adapter, {});
    } else {
      if (vim.visualBlock) {
        // Tabs are split in visua block before replacing
        const spaces = new Array(adapter.getOption('tabSize') + 1).join(' ');
        const replaceWithStr = adapter.getSelection().replace(/\t/g, spaces).replace(/[^\n]/g, replaceWith).split('\n');
        adapter.replaceSelections(replaceWithStr);
      } else {
        //replace all characters in range by selected, but keep linebreaks
        const replaceWithStr = adapter.getRange(curStart, curEnd).replace(/[^\n]/g, replaceWith);
        adapter.replaceRange(replaceWithStr, curStart, curEnd);
      }
      if (vim.visualMode) {
        curStart = cursorIsBefore(selections[0]!.anchor, selections[0]!.head)
          ? selections[0]!.anchor
          : selections[0]!.head;
        adapter.setCursor(curStart);
        exitVisualMode(adapter, false);
      } else {
        adapter.setCursor(offsetCursor(curEnd, 0, -1));
      }
    }
  },
  replayMacro: function (adapter, actionArgs, vim) {
    let registerName = actionArgs.selectedCharacter;
    let repeat = actionArgs.repeat || 1;
    const macroModeState = vimGlobalState.macroModeState;
    if (registerName == '@') {
      registerName = macroModeState.latestRegister;
    } else {
      macroModeState.latestRegister = registerName;
    }
    while (repeat--) {
      executeMacroRegister(adapter, vim, macroModeState, registerName!);
    }
  },
  reselectLastSelection: function (adapter, _actionArgs, vim) {
    const lastSelection = vim.lastSelection;
    if (vim.visualMode) {
      updateLastSelection(adapter, vim);
    }
    if (lastSelection) {
      const anchor = lastSelection.anchorMark.find();
      const head = lastSelection.headMark.find();
      if (!anchor || !head) {
        // If the marks have been destroyed due to edits, do nothing.
        return;
      }
      vim.sel = new CmSelection(anchor, head);
      vim.visualMode = true;
      vim.visualLine = lastSelection.visualLine;
      vim.visualBlock = lastSelection.visualBlock;
      updateCmSelection(adapter);
      updateMark(adapter, vim, '<', cursorMin(anchor, head));
      updateMark(adapter, vim, '>', cursorMax(anchor, head));
      adapter.dispatch('vim-mode-change', {
        mode: 'visual',
        subMode: vim.visualLine ? 'linewise' : vim.visualBlock ? 'blockwise' : ''
      });
    }
  },
  scroll: function (adapter, actionArgs, vim) {
    if (vim.visualMode) {
      return;
    }
    const repeat = actionArgs.repeat || 1;
    const lineHeight = adapter.defaultTextHeight();
    const top = adapter.getScrollInfo().top;
    const delta = lineHeight * repeat;
    const newPos = actionArgs.forward ? top + delta : top - delta;
    const cursor = copyCursor(adapter.getCursor());
    let cursorCoords = adapter.charCoords(cursor, 'local');
    if (actionArgs.forward) {
      if (newPos > cursorCoords.top) {
        cursor.line += (newPos - cursorCoords.top) / lineHeight;
        cursor.line = Math.ceil(cursor.line);
        adapter.setCursor(cursor);
        cursorCoords = adapter.charCoords(cursor, 'local');
        adapter.scrollTo(undefined, cursorCoords.top);
      } else {
        // Cursor stays within bounds.  Just reposition the scroll window.
        adapter.scrollTo(undefined, newPos);
      }
    } else {
      // TODO: none of this can work becauso cursorCoords doesn't have bottom
      //const newBottom = newPos + adapter.getScrollInfo().clientHeight;
      //if (newBottom < cursorCoords.bottom) {
      //  cursor.line -= (cursorCoords.bottom - newBottom) / lineHeight;
      //  cursor.line = Math.floor(cursor.line);
      //  adapter.setCursor(cursor);
      //  cursorCoords = adapter.charCoords(cursor, "local");
      //  adapter.scrollTo(
      //    null,
      //    cursorCoords.bottom - adapter.getScrollInfo().clientHeight
      //  );
      //} else {
      //  // Cursor stays within bounds.  Just reposition the scroll window.
      //  adapter.scrollTo(null, newPos);
      //}
      adapter.scrollTo(undefined, newPos);
    }
  },
  scrollToCursor: function (adapter, actionArgs) {
    if (actionArgs.position) {
      adapter.moveCurrentLineTo(actionArgs.position);
    } else {
      adapter.scrollTo(undefined, adapter.getCursor().line);
    }
  },
  setMark: function (adapter, actionArgs, vim) {
    const markName = actionArgs.selectedCharacter!;
    updateMark(adapter, vim, markName, adapter.getCursor());
  },
  setRegister: function (adapter, actionArgs, vim) {
    vim.inputState.registerName = actionArgs.selectedCharacter;
    if (actionArgs.selectedCharacter === '*' || actionArgs.selectedCharacter === '+') {
      // Send this signal in case fetching the external clipboard is async
      // (which it often is) , this allows the clipboard registers to prefetch
      // the register contents from the system clipboard
      adapter.dispatch('vim-set-clipboard-register');
    }
  },
  toggleOverwrite: function (adapter) {
    if (!adapter.state.overwrite) {
      adapter.toggleOverwrite(true);
      adapter.setOption('keyMap', 'vim-replace');
      adapter.dispatch('vim-mode-change', { mode: 'replace' });
    } else {
      adapter.toggleOverwrite(false);
      adapter.setOption('keyMap', 'vim-insert');
      adapter.dispatch('vim-mode-change', { mode: 'insert' });
    }
  },
  toggleVisualMode: function (adapter, actionArgs, vim) {
    const repeat = actionArgs.repeat!;
    const anchor = adapter.getCursor();
    let head: Pos;
    // TODO: The repeat should actually select number of characters/lines
    //     equal to the repeat times the size of the previous visual
    //     operation.
    if (!vim.visualMode) {
      // Entering visual mode
      vim.visualMode = true;
      vim.visualLine = !!actionArgs.linewise;
      vim.visualBlock = !!actionArgs.blockwise;
      head = clipCursorToContent(adapter, makePos(anchor.line, anchor.ch + repeat - 1));
      vim.sel = new CmSelection(anchor, head);
      adapter.dispatch('vim-mode-change', {
        mode: 'visual',
        subMode: vim.visualLine ? 'linewise' : vim.visualBlock ? 'blockwise' : ''
      });
      updateCmSelection(adapter);
      updateMark(adapter, vim, '<', cursorMin(anchor, head));
      updateMark(adapter, vim, '>', cursorMax(anchor, head));
    } else if (vim.visualLine !== actionArgs.linewise || vim.visualBlock !== actionArgs.blockwise) {
      // Toggling between modes
      vim.visualLine = !!actionArgs.linewise;
      vim.visualBlock = !!actionArgs.blockwise;
      adapter.dispatch('vim-mode-change', {
        mode: 'visual',
        subMode: vim.visualLine ? 'linewise' : vim.visualBlock ? 'blockwise' : ''
      });
      updateCmSelection(adapter);
    } else {
      exitVisualMode(adapter);
    }
  },
  undo: function (adapter, actionArgs) {
    repeatFn(() => EditorAdapter.commands.undo!(adapter, {}), actionArgs.repeat!)();
    adapter.setCursor(adapter.getCursor('anchor'));
  }
};

export const defineAction = (name: string, fn: ActionFunc) => (actions[name] = fn);

function executeMacroRegister(
  adapter: EditorAdapter,
  vim: VimState,
  macroModeState: MacroModeState,
  registerName: string
) {
  const register = vimGlobalState.registerController.getInternalRegister(registerName);
  if (registerName == ':') {
    // Read-only register containing last Ex command.
    if (register.keyBuffer[0]) {
      exCommandDispatcher.processCommand(adapter, register.keyBuffer[0]);
    }
    macroModeState.isPlaying = false;
    return;
  }
  const keyBuffer = register.keyBuffer;
  let imc = 0;
  macroModeState.isPlaying = true;
  macroModeState.replaySearchQueries = register.searchQueries.slice(0);
  for (let i = 0; i < keyBuffer.length; i++) {
    let text = keyBuffer[i];
    let match: RegExpExecArray;
    let key: string;
    while (text) {
      // Pull off one command key, which is either a single character
      // or a special sequence wrapped in '<' and '>', e.g. '<Space>'.
      match = /<\w+-.+?>|<\w+>|./.exec(text)!;
      key = match[0];
      text = text.substring(match.index + key.length);
      vimApi.handleKey(adapter, key, 'macro');
      if (vim.insertMode) {
        const changes = register.insertModeChanges[imc++]!.changes;
        vimGlobalState.macroModeState.lastInsertModeChanges.changes = changes;
        repeatInsertModeChanges(adapter, changes, 1);
        exitInsertMode(adapter);
      }
    }
  }
  macroModeState.isPlaying = false;
}

function getSelectedAreaRange(adapter: EditorAdapter, vim: VimState): [Pos, Pos] {
  const lastSelection = vim.lastSelection!;
  const getCurrentSelectedAreaRange = (): [Pos, Pos] => {
    const selections = adapter.listSelections();
    const start = selections[0]!;
    const end = selections[selections.length - 1]!;
    const selectionStart = cursorIsBefore(start.anchor, start.head) ? start.anchor : start.head;
    const selectionEnd = cursorIsBefore(end.anchor, end.head) ? end.head : end.anchor;
    return [selectionStart, selectionEnd];
  };
  const getLastSelectedAreaRange = (): [Pos, Pos] => {
    let selectionStart = adapter.getCursor();
    let selectionEnd = adapter.getCursor();
    const block = lastSelection.visualBlock;
    if (block) {
      const width = 0; // block.width;
      const height = 0; // block.height;
      selectionEnd = makePos(selectionStart.line + height, selectionStart.ch + width);
      const selections: CmSelection[] = [];
      // selectBlock creates a 'proper' rectangular block.
      // We do not want that in all cases, so we manually set selections.
      for (let i = selectionStart.line; i < selectionEnd.line; i++) {
        const anchor = makePos(i, selectionStart.ch);
        const head = makePos(i, selectionEnd.ch);
        selections.push(new CmSelection(anchor, head));
      }
      adapter.setSelections(selections);
    } else {
      const start = lastSelection.anchorMark.find();
      const end = lastSelection.headMark.find();
      const line = end.line - start.line;
      const ch = end.ch - start.ch;
      selectionEnd = makePos(selectionEnd.line + line, line ? selectionEnd.ch : ch + selectionEnd.ch);
      if (lastSelection.visualLine) {
        selectionStart = makePos(selectionStart.line, 0);
        selectionEnd = makePos(selectionEnd.line, lineLength(adapter, selectionEnd.line));
      }
      adapter.setSelection(selectionStart, selectionEnd);
    }
    return [selectionStart, selectionEnd];
  };
  if (!vim.visualMode) {
    // In case of replaying the action.
    return getLastSelectedAreaRange();
  } else {
    return getCurrentSelectedAreaRange();
  }
}

function extendLineToColumn(adapter: EditorAdapter, lineNum: number, column: number) {
  const endCh = lineLength(adapter, lineNum);
  const spaces = ''.padEnd(column - endCh, ' ');
  adapter.setCursor(makePos(lineNum, endCh));
  adapter.replaceRange(spaces, adapter.getCursor());
}

// This functions selects a rectangular block
// of text with selectionEnd as any of its corner
// Height of block:
// Difference in selectionEnd.line and first/last selection.line
// Width of the block:
// Distance between selectionEnd.ch and any(first considered here) selection.ch
function selectBlock(adapter: EditorAdapter, selectionEnd: Pos) {
  const ranges = adapter.listSelections();
  const head = copyCursor(adapter.clipPos(selectionEnd));
  const isClipped = !cursorEqual(selectionEnd, head);
  const curHead = adapter.getCursor('head');
  const primIndex = getIndex(ranges, curHead);
  const wasClipped = cursorEqual(ranges[primIndex]!.head, ranges[primIndex]!.anchor);
  const max = ranges.length - 1;
  const index = max - primIndex > primIndex ? max : 0;
  const base = ranges[index]!.anchor;

  const firstLine = Math.min(base.line, head.line);
  const lastLine = Math.max(base.line, head.line);
  let baseCh = base.ch;
  let headCh = head.ch;

  const dir = ranges[index]!.head.ch - baseCh;
  const newDir = headCh - baseCh;
  if (dir > 0 && newDir <= 0) {
    baseCh++;
    if (!isClipped) {
      headCh--;
    }
  } else if (dir < 0 && newDir >= 0) {
    baseCh--;
    if (!wasClipped) {
      headCh++;
    }
  } else if (dir < 0 && newDir == -1) {
    baseCh--;
    headCh++;
  }

  const selections: CmSelection[] = [];
  for (let line = firstLine; line <= lastLine; line++) {
    const range = new CmSelection(makePos(line, baseCh), makePos(line, headCh));
    selections.push(range);
  }
  adapter.setSelections(selections);
  selectionEnd.ch = headCh;
  base.ch = baseCh;
  return base;
}

function repeatFn(fn: () => void, repeat: number) {
  return () => {
    for (let i = 0; i < repeat; i++) {
      fn();
    }
  };
}

// getIndex returns the index of the cursor in the selections.
function getIndex(ranges: CmSelection[], cursor: Pos, end?: 'anchor' | 'head') {
  return ranges.findIndex(
    (range) =>
      (end != 'head' && cursorEqual(range.anchor, cursor)) || (end != 'anchor' && cursorEqual(range.head, cursor))
  );
}
