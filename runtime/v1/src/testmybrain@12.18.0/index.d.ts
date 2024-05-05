type AnyFunction = (...args: any[]) => any;

type PluckKey<T> = T extends { [key: string]: any } ? keyof T : never;

type PluckResult<T, K extends keyof T> = T[K] extends infer U extends any
  ? U extends (...args: any[]) => infer R
    ? R
    : U
  : never;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Array<T> {
    /**
     * Return the mean of the values in the array. If the array is empty, this returns null.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    average(): null | number;
    /**
     * This is an alias for `Array.prototype.includes` for compatibility with zen.js. The custom implementation of `Array.prototype.includes`
     * has been removed, as it is widely available in all modern browsers.
     *
     * @deprecated - **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    contains(searchElement: T, fromIndex?: number | undefined): boolean;
    /**
     * Flatten the array to unlimited depth. Due to limitations of TypeScript, the typings are only accurate to a depth of 20.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    flatten(): FlatArray<T[], 20>;
    /**
     * This seems to be roughly similar to `Array.prototype.map`.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    invoke<U extends (item: T) => any>(fn: U): ReturnType<U>[];
    /**
     * Return the median of the values in the array. If the array is empty, this returns null.
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    median(): number | null;
    /**
     * Returns a tuple of values in the array [matches, rejects], according to whether the callback function
     * returned a truthy value for the element.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    partition(fn: (item: T) => any): [T[], T[]];
    /**
     *
     * Given an array of objects `T` and a key `K` returns either `T[K]`, or if it is a function, the return value of `T[K]`.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    pluck<K extends PluckKey<T>>(key: K): PluckResult<T, K>[];
    /**
     * Return the standard deviation of the values in the array. If the array is empty, return null.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    sd(): null | number;
    /**
     * Return the sum of all values in the array.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    sum(): number;
    /**
     * Return all unique values in the array.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    unique(): T[];
    /**
     * Return the variance of the values in the array. If the array is empty, return null.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    variance(): null | number;
    /**
     * Given two equal length arrays, returns a new array of tuples formed from the values in both arrays at each index. If
     * the arrays are not the same length, throws a `TypeError`.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     * @example [1, 2].zip([3, 4]) // returns [[1, 3], [2, 4]]
     */
    zip<U>(arr: U[]): [T, U][];
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Number {
    /**
     * Return the number rounded to a given number of decimal places. If no argument is provided, it is assumed to be zero.
     *
     * @deprecated **DO NOT USE THIS METHOD. IT IS FROM TMB LEGACY CODE AND IS BAD PRACTICE. IT WILL ALSO NOT BE AVAILABLE IN ALMOST ALL CASES.**
     */
    round(places?: number): number;
  }
}

export type TestMyBrainObjects = {
  elements: { [key: string]: HTMLElement };
  frames: { [key: string]: any };
  params: { [key: string]: any };
  slices: { [key: string]: any };
};

export type AjaxRequestParams = {
  url: string;
  method?: string;
  data?: any;
  async?: boolean;
  timeout?: number;
  user?: any;
  pass?: any;
  getHeaders?: any;
  sendCredentials?: any;
  callback?: AnyFunction;
};

export type KeyboardKeys = {
  ' ': number;
  "'": number;
  ',': number;
  '.': number;
  '/': number;
  ';': number;
  '=': number;
  '[': number;
  '\\': number;
  ']': number;
  '`': number;
  '-': number;
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
  G: number;
  H: number;
  I: number;
  J: number;
  K: number;
  L: number;
  M: number;
  N: number;
  O: number;
  OSleft: number;
  OSright: number;
  P: number;
  Q: number;
  R: number;
  S: number;
  T: number;
  U: number;
  V: number;
  W: number;
  Windows: number;
  X: number;
  Y: number;
  Z: number;
  a: number;
  alt: number;
  b: number;
  backquote: number;
  backslash: number;
  backspace: number;
  bracketleft: number;
  bracketright: number;
  c: number;
  capslock: number;
  comma: number;
  command: number;
  commandleft: number;
  commandright: number;
  control: number;
  ctrl: number;
  d: number;
  delete: number;
  down: number;
  downarrow: number;
  e: number;
  end: number;
  enter: number;
  equal: number;
  esc: number;
  escape: number;
  f: number;
  f1: number;
  f2: number;
  f3: number;
  f4: number;
  f5: number;
  f6: number;
  f7: number;
  f8: number;
  f9: number;
  f10: number;
  f11: number;
  f12: number;
  f13: number;
  f14: number;
  f15: number;
  g: number;
  h: number;
  home: number;
  i: number;
  insert: number;
  j: number;
  k: number;
  l: number;
  left: number;
  leftarrow: number;
  m: number;
  minus: number;
  n: number;
  numlock: number;
  numpad0: number;
  numpad1: number;
  numpad2: number;
  numpad3: number;
  numpad4: number;
  numpad5: number;
  numpad6: number;
  numpad7: number;
  numpad8: number;
  numpad9: number;
  numpadadd: number;
  numpaddecimal: number;
  numpaddivide: number;
  numpadmultiply: number;
  numpadsubtract: number;
  o: number;
  p: number;
  pagedown: number;
  pageup: number;
  pause: number;
  period: number;
  q: number;
  quote: number;
  r: number;
  return: number;
  right: number;
  rightarrow: number;
  s: number;
  scrolllock: number;
  semicolon: number;
  shift: number;
  slash: number;
  space: number;
  spacebar: number;
  t: number;
  tab: number;
  u: number;
  up: number;
  uparrow: number;
  v: number;
  w: number;
  x: number;
  y: number;
  z: number;
};

export type BoundingClientRectWithScroll = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

export type TestMyBrainUI = {
  getInput(): AnyFunction;
  UIelements: any[];
  UIevents: any[];
  UIkeys: any[];
  downTimestamp: number;
  dwell: number;
  highlight: string;
  message: string;
  onreadyUI: AnyFunction;
  response: string;
  rt: number;
  status: string;
  timeout: number;
  timeoutRef: number;
  upTimestamp: number;
};

export function $$$(id: string, cache?: boolean): HTMLElement;
export function ajaxRequest(params: AjaxRequestParams): any;
export function attachLoadingSlide(): void;
export function autoCorr(series: any, hiLag: any): number[];
export function centimetersToDegrees(size: any, viewingDistance: any): number;
export function chain(...args: any[]): number[];
export function chainTimeouts(...args: any[]): number[];
export function chooseInput(inputTypes: any, callback: any): void;
export function clearChain(a: any): void;
export function clearChainTimeouts(a: any): void;
export function codeToKey(code: number): string;
export function combinations(arr: any, k: any): any;
export function createCookie(name: any, value: any, expire: any, path: any, domain: any, secure: any): boolean;
export function degreesToCentimeters(degrees: any, viewingDistance: any): number;
export function degreesToSize(degrees: any, viewingDistance: any): number;
export function disableDoubleTapZoom(): void;
export function disableDrag(): void;
export function disableElasticScrolling(): void;
export function disableKeyboard(): void;
export function disableRightClick(): void;
export function disableSelect(): void;
export function disableTouch(objs: any): void;
export function eraseCookie(name: any, path: any, domain: any): void;
export function euclidDistance(x1: any, y1: any, x2: any, y2: any): number;
export function euclidDistanceSquared(x1: any, y1: any, x2: any, y2: any): number;
export function fixMobileOrientation(orientation: any): void;
export function fixOrientation(orientation: any): void;
export function getAllCookies(): { [key: string]: any };
export function getAspectRatio(): number;
export function getBoundingClientRectWithScroll(el: any): BoundingClientRectWithScroll;
export function getID(id: string, cache?: boolean): HTMLElement;
export function getKeyboardInput(acceptedKeys: any, fun: any, state: any, duration: any): boolean;
export function getPastResults(test: any): any;
export function getUrlParameters(parameter: string, staticURL: string, decode: boolean): string | false | undefined;
export function getWindowHeight(): number;
export function getWindowWidth(): number;
export function hideCursor(divId: any): void;
export function httpBuildQuery(formData: any, numericPrefix: any, argSeparator: any): string;
export function imagePreLoad(imgs: any, args: any): void;
export function injectScript(url: any, id: any, callback: any): void;
export function insertAfter(referenceNode: any, newNode: any): void;
export function isEven(n: any): boolean;
export function keyToCode(key: string): number;
export function keyValue(code: any): any;
export function linSpace(a: any, b: any, n: any): any[];
export function logResults(res: any, mode: any): void;
export function mobileTouchHandler(ev: any): void;
export function now(): any;
export function pointSegmentDistance(p0: any, s1: any, s2: any): number;
export function polygonIsComplex(pn: any): false | number[];
export function randInt(a: any, b: any): any;
export function randSign(): -1 | 1;
export function range(m: any, n: any): any[];
export function readCookie(name: any): string;
export function regularPolygon(nv: any, cx: any, cy: any, cr: any, theta: any): { x: any; y: number }[];
export function safeDecode(s: any): string;
export function safeEncode(s: any): any;
export function segmentsIntersect(p1: any, p2: any, p3: any, p4: any): 0 | 1 | 2 | 3 | 4;
export function setMobileViewportScale(width: number, height: number): void;
export function showAlert(
  alertMessage: string,
  alertButtonText?: null | string,
  action?: AnyFunction | null,
  fontSize?: string | null,
  timeout?: number | null
): void;
export function showCursor(divId: any): void;
export function showFrame(...args: any[]): void;
export function showFrameClass(...args: any[]): void;
export function showSlide(id: any): void;
export function simulateKeyEvent(keyevent: any, keycode: any): void;
export function simulateMobileMouse(el: any): void;
export function simulateMobileMouseEvent(event: any, type: any): void;
export function sizeToDegrees(size: any, viewingDistance: any): number;
export function svgPathString(vxy: any, closedPath: any): string;
export function tmbSubmitToFile(tmbData: any, tmbFile: any, autoSave: any): void;
export function tmbSubmitToServer(tmbData: any, tmbScore: any, tmbOutcomes: any, tmbAction?: any): void;
export function tmbSubmitToURL(URL: any, tmbData: any): void;
export function urlEncode(str: any): string;
export function urlsafedecode(s: any): string;
export function vecAngle(v: any): any;
export function vecAngleBetween(v1: any, v2: any): any;
export function vecCrossProduct(v1: any, v2: any): number;
export function vecDotProduct(v1: any, v2: any): number;
export function vecLength(v: any): number;
export function vecPvector(p1: any, p2: any): { x: number; y: number };
export function wrapRads(r: any): any;

export const hasPointer: boolean;
export const hasTouch: boolean;
export const keyboardKeys: KeyboardKeys;
export const tmbUI: TestMyBrainUI;
export const tmbObjs: TestMyBrainObjects;
export const zen: TestMyBrainObjects;
