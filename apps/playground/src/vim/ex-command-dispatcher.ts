/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import EditorAdapter from './adapter';
import { defaultKeymap } from './default-key-map';
import { vimGlobalState } from './global';
import { exCommands, exitVisualMode, getMarkPos, showConfirm, trim, vimApi } from './keymap_vim';
import { StringStream } from './string-stream';

import type { ExCommandOptionalParameters } from './keymap_vim';
import type { Context, ExCommand, KeyMapping, VimState } from './types';

/**
 * Ex commands
 * Care must be taken when adding to the default Ex command map. For any
 * pair of commands that have a shared prefix, at least one of their
 * shortNames must not match the prefix of the other command.
 */
const defaultExCommandMap: ExCommand[] = [
  { name: 'colorscheme', shortName: 'colo' },
  { name: 'map' },
  { name: 'imap', shortName: 'im' },
  { name: 'nmap', shortName: 'nm' },
  { name: 'vmap', shortName: 'vm' },
  { name: 'unmap' },
  { name: 'edit', shortName: 'e' },
  { name: 'write', shortName: 'w' },
  { name: 'save', shortName: 'sav' },
  { name: 'undo', shortName: 'u' },
  { name: 'redo', shortName: 'red' },
  { name: 'set', shortName: 'se' },
  { name: 'setlocal', shortName: 'setl' },
  { name: 'setglobal', shortName: 'setg' },
  { name: 'sort', shortName: 'sor' },
  { name: 'substitute', possiblyAsync: true, shortName: 's' },
  { name: 'nohlsearch', shortName: 'noh' },
  { name: 'yank', shortName: 'y' },
  { name: 'delmarks', shortName: 'delm' },
  { excludeFromCommandHistory: true, name: 'registers', shortName: 'reg' },
  { name: 'vglobal', shortName: 'v' },
  { name: 'global', shortName: 'g' }
];

export class ExCommandDispatcher {
  commandMap_ = new Map<string, ExCommand>();

  constructor() {
    this.buildCommandMap_();
  }

  map(lhs: string, rhs: string, ctx?: Context) {
    if (lhs != ':' && lhs.startsWith(':')) {
      if (ctx) {
        throw Error('Mode not supported for ex mappings');
      }
      const commandName = lhs.substring(1);
      if (rhs != ':' && rhs.startsWith(':')) {
        // Ex to Ex mapping
        this.commandMap_.set(commandName, {
          name: commandName,
          toInput: rhs.substring(1),
          type: 'exToEx',
          user: true
        });
      } else {
        // Ex to key mapping
        this.commandMap_.set(commandName, {
          name: commandName,
          toKeys: rhs,
          type: 'exToKey',
          user: true
        });
      }
    } else {
      if (rhs != ':' && rhs.startsWith(':')) {
        // Key to Ex mapping.
        const mapping: KeyMapping = {
          exArgs: { input: rhs.substring(1) },
          keys: lhs,
          type: 'keyToEx'
        };
        if (ctx) {
          mapping.context = ctx;
        }
        defaultKeymap.unshift(mapping);
      } else {
        // Key to key mapping
        const mapping: KeyMapping = {
          keys: lhs,
          toKeys: rhs,
          type: 'keyToKey'
        };
        if (ctx) {
          mapping.context = ctx;
        }
        defaultKeymap.unshift(mapping);
      }
    }
  }

  processCommand(adapter: EditorAdapter, input: string, opt_params?: ExCommandOptionalParameters) {
    adapter.curOp.isVimOp = true;
    this._processCommand(adapter, input, opt_params);
  }

  unmap(lhs: string, ctx?: Context) {
    if (lhs != ':' && lhs.startsWith(':')) {
      // Ex to Ex or Ex to key mapping
      if (ctx) {
        throw Error('Mode not supported for ex mappings');
      }
      const commandName = lhs.substring(1);
      const command = this.commandMap_.get(commandName);
      if (command?.user) {
        this.commandMap_.delete(commandName);
        return true;
      }
    } else {
      // Key to Ex or key to key mapping
      const keys = lhs;
      for (let i = 0; i < defaultKeymap.length; i++) {
        if (keys == defaultKeymap[i]!.keys && defaultKeymap[i]!.context === ctx) {
          defaultKeymap.splice(i, 1);
          return true;
        }
      }
    }
    return;
  }

  private _processCommand(adapter: EditorAdapter, input: string, opt_params?: ExCommandOptionalParameters) {
    const vim = adapter.state.vim as VimState;
    const commandHistoryRegister = vimGlobalState.registerController.getRegister(':');
    const previousCommand = commandHistoryRegister.toString();
    if (vim.visualMode) {
      exitVisualMode(adapter);
    }
    const inputStream = new StringStream(input);
    // update ": with the latest command whether valid or invalid
    commandHistoryRegister.setText(input);
    const params = opt_params || {};
    params.input = input;
    try {
      this.parseInput_(adapter, inputStream, params);
    } catch (e) {
      showConfirm(adapter, `${e}`);
      throw e;
    }
    let command: ExCommand | undefined;
    let commandName: string | undefined;
    if (!params.commandName) {
      // If only a line range is defined, move to the line.
      if (params.line !== undefined) {
        commandName = 'move';
      }
    } else {
      command = this.matchCommand_(params.commandName);
      if (command) {
        commandName = command.name;
        if (command.excludeFromCommandHistory) {
          commandHistoryRegister.setText(previousCommand);
        }
        this.parseCommandArgs_(inputStream, params, command);
        if (command.type == 'exToKey') {
          // Handle Ex to Key mapping.
          for (let i = 0; i < command.toKeys!.length; i++) {
            vimApi.handleKey(adapter, command.toKeys![i]!, 'mapping');
          }
          return;
        } else if (command.type == 'exToEx') {
          // Handle Ex to Ex mapping.
          this.processCommand(adapter, command.toInput!);
          return;
        }
      }
    }
    if (!commandName) {
      showConfirm(adapter, `Not an editor command ":${input}"`);
      return;
    }
    try {
      exCommands[commandName]!(adapter, { input: '', ...params });
      // Possibly asynchronous commands (e.g. substitute, which might have a
      // user confirmation), are responsible for calling the callback when
      // done. All others have it taken care of for them here.
      if (!command?.possiblyAsync && params.callback) {
        params.callback();
      }
    } catch (e) {
      showConfirm(adapter, `${e}`);
      throw e;
    }
  }

  private buildCommandMap_() {
    this.commandMap_.clear();
    defaultExCommandMap.forEach((command) => {
      const key = command.shortName || command.name;
      this.commandMap_.set(key, command);
    });
  }

  private matchCommand_(commandName: string) {
    // Return the command in the command map that matches the shortest
    // prefix of the passed in command name. The match is guaranteed to be
    // unambiguous if the defaultExCommandMap's shortNames are set up
    // correctly. (see @code{defaultExCommandMap}).
    for (let i = commandName.length; i > 0; i--) {
      const prefix = commandName.substring(0, i);
      if (this.commandMap_.has(prefix)) {
        const command = this.commandMap_.get(prefix)!;
        if (command.name.startsWith(commandName)) {
          return command;
        }
      }
    }
    return;
  }

  private parseCommandArgs_(inputStream: StringStream, params: ExCommandOptionalParameters, _command: ExCommand) {
    if (inputStream.eol()) {
      return;
    }
    params.argString = inputStream.match(/.*/)[0];
    // Parse command-line arguments
    const delim = /\s+/;
    const args = trim(params.argString).split(delim);
    if (args.length && args[0]) {
      params.args = args;
    }
  }

  private parseInput_(adapter: EditorAdapter, inputStream: StringStream, result: ExCommandOptionalParameters) {
    inputStream.eatWhile(':');
    // Parse range.
    if (inputStream.eat('%')) {
      result.line = adapter.firstLine();
      result.lineEnd = adapter.lastLine();
    } else {
      result.line = this.parseLineSpec_(adapter, inputStream);
      if (result.line !== undefined && inputStream.eat(',')) {
        result.lineEnd = this.parseLineSpec_(adapter, inputStream);
      }
    }

    // Parse command name.
    const commandMatch = inputStream.match(/^(\w+|!!|@@|[!#&*<=>@~])/);
    if (commandMatch) {
      result.commandName = commandMatch[1];
    } else {
      result.commandName = inputStream.match(/.*/)[0];
    }

    return result;
  }

  private parseLineSpec_(adapter: EditorAdapter, inputStream: StringStream) {
    const numberMatch = inputStream.match(/^(\d+)/);
    if (numberMatch) {
      // Absolute line number plus offset (N+M or N-M) is probably a typo,
      // not something the user actually wanted. (NB: vim does allow this.)
      return parseInt(numberMatch[1]!, 10) - 1;
    }
    switch (inputStream.next()) {
      case '.':
        return this.parseLineSpecOffset_(inputStream, adapter.getCursor().line);
      case '$':
        return this.parseLineSpecOffset_(inputStream, adapter.lastLine());
      case "'":
        const markName = inputStream.next();
        if (!markName) {
          inputStream.backUp(1);
          return;
        }
        const markPos = getMarkPos(adapter, adapter.state.vim, markName);
        if (!markPos) throw new Error('Mark not set');
        return this.parseLineSpecOffset_(inputStream, markPos.line);
      case '-':
      case '+':
        inputStream.backUp(1);
        // Offset is relative to current line if not otherwise specified.
        return this.parseLineSpecOffset_(inputStream, adapter.getCursor().line);
      default:
        inputStream.backUp(1);
        return;
    }
  }

  private parseLineSpecOffset_(inputStream: StringStream, line: number) {
    const offsetMatch = inputStream.match(/^([+-])?(\d+)/);
    if (offsetMatch) {
      const offset = parseInt(offsetMatch[2]!, 10);
      if (offsetMatch[1] == '-') {
        line -= offset;
      } else {
        line += offset;
      }
    }
    return line;
  }
}
