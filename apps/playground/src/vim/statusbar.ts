/* eslint-disable import/exports-last */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

type Mode = 'insert' | 'normal' | 'replace' | 'visual';
type SubMode = '' | 'blockwise' | 'linewise';

export type ModeChangeEvent = {
  /** The current major mode */
  mode: Mode;
  /** The current minor mode, on populated when the mode is `visual` */
  subMode?: SubMode;
};

type StatusBarInput = {
  blurHandler: (evt: FocusEvent) => void;
  keyDownHandler: (evt: KeyboardEvent) => void;
  keyUpHandler: (evt: KeyboardEvent) => void;
  node: HTMLInputElement;
  options: StatusBarInputOptions;
};

/**
 * Passed in a call to IStatusBar.startPrompt
 */
export type StatusBarInputOptions = {
  /** Indicates whether the input element should close when the blur event is received. */
  closeOnBlur?: boolean;

  /** By default the input element should close when the user presses the `Enter`
   * key. That should only be overruled when this value is explicitly set to
   * `false` */
  closeOnEnter?: boolean;

  /** If `closeOnEnter` is not set to explicitly `false` then this should be
   * called with the value of the input element when the user presses the
   * `Enter` key. */
  onClose?: (value: string) => void;

  /**
   * If this is provided, it should be called when the input element receives a
   * keydown event
   * @param evt  The Keyboard event
   * @param text The current value of the input element
   * @param close A callback that can be used to close the input process
   * @returns if this returns `true` then no further processing should occur on the keydown.
   */
  onKeyDown?: (evt: KeyboardEvent, text: string, close: (value?: string) => void) => boolean;

  /**
   * If this is provided, it should be called when the input element receives a
   * keyup event
   * @param evt  The Keyboard event
   * @param text The current value of the input element
   * @param close A callback that can be used to close the input process
   * @returns
   */
  onKeyUp?: (evt: KeyboardEvent, text: string, close: (value?: string) => void) => void;

  /** indicates whether the input element should start with its current value selected. */
  selectValueOnOpen?: boolean;

  /** The initial value, if any, of the input element */
  value?: string;
};

export type IStatusBar = {
  /**
   * Called when the status bar should be cleared of all content.
   * @returns
   */
  clear: () => void;

  /**
   * If the vim mode instance calls this function then any input process should be ended.
   * @returns
   */
  closeInput: () => void;

  /**
   * Updates the status bar with the current contents of the key buffer. This is
   * typically the right most element of the status bar.
   *
   * @param key The current contents of the key buffer
   * @returns
   */
  setKeyBuffer: (key: string) => void;

  /**
   * Tells the status bar what the current major and minor modes are.
   */
  setMode: (mode: ModeChangeEvent) => void;

  /**
   * Used to show notifications, for example: the response, if any of a command.
   *
   * Typically this is shown to the right of the status bar.
   * @param message
   * @returns
   */
  showNotification: (message: string) => void;

  /**
   * Asks the status bar to display a static message, usually in the main body
   * of the status bar.
   *
   * This is currently only used to indicate that a macro is recording.
   * @param message the text to display
   * @returns a function that the vim mode instance will call when the message
   * is no longer to be displayed.
   */
  startDisplay: (message: string) => () => void;

  /**
   * Asks the status bar to get input from the user.
   *
   * Used to get command text or other input.  For example, in response to the `:` or `/`
   * The status bar should create an input element to allow the user to interact
   * with  the vim mode.
   *
   * @param prefix Text to appear before an input element.
   * @param desc Description that may appear after the input element.
   * @param options An interface with callbacks and configuration used by the
   * vim mode to interact with the input
   * @returns a function that the vim mode instance will call when the message is
   * no longer to be displayed
   */
  startPrompt: (prefix: string, desc: string, options: StatusBarInputOptions) => () => void;

  /**
   *
   * @param visible Indicates whether the status bar should be visible.
   * @returns
   */
  toggleVisibility: (visible: boolean) => void;
};

export class StatusBar implements IStatusBar {
  input?: StatusBarInput;
  keyInfoNode: HTMLSpanElement;
  modeInfoNode: HTMLSpanElement;
  node: HTMLElement;
  notifNode: HTMLSpanElement;
  notifTimeout?: ReturnType<typeof setTimeout> = undefined;
  secInfoNode: HTMLSpanElement;
  setFocus?: () => void;

  constructor(node: HTMLElement, setFocus?: () => void) {
    this.node = node;
    this.modeInfoNode = document.createElement('span');
    this.secInfoNode = document.createElement('span');
    this.notifNode = document.createElement('span');
    this.notifNode.className = 'vim-notification';
    this.keyInfoNode = document.createElement('span');
    this.keyInfoNode.setAttribute('style', 'float: right');
    this.node.appendChild(this.modeInfoNode);
    this.node.appendChild(this.secInfoNode);
    this.node.appendChild(this.notifNode);
    this.node.appendChild(this.keyInfoNode);
    this.toggleVisibility(false);
    this.setFocus = setFocus;
  }

  addInputListeners() {
    if (!this.input) {
      return;
    }
    this.input.node.addEventListener('keyup', this.input.keyUpHandler);
    this.input.node.addEventListener('keydown', this.input.keyDownHandler);
    this.input.node.addEventListener('blur', this.input.blurHandler);
  }

  clear() {
    this.setInnerHtml_(this.node, document.createTextNode(''));
  }

  closeInput() {
    this.removeInputListeners();
    this.input = undefined;
    this.setSec(document.createTextNode(''));

    if (this.setFocus) {
      this.setFocus();
    }
  }

  inputBlur() {
    if (!this.input) {
      return;
    }
    const { options } = this.input;

    if (options.closeOnBlur) {
      this.closeInput();
    }
  }

  inputKeyDown(e: KeyboardEvent) {
    if (!this.input) {
      return;
    }
    const { node: input, options } = this.input;

    if (!options) {
      return;
    }

    if (options?.onKeyDown) {
      if (options.onKeyDown(e, input.value, () => this.closeInput())) {
        return;
      }
    }

    if (e.key === 'Escape' || (options && options.closeOnEnter !== false && e.key === 'Enter')) {
      this.input.node.blur();
      e.stopPropagation();
      this.closeInput();
    }

    if (e.key === 'Enter' && options.onClose) {
      e.stopPropagation();
      e.preventDefault();
      options.onClose(input.value);
    }
  }

  inputKeyUp(e: KeyboardEvent) {
    const { node: input, options } = this.input || {};
    if (options?.onKeyUp && input) {
      options.onKeyUp(e, input.value, () => this.closeInput());
    }
  }

  removeInputListeners() {
    if (!this.input?.node) {
      return;
    }

    this.input.node.removeEventListener('keyup', this.input.keyUpHandler);
    this.input.node.removeEventListener('keydown', this.input.keyDownHandler);
    this.input.node.removeEventListener('blur', this.input.blurHandler);
  }

  setInnerHtml_(element: Node, htmlContents: Node) {
    // Clear out previous contents first.
    while (element.childNodes.length) {
      element.removeChild(element.childNodes[0]!);
    }
    element.appendChild(htmlContents);
  }

  setKeyBuffer(key: string) {
    this.keyInfoNode.textContent = key;
  }

  setMode(ev: ModeChangeEvent) {
    if (ev.mode === 'visual') {
      if (ev.subMode === 'linewise') {
        this.setText('--VISUAL LINE--');
      } else if (ev.subMode === 'blockwise') {
        this.setText('--VISUAL BLOCK--');
      } else {
        this.setText('--VISUAL--');
      }
      return;
    }

    this.setText(`--${ev.mode.toUpperCase()}--`);
  }

  setText(text: string) {
    this.modeInfoNode.textContent = text;
  }

  showNotification(message: string) {
    this.notifNode.textContent = message;
    this.notifTimeout = setTimeout(() => {
      this.notifNode.textContent = '';
    }, 5000);
  }

  startDisplay(message: string): () => void {
    return this.setSec(document.createTextNode(message));
  }

  startPrompt(prefix: string, desc: string, options: StatusBarInputOptions): () => void {
    const frag = document.createDocumentFragment();

    const span = document.createElement('span');
    span.style.fontFamily = 'monospace';
    span.style.whiteSpace = 'pre';
    span.appendChild(document.createTextNode(prefix));

    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('autocorrect', 'off');
    input.autocapitalize = 'off';
    input.spellcheck = false;

    span.appendChild(input);

    if (desc) {
      const descSpan = document.createElement('span');
      descSpan.style.color = '#888';
      span.appendChild(descSpan);
    }

    frag.appendChild(span);

    return this.setSec(frag, input, options);
  }

  toggleVisibility(toggle: boolean) {
    if (toggle) {
      this.node.style.display = 'block';
    } else {
      this.node.style.display = 'none';
    }

    if (this.input) {
      this.removeInputListeners();
    }

    if (this.notifTimeout) {
      clearTimeout(this.notifTimeout);
      this.notifTimeout = undefined;
    }
  }

  private setSec(text: Node, input?: HTMLInputElement, options?: StatusBarInputOptions): () => void {
    this.notifNode.textContent = '';

    this.setInnerHtml_(this.secInfoNode, text);

    if (input) {
      input.focus();
      this.input = {
        blurHandler: () => this.inputBlur(),
        keyDownHandler: (evt) => this.inputKeyDown(evt),
        keyUpHandler: (evt) => this.inputKeyUp(evt),
        node: input,
        options: options || {}
      };

      if (options) {
        if (options.selectValueOnOpen) {
          input.select();
        }

        if (options.value) {
          input.value = options.value;
        }
      }

      this.addInputListeners();
    }

    return () => this.closeInput();
  }
}
