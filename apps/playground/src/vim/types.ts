import { CmSelection, Marker } from './adapter';
import { InputState } from './input-state';
import { SearchState } from './search';

import type { Pos } from './common';
import type { MotionFunc } from './motions';

export type VimOptions = { [key: string]: { value?: boolean | number | string } };

export type LastSelection = {
  anchor: Pos;
  anchorMark: Marker;
  head: Pos;
  headMark: Marker;
  visualBlock: boolean;
  visualLine: boolean;
  visualMode: boolean;
};

export type VimState = {
  exMode?: boolean;
  // Vim's input state that triggered the last edit, used to repeat
  inputState: InputState;
  // Vim's action command before the last edit, used to repeat actions
  insertDigraph?: boolean;
  // When using jk for navigation, if you move from a longer line to a
  // shorter line, the cursor may clip to the end of the shorter line.
  // If j is pressed again and cursor goes to the next line, the
  // cursor should go back to its horizontal position on the longer
  insertMode: boolean;
  // sequences like 3,i. Only exists when insertMode is true.
  insertModeRepeat?: number;
  // The last motion command run. Cleared if a non-motion command gets
  // with '.' and insert mode repeat.
  lastEditActionCommand?: KeyMapping;
  // motions and operators with '.'.
  lastEditInputState?: InputState;
  // line if it can. This is to keep track of the horizontal position.
  lastHPos: number;
  // Repeat count for changes made in insert mode, triggered by key
  // Doing the same with screen-position for gj/gk
  lastHSPos: number;
  // executed in between.
  lastMotion?: MotionFunc;
  lastPastedText?: string;
  lastSelection?: LastSelection;
  marks: { [key: string]: Marker };
  // Buffer-local/window-local values of vim options.
  options: VimOptions;
  searchState_?: SearchState;
  sel: CmSelection;
  visualBlock: boolean;

  // If we are in visual line mode. No effect if visualMode is false.
  visualLine: boolean;
  visualMode: boolean;
};

export type MotionArgs = {
  bigWord?: boolean;
  explicitRepeat?: boolean;
  forward?: boolean;
  inclusive?: boolean;
  linewise?: boolean;
  noRepeat?: boolean;
  repeat?: number;
  repeatIsExplicit?: boolean;
  repeatOffset?: number;
  sameLine?: boolean;
  selectedCharacter?: string;
  textObjectInner?: boolean;
  toFirstChar?: boolean;
  toJumplist?: boolean;
  wordEnd?: boolean;
};

export type ActionArgs = {
  after?: boolean;
  backtrack?: boolean;
  blockwise?: boolean;
  forward?: boolean;
  head?: Pos;
  increase?: boolean;
  indentRight?: boolean;
  insertAt?: string;
  isEdit?: boolean;
  keepSpaces?: boolean;
  linewise?: boolean;
  matchIndent?: boolean;
  position?: 'bottom' | 'center' | 'top';
  registerName?: string;
  repeat?: number;
  repeatIsExplicit?: boolean;
  replace?: boolean;
  selectedCharacter?: string;
};

export type OperatorArgs = {
  fullLine?: boolean;
  indentRight?: boolean;
  lastSel?: Pick<LastSelection, 'anchor' | 'head' | 'visualBlock' | 'visualLine'>;
  linewise?: boolean;
  registerName?: string;
  repeat?: number;
  selectedCharacter?: string;
  shouldMoveCursor?: boolean;
  toLower?: boolean;
};

export type SearchArgs = {
  forward: boolean;
  querySrc: 'prompt' | 'wordUnderCursor';
  selectedCharacter?: string;
  toJumplist: boolean;
  wholeWordOnly?: boolean;
};

export type OperatorMotionArgs = {
  visualLine: boolean;
};

export type ExArgs = {
  input: string;
};

export type Context = 'insert' | 'normal' | 'visual';

export type MappableCommandType = 'action' | 'ex' | 'motion' | 'operator' | 'operatorMotion' | 'search';
export type MappableArgType = ActionArgs | ExArgs | MotionArgs | OperatorArgs | OperatorMotionArgs | SearchArgs;

export type KeyMapping = {
  action?: string;
  actionArgs?: ActionArgs;
  context?: Context;
  ex?: string;
  exArgs?: ExArgs;
  exitVisualBlock?: boolean;
  interlaceInsertRepeat?: boolean;
  isEdit?: boolean;
  keys: string;
  motion?: string;
  motionArgs?: MotionArgs;
  operator?: string;
  operatorArgs?: OperatorArgs;
  operatorMotion?: string;
  operatorMotionArgs?: OperatorMotionArgs;
  repeatOverride?: number;
  search?: string;
  searchArgs?: SearchArgs;
  toKeys?: string;
  type: 'idle' | 'keyToEx' | 'keyToKey' | MappableCommandType;
};

export type ExCommand = {
  excludeFromCommandHistory?: boolean;
  name: string;
  possiblyAsync?: boolean;
  shortName?: string;
  toInput?: string;
  toKeys?: string;
  type?: 'api' | 'exToEx' | 'exToKey';
  user?: boolean;
};
