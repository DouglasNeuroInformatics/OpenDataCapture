/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import * as monaco from 'monaco-editor';
import type { IKeyboardEvent } from 'monaco-editor';

export type Pos = {
  ch: number;
  line: number;
};

export const isPos = (value: any): value is Pos =>
  value && typeof value.line === 'number' && typeof value.ch === 'number';

export const makePos = (line: number, ch: number): Pos => ({
  ch: ch,
  line: line
});

export function findFirstNonWhiteSpaceCharacter(text: string) {
  if (!text) {
    return 0;
  }
  const firstNonWS = text.search(/\S/);
  return firstNonWS == -1 ? text.length : firstNonWS;
}

export function isLowerCase(k: string) {
  return /^[a-z]$/.test(k);
}
export function isMatchableSymbol(k: string) {
  return '()[]{}'.includes(k);
}
const numberRegex = /[\d]/;
export function isNumber(k: string) {
  return numberRegex.test(k);
}

const upperCaseChars = /^[\p{Lu}]$/u;

export function isUpperCase(k: string) {
  return upperCaseChars.test(k);
}
export function isWhiteSpaceString(k: string) {
  return /^\s*$/.test(k);
}
export function isEndOfSentenceSymbol(k: string) {
  return '.?!'.includes(k);
}
export function inArray<T>(val: T, arr: T[]) {
  return arr.includes(val);
}

export const copyCursor = (cur: Pos): Pos => ({ ...cur });

export const cursorEqual = (cur1: Pos, cur2: Pos): boolean => cur1.ch == cur2.ch && cur1.line == cur2.line;

export const cursorIsBefore = (cur1: Pos, cur2: Pos): boolean => {
  if (cur1.line < cur2.line) {
    return true;
  }
  if (cur1.line == cur2.line && cur1.ch < cur2.ch) {
    return true;
  }
  return false;
};

export const cursorMin = (...cursors: Pos[]): Pos => cursors.reduce((m, cur) => (cursorIsBefore(m, cur) ? m : cur));

export const cursorMax = (...cursors: Pos[]): Pos => cursors.reduce((m, cur) => (cursorIsBefore(m, cur) ? cur : m));

export const cursorIsBetween = (low: Pos, test: Pos, high: Pos): boolean =>
  // returns true if cur2 is between cur1 and cur3.
  cursorIsBefore(low, test) && cursorIsBefore(test, high);

export const stopEvent = (evt: Event | IKeyboardEvent) => {
  evt.stopPropagation();
  evt.preventDefault();

  if (Reflect.has(evt, 'browserEvent')) {
    (evt as IKeyboardEvent).browserEvent.preventDefault();
  }

  return false;
};

export const getEventKeyName = (e: IKeyboardEvent | KeyboardEvent, skip = false) => {
  const KeyCode = monaco.KeyCode;
  let addQuotes = true;
  let keyName = KeyCode[e.keyCode]!;

  if ((e as any).key) {
    keyName = (e as any).key as string;
    addQuotes = false;
  }

  let key = keyName;
  let skipOnlyShiftCheck = skip;

  switch (e.keyCode) {
    case KeyCode.Alt:
    case KeyCode.Ctrl:
    case KeyCode.Meta:
    case KeyCode.Shift:
      return key;
    case KeyCode.Escape:
      skipOnlyShiftCheck = true;
      key = 'Esc';
      break;
    case KeyCode.Space:
      skipOnlyShiftCheck = true;
      break;
  }

  // `Key` check for monaco >= 0.30.0
  if (keyName.startsWith('Key') || keyName.startsWith('KEY_')) {
    key = keyName[keyName.length - 1]!.toLowerCase();
  } else if (keyName.startsWith('Digit')) {
    key = keyName.slice(5, 6);
  } else if (keyName.startsWith('Numpad')) {
    key = keyName.slice(6, 7);
  } else if (keyName.endsWith('Arrow')) {
    skipOnlyShiftCheck = true;
    key = keyName.substring(0, keyName.length - 5);
  } else if (
    keyName.startsWith('US_') ||
    // `Bracket` check for monaco >= 0.30.0
    keyName.startsWith('Bracket') ||
    !key
  ) {
    if (Reflect.has(e, 'browserEvent')) {
      key = (e as IKeyboardEvent).browserEvent.key;
    }
  }

  if (!skipOnlyShiftCheck && !e.altKey && !e.ctrlKey && !e.metaKey) {
    key = (e as KeyboardEvent).key || (e as IKeyboardEvent).browserEvent.key;
  } else {
    if (e.altKey) {
      key = `Alt-${key}`;
    }
    if (e.ctrlKey) {
      key = `Ctrl-${key}`;
    }
    if (e.metaKey) {
      key = `Meta-${key}`;
    }
    if (e.shiftKey) {
      key = `Shift-${key}`;
    }
  }

  if (key.length === 1 && addQuotes) {
    key = `'${key}'`;
  }

  return key;
};
