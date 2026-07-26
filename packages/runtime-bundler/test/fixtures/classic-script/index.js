import { getValue } from 'shared-state';

export function report() {
  return `value is ${getValue()}`;
}
