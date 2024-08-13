export class HistoryController {
  historyBuffer: string[] = [];
  initialPrefix?: string = undefined;
  iterator = 0;

  // the input argument here acts a user entered prefix for a small time
  // until we start autocompletion in which case it is the autocompleted.
  nextMatch(input: string, up: boolean) {
    const dir = up ? -1 : 1;
    if (this.initialPrefix === undefined) {
      this.initialPrefix = input;
    }
    let i = 0;
    for (i = this.iterator + dir; up ? i >= 0 : i < this.historyBuffer.length; i += dir) {
      const element = this.historyBuffer[i];
      for (let j = 0; j <= element.length; j++) {
        if (this.initialPrefix == element.substring(0, j)) {
          this.iterator = i;
          return element;
        }
      }
    }
    // should return the user input in case we reach the end of buffer.
    if (i >= this.historyBuffer.length) {
      this.iterator = this.historyBuffer.length;
      return this.initialPrefix;
    }
    // return the last autocompleted query or exCommand as it is.
    if (i < 0) {
      return input;
    }
    return;
  }

  pushInput(input: string) {
    const index = this.historyBuffer.indexOf(input);
    if (index > -1) this.historyBuffer.splice(index, 1);
    if (input.length) this.historyBuffer.push(input);
  }

  reset() {
    this.initialPrefix = undefined;
    this.iterator = this.historyBuffer.length;
  }
}
