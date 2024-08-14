/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import EditorAdapter, { Marker } from './adapter';
import { cursorEqual } from './common';

import type { Pos } from './common';

export class CircularJumpList {
  buffer: Marker[] = new Array(100);
  cachedCursor?: Pos = undefined;
  head = 0;
  pointer = -1;
  size = 100;
  tail = 0;

  add(adapter: EditorAdapter, oldCur: Pos, newCur: Pos) {
    const current = this.pointer % this.size;
    const curMark = this.buffer[current];
    const useNextSlot = (cursor: Pos) => {
      const next = ++this.pointer % this.size;
      const trashMark = this.buffer[next];
      if (trashMark) {
        trashMark.clear();
      }
      this.buffer[next] = adapter.setBookmark(cursor);
    };
    if (curMark) {
      const markPos = curMark.find();
      // avoid recording redundant cursor position
      if (markPos && !cursorEqual(markPos, oldCur)) {
        useNextSlot(oldCur);
      }
    } else {
      useNextSlot(oldCur);
    }
    useNextSlot(newCur);
    this.head = this.pointer;
    this.tail = this.pointer - this.size + 1;
    if (this.tail < 0) {
      this.tail = 0;
    }
  }

  find(adapter: EditorAdapter, offset: number) {
    const oldPointer = this.pointer;
    const mark = this.move(adapter, offset);
    this.pointer = oldPointer;
    return mark && mark.find();
  }

  move(adapter: EditorAdapter, offset: number) {
    this.pointer += offset;
    if (this.pointer > this.head) {
      this.pointer = this.head;
    } else if (this.pointer < this.tail) {
      this.pointer = this.tail;
    }
    let mark = this.buffer[(this.size + this.pointer) % this.size];
    // skip marks that are temporarily removed from text buffer
    if (mark && !mark.find()) {
      const inc = offset > 0 ? 1 : -1;
      let newCur: Pos;
      const oldCur = adapter.getCursor();
      do {
        this.pointer += inc;
        mark = this.buffer[(this.size + this.pointer) % this.size];
        // skip marks that are the same as current position
        if (mark && (newCur = mark.find()) && !cursorEqual(oldCur, newCur)) {
          break;
        }
      } while (this.pointer < this.head && this.pointer > this.tail);
    }
    return mark;
  }
}

export const createCircularJumpList = () => new CircularJumpList();
