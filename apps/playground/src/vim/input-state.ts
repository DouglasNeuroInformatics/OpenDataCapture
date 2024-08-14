import type { MotionArgs, OperatorArgs } from './types';

// Represents the current input state.

export class InputState {
  keyBuffer = '';
  motion?: string;

  motionArgs?: MotionArgs;
  motionRepeat: string[] = [];
  operator?: string;
  operatorArgs?: OperatorArgs;
  operatorShortcut?: string; // For matching multi-key commands.
  prefixRepeat: string[] = []; // Defaults to the unnamed register.
  registerName?: string;
  repeatOverride?: number;
  selectedCharacter?: string;

  getRepeat() {
    let repeat = 0;
    if (this.prefixRepeat.length > 0 || this.motionRepeat.length > 0) {
      repeat = 1;
      if (this.prefixRepeat.length > 0) {
        repeat *= parseInt(this.prefixRepeat.join(''), 10);
      }
      if (this.motionRepeat.length > 0) {
        repeat *= parseInt(this.motionRepeat.join(''), 10);
      }
    }
    return repeat;
  }

  pushRepeatDigit(n: string) {
    if (!this.operator) {
      this.prefixRepeat.push(n);
    } else {
      this.motionRepeat.push(n);
    }
  }
}
