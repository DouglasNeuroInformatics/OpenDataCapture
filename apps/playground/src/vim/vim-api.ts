/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { defineAction } from './actions';
import EditorAdapter from './adapter';
import { commandDispatcher } from './command-dispatcher';
import { defaultKeymap, defaultKeymapLength } from './default-key-map';
import { findDigraph } from './digraph';
import { resetVimGlobalState, vimGlobalState } from './global';
import {
  _mapCommand,
  InsertModeKey,
  clearInputState,
  exCommandDispatcher,
  exCommands,
  exitInsertMode,
  exitVisualMode,
  logKey,
  mapCommand,
  maybeInitVimState,
  offsetCursor
} from './keymap_vim';
import { defineMotion } from './motions';
import { defineOperator } from './operators';
import { defineOption, getOption, setOption } from './options';
import { defineRegister } from './register-controller';

import type { ActionFunc } from './actions';
import type { ExCommandFunc } from './keymap_vim';
import type { MotionFunc } from './motions';
import type { OperatorFunc } from './operators';
import type { OptionCallback, OptionConfig } from './options';
import type { IRegister } from './register-controller';
import type { Context, KeyMapping, MappableArgType, MappableCommandType } from './types';

export class VimApi {
  InsertModeKey?: InsertModeKey;
  lastInsertModeKeyTimer?: ReturnType<typeof setTimeout>;
  suppressErrorLogging = false;

  constructor() {
    resetVimGlobalState();
  }

  buildKeyMap() {
    // TODO: Convert keymap into dictionary format for fast lookup.
  }
  // Testing hook, though it might be useful to expose the register
  defineAction(name: string, fn: ActionFunc) {
    defineAction(name, fn);
  }

  defineEx(name: string, prefix: string, func: ExCommandFunc) {
    if (!prefix) {
      prefix = name;
    } else if (!name.startsWith(prefix)) {
      throw new Error(`(Vim.defineEx) "${prefix}" is not a prefix of "${name}", command not registered`);
    }
    exCommands[name] = func;
    exCommandDispatcher.commandMap_.set(prefix, {
      name: name,
      shortName: prefix,
      type: 'api'
    });
  }

  defineMotion(name: string, fn: MotionFunc) {
    defineMotion(name, fn);
  }
  // Non-recursive map function.
  // NOTE: This will not create mappings to key maps that aren't present
  defineOperator(name: string, fn: OperatorFunc) {
    defineOperator(name, fn);
  }
  defineOption(
    name: string,
    defaultValue: boolean | number | string | undefined,
    type: 'boolean' | 'number' | 'string',
    aliases?: string[],
    callback?: OptionCallback,
    config?: OptionConfig
  ): void {
    defineOption(name, defaultValue, type, aliases, callback, config);
  }

  // TODO: Expose setOption and getOption as instance methods. Need to decide how to namespace
  defineRegister(name: string, register: IRegister) {
    defineRegister(name, register);
  }

  exitInsertMode(adapter: EditorAdapter) {
    exitInsertMode(adapter);
  }

  exitVisualMode(adapter: EditorAdapter, moveHead?: boolean) {
    exitVisualMode(adapter, moveHead);
  }

  /**
   * This is the outermost function called by EditorAdapter, after keys have
   * been mapped to their Vim equivalents.
   *
   * Finds a command based on the key (and cached keys if there is a
   * multi-key sequence). Returns `undefined` if no key is matched, a noop
   * function if a partial match is found (multi-key), and a function to
   * execute the bound command if a a key is matched. The function always
   * returns true.
   */
  findKey(adapter: EditorAdapter, key: string, origin?: string) {
    const vim = maybeInitVimState(adapter);
    const handleMacroRecording = () => {
      const macroModeState = vimGlobalState.macroModeState;
      if (macroModeState.isRecording) {
        if (key == 'q') {
          macroModeState.exitMacroRecordMode();
          clearInputState(adapter);
          return true;
        }
        if (origin != 'mapping') {
          logKey(macroModeState, key);
        }
      }
      return;
    };
    const handleEsc = () => {
      if (key == '<Esc>') {
        if (vim.visualMode) {
          // Get back to normal mode.
          exitVisualMode(adapter);
        } else if (vim.insertMode) {
          // Get back to normal mode.
          exitInsertMode(adapter);
        } else {
          // We're already in normal mode. Let '<Esc>' be handled normally.
          return;
        }
        clearInputState(adapter);
        return true;
      }
      return;
    };
    const doKeyToKey = (keys: string) => {
      // TODO: prevent infinite recursion.
      let match;
      while (keys) {
        // Pull off one command key, which is either a single character
        // or a special sequence wrapped in '<' and '>', e.g. '<Space>'.
        match = /<\w+-.+?>|<\w+>|./.exec(keys);
        if (!match) {
          throw new Error();
        }
        key = match[0];
        keys = keys.substring(match.index + key.length);
        this.handleKey(adapter, key, 'mapping');
      }
    };
    const handleKeyInsertMode = () => {
      if (handleEsc()) {
        return true;
      }
      let keys = (vim.inputState.keyBuffer = vim.inputState.keyBuffer + key);
      const keysAreChars = key.length == 1;
      if (vim.insertDigraph) {
        if (!keysAreChars) {
          clearInputState(adapter);
          vim.insertDigraph = false;
          return false;
        }
        if (keys.length < 2) {
          return true;
        }
        const digraph = findDigraph(keys);
        if (digraph == '') {
          adapter.openNotification(`Unknown digraph: ${keys}`);
        } else {
          adapter.listSelections().forEach((sel) => {
            adapter.replaceRange(digraph, sel.head);
          });
        }
        clearInputState(adapter);
        vim.insertDigraph = false;
        return true;
      }
      let match = commandDispatcher.matchCommand(keys, defaultKeymap, vim.inputState, 'insert');
      // Need to check all key substrings in insert mode.
      while (keys.length > 1 && match.type != 'full') {
        keys = vim.inputState.keyBuffer = keys.slice(1);
        const thisMatch = commandDispatcher.matchCommand(keys, defaultKeymap, vim.inputState, 'insert');
        if (thisMatch.type != 'none') {
          match = thisMatch;
        }
      }
      if (match.type == 'none') {
        clearInputState(adapter);
        return false;
      } else if (match.type == 'partial') {
        if (this.lastInsertModeKeyTimer) {
          window.clearTimeout(this.lastInsertModeKeyTimer);
        }
        this.lastInsertModeKeyTimer = setTimeout(
          () => {
            if (vim.insertMode && vim.inputState.keyBuffer) {
              clearInputState(adapter);
            }
          },
          getOption('insertModeEscKeysTimeout') as number
        );
        return !keysAreChars;
      }

      if (this.lastInsertModeKeyTimer) {
        window.clearTimeout(this.lastInsertModeKeyTimer);
      }
      if (keysAreChars) {
        adapter.listSelections().forEach((sel) => {
          adapter.replaceRange(
            '',
            offsetCursor(sel.head, 0, -(keys.length - 1)),
            sel.head
            //"+input"
          );
        });
        vimGlobalState.macroModeState.lastInsertModeChanges.changes.pop();
      }
      clearInputState(adapter);
      return match.command!;
    };

    const handleKeyNonInsertMode = () => {
      if (handleMacroRecording() || handleEsc()) {
        return true;
      }

      const keys = (vim.inputState.keyBuffer = vim.inputState.keyBuffer + key);
      if (/^[1-9]\d*$/.test(keys)) {
        return true;
      }

      let keysMatcher = /^(\d*)(.*)$/.exec(keys);
      if (!keysMatcher) {
        clearInputState(adapter);
        return false;
      }
      const context: Context = vim.visualMode ? 'visual' : 'normal';
      let mainKey = keysMatcher[2] || keysMatcher[1];
      if (vim.inputState.operatorShortcut && vim.inputState.operatorShortcut.slice(-1) == mainKey) {
        // multikey operators act linewise by repeating only the last character
        mainKey = vim.inputState.operatorShortcut;
      }
      const match = commandDispatcher.matchCommand(mainKey, defaultKeymap, vim.inputState, context);
      if (match.type == 'none') {
        clearInputState(adapter);
        return false;
      } else if (match.type == 'partial') {
        return true;
      }

      vim.inputState.keyBuffer = '';
      keysMatcher = /^(\d*)(.*)$/.exec(keys);
      if (keysMatcher && keysMatcher[1] && keysMatcher[1] != '0') {
        vim.inputState.pushRepeatDigit(keysMatcher[1]);
      }
      return match.command!;
    };

    const command = vim.insertMode ? handleKeyInsertMode() : handleKeyNonInsertMode();
    if (command === false) {
      return !vim.insertMode && key.length === 1 ? () => true : undefined;
    } else if (command === true) {
      // TODO: Look into using EditorAdapter's multi-key handling.
      // Return no-op since we are caching the key. Counts as handled, but
      // don't want act on it just yet.
      return () => true;
    } else {
      return () => {
        adapter.curOp.isVimOp = true;
        try {
          if (command.type == 'keyToKey') {
            doKeyToKey(command.toKeys!);
          } else {
            commandDispatcher.processCommand(adapter, vim, command);
          }
        } catch (e) {
          // clear VIM state in case it's in a bad state.
          adapter.state.vim = undefined;
          maybeInitVimState(adapter);
          if (!this.suppressErrorLogging) {
            console.error(e);
          }
          throw e;
        }
        return true;
      };
    }
  }

  getOption(name: string, adapter?: EditorAdapter, cfg?: OptionConfig) {
    return getOption(name, adapter, cfg);
  }

  // controller anyway.
  getRegisterController() {
    return vimGlobalState.registerController;
  }

  handleEx(adapter: EditorAdapter, input: string) {
    exCommandDispatcher.processCommand(adapter, input);
  }

  handleKey(adapter: EditorAdapter, key: string, origin?: string) {
    const command = this.findKey(adapter, key, origin);
    if (typeof command === 'function') {
      return command();
    }
    return;
  }

  map(lhs: string, rhs: string, ctx?: Context) {
    // Add user defined key bindings.
    exCommandDispatcher.map(lhs, rhs, ctx);
  }

  mapCommand(keys: string, type: MappableCommandType, name: string, args: MappableArgType, extra: any) {
    mapCommand(keys, type, name, args, extra);
  }

  // Remove all user-defined mappings for the provided context.
  mapclear(ctx?: Context) {
    // Partition the existing keymap into user-defined and true defaults.
    const actualLength = defaultKeymap.length;
    const origLength = defaultKeymapLength;
    const userKeymap = defaultKeymap.splice(0, actualLength - origLength);
    if (ctx) {
      // If a specific context is being cleared, we need to keep mappings
      // from all other contexts.
      for (let i = userKeymap.length - 1; i >= 0; i--) {
        const mapping = userKeymap[i];
        if (ctx !== mapping.context) {
          if (mapping.context) {
            this._mapCommand(mapping);
          } else {
            // `mapping` applies to all contexts so create keymap copies
            // for each context except the one being cleared.
            ['normal', 'insert', 'visual']
              .filter((el) => el !== ctx)
              .forEach((el) => {
                const newMapping: KeyMapping = { ...mapping };
                newMapping.context = el as Context;
                this._mapCommand(newMapping);
              });
          }
        }
      }
    }
  }

  // in the default key map. See TODO at bottom of function.
  noremap(lhs: string, rhs: string, ctx?: Context) {
    const toCtxArray = (ctx?: Context): Context[] => {
      return ctx ? [ctx] : ['normal', 'insert', 'visual'];
    };

    let ctxsToMap = toCtxArray(ctx);
    // Look through all actual defaults to find a map candidate.
    const actualLength = defaultKeymap.length;
    const origLength = defaultKeymapLength;
    for (let i = actualLength - origLength; i < actualLength && ctxsToMap.length; i++) {
      const mapping = defaultKeymap[i];
      // Omit mappings that operate in the wrong context(s) and those of invalid type.
      if (
        mapping.keys == rhs &&
        (!ctx || !mapping.context || mapping.context === ctx) &&
        !mapping.type.startsWith('ex') &&
        !mapping.type.startsWith('key')
      ) {
        // Make a shallow copy of the original keymap entry.
        const newMapping: KeyMapping = { ...mapping };
        // Modify it point to the new mapping with the proper context.
        newMapping.keys = lhs;
        if (ctx && !newMapping.context) {
          newMapping.context = ctx;
        }
        // Add it to the keymap with a higher priority than the original.
        this._mapCommand(newMapping);
        // Record the mapped contexts as complete.
        const mappedCtxs = toCtxArray(mapping.context);
        ctxsToMap = ctxsToMap.filter(function (el) {
          return mappedCtxs.indexOf(el) === -1;
        });
      }
    }
    // TODO: Create non-recursive keyToKey mappings for the unmapped contexts once those exist.
  }

  // them, or somehow make them work with the existing EditorAdapter setOption/getOption API.
  setOption(name: string, value: boolean | number | string, adapter?: EditorAdapter, cfg?: OptionConfig) {
    setOption(name, value, adapter, cfg);
  }

  unmap(lhs: string, ctx?: Context) {
    return exCommandDispatcher.unmap(lhs, ctx);
  }
  _mapCommand(command: KeyMapping) {
    _mapCommand(command);
  }
}
