import EditorAdapter from './adapter';
import { vimGlobalState } from './global';
import { createInsertModeChanges } from './keymap_vim';

import type { InsertModeChanges } from './keymap_vim';

export class MacroModeState {
  isPlaying = false;
  isRecording = false;
  lastInsertModeChanges: InsertModeChanges;
  latestRegister?: string = undefined;
  onRecordingDone?: () => void = undefined;
  replaySearchQueries: string[] = [];

  constructor() {
    this.lastInsertModeChanges = createInsertModeChanges();
  }

  enterMacroRecordMode(adapter: EditorAdapter, registerName: string) {
    const register = vimGlobalState.registerController.getRegister(registerName);
    if (register) {
      register.clear();
      this.latestRegister = registerName;
      this.onRecordingDone = adapter.displayMessage(`(recording)[${registerName}]`);
      this.isRecording = true;
    }
  }

  exitMacroRecordMode() {
    if (this.onRecordingDone) {
      this.onRecordingDone(); // close dialog
    }
    this.onRecordingDone = undefined;
    this.isRecording = false;
  }
}
