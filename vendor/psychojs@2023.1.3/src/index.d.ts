/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

/// <reference lib="DOM" />

import type { Class } from 'type-fest__4.x';

declare class A11yDialog {
  constructor(node: Element, targets?: any);
  create(targets: any): A11yDialog;
  destroy(): A11yDialog;
  hide(event?: any): A11yDialog;
  off(type: any, handler: any): A11yDialog;
  on(type: any, handler: any): A11yDialog;
  show(event?: Event): A11yDialog;
}

declare namespace log4javascript {
  class Logger {
    [key: string]: any;
  }
}

declare namespace Tone {
  class Synth {
    [key: string]: any;
  }
  class Volume {
    [key: string]: any;
  }
}

declare namespace PIXI {
  abstract class AbstractRenderer {
    protected _backgroundColor: number;
    _backgroundColorRgba: number[];
    protected _backgroundColorString: string;
    _lastObjectRendered: any;
    readonly autoDensity: boolean;
    clearBeforeRender?: boolean;
    readonly options: { [key: string]: any };
    readonly plugins: { [key: string]: any };
    readonly preserveDrawingBuffer: boolean;
    resolution: number;
    readonly screen: Rectangle;
    readonly type: any;
    readonly useContextAlpha: 'notMultiplied' | boolean;
    readonly view: HTMLCanvasElement;
    constructor(type?: any, options?: { [key: string]: any });
    get backgroundAlpha(): number;
    set backgroundAlpha(value: number);
    get backgroundColor(): number;
    set backgroundColor(value: number);
    get height(): number;
    get width(): number;
    destroy(removeView?: boolean): void;
    generateTexture(
      displayObject: { [key: string]: any },
      scaleMode?: any,
      resolution?: number,
      region?: Rectangle
    ): any;
    initPlugins(staticMap: { [key: string]: any }): void;
    abstract render(displayObject: { [key: string]: any }, options?: { [key: string]: any }): void;
    resize(screenWidth: number, screenHeight: number): void;
  }
  class Container {
    [key: string]: any;
  }
  class Graphics extends Container {
    [key: string]: any;
  }
  class Matrix {
    a: number;
    array: Float32Array | null;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
    constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
    static get IDENTITY(): Matrix;
    static get TEMP_MATRIX(): Matrix;
    append(matrix: Matrix): this;
    apply(pos: { [key: string]: any }, newPos?: { [key: string]: any }): { [key: string]: any };
    applyInverse(pos: { [key: string]: any }, newPos?: { [key: string]: any }): { [key: string]: any };
    clone(): Matrix;
    copyFrom(matrix: Matrix): this;
    copyTo(matrix: Matrix): Matrix;
    decompose(transform: any): any;
    fromArray(array: number[]): void;
    identity(): this;
    invert(): this;
    prepend(matrix: Matrix): this;
    rotate(angle: number): this;
    scale(x: number, y: number): this;
    set(a: number, b: number, c: number, d: number, tx: number, ty: number): this;
    setTransform(
      x: number,
      y: number,
      pivotX: number,
      pivotY: number,
      scaleX: number,
      scaleY: number,
      rotation: number,
      skewX: number,
      skewY: number
    ): this;
    toArray(transpose: boolean, out?: Float32Array): Float32Array;
    toString(): string;
    translate(x: number, y: number): this;
  }
  class Mesh {
    [key: string]: any;
  }
  class ObservablePoint<T = any> {
    cb: (this: T) => any;
    scope: any;
    constructor(cb: (this: T) => any, scope: T, x?: number, y?: number);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    clone(cb?: (this: T) => any, scope?: any): ObservablePoint;
    copyFrom(p: { [key: string]: any }): this;
    copyTo(p: { [key: string]: any }): { [key: string]: any };
    equals(p: { [key: string]: any }): boolean;
    set(x?: number, y?: number): this;
    toString(): string;
  }
  class Point {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    clone(): Point;
    copyFrom(p: { [key: string]: any }): this;
    copyTo(p: { [key: string]: any }): { [key: string]: any };
    equals(p: { [key: string]: any }): boolean;
    set(x?: number, y?: number): this;
    toString(): string;
  }
  class Polygon {
    closeStroke: boolean;
    points: number[];
    readonly type: any;
    constructor(points: { [key: string]: any }[] | number[]);
    constructor(...points: { [key: string]: any }[] | number[]);
    clone(): Polygon;
    contains(x: number, y: number): boolean;
    toString(): string;
  }
  class Rectangle {
    height: number;
    readonly type: any;
    width: number;
    x: number;
    y: number;
    constructor(x?: number, y?: number, width?: number, height?: number);
    get bottom(): number;
    static get EMPTY(): Rectangle;
    get left(): number;
    get right(): number;
    get top(): number;
    ceil(resolution?: number, eps?: number): this;
    clone(): Rectangle;
    contains(x: number, y: number): boolean;
    copyFrom(rectangle: Rectangle): Rectangle;
    copyTo(rectangle: Rectangle): Rectangle;
    enlarge(rectangle: Rectangle): this;
    fit(rectangle: Rectangle): this;
    pad(paddingX?: number, paddingY?: number): this;
    toString(): string;
  }
  abstract class Resource {
    protected _height: number;
    protected _width: number;
    destroyed: boolean;
    internal: boolean;
    protected onError: any;
    protected onResize: any;
    protected onUpdate: any;
    constructor(width?: number, height?: number);
    static test(_source: unknown, _extension?: string): boolean;
    get height(): number;
    get valid(): boolean;
    get width(): number;
    bind(baseTexture: any): void;
    destroy(): void;
    dispose(): void;
    load(): Promise<Resource>;
    resize(width: number, height: number): void;
    style(_renderer: any, _baseTexture: any, _glTexture: any): boolean;
    unbind(baseTexture: any): void;
    update(): void;
    abstract upload(renderer: any, baseTexture: any, glTexture: any): boolean;
  }
  class Sprite extends Container {
    _tintedCanvas: HTMLCanvasElement | HTMLImageElement;
    _renderCanvas(renderer: any): void;
  }
  class Text extends Sprite {
    static nextLineHeightBehavior: boolean;
    _autoResolution: boolean;
    protected _font: string;
    _resolution: number;
    protected _style: TextStyle;
    protected _styleListener: () => void;
    protected _text: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    dirty: boolean;
    localStyleID: number;
    constructor(text: string, style?: { [key: string]: any }, canvas?: HTMLCanvasElement);
    get height(): number;
    set height(value: number);
    get resolution(): number;
    set resolution(value: number);
    get style(): { [key: string]: any };
    set style(style: { [key: string]: any });
    get text(): string;
    set text(text: string);
    get width(): number;
    set width(value: number);
    protected _calculateBounds(): void;
    protected _render(renderer: any): void;
    destroy(options?: { [key: string]: any } | boolean): void;
    getLocalBounds(rect: Rectangle): Rectangle;
    updateText(respectDirty: boolean): void;
  }
  class TextMetrics {
    static _breakingSpaces: number[];
    static _canvas: HTMLCanvasElement | OffscreenCanvas;
    static _context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    static _fonts: {
      [font: string]: any;
    };
    static _newlines: number[];
    static BASELINE_MULTIPLIER: number;
    static BASELINE_SYMBOL: string;
    static HEIGHT_MULTIPLIER: number;
    static METRICS_STRING: string;
    fontProperties: { [key: string]: any };
    height: number;
    lineHeight: number;
    lines: string[];
    lineWidths: number[];
    maxLineWidth: number;
    style: TextStyle;
    text: string;
    width: number;
    constructor(
      text: string,
      style: TextStyle,
      width: number,
      height: number,
      lines: string[],
      lineWidths: number[],
      lineHeight: number,
      maxLineWidth: number,
      fontProperties: { [key: string]: any }
    );
    static canBreakChars(
      _char: string,
      _nextChar: string,
      _token: string,
      _index: number,
      _breakWords: boolean
    ): boolean;
    static canBreakWords(_token: string, breakWords: boolean): boolean;
    static clearMetrics(font?: string): void;
    static isBreakingSpace(char: string, _nextChar?: string): boolean;
    static measureFont(font: string): { [key: string]: any };
    static measureText(
      text: string,
      style: TextStyle,
      wordWrap?: boolean,
      canvas?: HTMLCanvasElement | OffscreenCanvas
    ): TextMetrics;
    static wordWrapSplit(token: string): string[];
  }
  type ITextStyle = {
    align: string;
    breakWords: boolean;
    dropShadow: boolean;
    dropShadowAlpha: number;
    dropShadowAngle: number;
    dropShadowBlur: number;
    dropShadowColor: number | string;
    dropShadowDistance: number;
    fill: any;
    fillGradientStops: number[];
    fillGradientType: any;
    fontFamily: string | string[];
    fontSize: number | string;
    fontStyle: string;
    fontVariant: string;
    fontWeight: string;
    leading: number;
    letterSpacing: number;
    lineHeight: number;
    lineJoin: string;
    miterLimit: number;
    padding: number;
    stroke: number | string;
    strokeThickness: number;
    textBaseline: string;
    trim: boolean;
    whiteSpace: string;
    wordWrap: boolean;
    wordWrapWidth: number;
  };

  class TextStyle implements ITextStyle {
    protected _align: string;
    protected _breakWords: boolean;
    protected _dropShadow: boolean;
    protected _dropShadowAlpha: number;
    protected _dropShadowAngle: number;
    protected _dropShadowBlur: number;
    protected _dropShadowColor: number | string;
    protected _dropShadowDistance: number;
    protected _fill: any;
    protected _fillGradientStops: number[];
    protected _fillGradientType: any;
    protected _fontFamily: string | string[];
    protected _fontSize: number | string;
    protected _fontStyle: string;
    protected _fontVariant: string;
    protected _fontWeight: string;
    protected _leading: number;
    protected _letterSpacing: number;
    protected _lineHeight: number;
    protected _lineJoin: string;
    protected _miterLimit: number;
    protected _padding: number;
    protected _stroke: number | string;
    protected _strokeThickness: number;
    protected _textBaseline: string;
    protected _trim: boolean;
    protected _whiteSpace: string;
    protected _wordWrap: boolean;
    protected _wordWrapWidth: number;
    styleID: number;
    constructor(style?: Partial<ITextStyle>);
    get align(): string;
    set align(align: string);
    get breakWords(): boolean;
    set breakWords(breakWords: boolean);
    get dropShadow(): boolean;
    set dropShadow(dropShadow: boolean);
    get dropShadowAlpha(): number;
    set dropShadowAlpha(dropShadowAlpha: number);
    get dropShadowAngle(): number;
    set dropShadowAngle(dropShadowAngle: number);
    get dropShadowBlur(): number;
    set dropShadowBlur(dropShadowBlur: number);
    get dropShadowColor(): number | string;
    set dropShadowColor(dropShadowColor: number | string);
    get dropShadowDistance(): number;
    set dropShadowDistance(dropShadowDistance: number);
    get fill(): any;
    set fill(fill: any);
    get fillGradientStops(): number[];
    set fillGradientStops(fillGradientStops: number[]);
    get fillGradientType(): any;
    set fillGradientType(fillGradientType: any);
    get fontFamily(): string | string[];
    set fontFamily(fontFamily: string | string[]);
    get fontSize(): number | string;
    set fontSize(fontSize: number | string);
    get fontStyle(): string;
    set fontStyle(fontStyle: string);
    get fontVariant(): string;
    set fontVariant(fontVariant: string);
    get fontWeight(): string;
    set fontWeight(fontWeight: string);
    get leading(): number;
    set leading(leading: number);
    get letterSpacing(): number;
    set letterSpacing(letterSpacing: number);
    get lineHeight(): number;
    set lineHeight(lineHeight: number);
    get lineJoin(): string;
    set lineJoin(lineJoin: string);
    get miterLimit(): number;
    set miterLimit(miterLimit: number);
    get padding(): number;
    set padding(padding: number);
    get stroke(): number | string;
    set stroke(stroke: number | string);
    get strokeThickness(): number;
    set strokeThickness(strokeThickness: number);
    get textBaseline(): string;
    set textBaseline(textBaseline: string);
    get trim(): boolean;
    set trim(trim: boolean);
    get whiteSpace(): string;
    set whiteSpace(whiteSpace: string);
    get wordWrap(): boolean;
    set wordWrap(wordWrap: boolean);
    get wordWrapWidth(): number;
    set wordWrapWidth(wordWrapWidth: number);
    clone(): TextStyle;
    reset(): void;
    toFontString(): string;
  }
  class Texture<_T> {
    [key: string]: any;
  }
  enum BLEND_MODES {
    ADD = 1,
    ADD_NPM = 18,
    COLOR = 15,
    COLOR_BURN = 8,
    COLOR_DODGE = 7,
    DARKEN = 5,
    DIFFERENCE = 11,
    DST_ATOP = 27,
    DST_IN = 25,
    DST_OUT = 26,
    DST_OVER = 24,
    ERASE = 26,
    EXCLUSION = 12,
    HARD_LIGHT = 9,
    HUE = 13,
    LIGHTEN = 6,
    LUMINOSITY = 16,
    MULTIPLY = 2,
    NONE = 20,
    NORMAL = 0,
    NORMAL_NPM = 17,
    OVERLAY = 4,
    SATURATION = 14,
    SCREEN = 3,
    SCREEN_NPM = 19,
    SOFT_LIGHT = 10,
    SRC_ATOP = 23,
    SRC_IN = 21,
    SRC_OUT = 22,
    SRC_OVER = 0,
    SUBTRACT = 28,
    XOR = 29
  }
}

declare function addInfoFromUrl(info: { [key: string]: any }): any;

declare type AudioClipOptions = {
  autoLog?: boolean;
  data: Blob;
  format: string;
  name?: string;
  psychoJS: PsychoJS;
  sampleRateHz: number;
};

declare class AudioClip extends PsychObject {
  _audioBuffer: AudioBuffer;
  _audioContext: AudioContext;
  _audioData: Float32Array | null;
  _decodingCallbacks: ((...args: any[]) => any)[];
  _gainNode: GainNode;
  _source: AudioBufferSourceNode;
  _status: AudioClip.Status;
  _volume: number;
  constructor(options?: AudioClipOptions);
  protected _base64ArrayBuffer(arrayBuffer: ArrayBuffer): string;
  protected _decodeAudio(): any;
  protected _GoogleTranscribe(transcriptionKey: string, languageCode: string): Promise<any>;
  download(filename?: string): void;
  getDuration(): Promise<number>;
  setVolume(volume: number): void;
  startPlayback(): Promise<void>;
  stopPlayback(fadeDuration?: number): Promise<void>;
  transcribe(options?: { engine: AudioClip.Engine; languageCode: string }): Promise<any>;
  upload(): Promise<any> | void;
}

declare namespace AudioClip {
  type Engine = symbol;
  namespace Engine {
    let GOOGLE: symbol;
  }
  type Status = symbol;
  namespace Status {
    let CREATED: symbol;
    let DECODING: symbol;
    let READY: symbol;
  }
}

declare type AudioClipPlayerOptions = {
  audioClip: AudioClip;
  loops?: number;
  psychoJS: PsychoJS;
  startTime?: number;
  stereo?: boolean;
  stopTime?: number;
  volume?: number;
};

declare class AudioClipPlayer extends SoundPlayer {
  _audioClip: AudioClip;
  _currentLoopIndex: number;
  _loops: number;
  _volume: number;
  constructor(options?: AudioClipPlayerOptions);
  static accept(psychoJS: PsychoJS, value: string): any;
  getDuration(): number;
  play(loops: number, fadeDuration?: number): void;
  setAudioClip(audioClip: AudioClip): void;
  setDuration(duration_s: number): void;
  setVolume(volume: number, mute?: boolean): void;
  stop(fadeDuration?: number): void;
}

declare function average(input?: (number | string)[]): number;

declare class BuilderKeyResponse {
  _psychoJS: PsychoJS;
  clock: Clock;
  corr: number;
  keys: any[];
  rt: any[];
  status: any;
  constructor(psychoJS: PsychoJS);
}

declare type ButtonStimOptions = {
  anchor?: string;
  autoDraw?: boolean;
  autoLog?: boolean;
  bold?: boolean;
  borderColor?: Color;
  borderWidth?: Color;
  color?: Color;
  fillColor?: Color;
  font?: string;
  italic?: boolean;
  letterHeight?: number;
  name: string;
  opacity?: number;
  padding?: any;
  pos?: number[];
  size?: any;
  text?: string;
  units?: string;
  win: Window_2;
};

declare class ButtonStim extends TextBox {
  listener: Mouse;
  constructor(options?: ButtonStimOptions);
  get isClicked(): boolean;
  get numClicks(): number;
}

declare type CameraOptions = {
  autoLog?: any;
  clock?: any;
  format?: any;
  name?: any;
  win?: any;
};

declare class Camera extends PsychObject {
  _audioBuffer: any[];
  _recorder: MediaRecorder;
  _status: any;
  _stream: MediaStream;
  _streamSettings: MediaTrackSettings;
  _videoBuffer: any[];
  _videos: any[];
  constructor(options?: CameraOptions);
  public get isReady(): boolean;
  protected _onChange(): void;
  protected _prepareRecording(): void;
  public authorize(showDialog?: boolean, dialogMsg?: string): boolean;
  public close(): Promise<void>;
  public flush(): Promise<any>;
  public getRecording(...args: any[]): Promise<any>;
  public getStream(): MediaStream;
  public getVideo(): HTMLVideoElement;
  public open(): void;
  public pause(): Promise<any>;
  public record(): Promise<any>;
  resume(options?: { clear?: boolean }): Promise<any>;
  protected save(...args: any[]): Promise<any>;
  public stop(): Promise<any>;
}

declare class Clock extends MonotonicClock {
  constructor();
  add(deltaTime?: number): void;
  reset(newTime?: number): void;
}

declare class Color {
  _hex: any;
  _int: number;
  _rgb: any;
  _rgbFull: any;
  constructor(obj?: number | number[] | string, colorspace?: Color.COLOR_SPACE);
  protected static _checkTypeAndRange(arg: any, range?: number[]): boolean;
  protected static _intToRgb(hex: number): number[];
  protected static _intToRgb255(hex: number): number[];
  protected static _rgb255ToHex(rgb255: number[]): string;
  protected static _rgb255ToInt(rgb255: number[]): number;
  protected static _rgbToHex(rgb: number[]): string;
  protected static _rgbToInt(rgb: number[]): number;
  static hexToRgb(hex: string): number[];
  static hexToRgb255(hex: string): number[];
  static rgb255ToHex(rgb255: number[]): string;
  static rgb255ToInt(rgb255: number[]): number;
  static rgbToHex(rgb: number[]): string;
  static rgbToInt(rgb: number[]): number;
  get hex(): string;
  get int(): number;
  get rgb(): number[];
  get rgb255(): number[];
  get rgbFull(): number[];
  toString(): string;
}

declare namespace Color {
  namespace COLOR_SPACE {
    let RGB: symbol;
    let RGB255: symbol;
  }
  type COLOR_SPACE = symbol;
  namespace NAMED_COLORS {
    let aliceblue: string;
    let antiquewhite: string;
    let aqua: string;
    let aquamarine: string;
    let azure: string;
    let beige: string;
    let bisque: string;
    let black: string;
    let blanchedalmond: string;
    let blue: string;
    let blueviolet: string;
    let brown: string;
    let burlywood: string;
    let cadetblue: string;
    let chartreuse: string;
    let chocolate: string;
    let coral: string;
    let cornflowerblue: string;
    let cornsilk: string;
    let crimson: string;
    let cyan: string;
    let darkblue: string;
    let darkcyan: string;
    let darkgoldenrod: string;
    let darkgray: string;
    let darkgrey: string;
    let darkgreen: string;
    let darkkhaki: string;
    let darkmagenta: string;
    let darkolivegreen: string;
    let darkorange: string;
    let darkorchid: string;
    let darkred: string;
    let darksalmon: string;
    let darkseagreen: string;
    let darkslateblue: string;
    let darkslategray: string;
    let darkslategrey: string;
    let darkturquoise: string;
    let darkviolet: string;
    let deeppink: string;
    let deepskyblue: string;
    let dimgray: string;
    let dimgrey: string;
    let dodgerblue: string;
    let firebrick: string;
    let floralwhite: string;
    let forestgreen: string;
    let fuchsia: string;
    let gainsboro: string;
    let ghostwhite: string;
    let gold: string;
    let goldenrod: string;
    let gray: string;
    let grey: string;
    let green: string;
    let greenyellow: string;
    let honeydew: string;
    let hotpink: string;
    let indianred: string;
    let indigo: string;
    let ivory: string;
    let khaki: string;
    let lavender: string;
    let lavenderblush: string;
    let lawngreen: string;
    let lemonchiffon: string;
    let lightblue: string;
    let lightcoral: string;
    let lightcyan: string;
    let lightgoldenrodyellow: string;
    let lightgray: string;
    let lightgrey: string;
    let lightgreen: string;
    let lightpink: string;
    let lightsalmon: string;
    let lightseagreen: string;
    let lightskyblue: string;
    let lightslategray: string;
    let lightslategrey: string;
    let lightsteelblue: string;
    let lightyellow: string;
    let lime: string;
    let limegreen: string;
    let linen: string;
    let magenta: string;
    let maroon: string;
    let mediumaquamarine: string;
    let mediumblue: string;
    let mediumorchid: string;
    let mediumpurple: string;
    let mediumseagreen: string;
    let mediumslateblue: string;
    let mediumspringgreen: string;
    let mediumturquoise: string;
    let mediumvioletred: string;
    let midnightblue: string;
    let mintcream: string;
    let mistyrose: string;
    let moccasin: string;
    let navajowhite: string;
    let navy: string;
    let oldlace: string;
    let olive: string;
    let olivedrab: string;
    let orange: string;
    let orangered: string;
    let orchid: string;
    let palegoldenrod: string;
    let palegreen: string;
    let paleturquoise: string;
    let palevioletred: string;
    let papayawhip: string;
    let peachpuff: string;
    let peru: string;
    let pink: string;
    let plum: string;
    let powderblue: string;
    let purple: string;
    let red: string;
    let rosybrown: string;
    let royalblue: string;
    let saddlebrown: string;
    let salmon: string;
    let sandybrown: string;
    let seagreen: string;
    let seashell: string;
    let sienna: string;
    let silver: string;
    let skyblue: string;
    let slateblue: string;
    let slategray: string;
    let slategrey: string;
    let snow: string;
    let springgreen: string;
    let steelblue: string;
    let tan: string;
    let teal: string;
    let thistle: string;
    let tomato: string;
    let turquoise: string;
    let violet: string;
    let wheat: string;
    let white: string;
    let whitesmoke: string;
    let yellow: string;
    let yellowgreen: string;
  }
  type NAMED_COLORS = string;
}

declare type WithColor<T extends { [key: string]: any }> = {
  _needPixiUpdate: boolean;
  _needUpdate: boolean;
  getContrastedColor(color: number | number[] | string, contrast: number): Color;
  setColor(color: Color, log?: boolean): void;
  setContrast(contrast: number, log?: boolean): void;
} & T;

declare function ColorMixin<T extends { [key: string]: any }>(superclass: Class<T>): Class<WithColor<T>>;

export declare namespace core {
  export {
    BuilderKeyResponse,
    EventManager,
    GUI,
    Keyboard,
    KeyPress,
    Logger,
    MinimalStim,
    Mouse,
    PsychoJS,
    ServerManager,
    Window_2 as Window,
    WindowMixin
  };
}

declare function count(input: any[], value: null | number | object | string): number;

declare class CountdownTimer extends Clock {
  _countdown_duration: number;
  constructor(startTime?: number);
}

export declare namespace data {
  export { ExperimentHandler, MultiStairHandler, QuestHandler, Shelf, Snapshot, TrialHandler };
}

declare function detectBrowser(): string;

declare class EventEmitter {
  /**
   * Emit an event with a given name and associated data.
   * @param name the name of the event
   * @param data the data of the event
   * @return `true` if at least one listener has been registered for that event, and `false` otherwise
   */
  emit(name: string, data: object): boolean;
  /**
   * Remove the listener with the given uuid associated to the given event name.
   * @param name the name of the event
   * @param uuid the uuid of the listener
   * @return `true` if the listener has been removed, and `false` otherwise
   */
  off(name: string, uuid: string): boolean;
  /**
   * Register a new listener for events with the given name emitted by this instance.
   * @param name the name of the event
   * @param listener a listener called upon emission of the event
   * @return the unique identifier associated with that (event, listener) pair (useful to remove the listener)
   */
  on(name: string, listener: (data: object) => any): string;
  /**
   * Register a new listener for the given event name, and remove it as soon as the event has been emitted.
   * @param name the name of the event
   * @param listener a listener called upon emission of the event
   * @return the unique identifier associated with that (event, listener) pair (useful to remove the listener)
   */
  once(name: string, listener: (data: object) => any): string;
}

declare class EventManager {
  _keyBuffer: any[];
  _mouseInfo: {
    buttons: {
      clocks: Clock[];
      pressed: number[];
      times: number[];
    };
    moveClock: Clock;
    pos: number[];
    wheelRel: number[];
  };
  _psychoJS: PsychoJS;
  constructor(psychoJS: PsychoJS);
  static keycode2w3c(keycode: number): string;
  static pyglet2w3c(pygletKeyList: string[]): string[];
  static w3c2pyglet(code: string): string;
  protected _addKeyListeners(): void;
  addMouseListeners(renderer: any): void;
  clearEvents(attribs: any): void;
  clearKeys(): void;
  getKeys(options?: { keyList?: string[]; timeStamped?: boolean }): string[];
  getMouseInfo(): EventManager.MouseInfo;
  resetMoveClock(): void;
  startMoveClock(): void;
  stopMoveClock(): void;
}

declare namespace EventManager {
  let _keycodeMap: { [key: number]: string };
  let _pygletMap: { [key: string]: string };
  let _reversePygletMap: { [key: string]: string };
  type ButtonInfo = {
    clocks: Clock[];
    pressed: number[];
    times: number[];
  };
  type MouseInfo = {
    buttons: EventManager.ButtonInfo;
    moveClock: Clock;
    pos: number[];
    wheelRel: number[];
  };
}

declare class ExperimentHandler extends PsychObject {
  _currentTrialData: { [key: string]: any };
  _datetime: any;
  _experimentEnded: boolean;
  _experimentName: any;
  _loops: any[];
  _participant: any;
  _session: any;
  _trialsData: any[];
  _trialsKeys: any[];
  _unfinishedLoops: any[];
  constructor(options?: { dataFileName?: any; extraInfo: any; name: string; psychoJS: PsychoJS });
  protected static _getLoopAttributes(loop: any): { [key: string]: any };
  get _entries(): any[];
  get _thisEntry(): { [key: string]: any };
  set experimentEnded(ended: boolean);
  get experimentEnded(): boolean;
  addData(key: any, value: any): void;
  addLoop(loop: any): void;
  isEntryEmpty(): boolean;
  nextEntry(snapshots?: any): void;
  removeLoop(loop: any): void;
  save(options?: { attributes?: any[]; clear?: boolean; sync?: boolean; tag?: string }): Promise<any>;
}

declare namespace ExperimentHandler {
  namespace SaveFormat {
    let CSV: any;
    let DATABASE: any;
  }
  type SaveFormat = symbol;
  namespace Environment {
    let SERVER: any;
    let LOCAL: any;
  }
  type Environment = symbol;
}

declare function extensionFromMimeType(mimeType: string): string;

declare class FaceDetector extends VisualStim {
  _body: PIXI.Graphics;
  _detectionId: number;
  _detections: any;
  _modelsLoaded: boolean;
  constructor(options?: {
    autoDraw?: any;
    autoLog?: any;
    faceApiUrl?: any;
    input?: any;
    modelDir?: any;
    name: string;
    opacity?: any;
    ori?: any;
    pos?: any;
    size?: any;
    units?: any;
    win: Window_2;
  });
  protected _initFaceApi(): Promise<void>;
  isReady(): boolean;
  setInput(input: any, log?: boolean): void;
  start(period: number, detectionCallback: any, log?: boolean): void;
  stop(log?: boolean): void;
}

declare function flattenArray(array: any[]): any[];

declare class Form extends VisualStim implements WithColor<VisualStim> {
  _bottomEdge: number;
  _boundingBox: PIXI.Rectangle;
  _decorations: PIXI.Graphics;
  _itemPadding_px: any;
  _items: any;
  _leftEdge: number;
  _needPixiUpdate: boolean;
  _needUpdate: boolean;
  _pixi: any;
  _prevScrollbarMarkerPos: any;
  _responseTextHeightRatio: number;
  _rightEdge: any;
  _scrollbar: Slider;
  _scrollbarOffset: number;
  _scrollbarWidth: number;
  _scrollbarWidth_px: any;
  _size_px: number[];
  _stimuliClipMask: PIXI.Graphics;
  _topEdge: any;
  _visual: {
    responseStims: any[];
    rowHeights: any[];
    stimuliTotalHeight: number;
    textStims: any[];
    visibles: any[];
  };
  constructor(options?: {
    autoDraw?: boolean;
    autoLog?: boolean;
    bold?: boolean;
    borderColor?: any;
    clipMask?: PIXI.Graphics;
    color?: Color;
    contrast?: number;
    depth?: number;
    fillColor?: any;
    font?: string;
    fontFamily?: string;
    fontSize?: number;
    italic?: boolean;
    itemColor?: any;
    itemPadding?: number;
    items?: number[];
    markerColor?: any;
    name: string;
    opacity?: number;
    pos?: number[];
    randomize?: any;
    responseColor?: any;
    size: number[];
    units?: string;
    win: Window_2;
  });
  protected _estimateBoundingBox(): void;
  protected _importItems(): void;
  protected _processItems(): void;
  protected _sanitizeItems(): void;
  protected _setupStimuli(): void;
  protected _updateDecorations(): void;
  protected _updateIfNeeded(): void;
  protected _updateVisibleStimuli(): void;
  addDataToExp(experiment: any, format?: string): void;
  draw(): void;
  formComplete(): boolean;
  getContrastedColor(color: number | number[] | string, contrast: number): Color;
  getData(): object;
  hide(): void;
  refresh(): void;
  reset(): void;
  setColor(color: Color, log?: boolean): void;
  setContrast(contrast: number, log?: boolean): void;
}

declare namespace Form {
  namespace Types {
    let HEADING: any;
    let DESCRIPTION: any;
    let RATING: any;
    let SLIDER: any;
    let FREE_TEXT: any;
    let CHOICE: any;
    let RADIO: any;
  }
  type Types = symbol;
  namespace Layout {
    let HORIZONTAL: any;
    let VERTICAL: any;
  }
  type Layout = symbol;
  namespace _defaultItems {
    let itemText: string;
    let type: string;
    let options: string;
    let tickLabels: string;
    let itemWidth: number;
    let itemColor: string;
    let responseWidth: number;
    let responseColor: string;
    let index: number;
    let layout: string;
  }
}

declare function getDownloadSpeed(psychoJS: PsychoJS, nbDownloads?: number): number;

declare function getErrorStack(): string;

declare function getPositionFromObject(object: any, units: string): number[];

declare function getRequestError(jqXHR: any, textStatus: any, errorThrown: any): string;

declare function getUrlParameters(): URLSearchParams;

declare class GratingStim extends VisualStim {
  static '__#2@#BLEND_MODES_MAP': {
    add: PIXI.BLEND_MODES;
    avg: PIXI.BLEND_MODES;
    mul: PIXI.BLEND_MODES;
    screen: PIXI.BLEND_MODES;
  };
  static '__#2@#DEFAULT_STIM_SIZE_PX': any[];
  static '__#2@#SHADERS': any;
  static '__#2@#SHADERSWGL1': {
    circle: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uRadius: number;
      };
    };
    cross: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uThickness: number;
      };
    };
    gauss: {
      shader: any;
      uniforms: {
        uA: number;
        uAlpha: number;
        uB: number;
        uC: number;
        uColor: number[];
      };
    };
    imageShader: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uFreq: number;
        uPhase: number;
      };
    };
    radialStim: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uDX: number;
        uFreq: number;
        uPhase: number;
        uStep: number;
      };
    };
    radRamp: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uSqueeze: number;
      };
    };
    raisedCos: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uBeta: number;
        uColor: number[];
        uPeriod: number;
      };
    };
    saw: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uFreq: number;
        uPhase: number;
      };
    };
    sin: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uFreq: number;
        uPhase: number;
      };
    };
    sinXsin: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uFreq: number;
        uPhase: number;
      };
    };
    sqr: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uFreq: number;
        uPhase: number;
      };
    };
    sqrXsqr: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uFreq: number;
        uPhase: number;
      };
    };
    tri: {
      shader: any;
      uniforms: {
        uAlpha: number;
        uColor: number[];
        uFreq: number;
        uPeriod: number;
        uPhase: number;
      };
    };
  };
  _adjustmentFilter: any;
  _boundingBox: PIXI.Rectangle;
  _size_px: number[];
  anchor: any;
  opacity: any;
  size: number[];
  constructor(options?: {
    anchor?: string;
    autoDraw?: boolean;
    autoLog?: boolean;
    blendmode?: string;
    color?: Color;
    colorSpace?: any;
    contrast?: number;
    depth?: number;
    interpolate?: boolean;
    mask?: HTMLImageElement | string;
    maskParams?: any;
    name: string;
    opacity?: number;
    ori?: number;
    phase?: number;
    pos?: number[];
    sf?: number;
    size?: number;
    tex?: HTMLImageElement | string;
    units?: string;
    win: Window;
  });
  protected _getDisplaySize(): number[];
  protected _getPixiMeshFromPredefinedShaders(shaderName?: string, uniforms?: any): PIXI.Mesh;
  setBlendmode(blendMode?: string, log?: boolean): void;
  setColor(colorVal?: Color, log?: boolean): void;
  setColorSpace(colorSpaceVal?: string, log?: boolean): void;
  setInterpolate(interpolate?: boolean, log?: boolean): void;
  setMask(mask: HTMLImageElement | string, log?: boolean): void;
  setOpacity(opacity?: number, log?: boolean): void;
  setPhase(phase: number, log?: boolean): void;
  setSF(sf: number, log?: boolean): void;
  setTex(tex: HTMLImageElement | string, log?: boolean): void;
}

declare class GUI {
  static DEFAULT_SETTINGS: {
    DlgFromDict: {
      requireParticipantClick: boolean;
    };
  };
  _allResourcesDownloaded: boolean;
  _cancelButton: HTMLElement;
  _dialog: A11yDialog;
  _dialogComponent: { [key: string]: any };
  _dictionary: any;
  _okButton: HTMLElement;
  _progressBar: HTMLElement;
  _progressBarCurrentValue: number;
  _progressBarMax: any;
  _progressMessage: string;
  _progressMsg: HTMLElement;
  _psychoJS: PsychoJS;
  _requiredKeys: any[];
  _requireParticipantClick: boolean;
  _setRequiredKeys: any;
  constructor(psychoJS: PsychoJS);
  protected static _onKeyChange(gui: GUI, event: Event): void;
  get dialogComponent(): { [key: string]: any };
  protected _onCancelExperiment(): void;
  protected _onResourceEvents(signal: { [x: string]: string | symbol }): void;
  protected _onStartExperiment(): void;
  protected _setProgressMessage(message: string): void;
  protected _updateDialog(changeOKButtonFocus?: boolean): void;
  protected _updateProgressBar(): void;
  protected _userFriendlyError(errorCode: number): {
    class: string;
    text: string;
    title: string;
  };
  closeDialog(): void;
  dialog(options?: {
    error: { [key: string]: any };
    message: string;
    onCancel?: (...args: any[]) => any;
    onOK?: (...args: any[]) => any;
    showCancel?: boolean;
    showOK?: boolean;
    warning: string;
  }): void;
  DlgFromDict(options: {
    dictionary: any;
    logoUrl?: string;
    requireParticipantClick?: boolean;
    text?: string;
    title: string;
  }): () => any;
  finishDialog(options: { [key: string]: any; text?: string }): void;
  finishDialogNextStep(text: any): void;
}

export declare namespace hardware {
  export { Camera };
}

declare class ImageStim extends VisualStim implements WithColor<VisualStim> {
  _boundingBox: PIXI.Rectangle;
  _needPixiUpdate: boolean;
  _needUpdate: boolean;
  _texture: PIXI.Texture<PIXI.Resource>;
  anchor: any;
  constructor(options?: {
    anchor?: string;
    autoDraw?: boolean;
    autoLog?: boolean;
    color?: Color;
    contrast?: number;
    depth?: number;
    flipHoriz?: boolean;
    flipVert?: boolean;
    image: HTMLImageElement | string;
    interpolate?: boolean;
    mask: HTMLImageElement | string;
    name: string;
    opacity?: number;
    ori?: number;
    pos?: number[];
    size?: number;
    texRes?: number;
    units?: string;
    win: Window;
  });
  protected _getDisplaySize(): number[];
  getContrastedColor(color: number | number[] | string, contrast: number): Color;
  setColor(color: Color, log?: boolean): void;
  setContrast(contrast: number, log?: boolean): void;
  setImage(image: HTMLImageElement | string, log?: boolean): void;
  setInterpolate(interpolate?: boolean, log?: boolean): void;
  setMask(mask: HTMLImageElement | string, log?: boolean): void;
}

declare function index(input: any[], value: null | number | object | string): any;

declare function isEmpty(x: any): boolean;

declare function isInt(obj: any): boolean;

declare function isNumeric(input: any): boolean;

declare function IsPointInsidePolygon(point: number[], vertices: any): boolean;

declare class Keyboard extends PsychObject {
  _bufferIndex: number;
  _bufferLength: number;
  _circularBuffer: any[];
  _previousKeydownKey: any;
  _status: any;
  _unmatchedKeydownMap: any;
  constructor(options?: {
    autoLog?: boolean;
    bufferSize?: number;
    clock?: Clock;
    psychoJS: PsychoJS;
    waitForStart?: boolean;
  });
  static includes(keypressList: KeyPress[], keyName: string): boolean;
  protected _addKeyListeners(): void;
  clearEvents(): void;
  getEvents(): Keyboard.KeyEvent[];
  getKeys(options?: { clear?: boolean; keyList?: string[]; waitRelease?: boolean }): KeyPress[];
  start(): void;
  stop(): void;
}

declare namespace Keyboard {
  namespace KeyStatus {
    let KEY_DOWN: any;
    let KEY_UP: any;
  }
  type KeyStatus = symbol;
  type KeyEvent = {
    '#KeyStatus': Keyboard;
    pyglet: string;
    timestamp: number;
    W3C: string;
  };
}

declare class KeyPress {
  code: string;
  duration: any;
  name: string;
  rt: any;
  tDown: number;
  constructor(code: string, tDown: number, name: string | undefined);
}

declare function loadCss(cssId: string, cssPath: string): void;

declare class Logger {
  _psychoJS: PsychoJS;
  _serverLevel: any;
  _serverLevelValue: number;
  _serverLogs: any[];
  _throttling: {
    designerWasWarned: boolean;
    factor: number;
    index: number;
    isThrottling: boolean;
    minimumDuration: number;
    startOfThrottling: number;
    threshold: number;
    window: number;
  };
  consoleLogger: log4javascript.Logger;
  constructor(psychoJS: PsychoJS, threshold: any);
  protected _customConsoleLayout(): any;
  protected _getValue(level: Logger.ServerLevel): number;
  protected _throttle(time: number): boolean;
  data(msg: string, time?: number, obj?: object): void;
  exp(msg: string, time?: number, obj?: object): void;
  flush(): Promise<any>;
  log(msg: string, level: Logger.ServerLevel, time?: number, obj?: object): void;
  setLevel(serverLevel: Logger.ServerLevel): void;
}

declare namespace Logger {
  namespace ServerLevel {
    let CRITICAL: any;
    let ERROR: any;
    let WARNING: any;
    let DATA: any;
    let EXP: any;
    let INFO: any;
    let DEBUG: any;
    let NOTSET: any;
  }
  type ServerLevel = symbol;
  namespace _ServerLevelValue {
    let CRITICAL_1: number;

    let ERROR_1: number;

    let WARNING_1: number;

    let DATA_1: number;

    let EXP_1: number;

    let INFO_1: number;

    let DEBUG_1: number;

    let NOTSET_1: number;
  }
  type _ServerLevelValue = number;
}

declare function makeUuid(root?: string): string;

declare class Microphone extends PsychObject {
  _audioBuffer: any[];
  _recorder: MediaRecorder;
  _status: any;
  _stopOptions: {
    filename: string;
  };
  constructor(options?: {
    autoLog?: boolean;
    clock?: Clock;
    format?: string;
    name: string;
    sampleRateHz?: number;
    win: Window_2;
  });
  protected _onChange(): void;
  protected _prepareRecording(): Promise<void>;
  download(filename?: string): void;
  flush(): Promise<any>;
  getRecording(...args: any[]): Promise<AudioClip>;
  pause(): Promise<any>;
  resume(options?: { clear?: boolean }): Promise<any>;
  start(): Promise<any>;
  stop(options?: { filename?: string }): Promise<any>;
  upload(...args: any[]): Promise<any>;
}

declare class MinimalStim extends PsychObject {
  _needUpdate: boolean;
  _pixi: any;
  status: any;
  constructor(options?: { autoDraw?: boolean; autoLog?: boolean; name: string; win: Window_2 });
  protected _updateIfNeeded(): void;
  contains(object: any, units: string): void;
  draw(): void;
  hide(): void;
  release(log?: boolean): void;
  setAutoDraw(autoDraw: boolean, log?: boolean): void;
}

declare function mix(superclass: any): MixinBuilder;

declare class MixinBuilder {
  superclass: any;
  constructor(superclass: any);
  with(...mixins: any[]): any;
}

declare class MonotonicClock {
  _timeAtLastReset: number;
  constructor(startTime?: number);
  static getDate(locales?: string | string[], options?: object): string;
  static getDateStr(): string;
  static getReferenceTime(): number;
  getLastResetTime(): number;
  getTime(): number;
}

declare namespace MonotonicClock {
  let _referenceTime: number;
}

declare class Mouse extends PsychObject {
  _lastPos: number[];
  _movedistance: number;
  _prevPos: any;
  status: any;
  constructor(options?: { autoLog?: boolean; name: string; win: Window });
  clickReset(buttons?: number[]): void;
  getPos(): number[];
  getPressed(getTime?: boolean): number[] | number[][];
  getRel(): number[];
  getWheelRel(): number[];
  isPressedIn(...args: any[]): boolean;
  mouseMoved(distance?: number | number[], reset?: boolean | number[] | string): boolean;
  mouseMoveTime(): number;
}

declare class MovieStim extends VisualStim {
  _boundingBox: PIXI.Rectangle;
  _hasFastSeek: boolean;
  _texture: PIXI.Texture<PIXI.Resource>;
  anchor: any;
  constructor(options?: {
    anchor?: any;
    autoDraw?: any;
    autoLog?: any;
    autoPlay?: any;
    color?: any;
    contrast?: any;
    flipHoriz?: any;
    flipVert?: any;
    interpolate?: any;
    loop?: any;
    movie?: any;
    name: string;
    noAudio?: any;
    opacity?: any;
    ori?: any;
    pos?: any;
    size?: any;
    units?: any;
    volume?: any;
    win: Window_2;
  });
  protected _getDisplaySize(): number[];
  pause(log?: boolean): void;
  play(log?: boolean): void;
  reset(log?: boolean): void;
  seek(timePoint: number, log?: boolean): void;
  setMovie(movie: any, log?: boolean): void;
  stop(log?: boolean): void;
}

declare class MultiStairHandler extends TrialHandler {
  _currentPass: any;
  _currentStaircase: any;
  _multiMethod: any;
  _staircases: any[];
  constructor(options?: {
    autoLog?: boolean;
    conditions?: any[] | string;
    method: any;
    name: string;
    nTrials?: number;
    psychoJS: PsychoJS;
    randomSeed: number;
    stairType?: MultiStairHandler.StaircaseType;
    varName: string;
  });
  get currentStaircase(): TrialHandler;
  get intensity(): number;
  protected _nextTrial(): void;
  protected _prepareStaircases(): void;
  protected _validateConditions(): void;
  addResponse(response: number, value?: number): void;
}

declare namespace MultiStairHandler {
  namespace StaircaseType {
    let SIMPLE: any;
    let QUEST: any;
  }
  type StaircaseType = symbol;
  namespace StaircaseStatus {
    let RUNNING: any;
    let FINISHED: any;
  }
  type StaircaseStatus = symbol;
}

declare function offerDataForDownload(filename: string, data: any, type: string): void;

declare function pad(n: any, width?: number): string;

declare class Polygon extends ShapeStim {
  constructor(options?: {
    autoDraw?: boolean;
    autoLog?: boolean;
    contrast?: number;
    depth?: number;
    edges?: number;
    fillColor: Color;
    interpolate?: boolean;
    lineColor?: Color;
    lineWidth?: number;
    name: string;
    opacity?: number;
    ori?: number;
    pos?: number[];
    radius?: number;
    size?: number;
    units: string;
    win: Window;
  });
  protected _updateVertices(): void;
  setEdges(edges: number, log?: boolean): void;
  setRadius(radius: number, log?: boolean): void;
}

declare function promiseToTupple(promise: Promise<any>): any[];

declare class PsychObject extends EventEmitter {
  _psychoJS: PsychoJS;
  _userAttributes: any;
  constructor(psychoJS: PsychoJS, name: string);
  set psychoJS(psychoJS: PsychoJS);
  get psychoJS(): PsychoJS;
  protected _addAttribute(name: string, value: object, defaultValue?: object, onChange?: (...args: any[]) => any): void;
  protected _setAttribute(
    attributeName: string,
    attributeValue: object,
    log?: boolean,
    operation?: string,
    stealth?: boolean
  ): boolean;
}

declare class PsychoJS {
  _autoStartScheduler: any;
  _browser: string;
  _cancellationUrl: string;
  _checkWebGLSupport: any;
  _collectIP: boolean;
  _completionUrl: string;
  _config:
    | {
        environment: any;
        experiment: {
          keys: any[];
          name: string;
          saveFormat: any;
          saveIncompleteResults: boolean;
        };
      }
    | { [key: string]: any };
  _eventManager: EventManager;
  _experiment: ExperimentHandler;
  _gui: GUI;
  _hosts: any;
  _IP:
    | {
        city: string;
        country: string;
        hostname: string;
        IP: string;
        latitude?: undefined;
        location: string;
        longitude?: undefined;
        region: string;
      }
    | {
        city?: undefined;
        country: any;
        hostname?: undefined;
        IP: any;
        latitude: any;
        location?: undefined;
        longitude: any;
        region?: undefined;
      }
    | {
        city?: undefined;
        country?: undefined;
        hostname?: undefined;
        IP?: undefined;
        latitude?: undefined;
        location?: undefined;
        longitude?: undefined;
        region?: undefined;
      };
  _logger: Logger;
  _monotonicClock: MonotonicClock;
  _saveResults: any;
  _scheduler: Scheduler;
  _serverManager: ServerManager;
  _serverMsg: any;
  _shelf: Shelf;
  _status: any;
  _window: Window_2;
  beforeunloadCallback: (event: any) => void;
  constructor(options?: {
    autoStartScheduler?: any;
    captureErrors?: any;
    checkWebGLSupport?: any;
    collectIP?: boolean;
    debug?: boolean;
    hosts?: any;
    saveResults?: any;
    topLevelStatus?: any;
  });
  get browser(): string;
  get config():
    | {
        environment: any;
        experiment: {
          keys: any[];
          name: string;
          saveFormat: any;
          saveIncompleteResults: boolean;
        };
      }
    | { [key: string]: any };
  get eventManager(): EventManager;
  get experiment(): ExperimentHandler;
  get experimentLogger(): Logger;
  get gui(): GUI;
  get IP():
    | {
        city: string;
        country: string;
        hostname: string;
        IP: string;
        latitude?: undefined;
        location: string;
        longitude?: undefined;
        region: string;
      }
    | {
        city?: undefined;
        country: any;
        hostname?: undefined;
        IP: any;
        latitude: any;
        location?: undefined;
        longitude: any;
        region?: undefined;
      }
    | {
        city?: undefined;
        country?: undefined;
        hostname?: undefined;
        IP?: undefined;
        latitude?: undefined;
        location?: undefined;
        longitude?: undefined;
        region?: undefined;
      };
  get logger(): log4javascript.Logger;
  get monotonicClock(): MonotonicClock;
  get scheduler(): Scheduler;
  get serverManager(): ServerManager;
  get serverMsg(): any;
  get shelf(): Shelf;
  set status(status: any);
  get status(): any;
  get window(): Window_2;
  protected _captureErrors(): void;
  protected _configure(configURL: string, name: string): Promise<void>;
  protected _getParticipantIPInfo(): Promise<void>;
  protected _makeStatusTopLevel(): void;
  getEnvironment(): ExperimentHandler.Environment | undefined;
  importAttributes(obj: { [key: string]: any }): void;
  openWindow(options?: {
    autoLog?: boolean;
    color?: Color;
    fullscr?: boolean;
    gamma?: any;
    name?: string;
    units?: string;
    waitBlanking?: boolean;
  }): void;
  quit(options?: { closeWindow?: any; isCompleted?: boolean; message?: string; showOK?: any }): Promise<void>;
  schedule(task: any, args?: any): void;
  scheduleCondition(condition: any, thenScheduler: Scheduler, elseScheduler: Scheduler): void;
  setRedirectUrls(completionUrl: string, cancellationUrl: string): void;
  start(options?: {
    configURL?: string;
    dataFileName?: any;
    expInfo?: { [key: string]: any };
    expName?: string;
    resources?: any;
    surveyId?: any;
    surveyIdL?: any;
  }): Promise<void>;
  waitForResources(
    resources?: {
      name: string;
      path: string;
    }[]
  ): () => Promise<any>;
}

declare namespace PsychoJS {
  namespace Status {
    let NOT_CONFIGURED: any;
    let CONFIGURING: any;
    let CONFIGURED: any;
    let NOT_STARTED: any;
    let STARTED: any;
    let PAUSED: any;
    let FINISHED: any;
    let STOPPED: any;
    let ERROR: any;
  }
  type Status = symbol;
}

declare class QuestHandler extends TrialHandler {
  _jsQuest: any;
  _questValue: any;
  constructor(options?: {
    autoLog?: boolean;
    beta?: number;
    delta?: number;
    gamma?: number;
    grain?: number;
    maxVal: number;
    method: QuestHandler.Method;
    minVal: number;
    name: string;
    nTrials: number;
    psychoJS: PsychoJS;
    pThreshold?: number;
    startVal: number;
    startValSd: number;
    stopInterval: number;
    varName: string;
  });
  get intensity(): number;
  protected _estimateQuestValue(): void;
  protected _setupJsQuest(): void;
  addResponse(response: number, value: number | undefined, doAddData?: boolean): void;
  confInterval(getDifference?: boolean): number | number[];
  getQuestValue(): number;
  mean(): number;
  mode(): number;
  quantile(quantileOrder: number): number;
  sd(): number;
  setMethod(method: any, log: boolean): void;
  simulate(trueValue: number): number;
}

declare namespace QuestHandler {
  namespace Method {
    let SEQUENTIAL: any;
    let RANDOM: any;
    let FULL_RANDOM: any;
    let FULLRANDOM: any;
    let QUANTILE: any;
    let MEAN: any;
    let MODE: any;
  }
  type Method = symbol;
}

declare function randchoice(array: any[], randomNumberGenerator?: (...args: any[]) => any): any[];

declare function randint(min?: number, max?: number): number;

declare function range(...args: any[]): number[];

declare class Rect extends ShapeStim {
  constructor(options?: {
    anchor?: string;
    autoDraw?: boolean;
    autoLog?: boolean;
    contrast?: number;
    depth?: number;
    fillColor?: Color;
    height?: number;
    interpolate?: boolean;
    lineColor?: Color;
    lineWidth?: number;
    name: string;
    opacity?: number;
    ori?: number;
    pos?: number[];
    size?: number;
    units?: string;
    width?: number;
    win: Window_2;
  });
  protected _updateVertices(): void;
  setHeight(height: number, log?: boolean): void;
  setWidth(width: number, log?: boolean): void;
}

declare function round(input: number, places?: number): number;

declare class Scheduler {
  _argsList: any[];
  _currentArgs: any;
  _currentTask: any;
  _psychoJS: PsychoJS;
  _status: any;
  _stopAtNextTask: boolean;
  _stopAtNextUpdate: boolean;
  _taskList: any[];
  constructor(psychoJS: PsychoJS);
  get status(): (args?: any) => any;
  add(task: any, ...args: any[]): void;
  addConditional(condition: any, thenScheduler: (args?: any) => any, elseScheduler: (args?: any) => any): void;
  start(): void;
  stop(): void;
}

declare namespace Scheduler {
  namespace Event {
    let NEXT: any;
    let FLIP_REPEAT: any;
    let FLIP_NEXT: any;
    let QUIT: any;
  }
  type Event = symbol;
  namespace Status {
    let RUNNING: any;
    let STOPPED: any;
  }
  type Status = symbol;
}

declare function selectFromArray(array: any[], selection: number | number[] | string): any;

declare class ServerManager extends PsychObject {
  public static readonly ALL_RESOURCES: symbol;
  _nbLoadedResources: number;
  _preloadQueue: any;
  _resources: any;
  _session: { [key: string]: any };
  _status: any;
  _waitForDownloadComponent: {
    clock: Clock;
    resources: any;
    status: any;
  };
  constructor(options?: { autoLog?: boolean; psychoJS: PsychoJS });
  protected _downloadResources(resources: any): Promise<void>;
  protected _listResources(): any;
  protected _queryServerAPI(method: any, path: any, data: any, contentType?: string): Promise<Response>;
  protected _setupPreloadQueue(): void;
  closeSession(isCompleted?: boolean, sync?: boolean): Promise<any> | void;
  getConfiguration(configURL: string): Promise<ServerManager.GetConfigurationPromise>;
  getResource(name: string, errorIfNotDownloaded?: boolean): any;
  getResourceStatus(names: string | string[]): ServerManager.ResourceStatus;
  getSurveyExperimentParameters(surveyId: any, experimentInfo: any): Promise<any>;
  openSession(params?: any): Promise<ServerManager.OpenSessionPromise>;
  prepareResources(
    resources?:
      | (
          | {
              download: boolean;
              name: string;
              path: string;
            }
          | string
          | symbol
        )[]
      | string
  ): Promise<any>;
  releaseResource(name: string): boolean;
  resetStatus(): typeof ServerManager.Status.READY;
  setStatus(status: any): any;
  uploadAudioVideo(options: {
    dialogMsg?: string;
    mediaBlob: any;
    showDialog?: boolean;
    tag: any;
    waitForCompletion?: boolean;
  }): Promise<any>;
  uploadData(key: string, value: string, sync?: boolean): Promise<any>;
  uploadLog(logs: string, compressed?: boolean): Promise<any>;
  uploadSurveyResponse(surveyId: any, surveyResponse: any, isComplete: any): Promise<any>;
  waitForResources(
    resources?: {
      name: string;
      path: string;
    }[]
  ): () => Promise<any>;
}

declare namespace ServerManager {
  namespace Event {
    let RESOURCE: any;
    let DOWNLOADING_RESOURCES: any;
    let DOWNLOADING_RESOURCE: any;
    let RESOURCE_DOWNLOADED: any;
    let DOWNLOAD_COMPLETED: any;
    let STATUS: any;
  }
  type Event = symbol;
  namespace Status {
    let READY: any;
    let BUSY: any;
    let ERROR: any;
  }
  type Status = symbol;
  namespace ResourceStatus {
    let ERROR_1: any;
    let REGISTERED: any;
    let DOWNLOADING: any;
    let DOWNLOADED: any;
  }
  type ResourceStatus = symbol;
  type GetConfigurationPromise = {
    config?: { [key: string]: any };
    context: string;
    error?: { [key: string]: any };
    origin: string;
  };
  type OpenSessionPromise = {
    context: string;
    error?: { [key: string]: any };
    origin: string;
    token?: string;
  };
}

declare class ShapeStim extends VisualStim implements WithWindow<WithColor<VisualStim>> {
  _boundingBox: PIXI.Rectangle;
  _needPixiUpdate: boolean;
  _needUpdate: boolean;
  _pixiPolygon_px: PIXI.Polygon;
  _vertices_px: any;
  anchor: any;
  size: number[];
  constructor(options?: {
    anchor?: string;
    autoDraw?: boolean;
    autoLog?: boolean;
    closeShape?: boolean;
    contrast?: number;
    depth?: number;
    fillColor: Color;
    interpolate?: boolean;
    lineColor?: Color;
    lineWidth: number;
    name: string;
    opacity?: number;
    ori?: number;
    pos?: number[];
    size?: number;
    units: string;
    vertices?: number[][];
    win: Window_2;
  });
  _getHorLengthPix(length: number): number;
  _getLengthPix(length: number, integerCoordinates?: boolean): number;
  _getLengthUnits(length_px: number): number;
  protected _getPixiPolygon(): any;
  _getVerLengthPix(length: number): number;
  protected _getVertices_px(): number[][];
  getContrastedColor(color: number | number[] | string, contrast: number): Color;
  setColor(color: Color, log?: boolean): void;
  setContrast(contrast: number, log?: boolean): void;
  setVertices(vertices: number[][], log?: boolean): void;
}

declare namespace ShapeStim {
  namespace KnownShapes {
    let cross: number[][];
    let star7: number[][];
  }
}

declare class Shelf extends PsychObject {
  static '__#1@#MAX_KEY_LENGTH': number;
  _lastCallTimestamp: number;
  _lastScheduledCallTimestamp: number;
  _status: any;
  _throttlingPeriod_ms: number;
  constructor(options?: { autoLog?: boolean; psychoJS: PsychoJS });
  _checkAvailability(methodName?: string): any;
  _checkKey(key: object): void;
  _getValue(key: string[], type: Shelf.Type, options?: any): Promise<any>;
  _updateValue(key: string[], type: Shelf.Type, update: any): Promise<any>;
  addIntegerValue(options?: { delta: number; key: string[] }): Promise<number>;
  appendListValue(options?: { elements: any; key: string[] }): Promise<any[]>;
  clearListValue(options?: { key: string[] }): Promise<any[]>;
  counterBalanceSelect(options?: { groups: string[]; groupSizes: number[]; key: string[] }): Promise<{
    boolean: any;
    string: any;
  }>;
  flipBooleanValue(options?: { key: string[] }): Promise<boolean>;
  getBooleanValue(options?: { defaultValue: boolean; key: string[] }): Promise<boolean>;
  getDictionaryFieldNames(options?: { key: string[] }): Promise<string[]>;
  getDictionaryFieldValue(options?: { defaultValue: boolean; fieldName: string; key: string[] }): Promise<any>;
  getDictionaryValue(options?: {
    defaultValue: { [key: string]: any };
    key: string[];
  }): Promise<{ [key: string]: any }>;
  getIntegerValue(options?: { defaultValue: number; key: string[] }): Promise<number>;
  getListValue(options?: { defaultValue: any[]; key: string[] }): Promise<any[]>;
  getTextValue(options?: { defaultValue: string; key: string[] }): Promise<string>;
  incrementComponent(key: any[], increment: number, callback: any): () => any;
  popListValue(options?: { index?: number; key: string[] }): Promise<any>;
  setBooleanValue(options?: { key: string[]; value: boolean }): Promise<boolean>;
  setDictionaryFieldValue(options?: {
    fieldName: string;
    fieldValue: any;
    key: string[];
  }): Promise<{ [key: string]: any }>;
  setDictionaryValue(options?: { key: string[]; value: { [key: string]: any } }): Promise<{ [key: string]: any }>;
  setIntegerValue(options?: { key: string[]; value: number }): Promise<number>;
  setListValue(options?: { key: string[]; value: any[] }): Promise<any[]>;
  setTextValue(options?: { key: string[]; value: string }): Promise<string>;
  shuffleListValue(options?: { key: string[] }): Promise<any[]>;
}

declare namespace Shelf {
  namespace Status {
    let READY: any;
    let BUSY: any;
    let ERROR: any;
  }
  type Status = symbol;
  namespace Type {
    let INTEGER: any;
    let TEXT: any;
    let DICTIONARY: any;
    let BOOLEAN: any;
    let LIST: any;
  }
  type Type = symbol;
}

declare function shuffle(
  array: any[],
  randomNumberGenerator?: (...args: any[]) => any,
  startIndex?: any,
  endIndex?: any
): any[];

declare function sliceArray(array: any[], from?: number, to?: number, step?: number): any[];

declare class Slider extends VisualStim implements WithWindow<WithColor<VisualStim>> {
  _barFillColor: any;
  _barLineColor: any;
  _barLineWidth_px: number;
  _barSize: any[];
  _barSize_px: number[];
  _body: PIXI.Graphics;
  _boundingBox: PIXI.Rectangle;
  _fontSize_px: any;
  _frozenMarker: boolean;
  _granularity: number;
  _handlePointerDownBinded: any;
  _handlePointerMoveBinded: any;
  _handlePointerUpBinded: any;
  _history: any[];
  _isCategorical: boolean;
  _isSliderStyle: boolean;
  _labelAnchor: PIXI.Point;
  _labelColor: any;
  _labelOri: number;
  _labelPositions_px: any[];
  _marker: PIXI.Graphics;
  _markerDragging: boolean;
  _markerPos: number;
  _markerSize: any;
  _markerSize_px: number[];
  _markerType: any;
  _needMarkerUpdate: boolean;
  _needPixiUpdate: boolean;
  _needUpdate: boolean;
  _pixi: PIXI.Container;
  _pixiLabels: any[];
  _rating: any;
  _responseClock: Clock;
  _skin: { [key: string]: any };
  _tickColor: any;
  _tickPositions_px: number[][];
  _ticks: any;
  _tickSize: any[];
  _tickSize_px: number[];
  _tickType: any;
  anchor: any;
  granularity: number;
  lineColor: any;
  markerColor: any;
  status: any;
  constructor(options?: {
    autoDraw?: boolean;
    autoLog?: boolean;
    bold?: boolean;
    clipMask: PIXI.Graphics;
    color?: Color;
    compact?: boolean;
    contrast?: number;
    dependentStims?: MinimalStim[];
    depth?: any;
    flip?: boolean;
    font?: string;
    fontSize?: number;
    granularity?: number;
    italic?: boolean;
    labels?: number[];
    lineColor?: any;
    markerColor?: any;
    name: string;
    opacity?: number;
    ori?: number;
    pos?: number[];
    readOnly?: boolean;
    size: number[];
    startValue?: any;
    style?: string;
    ticks?: number[];
    units?: string;
    win: Window_2;
  });
  set borderColor(color: any);
  get borderColor(): any;
  set fillColor(color: any);
  get fillColor(): any;
  protected _addEventListeners(): void;
  protected _estimateBoundingBox(): void;
  _getHorLengthPix(length: number): number;
  _getLengthPix(length: number, integerCoordinates?: boolean): number;
  _getLengthUnits(length_px: number): number;
  protected _getPosition_px(): number[];
  protected _getTextStyle(): PIXI.TextStyle;
  _getVerLengthPix(length: number): number;
  protected _granularise(rating: number): number;
  protected _handlePointerDown(e: any): void;
  protected _handlePointerMove(e: any): void;
  protected _handlePointerUp(e: any): void;
  protected _isHorizontal(): boolean;
  protected _posToRating(pos_px: number[]): number;
  protected _ratingToPos(ratings: number[]): number[][];
  protected _removeEventListeners(): void;
  protected _sanitizeAttributes(): void;
  protected _setupBar(): void;
  protected _setupLabels(): void;
  protected _setupMarker(): void;
  protected _setupSlider(): void;
  protected _setupStyle(): void;
  protected _setupTicks(): void;
  protected _updateIfNeeded(): void;
  protected _updateMarker(): void;
  getBorderColor(): any;
  getContrastedColor(color: number | number[] | string, contrast: number): Color;
  getFillColor(): any;
  getRating(): number | undefined;
  getRT(): number | undefined;
  isMarkerDragging(): boolean;
  recordRating(rating: number, responseTime?: number, log?: boolean): void;
  refresh(): void;
  release(log?: boolean): void;
  reset(): void;
  setAnchor(anchor?: string, log?: boolean): void;
  setBorderColor(color: any): void;
  setColor(color: Color, log?: boolean): void;
  setContrast(contrast: number, log?: boolean): void;
  setFillColor(color: any): void;
  setMarkerPos(displayedRating: number, log?: boolean): void;
  setOri(ori?: number, log?: boolean): void;
  setRating(rating: number, log?: boolean): void;
  setReadOnly(readOnly?: boolean, log?: boolean): void;
}

declare namespace Slider {
  namespace Shape {
    let DISC: any;
    let TRIANGLE: any;
    let LINE: any;
    let BOX: any;
  }
  type Shape = symbol;
  namespace Style {
    let RATING: any;
    let TRIANGLE_MARKER: any;
    let SLIDER: any;
    let WHITE_ON_BLACK: any;
    let LABELS_45: any;
    let RADIO: any;
  }
  type Style = symbol;
  namespace Skin {
    let MARKER_SIZE: any;
    namespace STANDARD {
      let MARKER_COLOR: Color;
      let BAR_LINE_COLOR: any;
      let TICK_COLOR: any;
      let LABEL_COLOR: any;
    }
    namespace WHITE_ON_BLACK_1 {
      let MARKER_COLOR_1: Color;
      let BAR_LINE_COLOR_1: Color;
      let TICK_COLOR_1: Color;
      let LABEL_COLOR_1: Color;
    }
  }
  type Skin = any;
}

declare type Snapshot = {
  finished: number;
  handler: TrialHandler;
  name: string;
  nRemaining: number;
  nStim: number;
  nTotal: number;
  ran: number;
  thisIndex: number;
  thisN: number;
  thisRepN: number;
  thisTrialN: number;
  trialAttributes: any;
};

declare function sort(input: any[]): any[];

declare class Sound extends PsychObject {
  _player: any;
  status: any;
  constructor(options?: {
    autoLog?: boolean;
    loops?: number;
    name: string;
    octave?: number;
    secs?: number;
    startTime?: number;
    stereo?: boolean;
    stopTime?: number;
    value?: number | string;
    volume?: number;
    win: Window_2;
  });
  protected _getPlayer(): SoundPlayer;
  getDuration(): number;
  play(loops: number, log?: boolean): void;
  setLoops(loops?: number, log?: boolean): void;
  setSecs(secs?: number, log?: boolean): void;
  setSound(sound: object, log?: boolean): this;
  setValue(value?: number | string, octave?: number, log?: boolean): void;
  setVolume(volume: number, mute?: boolean, log?: boolean): void;
  stop(options?: { log?: boolean }): void;
}

export declare namespace sound {
  export {
    AudioClip,
    AudioClipPlayer,
    Microphone,
    Sound,
    SoundPlayer,
    SpeechRecognition,
    TonePlayer,
    TrackPlayer,
    Transcript
  };
}

declare class SoundPlayer extends PsychObject {
  constructor(psychoJS: PsychoJS);
  getDuration(): void;
  play(loops?: number): void;
  setDuration(duration_s: any): void;
  setLoops(loops: number): void;
  setVolume(volume: number, mute?: boolean): void;
  stop(): void;
}

declare class SpeechRecognition extends PsychObject {
  _bufferIndex: number;
  _bufferLength: number;
  _circularBuffer: any[];
  _currentSpeechEnd: any;
  _currentSpeechStart: any;
  _recognition: any;
  _recognitionTime: any;
  _status: any;
  constructor(options?: {
    autoLog?: boolean;
    bufferSize?: number;
    clock?: Clock;
    continuous?: string[];
    interimResults?: string[];
    lang?: string[];
    maxAlternatives?: string[];
    name: string;
    psychoJS: PsychoJS;
    tokens?: string[];
  });
  protected _onChange(): void;
  protected _prepareRecognition(): void;
  clearTranscripts(): void;
  getTranscripts(options?: { clear?: boolean; transcriptList?: string[] }): Transcript[];
  start(): Promise<any>;
  stop(): Promise<any>;
}

declare function sum(input?: any[], start?: number): number;

declare class Survey extends VisualStim {
  static CAPTIONS: {
    NEXT: string;
  };
  static NODE_EXIT_CODES: {
    BREAK_FLOW: number;
    NORMAL: number;
  };
  static SURVEY_COMPLETION_CODES: {
    NORMAL: number;
    SKIP_TO_END_OF_BLOCK: number;
    SKIP_TO_END_OF_SURVEY: number;
  };
  static SURVEY_EXPERIMENT_PARAMETERS: string[];
  static SURVEY_FLOW_PLAYBACK_TYPES: {
    CONDITIONAL: string;
    DIRECT: string;
    EMBEDDED_DATA: string;
    ENDSURVEY: string;
    RANDOMIZER: string;
    SEQUENTIAL: string;
  };
  _boundingBox: PIXI.Rectangle;
  _expressionsRunner: any;
  _hasSelfGeneratedSurveyId: boolean;
  _isCompletedAll: boolean;
  _lastPageSwitchHandledIdx: number;
  _onFinishedCallback: () => void;
  _overallSurveyResults: { [key: string]: any };
  _questionAnswerTimestampClock: Clock;
  _questionAnswerTimestamps: { [key: string]: any };
  _signaturePadRO: ResizeObserver;
  _surveyData: any;
  _surveyDivId: string;
  _surveyModel: any;
  _surveyRunningPromise: any;
  _surveyRunningPromiseReject: any;
  _surveyRunningPromiseResolve: any;
  _variables: { [key: string]: any };
  isFinished: boolean;
  size: number[];
  constructor(options?: {
    autoDraw?: boolean;
    autoLog?: boolean;
    depth?: number;
    model?: string;
    name: string;
    ori?: number;
    pos?: number[];
    size?: number;
    surveyId?: string;
    units?: string;
    win: Window;
  });
  get isCompleted(): boolean;
  _addEventListeners(): void;
  _applyInQuestionRandomization(questionData: any, inQuestionRandomizationSettings: any, surveyData: any): void;
  protected _beginSurvey(surveyData: any, surveyFlowBlock: any): void;
  _composeModelWithRandomizedQuestions(
    surveyModel: any,
    inBlockRandomizationSettings: any
  ): {
    pages: {
      elements: any[];
    }[];
  };
  _detachResizeObservers(): void;
  _handleAfterQuestionRender(sender: any, options: any): void;
  _handleSignaturePadResize(entries: any): void;
  protected _initSurveyJS(): void;
  protected _onCurrentPageChanging(surveyModel: any, options: any): void;
  _onFlowComplete(): void;
  protected _onQuestionValueChanged(survey: any, questionData: any): void;
  protected _onSurveyComplete(surveyModel: any, options: any): void;
  _onTextMarkdown(survey: any, options: any): void;
  _processSurveyData(surveyData: any, surveyIdx: any): any;
  _registerCustomComponentCallbacks(surveyModel: any): void;
  protected _registerCustomExpressionFunctions(Survey: any, customFuncs?: any[]): void;
  protected _registerCustomSurveyProperties(Survey: any): void;
  protected _registerWidgets(Survey: any): void;
  _resetState(): void;
  _runSurveyFlow(surveyBlock: any, surveyData: any, prevBlockResults?: { [key: string]: any }): Promise<number>;
  evaluateExpression(expression: string): any;
  getResponse(): { [key: string]: any };
  onFinished(callback: any): void;
  save(): Promise<any>;
  setModel(model: string, log?: boolean): void;
  setSurveyId(surveyId: string, log?: boolean): void;
  setVariables(variables: any, excludedNames?: string[]): void;
}

declare type TEXT_DIRECTION = any;

declare namespace TEXT_DIRECTION {
  let LTR: string;
  let RTL: string;
  let Arabic: string;
}

declare class TextBox extends VisualStim implements WithColor<VisualStim> {
  _boundingBox: PIXI.Rectangle;
  _needPixiUpdate: boolean;
  _needUpdate: boolean;
  _text: any;
  anchor: any;
  fitToContent: boolean;
  text: string;
  constructor(options?: {
    alignment?: any;
    anchor?: any;
    autoDraw?: any;
    autofocus?: any;
    autoLog?: any;
    bold?: any;
    borderColor?: any;
    borderWidth?: any;
    clipMask?: PIXI.Graphics;
    color?: Color;
    contrast?: number;
    depth?: number;
    editable?: any;
    fillColor?: any;
    fitToContent?: any;
    flipHoriz?: any;
    flipVert?: any;
    font?: string;
    italic?: any;
    languageStyle?: any;
    letterHeight?: number;
    multiline?: any;
    name: string;
    opacity?: number;
    ori?: number;
    padding?: any;
    placeholder?: any;
    pos?: number[];
    size?: any;
    text?: string;
    units?: string;
    win: Window_2;
  });
  protected _addEventListeners(): void;
  protected _getDefaultLetterHeight(): number;
  protected _getTextInputOptions(): {
    box: {
      alpha: number;
      fill: number;
      rounded: number;
      stroke: {
        alpha: number;
        color: number;
        width: number;
      };
    };
    input: {
      color: string;
      direction: any;
      display: string;
      flexDirection: string;
      fontFamily: any;
      fontSize: string;
      fontStyle: string;
      fontWeight: string;
      height: string;
      justifyContent: any;
      maxHeight: string;
      maxWidth: string;
      multiline: any;
      overflow: string;
      padding: string;
      pointerEvents: string;
      text: any;
      textAlign: any;
      width: string;
    };
  };
  clear(): void;
  getContrastedColor(color: number | number[] | string, contrast: number): Color;
  getText(): string;
  reset(): void;
  setAlignment(alignment?: boolean, log?: boolean): void;
  setBorderColor(borderColor: Color, log?: boolean): void;
  setColor(color: Color, log?: boolean): void;
  setContrast(contrast: number, log?: boolean): void;
  setFillColor(fillColor: boolean, log?: boolean): void;
  setFitToContent(fitToContent: boolean, log?: boolean): void;
  setFont(font?: string, log?: boolean): void;
  setLanguageStyle(languageStyle?: string, log?: boolean): void;
  setLetterHeight(fontSize?: string, log?: boolean): void;
  setSize(...args: any[]): void;
  setText(text?: string): void;
}

declare namespace TextBox {
  let _alignmentToFlexboxMap: any;
  let _defaultLetterHeightMap: any;
  let _defaultSizeMap: any;
}

declare class TextInput extends PIXI.Container {
  _anchor: PIXI.ObservablePoint<Window>;
  _box: any;
  _box_cache: { [key: string]: any };
  _box_generator: any;
  _canvas_bounds: {
    height: any;
    left: any;
    top: any;
    width: any;
  };
  _disabled: any;
  _dom_added: boolean;
  _dom_input: HTMLDivElement | HTMLInputElement;
  _dom_visible: boolean;
  _font_metrics: any;
  _input_style: any;
  _last_renderer: any;
  _max_length: any;
  _multiline: boolean;
  _placeholder: string;
  _placeholderColor: number;
  _previous: { [key: string]: any };
  _resolution: any;
  _restrict_regex: any;
  _restrict_value: string;
  _selection: number[];
  _substituted: any;
  _surrogate: PIXI.Text;
  _surrogate_hitbox: PIXI.Graphics;
  _surrogate_mask: PIXI.Graphics;
  state: any;
  constructor(styles: any);
  set anchor(v: PIXI.ObservablePoint<Window>);
  get anchor(): PIXI.ObservablePoint<Window>;
  set disabled(disabled: any);
  get disabled(): any;
  get htmlInput(): HTMLDivElement | HTMLInputElement;
  set maxLength(length: any);
  get maxLength(): any;
  set placeholder(text: string);
  get placeholder(): string;
  set restrict(regex: any);
  get restrict(): any;
  set substituteText(substitute: any);
  get substituteText(): any;
  set text(text: any);
  get text(): any;
  _addListeners(): void;
  _applyRestriction(): void;
  _buildBoxCache(): void;
  _compareClientRects(r1: any, r2: any): boolean;
  _comparePixiMatrices(m1: any, m2: any): boolean;
  _createDOMInput(): void;
  _createSurrogate(): void;
  _deriveSurrogatePadding(): any;
  _deriveSurrogateStyle(): PIXI.TextStyle;
  _deriveSurrogateText(): any;
  _destroyBoxCache(): void;
  _destroySurrogate(): void;
  _ensureFocus(): void;
  _getCanvasBounds(): {
    height: any;
    left: any;
    top: any;
    width: any;
  };
  _getDOMInputBounds(): DOMRect;
  _getDOMRelativeWorldTransform(): PIXI.Matrix;
  _hasFocus(): boolean;
  _needsNewBoxCache(): boolean;
  _needsUpdate(): boolean;
  _onAdded(): void;
  _onAnchorUpdate(): void;
  _onBlurred(): void;
  _onFocused(): void;
  _onInputInput(e: any): void;
  _onInputKeyDown(e: any): void;
  _onInputKeyUp(e: any): void;
  _onRemoved(): void;
  _onSurrogateFocus(): void;
  _pixiMatrixToCSS(m: PIXI.Matrix): string;
  _renderInternal(renderer: any): void;
  _setDOMInputVisible(visible: any): void;
  _setState(state: any): void;
  _update(): void;
  _updateBox(): void;
  _updateDOMInput(): void;
  _updateFontMetrics(): void;
  _updateSubstitution(): void;
  _updateSurrogate(): void;
  _updateSurrogateHitbox(bounds: any): void;
  _updateSurrogateMask(bounds: any, padding: any): void;
  blur(): void;
  destroy(options: any): void;
  focus(options?: { preventScroll: boolean }): void;
  getInputStyle(key: any): string;
  render(renderer: any): void;
  renderCanvas(renderer: any): void;
  renderWebGL(renderer: any): void;
  select(): void;
  setInputStyle(key: any, value: any): void;
}

declare class TextStim extends VisualStim implements WithColor<VisualStim> {
  _boundingBox: PIXI.Rectangle;
  _needPixiUpdate: boolean;
  _needUpdate: boolean;
  _size: number[];
  _textMetrics: PIXI.TextMetrics;
  anchor: string;
  constructor(options?: {
    alignHoriz?: string;
    alignVert?: string;
    anchor?: string;
    autoDraw?: boolean;
    autoLog?: boolean;
    bold?: boolean;
    clipMask?: PIXI.Graphics;
    color?: Color;
    contrast?: number;
    depth?: number;
    flipHoriz?: boolean;
    flipVert?: boolean;
    font?: string;
    height?: number;
    italic?: boolean;
    name: string;
    opacity?: number;
    ori: number;
    pos?: number[];
    text?: string;
    units?: string;
    win: Window_2;
    wrapWidth: boolean;
  });
  protected _getAnchor(): number[];
  protected _getDefaultLetterHeight(): any;
  protected _getDefaultWrapWidth(): any;
  protected _getTextStyle(): PIXI.TextStyle;
  protected getBoundingBox(tight?: boolean): number[];
  getContrastedColor(color: number | number[] | string, contrast: number): Color;
  getTextMetrics(): PIXI.TextMetrics;
  setColor(color: Color, log?: boolean): void;
  setContrast(contrast: number, log?: boolean): void;
}

declare namespace TextStim {
  let _defaultLetterHeightMap: any;
  let _defaultWrapWidthMap: any;
}

declare function to_height(pos: number[], posUnit: string, win: Window): number[];

declare function to_norm(pos: number[], posUnit: string, win: Window): number[];

declare function to_pixiPoint(pos: number[], posUnit: string, win: Window, integerCoordinates?: boolean): number[];

declare function to_px(pos: number[], posUnit: string, win: Window, integerCoordinates?: boolean): number[];

declare function to_unit(pos: number[], posUnit: string, win: Window, targetUnit: string): number[];

declare function to_win(pos: number[], posUnit: string, win: Window): number[];

declare class TonePlayer extends SoundPlayer {
  _audioContext: any;
  _loops: boolean | number;
  _note: any;
  _synth: Tone.Synth;
  _synthOtions: {
    envelope: {
      attack: number;
      decay: number;
      release: number;
      sustain: number;
    };
    oscillator: {
      type: string;
    };
  };
  _toneId: number;
  _toneLoop: any;
  _volume: number;
  _volumeNode: Tone.Synth;
  duration_s: number;
  constructor(options?: {
    autoLog?: any;
    loops?: number;
    note?: number | string;
    psychoJS: PsychoJS;
    secs?: number;
    soundLibrary?: any;
    volume?: number;
  });
  static accept(value: number | string, octave: number): any;
  protected _initSoundLibrary(): void;
  getDuration(): number;
  play(loops?: any): void;
  setDuration(secs: number): void;
  setTone(value?: number | string, octave?: number): void;
}

declare namespace TonePlayer {
  let SoundLibrary: {
    AUDIO_CONTEXT: any;
    TONE_JS: any;
  };
}

declare function toNumerical(obj: any): number | number[];

declare function toString_2(object: any): string;

declare class TrackPlayer extends SoundPlayer {
  _currentLoopIndex: number;
  _howl: any;
  _id: any;
  _loops: number;
  _volume: number;
  constructor(options?: {
    howl: any;
    loops?: number;
    psychoJS: PsychoJS;
    startTime?: number;
    stereo?: boolean;
    stopTime?: number;
    volume?: number;
  });
  static accept(psychoJS: PsychoJS, value: string): any;
  static checkValueSupport(value: string): boolean;
  getDuration(): number;
  play(loops: number, fadeDuration?: number): void;
  setDuration(duration_s: number): void;
  setTrack(track: any): void;
  stop(fadeDuration?: number): void;
}

declare class Transcript {
  confidence: number;
  speechEnd: any;
  speechStart: any;
  text: string;
  time: any;
  constructor(transcriber: SpeechRecognition, text?: string, confidence?: number);
}

declare class TrialHandler extends PsychObject {
  _experimentHandler: any;
  _finished: boolean;
  _randomNumberGenerator: any;
  _snapshots: any[];
  _trialSequence: any;
  nRemaining: number;
  nStim: any;
  nTotal: number;
  order: number;
  ran: number;
  thisIndex: number;
  thisN: number;
  thisRepN: number;
  thisTrial: any;
  thisTrialN: number;
  trialList: any;
  constructor(options?: {
    autoLog?: boolean;
    extraInfo: any;
    method: any;
    name?: any;
    nReps: number;
    psychoJS: PsychoJS;
    seed: number;
    trialList?: any[] | string;
  });
  static fromSnapshot(snapshot: Snapshot): void;
  static importConditions(serverManager: ServerManager, resourceName: string, selection?: any): any;
  set experimentHandler(exp: any);
  get experimentHandler(): any;
  set finished(isFinished: boolean);
  get finished(): boolean;
  protected _prepareSequence(): any;
  protected _prepareTrialList(): void;
  addData(key: any, value: any): void;
  forEach(callback: any): void;
  getAttributes(): string[];
  getCurrentTrial(): any;
  getEarlierTrial(n?: number): any;
  getFutureTrial(n?: number): any;
  getSnapshot(): Snapshot;
  getTrial(index?: number): any;
  getTrialIndex(): number;
  next(): any;
  setSeed(seed: boolean, log: boolean): void;
  setTrialIndex(index: number): void;
}

declare namespace TrialHandler {
  namespace Method {
    let SEQUENTIAL: any;
    let RANDOM: any;
    let FULL_RANDOM: any;
    let FULLRANDOM: any;
  }
  type Method = symbol;
}

declare function turnSquareBracketsIntoArrays(input: string, max?: string): any[];

export declare namespace util {
  export {
    addInfoFromUrl,
    average,
    Clock,
    Color,
    ColorMixin,
    count,
    CountdownTimer,
    detectBrowser,
    EventEmitter,
    extensionFromMimeType,
    flattenArray,
    getDownloadSpeed,
    getErrorStack,
    getPositionFromObject,
    getRequestError,
    getUrlParameters,
    index,
    isEmpty,
    isInt,
    isNumeric,
    IsPointInsidePolygon,
    loadCss,
    makeUuid,
    mix,
    MonotonicClock,
    offerDataForDownload,
    pad,
    promiseToTupple,
    PsychObject,
    randchoice,
    randint,
    range,
    round,
    Scheduler,
    selectFromArray,
    shuffle,
    sliceArray,
    sort,
    sum,
    TEXT_DIRECTION,
    to_height,
    to_norm,
    to_pixiPoint,
    to_px,
    to_unit,
    to_win,
    toNumerical,
    toString_2 as toString,
    turnSquareBracketsIntoArrays
  };
}

export declare namespace visual {
  export {
    ButtonStim,
    FaceDetector,
    Form,
    GratingStim,
    ImageStim,
    MovieStim,
    Polygon,
    Rect,
    ShapeStim,
    Slider,
    Survey,
    TextBox,
    TextInput,
    TextStim,
    VisualStim
  };
}

declare class VisualStim extends MinimalStim implements WithWindow<MinimalStim> {
  _needPixiUpdate: boolean;
  _rotationMatrix: number[][];
  constructor(options?: {
    anchor?: string;
    autoDraw?: boolean;
    autoLog?: boolean;
    clipMask?: PIXI.Graphics;
    depth?: number;
    name: string;
    opacity?: number;
    ori?: number;
    pos?: number[];
    size?: number;
    units?: string;
    win: Window_2;
  });
  protected _anchorTextToNum(anchorText?: string): number[];
  protected _estimateBoundingBox(): void;
  protected _getBoundingBox_px(): PIXI.Rectangle;
  _getHorLengthPix(length: number): number;
  _getLengthPix(length: number, integerCoordinates?: boolean): number;
  _getLengthUnits(length_px: number): number;
  _getVerLengthPix(length: number): number;
  protected _onChange(withPixi?: boolean, withBoundingBox?: boolean): (...args: any[]) => any;
  contains(object: any, units: string): boolean;
  refresh(): void;
  setAnchor(anchor?: string, log?: boolean): void;
  setDepth(depth?: number[], log?: boolean): void;
  setOri(ori: number, log?: boolean): void;
  setPos(pos: number[], log?: boolean): void;
  setSize(size: null | number | number[] | undefined, log?: boolean): void;
}

declare class Window_2 extends PsychObject {
  _adjustmentFilter: any;
  _backgroundSprite: PIXI.Sprite;
  _drawList: any[];
  _flipCallbacks: any[];
  _frameCount: number;
  _msgToBeLogged: any[];
  _needUpdate: boolean;
  _renderer: PIXI.AbstractRenderer;
  _resizeCallback: (e: any) => void;
  _rootContainer: any;
  _stimsContainer: PIXI.Container;
  _windowAlreadyInFullScreen: boolean;
  constructor(options?: {
    autoLog?: boolean;
    color?: Color;
    contrast?: number;
    fullscr?: boolean;
    gamma?: number;
    name?: string;
    psychoJS: PsychoJS;
    units?: string;
    waitBlanking?: boolean;
  });
  protected static _resizePixiRenderer(pjsWindow: Window_2, event: any): void;
  static checkWebGLSupport(): boolean;
  get monitorFramePeriod(): number;
  protected _fullRefresh(): void;
  protected _refresh(): void;
  protected _setupPixi(): void;
  protected _updateIfNeeded(): void;
  protected _writeLogOnFlip(): void;
  addPixiObject(pixiObject: any): void;
  adjustScreenSize(): void;
  callOnFlip(flipCallback: any, ...flipCallbackArgs: any[]): void;
  close(): void;
  closeFullScreen(): void;
  getActualFrameRate(): number;
  logOnFlip(options?: { level?: any; msg: string; obj?: any }): void;
  removePixiObject(pixiObject: any): void;
  render(): void;
}

declare type WithWindow<T extends { [key: string]: any }> = {
  _getHorLengthPix(length: number): number;
  _getLengthPix(length: number, integerCoordinates?: boolean): number;
  _getLengthUnits(length_px: number): number;
  _getVerLengthPix(length: number): number;
} & T;

declare function WindowMixin<T extends { [key: string]: any }>(superclass: Class<T>): Class<WithColor<T>>;
