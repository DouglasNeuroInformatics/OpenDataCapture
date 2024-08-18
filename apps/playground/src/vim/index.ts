/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable no-dupe-class-members */

import * as monaco from 'monaco-editor';

import EditorAdapter from './adapter';
import { initVimAdapter, vimApi } from './keymap_vim';
import * as Registers from './register-controller';
import * as StatusBar from './statusbar';

export type IRegister = Registers.IRegister;
export type IStatusBar = StatusBar.IStatusBar;
export type ModeChangeEvent = StatusBar.ModeChangeEvent;
export type StatusBarInputOptions = StatusBar.StatusBarInputOptions;

export const makeDomStatusBar = (parent: HTMLElement, setFocus?: () => void): IStatusBar => {
  return new StatusBar.StatusBar(parent, setFocus);
};

type SetOptionConfig = {
  adapterOption?: boolean;
  append?: boolean;
  remove?: boolean;
};

export class FileEvent extends Event {
  readonly filename: string;

  constructor(type: 'open-file' | 'save-file', filename: string) {
    super(type);
    this.filename = filename;
  }
}
type Listener<T> = (evt: T) => void;

type ListenerObject<T> = {
  handleEvent(object: T): void;
};

type EventHandler<T> = Listener<T> | ListenerObject<T>;

export class VimMode implements EventTarget {
  private adapter_: EditorAdapter;
  private attached_ = false;
  private closers_ = new Map<string, () => void>();
  private keyBuffer_ = '';
  private listeners_ = new Map<string, (EventHandler<Event> | EventHandler<FileEvent>)[]>();
  private statusBar_?: IStatusBar;

  constructor(editor: monaco.editor.IStandaloneCodeEditor, statusBar?: IStatusBar) {
    this.statusBar_ = statusBar;

    initVimAdapter();
    this.adapter_ = new EditorAdapter(editor);

    this.initListeners();
  }

  get attached(): boolean {
    return this.attached_;
  }

  addEventListener(
    type: 'open-file' | 'save-file',
    callback: EventHandler<FileEvent>,
    options?: AddEventListenerOptions | boolean
  ): void;

  addEventListener(type: 'clipboard', callback: EventHandler<Event>, options?: AddEventListenerOptions | boolean): void;
  addEventListener(
    type: string,
    callback: EventHandler<Event> | EventHandler<FileEvent>,
    _options?: AddEventListenerOptions | boolean
  ): void {
    const typeListeners = this.listeners_.get(type);
    if (!typeListeners) {
      if (type === 'clipboard') {
        /* empty */
      }
      this.listeners_.set(type, [callback]);
    } else {
      typeListeners.push(callback);
    }
  }
  disable() {
    if (this.attached_) {
      this.adapter_.detach();
      this.attached_ = false;
    }
  }

  dispatchEvent(event: Event): boolean {
    const typeListeners = this.listeners_.get(event.type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        const callback = Reflect.has(listener, 'handleEvent')
          ? (listener as EventListenerObject).handleEvent
          : (listener as EventListener);
        callback(event);
        if (event.cancelable && event.defaultPrevented) {
          break;
        }
      }
    }
    return !(event.cancelable && event.defaultPrevented);
  }

  enable() {
    if (!this.attached_) {
      this.adapter_.attach();
      this.attached_ = true;
    }
  }
  executeCommand(input: string) {
    if (!this.attached) {
      throw new Error('Cannot execute commands when not attached');
    }
    vimApi.handleEx(this.adapter_, input);
  }
  removeEventListener(
    type: 'open-file' | 'save-file',
    callback: EventHandler<FileEvent>,
    options?: AddEventListenerOptions | boolean
  ): void;

  removeEventListener(
    type: 'clipboard',
    callback: EventHandler<Event>,
    options?: AddEventListenerOptions | boolean
  ): void;

  removeEventListener(
    type: string,
    callback: EventHandler<Event> | EventHandler<FileEvent>,
    _options?: boolean | EventListenerOptions
  ): void {
    const typeListeners = this.listeners_.get(type);
    if (typeListeners) {
      const index = typeListeners.lastIndexOf(callback);
      if (index >= 0) {
        typeListeners.splice(index, 1);
      }
      if (typeListeners.length == 0) {
        this.listeners_.delete(type);
      }
    }
  }

  setClipboardRegister(register: IRegister) {
    vimApi.defineRegister('*', register);
    vimApi.defineRegister('+', register);
  }

  setOption(name: string, value: boolean | number | string, config?: SetOptionConfig) {
    if (config?.adapterOption) {
      this.adapter_.setOption(name, value);
    } else {
      vimApi.setOption(name, value, this.adapter_, config);
    }
  }

  private initListeners() {
    this.adapter_.on('vim-set-clipboard-register', () => {
      this.dispatchEvent(new Event('clipboard'));
    });

    if (this.statusBar_ !== undefined) {
      const statusBar = this.statusBar_;

      this.adapter_.on('vim-mode-change', (mode) => {
        statusBar.setMode(mode);
      });

      this.adapter_.on('vim-keypress', (key) => {
        if (key === ':') {
          this.keyBuffer_ = '';
        } else {
          this.keyBuffer_ += key;
        }
        statusBar.setKeyBuffer(this.keyBuffer_);
      });

      this.adapter_.on('vim-command-done', () => {
        this.keyBuffer_ = '';
        statusBar.setKeyBuffer(this.keyBuffer_);
      });

      this.adapter_.on('status-display', (msg, id) => {
        const closer = statusBar.startDisplay(msg);
        this.closers_.set(id, closer);
      });

      this.adapter_.on('status-close-display', (id) => {
        const closer = this.closers_.get(id);
        if (closer) {
          closer();
          this.closers_.delete(id);
        }
      });

      this.adapter_.on('status-prompt', (prefix, desc, options, id) => {
        const closer = statusBar.startPrompt(prefix, desc, options);
        this.closers_.set(id, closer);
      });

      this.adapter_.on('status-close-prompt', (id) => {
        const closer = this.closers_.get(id);
        if (closer) {
          closer();
          this.closers_.delete(id);
        }
      });

      this.adapter_.on('status-notify', (msg) => {
        statusBar.showNotification(msg);
      });

      this.adapter_.on('dispose', () => {
        statusBar.toggleVisibility(false);
        statusBar.closeInput();
        statusBar.clear();
      });
    }

    EditorAdapter.commands.open = (_adapter, params) =>
      this.dispatchEvent(new FileEvent('open-file', params.argString || ''));
    EditorAdapter.commands.save = (_adapter, params) =>
      this.dispatchEvent(new FileEvent('save-file', params.argString || ''));
  }
}
