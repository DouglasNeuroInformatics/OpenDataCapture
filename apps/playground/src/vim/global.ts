import { HistoryController } from './history-controller';
import { CircularJumpList, createCircularJumpList } from './jump-list';
import { MacroModeState } from './macro-mode-state';
import { resetOptions } from './options';
import { RegisterController } from './register-controller';

type VimGlobalState = {
  // ex Command history buffer
  exCommandHistoryController: HistoryController;
  isReversed?: boolean;
  jumpList: CircularJumpList;
  // Recording latest f, t, F or T motion command.
  lastCharacterSearch: {
    forward: boolean;
    increment: number;
    selectedCharacter: string;
  };
  // Replace part of the last substituted pattern
  lastSubstituteReplacePart?: string;
  macroModeState: MacroModeState;
  query?: RegExp;
  registerController: RegisterController;
  // search history buffer
  searchHistoryController: HistoryController;
  // Whether we are searching backwards.
  searchIsReversed: boolean;
  // The current search query.
  searchQuery?: string;
};

export let vimGlobalState: VimGlobalState;
export function resetVimGlobalState() {
  vimGlobalState = {
    // ex Command history buffer
    exCommandHistoryController: new HistoryController(),
    jumpList: createCircularJumpList(),
    // Recording latest f, t, F or T motion command.
    lastCharacterSearch: {
      forward: true,
      increment: 0,
      selectedCharacter: ''
    },
    // Replace part of the last substituted pattern
    lastSubstituteReplacePart: undefined,
    macroModeState: new MacroModeState(),
    registerController: new RegisterController({}),
    // search history buffer
    searchHistoryController: new HistoryController(),
    // Whether we are searching backwards.
    searchIsReversed: false,
    // The current search query.
    searchQuery: undefined
  };
  resetOptions();
}
