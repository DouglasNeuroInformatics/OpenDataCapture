/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { actions } from './actions';
import EditorAdapter, { CmSelection } from './adapter';
import { copyCursor, cursorIsBefore, cursorMax, cursorMin, getEventKeyName, makePos, stopEvent } from './common';
import { vimGlobalState } from './global';
import { InputState } from './input-state';
import {
  clearInputState,
  clearSearchHighlight,
  clipCursorToContent,
  clipToLine,
  commandMatches,
  copyArgs,
  escapeRegex,
  exCommandDispatcher,
  exitVisualMode,
  expandSelectionToLine,
  expandWordUnderCursor,
  findNext,
  lastChar,
  lineLength,
  logSearchQuery,
  makeCmSelection,
  recordJumpPosition,
  showConfirm,
  showPrompt,
  updateCmSelection,
  updateMark,
  updateSearchQuery
} from './keymap_vim';
import { motions } from './motions';
import { operators } from './operators';
import { getSearchState } from './search';

import type { Pos } from './common';
import type { Context, KeyMapping, VimState } from './types';

export class CommandDispatcher {
  evalInput(adapter: EditorAdapter, vim: VimState) {
    // If the motion command is set, execute both the operator and motion.
    // Otherwise return.
    const inputState = vim.inputState;
    const motion = inputState.motion;
    const motionArgs = inputState.motionArgs || {};
    const operator = inputState.operator;
    const operatorArgs = inputState.operatorArgs || {};
    const registerName = inputState.registerName;
    let sel = vim.sel;
    // TODO: Make sure adapter and vim selections are identical outside visual mode.
    const origHead = copyCursor(vim.visualMode ? clipCursorToContent(adapter, sel.head) : adapter.getCursor('head'));
    const origAnchor = copyCursor(
      vim.visualMode ? clipCursorToContent(adapter, sel.anchor) : adapter.getCursor('anchor')
    );
    const oldHead = copyCursor(origHead);
    const oldAnchor = copyCursor(origAnchor);
    let newHead: Pos | undefined;
    let newAnchor: Pos | undefined;
    if (operator) {
      this.recordLastEdit(vim, inputState);
    }
    // If repeatOverride is specified, that takes precedence over the
    // input state's repeat. Used by Ex mode and can be user defined.
    let repeat = inputState.repeatOverride !== undefined ? inputState.repeatOverride : inputState.getRepeat();

    if (repeat > 0 && motionArgs.explicitRepeat) {
      motionArgs.repeatIsExplicit = true;
    } else if (motionArgs.noRepeat || (!motionArgs.explicitRepeat && repeat === 0)) {
      repeat = 1;
      motionArgs.repeatIsExplicit = false;
    }
    if (inputState.selectedCharacter) {
      // If there is a character input, stick it in all of the arg arrays.
      motionArgs.selectedCharacter = operatorArgs.selectedCharacter = inputState.selectedCharacter;
    }
    motionArgs.repeat = repeat;
    clearInputState(adapter);
    if (motion) {
      const motionResult = motions[motion]!(adapter, origHead, motionArgs, vim, inputState);
      vim.lastMotion = motions[motion];
      if (!motionResult) {
        return;
      }
      if (motionArgs.toJumplist) {
        const jumpList = vimGlobalState.jumpList;
        // if the current motion is # or *, use cachedCursor
        const cachedCursor = jumpList.cachedCursor;
        if (cachedCursor) {
          recordJumpPosition(adapter, cachedCursor, motionResult as Pos);
          delete jumpList.cachedCursor;
        } else {
          recordJumpPosition(adapter, origHead, motionResult as Pos);
        }
      }
      if (motionResult instanceof Array) {
        newAnchor = motionResult[0];
        newHead = motionResult[1];
      } else {
        newHead = motionResult;
      }
      // TODO: Handle null returns from motion commands better.
      if (!newHead) {
        newHead = copyCursor(origHead);
      }
      if (vim.visualMode) {
        if (!(vim.visualBlock && newHead.ch === Infinity)) {
          newHead = clipCursorToContent(adapter, newHead);
        }
        if (newAnchor) {
          newAnchor = clipCursorToContent(adapter, newAnchor);
        }
        newAnchor = newAnchor || oldAnchor;
        sel = vim.sel = new CmSelection(newAnchor, newHead);
        updateCmSelection(adapter);
        updateMark(adapter, vim, '<', cursorIsBefore(newAnchor, newHead) ? newAnchor : newHead);
        updateMark(adapter, vim, '>', cursorIsBefore(newAnchor, newHead) ? newHead : newAnchor);
      } else if (!operator) {
        newHead = clipCursorToContent(adapter, newHead);
        adapter.setCursor(newHead.line, newHead.ch);
      }
    }
    if (operator) {
      if (operatorArgs.lastSel) {
        // Replaying a visual mode operation
        newAnchor = oldAnchor;
        const lastSel = operatorArgs.lastSel;
        const lineOffset = Math.abs(lastSel.head.line - lastSel.anchor.line);
        const chOffset = Math.abs(lastSel.head.ch - lastSel.anchor.ch);
        if (lastSel.visualLine) {
          // Linewise Visual mode: The same number of lines.
          newHead = makePos(oldAnchor.line + lineOffset, oldAnchor.ch);
        } else if (lastSel.visualBlock) {
          // Blockwise Visual mode: The same number of lines and columns.
          newHead = makePos(oldAnchor.line + lineOffset, oldAnchor.ch + chOffset);
        } else if (lastSel.head.line == lastSel.anchor.line) {
          // Normal Visual mode within one line: The same number of characters.
          newHead = makePos(oldAnchor.line, oldAnchor.ch + chOffset);
        } else {
          // Normal Visual mode with several lines: The same number of lines, in the
          // last line the same number of characters as in the last line the last time.
          newHead = makePos(oldAnchor.line + lineOffset, oldAnchor.ch);
        }
        vim.visualMode = true;
        vim.visualLine = lastSel.visualLine;
        vim.visualBlock = lastSel.visualBlock;
        sel = vim.sel = new CmSelection(newAnchor, newHead);
        updateCmSelection(adapter);
      } else if (vim.visualMode) {
        operatorArgs.lastSel = {
          anchor: copyCursor(sel.anchor),
          head: copyCursor(sel.head),
          visualBlock: vim.visualBlock,
          visualLine: vim.visualLine
        };
      }
      let curStart: Pos;
      let curEnd: Pos;
      let linewise: boolean;
      let mode: 'block' | 'char' | 'line';
      let cmSel: { primary: number; ranges: CmSelection[] };
      if (vim.visualMode) {
        // Init visual op
        curStart = cursorMin(sel.head, sel.anchor);
        curEnd = cursorMax(sel.head, sel.anchor);
        linewise = !!(vim.visualLine || operatorArgs.linewise);
        mode = vim.visualBlock ? 'block' : linewise ? 'line' : 'char';
        cmSel = makeCmSelection(adapter, new CmSelection(curStart, curEnd), mode);
        if (linewise) {
          const ranges = cmSel.ranges;
          if (mode == 'block') {
            // Linewise operators in visual block mode extend to end of line
            for (let i = 0; i < ranges.length; i++) {
              ranges[i]!.head.ch = lineLength(adapter, ranges[i]!.head.line);
            }
          } else if (mode == 'line') {
            ranges[0]!.head.line = ranges[0]!.head.line + 1;
            ranges[0]!.head.ch = 0;
          }
        }
      } else {
        // Init motion op
        curStart = copyCursor(newAnchor || oldAnchor);
        curEnd = copyCursor(newHead || oldHead);
        if (cursorIsBefore(curEnd, curStart)) {
          const tmp = curStart;
          curStart = curEnd;
          curEnd = tmp;
        }
        linewise = !!(motionArgs.linewise || operatorArgs.linewise);
        if (linewise) {
          // Expand selection to entire line.
          expandSelectionToLine(adapter, curStart, curEnd);
        } else if (motionArgs.forward) {
          // Clip to trailing newlines only if the motion goes forward.
          clipToLine(adapter, curStart, curEnd);
        }
        mode = 'char';
        const exclusive = !motionArgs.inclusive || linewise;
        cmSel = makeCmSelection(adapter, new CmSelection(curStart, curEnd), mode, exclusive);
      }
      adapter.setSelections(cmSel.ranges, cmSel.primary);
      vim.lastMotion = undefined;
      operatorArgs.repeat = repeat; // For indent in visual mode.
      operatorArgs.registerName = registerName;
      // Keep track of linewise as it affects how paste and change behave.
      operatorArgs.linewise = linewise;
      const operatorMoveTo = operators[operator]!(adapter, operatorArgs, cmSel.ranges, oldAnchor, newHead!);
      if (vim.visualMode) {
        exitVisualMode(adapter, !!operatorMoveTo);
      }
      if (operatorMoveTo) {
        adapter.setCursor(operatorMoveTo);
      }
    }
  }

  matchCommand(keys: string, keyMap: KeyMapping[], inputState: InputState, context: Context) {
    const matches = commandMatches(keys, keyMap, context, inputState);
    if (!matches.full && !matches.partial) {
      return { type: 'none' };
    } else if (!matches.full && matches.partial) {
      return { type: 'partial' };
    }

    const bestMatch = matches.full![0]!;

    if (bestMatch.keys.endsWith('<character>')) {
      const character = lastChar(keys);
      if (!character) return { type: 'none' };
      inputState.selectedCharacter = character;
    }
    return { command: bestMatch, type: 'full' };
  }

  processAction(adapter: EditorAdapter, vim: VimState, command: KeyMapping) {
    const inputState = vim.inputState;
    const repeat = inputState.getRepeat();
    const repeatIsExplicit = !!repeat;
    const actionArgs = copyArgs(command.actionArgs) || {};
    if (inputState.selectedCharacter) {
      actionArgs.selectedCharacter = inputState.selectedCharacter;
    }
    // Actions may or may not have motions and operators. Do these first.
    if (command.operator) {
      this.processOperator(adapter, vim, command);
    }
    if (command.motion) {
      this.processMotion(adapter, vim, command);
    }
    if (command.motion || command.operator) {
      this.evalInput(adapter, vim);
    }
    actionArgs.repeat = repeat || 1;
    actionArgs.repeatIsExplicit = repeatIsExplicit;
    actionArgs.registerName = inputState.registerName;
    clearInputState(adapter);
    vim.lastMotion = undefined;
    if (command.isEdit) {
      this.recordLastEdit(vim, inputState, command);
    }
    actions[command.action!]!(adapter, actionArgs, vim);
  }

  processCommand(adapter: EditorAdapter, vim: VimState, command: KeyMapping) {
    vim.inputState.repeatOverride = command.repeatOverride;
    switch (command.type) {
      case 'motion':
        this.processMotion(adapter, vim, command);
        break;
      case 'operator':
        this.processOperator(adapter, vim, command);
        break;
      case 'operatorMotion':
        this.processOperatorMotion(adapter, vim, command);
        break;
      case 'action':
        this.processAction(adapter, vim, command);
        break;
      case 'search':
        this.processSearch(adapter, vim, command);
        break;
      case 'ex':
      case 'keyToEx':
        this.processEx(adapter, vim, command);
        break;
      default:
        break;
    }
  }

  processEx(adapter: EditorAdapter, vim: VimState, command: KeyMapping) {
    const onPromptClose = (input: string) => {
      // Give the prompt some time to close so that if processCommand shows
      // an error, the elements don't overlap.
      vimGlobalState.exCommandHistoryController.pushInput(input);
      vimGlobalState.exCommandHistoryController.reset();
      exCommandDispatcher.processCommand(adapter, input);
    };
    const onPromptKeyDown = (e: KeyboardEvent, input: string, close: (value?: string) => void): boolean => {
      const keyName = getEventKeyName(e);
      let up;
      let offset;
      if (keyName == 'Esc' || keyName == 'Ctrl-C' || keyName == 'Ctrl-[' || (keyName == 'Backspace' && input == '')) {
        vimGlobalState.exCommandHistoryController.pushInput(input);
        vimGlobalState.exCommandHistoryController.reset();
        stopEvent(e);
        clearInputState(adapter);
        close();
        adapter.focus();
      }
      const target = e.target as HTMLInputElement;
      if (keyName == 'Up' || keyName == 'Down') {
        stopEvent(e);
        up = keyName == 'Up' ? true : false;
        offset = target ? target.selectionEnd : 0;
        input = vimGlobalState.exCommandHistoryController.nextMatch(input, up) || '';
        close(input);
        if (offset && target) target.selectionEnd = target.selectionStart = Math.min(offset, target.value.length);
      } else if (keyName == 'Ctrl-U') {
        // Ctrl-U clears input.
        stopEvent(e);
        close('');
      } else {
        if (keyName != 'Left' && keyName != 'Right' && keyName != 'Ctrl' && keyName != 'Alt' && keyName != 'Shift')
          vimGlobalState.exCommandHistoryController.reset();
      }
      return false;
    };
    if (command.type == 'keyToEx') {
      // Handle user defined Ex to Ex mappings
      exCommandDispatcher.processCommand(adapter, command.exArgs!.input);
    } else {
      if (vim.visualMode) {
        showPrompt(adapter, {
          onClose: onPromptClose,
          onKeyDown: onPromptKeyDown,
          prefix: ':',
          selectValueOnOpen: false,
          value: "'<,'>"
        });
      } else {
        showPrompt(adapter, {
          onClose: onPromptClose,
          onKeyDown: onPromptKeyDown,
          prefix: ':'
        });
      }
    }
  }

  processMotion(adapter: EditorAdapter, vim: VimState, command: KeyMapping) {
    vim.inputState.motion = command.motion;
    vim.inputState.motionArgs = copyArgs(command.motionArgs);
    this.evalInput(adapter, vim);
  }

  processOperator(adapter: EditorAdapter, vim: VimState, command: KeyMapping) {
    const inputState = vim.inputState;
    if (inputState.operator) {
      if (inputState.operator == command.operator) {
        // Typing an operator twice like 'dd' makes the operator operate
        // linewise
        inputState.motion = 'expandToLine';
        inputState.motionArgs = { linewise: true };
        this.evalInput(adapter, vim);
        return;
      } else {
        // 2 different operators in a row doesn't make sense.
        clearInputState(adapter);
      }
    }
    inputState.operator = command.operator;
    inputState.operatorArgs = copyArgs(command.operatorArgs);
    if (command.keys.length > 1) {
      inputState.operatorShortcut = command.keys;
    }
    if (command.exitVisualBlock) {
      vim.visualBlock = false;
      updateCmSelection(adapter);
    }
    if (vim.visualMode) {
      // Operating on a selection in visual mode. We don't need a motion.
      this.evalInput(adapter, vim);
    }
  }

  processOperatorMotion(adapter: EditorAdapter, vim: VimState, command: KeyMapping) {
    const visualMode = vim.visualMode;
    const operatorMotionArgs = copyArgs(command.operatorMotionArgs);
    if (operatorMotionArgs) {
      // Operator motions may have special behavior in visual mode.
      if (visualMode && operatorMotionArgs.visualLine) {
        vim.visualLine = true;
      }
    }
    this.processOperator(adapter, vim, command);
    if (!visualMode) {
      this.processMotion(adapter, vim, command);
    }
  }
  processSearch(adapter: EditorAdapter, vim: VimState, command: KeyMapping) {
    if (!adapter.getSearchCursor) {
      // Search depends on SearchCursor.
      return;
    }
    const forward = command.searchArgs!.forward;
    const wholeWordOnly = command.searchArgs!.wholeWordOnly;
    getSearchState(adapter).setReversed(!forward);
    const promptPrefix = forward ? '/' : '?';
    const originalQuery = getSearchState(adapter).getQuery();
    const originalScrollPos = adapter.getScrollInfo();
    const handleQuery = (query: string, ignoreCase: boolean, smartCase: boolean) => {
      vimGlobalState.searchHistoryController.pushInput(query);
      vimGlobalState.searchHistoryController.reset();
      try {
        updateSearchQuery(adapter, query, ignoreCase, smartCase);
      } catch {
        showConfirm(adapter, 'Invalid regex: ' + query);
        clearInputState(adapter);
        return;
      }
      commandDispatcher.processMotion(adapter, vim, {
        keys: '',
        motion: 'findNext',
        motionArgs: {
          forward: true,
          toJumplist: command.searchArgs!.toJumplist
        },
        type: 'motion'
      });
    };
    const onPromptClose = (query: string) => {
      adapter.scrollTo(originalScrollPos.left, originalScrollPos.top);
      handleQuery(query, true /** ignoreCase */, true /** smartCase */);
      const macroModeState = vimGlobalState.macroModeState;
      if (macroModeState.isRecording) {
        logSearchQuery(macroModeState, query);
      }
    };
    const onPromptKeyUp = (e: KeyboardEvent, query: string, close: (input?: string) => void) => {
      const keyName = getEventKeyName(e);
      let up: boolean;
      let offset: number;
      if (keyName == 'Up' || keyName == 'Down') {
        const target = e.target as HTMLInputElement;
        up = keyName == 'Up' ? true : false;
        offset = e.target ? target.selectionEnd! : 0;
        query = vimGlobalState.searchHistoryController.nextMatch(query, up) || '';
        close(query);
        if (offset && e.target) target.selectionEnd = target.selectionStart = Math.min(offset, target.value.length);
      } else {
        if (keyName != 'Left' && keyName != 'Right' && keyName != 'Ctrl' && keyName != 'Alt' && keyName != 'Shift')
          vimGlobalState.searchHistoryController.reset();
      }
      let parsedQuery: RegExp | undefined;
      try {
        parsedQuery = updateSearchQuery(adapter, query, true /** ignoreCase */, true /** smartCase */);
      } catch {
        // Swallow bad regexes for incremental search.
      }
      if (parsedQuery) {
        adapter.scrollIntoView(findNext(adapter, !forward, parsedQuery), 30);
      } else {
        clearSearchHighlight(adapter);
        adapter.scrollTo(originalScrollPos.left, originalScrollPos.top);
      }
    };
    const onPromptKeyDown = (e: KeyboardEvent, query: string, close: (text?: string) => void): boolean => {
      const keyName = getEventKeyName(e);
      if (keyName == 'Esc' || keyName == 'Ctrl-C' || keyName == 'Ctrl-[' || (keyName == 'Backspace' && query == '')) {
        vimGlobalState.searchHistoryController.pushInput(query);
        vimGlobalState.searchHistoryController.reset();
        updateSearchQuery(adapter, originalQuery!.source);
        clearSearchHighlight(adapter);
        adapter.scrollTo(originalScrollPos.left, originalScrollPos.top);
        stopEvent(e);
        clearInputState(adapter);
        close();
        adapter.focus();
      } else if (keyName == 'Up' || keyName == 'Down') {
        stopEvent(e);
      } else if (keyName == 'Ctrl-U') {
        // Ctrl-U clears input.
        stopEvent(e);
        close('');
      }
      return false;
    };
    switch (command.searchArgs!.querySrc) {
      case 'prompt':
        const macroModeState = vimGlobalState.macroModeState;
        if (macroModeState.isPlaying) {
          const query = macroModeState.replaySearchQueries.shift()!;
          handleQuery(query, true /** ignoreCase */, false /** smartCase */);
        } else {
          showPrompt(adapter, {
            desc: '(JavaScript regexp)',
            onClose: onPromptClose,
            onKeyDown: onPromptKeyDown,
            onKeyUp: onPromptKeyUp,
            prefix: promptPrefix
          });
        }
        break;
      case 'wordUnderCursor':
        let word = expandWordUnderCursor(
          adapter,
          false /** inclusive */,
          true /** forward */,
          false /** bigWord */,
          true /** noSymbol */
        );
        let isKeyword = true;
        if (!word) {
          word = expandWordUnderCursor(
            adapter,
            false /** inclusive */,
            true /** forward */,
            false /** bigWord */,
            false /** noSymbol */
          );
          isKeyword = false;
        }
        if (!word) {
          return;
        }
        let query = adapter.getLine(word[0].line).substring(word[0].ch, word[1].ch);
        if (isKeyword && wholeWordOnly) {
          query = '\\b' + query + '\\b';
        } else {
          query = escapeRegex(query);
        }

        // cachedCursor is used to save the old position of the cursor
        // when * or # causes vim to seek for the nearest word and shift
        // the cursor before entering the motion.
        vimGlobalState.jumpList.cachedCursor = adapter.getCursor();
        adapter.setCursor(word[0]);

        handleQuery(query, true /** ignoreCase */, false /** smartCase */);
        break;
    }
  }
  recordLastEdit(vim: VimState, inputState: InputState, actionCommand?: KeyMapping) {
    const macroModeState = vimGlobalState.macroModeState;
    if (macroModeState.isPlaying) {
      return;
    }
    vim.lastEditInputState = inputState;
    vim.lastEditActionCommand = actionCommand;
    macroModeState.lastInsertModeChanges.changes = [];
    macroModeState.lastInsertModeChanges.expectCursorActivityForChange = false;
    macroModeState.lastInsertModeChanges.visualBlock = vim.visualBlock ? vim.sel.head.line - vim.sel.anchor.line : 0;
  }
}

export const commandDispatcher = new CommandDispatcher();
