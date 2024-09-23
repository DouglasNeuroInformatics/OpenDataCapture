declare const A11yDialog: any;
declare const log4javascript: any;
declare const PIXI: any;
declare const Tone: any;

declare function addInfoFromUrl(info: any): any;

declare class AudioClip extends PsychObject {
  constructor({
    psychoJS,
    name,
    sampleRateHz,
    format,
    data,
    autoLog
  }?: {
    psychoJS: PsychoJS;
    name?: string;
    format: string;
    sampleRateHz: number;
    data: Blob;
    autoLog?: boolean;
  });
  setVolume(volume: number): void;
  _volume: number;
  public startPlayback(): Promise<void>;
  _source: any;
  _gainNode: any;
  stopPlayback(fadeDuration?: number): Promise<void>;
  getDuration(): Promise<number>;
  public upload(): void | Promise<any>;
  download(filename?: string): void;
  transcribe({ engine, languageCode }?: { engine: Symbol; languageCode: string }): Promise<any>;
  protected _GoogleTranscribe(transcriptionKey: string, languageCode: string): Promise<any>;
  protected _decodeAudio(): any;
  _status: any;
  _audioData: any;
  _decodingCallbacks: any[];
  _audioContext: any;
  _audioBuffer: any;
  protected _base64ArrayBuffer(arrayBuffer: any): string;
}

declare namespace AudioClip {
  namespace Engine {
    let GOOGLE: any;
  }
  type Engine = Symbol;
  namespace Status {
    let CREATED: any;
    let DECODING: any;
    let READY: any;
  }
  type Status = Symbol;
}

declare class AudioClipPlayer extends SoundPlayer {
  static accept(psychoJS: PsychoJS, value: string): any | boolean;
  constructor({
    psychoJS,
    audioClip,
    startTime,
    stopTime,
    stereo,
    volume,
    loops
  }?: {
    psychoJS: PsychoJS;
    audioClip: any;
    startTime?: number;
    stopTime?: number;
    stereo?: boolean;
    volume?: number;
    loops?: number;
  });
  _currentLoopIndex: number;
  getDuration(): number;
  setDuration(duration_s: number): void;
  setVolume(volume: number, mute?: boolean): void;
  _volume: number;
  _loops: number;
  setAudioClip(audioClip: any): void;
  _audioClip: AudioClip;
  play(loops: number, fadeDuration?: number): void;
  stop(fadeDuration?: number): void;
}

declare function average(input?: any[]): number;

declare class BuilderKeyResponse {
  constructor(psychoJS: any);
  _psychoJS: any;
  status: any;
  keys: any[];
  corr: number;
  rt: any[];
  clock: Clock;
}

declare class ButtonStim extends TextBox {
  constructor({
    win,
    name,
    text,
    font,
    pos,
    size,
    padding,
    anchor,
    units,
    color,
    fillColor,
    borderColor,
    borderWidth,
    opacity,
    letterHeight,
    bold,
    italic,
    autoDraw,
    autoLog
  }?: {
    win: Window_2;
    name: string;
    text?: string;
    font?: string;
    pos?: number[];
    anchor?: string;
    units?: string;
    color?: Color;
    fillColor?: Color;
    borderColor?: Color;
    size?: any;
    padding?: any;
    borderWidth?: Color;
    opacity?: number;
    letterHeight?: number;
    bold?: boolean;
    italic?: boolean;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  listener: Mouse;
  get numClicks(): number;
  get isClicked(): boolean;
}

declare class Camera extends PsychObject {
  constructor({
    win,
    name,
    format,
    clock,
    autoLog
  }?: {
    win?: any;
    name?: any;
    format?: any;
    clock?: any;
    autoLog?: any;
  });
  _stream: MediaStream;
  _recorder: MediaRecorder;
  public authorize(showDialog?: boolean, dialogMsg?: string): boolean;
  _status: any;
  public get isReady(): boolean;
  public getStream(): MediaStream;
  public getVideo(): HTMLVideoElement;
  public open(): void;
  public record(): Promise<any>;
  public stop(): Promise<any>;
  public pause(): Promise<any>;
  resume({ clear }?: { clear?: boolean }): Promise<any>;
  _audioBuffer: any[];
  public flush(): Promise<any>;
  public getRecording(...args: any[]): Promise<any>;
  protected save(...args: any[]): Promise<any>;
  public close(): Promise<void>;
  _videos: any[];
  protected _onChange(): void;
  protected _prepareRecording(): void;
  _videoBuffer: any[];
  _streamSettings: MediaTrackSettings;
}

declare class Clock extends MonotonicClock {
  constructor();
  reset(newTime?: number): void;
  add(deltaTime?: number): void;
}

declare class Color {
  static hexToRgb255(hex: string): number[];
  static hexToRgb(hex: string): number[];
  static rgb255ToHex(rgb255: number[]): string;
  static rgbToHex(rgb: number[]): string;
  static rgbToInt(rgb: number[]): number;
  static rgb255ToInt(rgb255: number[]): number;
  protected static _rgb255ToHex(rgb255: number[]): string;
  protected static _rgbToHex(rgb: number[]): string;
  protected static _rgbToInt(rgb: number[]): number;
  protected static _rgb255ToInt(rgb255: number[]): number;
  protected static _intToRgb255(hex: number): number[];
  protected static _intToRgb(hex: number): number[];
  protected static _checkTypeAndRange(arg: any, range?: number[]): boolean;
  constructor(obj?: string | number | number[] | undefined, colorspace?: any);
  _hex: any;
  _rgb: any;
  _rgbFull: any;
  get rgb(): number[];
  get rgbFull(): number[];
  get rgb255(): number[];
  get hex(): string;
  get int(): number;
  _int: number;
  toString(): string;
}

declare namespace Color {
  namespace COLOR_SPACE {
    let RGB: any;
    let RGB255: any;
  }
  type COLOR_SPACE = Symbol;
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

declare function ColorMixin(superclass: any): {
  new (args: any): {
    [x: string]: any;
    setColor(color: Color, log?: boolean): void;
    _needUpdate: boolean;
    _needPixiUpdate: boolean;
    setContrast(contrast: number, log?: boolean): void;
    getContrastedColor(color: string | number | number[], contrast: number): Color;
  };
  [x: string]: any;
};

export declare namespace core {
  export {
    EventManager,
    BuilderKeyResponse,
    GUI,
    KeyPress,
    Keyboard,
    Logger,
    MinimalStim,
    Mouse,
    PsychoJS,
    ServerManager,
    Window_2 as Window,
    WindowMixin
  };
}

declare function count(input: any[], value: number | string | object | null): number;

declare class CountdownTimer extends Clock {
  constructor(startTime?: number);
  _countdown_duration: number;
}

export declare namespace data {
  export { ExperimentHandler, TrialHandler, Snapshot, QuestHandler, MultiStairHandler, Shelf };
}

declare function detectBrowser(): string;

declare class EventEmitter {
  _listeners: any;
  _onceUuids: any;
  on(name: string, listener: any): string;
  once(name: string, listener: any): string;
  off(name: string, uuid: any): boolean;
  emit(name: string, data: object): boolean;
}

declare class EventManager {
  static pyglet2w3c(pygletKeyList: string[]): string[];
  static w3c2pyglet(code: string): string;
  static keycode2w3c(keycode: number): string;
  constructor(psychoJS: any);
  _psychoJS: any;
  _keyBuffer: any[];
  _mouseInfo: {
    pos: number[];
    wheelRel: number[];
    buttons: {
      pressed: number[];
      clocks: Clock[];
      times: number[];
    };
    moveClock: Clock;
  };
  getKeys({ keyList, timeStamped }?: { keyList?: string[]; timeStamped?: boolean }): string[];
  getMouseInfo(): EventManager.MouseInfo;
  clearEvents(attribs: any): void;
  clearKeys(): void;
  startMoveClock(): void;
  stopMoveClock(): void;
  resetMoveClock(): void;
  addMouseListeners(renderer: any): void;
  protected _addKeyListeners(): void;
}

declare namespace EventManager {
  let _keycodeMap: Record<number, string>;
  let _pygletMap: Record<string, string>;
  let _reversePygletMap: Record<string, string>;
  type ButtonInfo = {
    pressed: number[];
    clocks: Clock[];
    times: number[];
  };
  type MouseInfo = {
    pos: number[];
    wheelRel: number[];
    buttons: EventManager.ButtonInfo;
    moveClock: Clock;
  };
}

declare class ExperimentHandler extends PsychObject {
  protected static _getLoopAttributes(loop: any): {};
  constructor({
    psychoJS,
    name,
    extraInfo,
    dataFileName
  }?: {
    psychoJS: PsychoJS;
    name: string;
    extraInfo: any;
    dataFileName?: any;
  });
  set experimentEnded(ended: boolean);
  get experimentEnded(): boolean;
  _experimentEnded: boolean;
  get _thisEntry(): {};
  get _entries(): any[];
  _experimentName: any;
  _participant: any;
  _session: any;
  _datetime: any;
  _loops: any[];
  _unfinishedLoops: any[];
  _trialsKeys: any[];
  _trialsData: any[];
  _currentTrialData: {};
  isEntryEmpty(): boolean;
  addLoop(loop: any): void;
  removeLoop(loop: any): void;
  addData(key: any, value: any): void;
  nextEntry(snapshots: any | any[] | undefined): void;
  save({
    attributes,
    sync,
    tag,
    clear
  }?: {
    attributes?: Array<any>;
    sync?: boolean;
    tag?: string;
    clear?: boolean;
  }): Promise<any>;
}

declare namespace ExperimentHandler {
  namespace SaveFormat {
    let CSV: any;
    let DATABASE: any;
  }
  type SaveFormat = Symbol;
  namespace Environment {
    let SERVER: any;
    let LOCAL: any;
  }
  type Environment = Symbol;
}

declare function extensionFromMimeType(mimeType: string): string;

declare class FaceDetector extends VisualStim {
  constructor({
    name,
    win,
    input,
    modelDir,
    faceApiUrl,
    units,
    ori,
    opacity,
    pos,
    size,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    input?: any;
    modelDir?: any;
    faceApiUrl?: any;
    units?: any;
    ori?: any;
    opacity?: any;
    pos?: any;
    size?: any;
    autoDraw?: any;
    autoLog?: any;
  });
  isReady(): boolean;
  setInput(input: any, log?: boolean): void;
  start(period: number, detectionCallback: any, log?: boolean): void;
  _detectionId: number;
  _detections: any;
  stop(log?: boolean): void;
  protected _initFaceApi(): Promise<void>;
  _modelsLoaded: boolean;
  _body: any;
}

declare function flattenArray(array: Array<any>): Array<any>;

declare class Form {
  constructor({
    name,
    win,
    pos,
    size,
    units,
    borderColor,
    fillColor,
    itemColor,
    markerColor,
    responseColor,
    color,
    contrast,
    opacity,
    depth,
    items,
    randomize,
    itemPadding,
    font,
    fontFamily,
    bold,
    italic,
    fontSize,
    clipMask,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    pos?: number[];
    size: number[];
    units?: string;
    color?: Color;
    contrast?: number;
    opacity?: number;
    depth?: number;
    items?: number[];
    itemPadding?: number;
    font?: string;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    fontSize?: number;
    clipMask?: any;
    autoDraw?: boolean;
    autoLog?: boolean;
    borderColor?: any;
    fillColor?: any;
    itemColor?: any;
    markerColor?: any;
    responseColor?: any;
    randomize?: any;
  });
  _scrollbarWidth: number;
  _responseTextHeightRatio: number;
  refresh(): void;
  draw(): void;
  _prevScrollbarMarkerPos: any;
  _needUpdate: boolean;
  hide(): void;
  reset(): void;
  getData(): object;
  formComplete(): boolean;
  addDataToExp(experiment: any, format?: string): void;
  protected _processItems(): void;
  protected _importItems(): void;
  _items: any;
  protected _sanitizeItems(): void;
  protected _estimateBoundingBox(): void;
  _boundingBox: any;
  protected _setupStimuli(): void;
  _visual: {
    rowHeights: any[];
    textStims: any[];
    responseStims: any[];
    visibles: any[];
    stimuliTotalHeight: number;
  };
  _stimuliClipMask: any;
  _scrollbar: Slider;
  protected _updateIfNeeded(): void;
  _leftEdge: number;
  _rightEdge: any;
  _topEdge: any;
  _bottomEdge: number;
  _itemPadding_px: any;
  _scrollbarWidth_px: any;
  _size_px: number[];
  _scrollbarOffset: number;
  protected _updateVisibleStimuli(): void;
  protected _updateDecorations(): void;
  _pixi: any;
  _decorations: any;
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
  type Types = Symbol;
  namespace Layout {
    let HORIZONTAL: any;
    let VERTICAL: any;
  }
  type Layout = Symbol;
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
  static '__#2@#SHADERS': any;
  static '__#2@#SHADERSWGL1': {
    imageShader: {
      shader: any;
      uniforms: {
        uFreq: number;
        uPhase: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    sin: {
      shader: any;
      uniforms: {
        uFreq: number;
        uPhase: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    sqr: {
      shader: any;
      uniforms: {
        uFreq: number;
        uPhase: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    saw: {
      shader: any;
      uniforms: {
        uFreq: number;
        uPhase: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    tri: {
      shader: any;
      uniforms: {
        uFreq: number;
        uPhase: number;
        uPeriod: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    sinXsin: {
      shader: any;
      uniforms: {
        uFreq: number;
        uPhase: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    sqrXsqr: {
      shader: any;
      uniforms: {
        uFreq: number;
        uPhase: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    circle: {
      shader: any;
      uniforms: {
        uRadius: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    gauss: {
      shader: any;
      uniforms: {
        uA: number;
        uB: number;
        uC: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    cross: {
      shader: any;
      uniforms: {
        uThickness: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    radRamp: {
      shader: any;
      uniforms: {
        uSqueeze: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    raisedCos: {
      shader: any;
      uniforms: {
        uBeta: number;
        uPeriod: number;
        uColor: number[];
        uAlpha: number;
      };
    };
    radialStim: {
      shader: any;
      uniforms: {
        uFreq: number;
        uStep: number;
        uDX: number;
        uPhase: number;
        uColor: number[];
        uAlpha: number;
      };
    };
  };
  static '__#2@#DEFAULT_STIM_SIZE_PX': any[];
  static '__#2@#BLEND_MODES_MAP': {
    avg: any;
    add: any;
    mul: any;
    screen: any;
  };
  constructor({
    name,
    tex,
    win,
    mask,
    pos,
    anchor,
    units,
    sf,
    ori,
    phase,
    size,
    color,
    colorSpace,
    opacity,
    contrast,
    depth,
    interpolate,
    blendmode,
    autoDraw,
    autoLog,
    maskParams
  }?: {
    name: string;
    win: Window;
    tex?: string | HTMLImageElement;
    colorSpace?: any;
    maskParams?: any;
    mask?: string | HTMLImageElement;
    units?: string;
    sf?: number;
    phase?: number;
    pos?: number[];
    anchor?: string;
    ori?: number;
    size?: number;
    color?: Color;
    opacity?: number;
    contrast?: number;
    depth?: number;
    interpolate?: boolean;
    blendmode?: string;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  _adjustmentFilter: any;
  size: number[];
  _size_px: number[];
  setTex(tex: HTMLImageElement | string, log?: boolean): void;
  setMask(mask: HTMLImageElement | string, log?: boolean): void;
  protected _getDisplaySize(): number[];
  _boundingBox: any;
  protected _getPixiMeshFromPredefinedShaders(shaderName?: string, uniforms?: any): any;
  setPhase(phase: number, log?: boolean): void;
  setColorSpace(colorSpaceVal?: string, log?: boolean): void;
  setColor(colorVal?: Color, log?: boolean): void;
  setOpacity(opacity?: number, log?: boolean): void;
  setSF(sf: number, log?: boolean): void;
  setBlendmode(blendMode?: string, log?: boolean): void;
  setInterpolate(interpolate?: boolean, log?: boolean): void;
  opacity: any;
  anchor: any;
}

declare class GUI {
  static DEFAULT_SETTINGS: {
    DlgFromDict: {
      requireParticipantClick: boolean;
    };
  };
  protected static _onKeyChange(gui: GUI, event: Event): void;
  constructor(psychoJS: PsychoJS);
  get dialogComponent(): {};
  _psychoJS: PsychoJS;
  DlgFromDict({
    logoUrl,
    text,
    dictionary,
    title,
    requireParticipantClick
  }: {
    logoUrl?: string;
    text?: string;
    dictionary: any;
    title: string;
    requireParticipantClick?: boolean;
  }): () => any;
  _progressBarMax: any;
  _allResourcesDownloaded: boolean;
  _requiredKeys: any[];
  _setRequiredKeys: any;
  _progressMessage: string;
  _requireParticipantClick: boolean;
  _dictionary: any;
  _dialogComponent: {};
  dialog({
    message,
    warning,
    error,
    showOK,
    onOK,
    showCancel,
    onCancel
  }?: {
    message: string;
    error: Record<string, any>;
    warning: string;
    showOK?: boolean;
    onOK?: (...args: any[]) => any;
    showCancel?: boolean;
    onCancel?: (...args: any[]) => any;
  }): void;
  _dialog: any;
  _okButton: HTMLElement;
  _cancelButton: HTMLElement;
  finishDialog({ text, nbSteps }: { [key: string]: any; text?: string }): void;
  _progressMsg: HTMLElement;
  _progressBar: HTMLElement;
  _progressBarCurrentValue: number;
  finishDialogNextStep(text: any): void;
  closeDialog(): void;
  protected _setProgressMessage(message: string): void;
  protected _updateProgressBar(): void;
  protected _onCancelExperiment(): void;
  protected _onStartExperiment(): void;
  protected _onResourceEvents(signal: { [x: string]: string | Symbol }): void;
  protected _updateDialog(changeOKButtonFocus?: boolean): void;
  protected _userFriendlyError(errorCode: number): {
    class: string;
    title: string;
    text: string;
  };
}

export declare namespace hardware {
  export { Camera };
}

declare class ImageStim extends VisualStim {
  constructor({
    name,
    win,
    image,
    mask,
    pos,
    anchor,
    units,
    ori,
    size,
    color,
    opacity,
    contrast,
    texRes,
    depth,
    interpolate,
    flipHoriz,
    flipVert,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window;
    image: string | HTMLImageElement;
    mask: string | HTMLImageElement;
    pos?: number[];
    anchor?: string;
    units?: string;
    ori?: number;
    size?: number;
    color?: Color;
    opacity?: number;
    contrast?: number;
    depth?: number;
    texRes?: number;
    interpolate?: boolean;
    flipHoriz?: boolean;
    flipVert?: boolean;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  setImage(image: HTMLImageElement | string, log?: boolean): void;
  setMask(mask: HTMLImageElement | string, log?: boolean): void;
  setInterpolate(interpolate?: boolean, log?: boolean): void;
  _boundingBox: any;
  _texture: any;
  anchor: any;
  protected _getDisplaySize(): number[];
}

declare function index(input: any[], value: number | string | object | null): any;

declare function isEmpty(x: any): boolean;

declare function isInt(obj: any): boolean;

declare function isNumeric(input: any): boolean;

declare function IsPointInsidePolygon(point: number[], vertices: any): boolean;

declare class Keyboard extends PsychObject {
  static includes(keypressList: KeyPress[], keyName: string): boolean;
  constructor({
    psychoJS,
    bufferSize,
    waitForStart,
    clock,
    autoLog
  }?: {
    psychoJS: PsychoJS;
    bufferSize?: number;
    waitForStart?: boolean;
    clock?: Clock;
    autoLog?: boolean;
  });
  start(): void;
  _status: any;
  stop(): void;
  getEvents(): Keyboard.KeyEvent[];
  getKeys({ keyList, waitRelease, clear }?: { keyList?: string[]; waitRelease?: boolean; clear?: boolean }): KeyPress[];
  clearEvents(): void;
  _circularBuffer: any[];
  _bufferLength: number;
  _bufferIndex: number;
  _previousKeydownKey: any;
  _unmatchedKeydownMap: any;
  protected _addKeyListeners(): void;
}

declare namespace Keyboard {
  namespace KeyStatus {
    let KEY_DOWN: any;
    let KEY_UP: any;
  }
  type KeyStatus = Symbol;
  type KeyEvent = {
    W3C: string;
    pyglet: string;
    '#KeyStatus': Keyboard;
    timestamp: number;
  };
}

declare class KeyPress {
  constructor(code: string, tDown: number, name: string | undefined);
  code: string;
  tDown: number;
  name: string;
  duration: any;
  rt: any;
}

declare function loadCss(cssId: string, cssPath: string): void;

declare class Logger {
  constructor(psychoJS: PsychoJS, threshold: any);
  _psychoJS: PsychoJS;
  consoleLogger: any;
  _serverLogs: any[];
  _serverLevel: any;
  _serverLevelValue: number;
  _throttling: {
    window: number;
    threshold: number;
    factor: number;
    minimumDuration: number;
    startOfThrottling: number;
    isThrottling: boolean;
    index: number;
    designerWasWarned: boolean;
  };
  setLevel(serverLevel: Logger.ServerLevel): void;
  exp(msg: string, time?: number, obj?: object): void;
  data(msg: string, time?: number, obj?: object): void;
  log(msg: string, level: Logger.ServerLevel, time?: number, obj?: object): void;
  protected _throttle(time: number): boolean;
  flush(): Promise<any>;
  protected _customConsoleLayout(): any;
  protected _getValue(level: Logger.ServerLevel): number;
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
  type ServerLevel = Symbol;
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
  constructor({
    win,
    name,
    format,
    sampleRateHz,
    clock,
    autoLog
  }?: {
    win: Window_2;
    name: string;
    format?: string;
    sampleRateHz?: number;
    clock?: Clock;
    autoLog?: boolean;
  });
  start(): Promise<any>;
  _status: any;
  stop({ filename }?: { filename?: string }): Promise<any>;
  _stopOptions: {
    filename: string;
  };
  pause(): Promise<any>;
  resume({ clear }?: { clear?: boolean }): Promise<any>;
  _audioBuffer: any[];
  flush(): Promise<any>;
  download(filename?: string): void;
  upload(...args: any[]): Promise<any>;
  getRecording(...args: any[]): Promise<AudioClip>;
  protected _onChange(): void;
  protected _prepareRecording(): Promise<void>;
  _recorder: MediaRecorder;
}

declare class MinimalStim extends PsychObject {
  constructor({
    name,
    win,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  _pixi: any;
  _needUpdate: boolean;
  status: any;
  setAutoDraw(autoDraw: boolean, log?: boolean): void;
  draw(): void;
  hide(): void;
  contains(object: any, units: string): void;
  release(log?: boolean): void;
  protected _updateIfNeeded(): void;
}

declare function mix(superclass: any): MixinBuilder;

declare class MixinBuilder {
  constructor(superclass: any);
  superclass: any;
  with(...mixins: any[]): any;
}

declare class MonotonicClock {
  static getReferenceTime(): number;
  static getDate(locales?: string | string[], options?: object): string;
  static getDateStr(): string;
  constructor(startTime?: number);
  _timeAtLastReset: number;
  getTime(): number;
  getLastResetTime(): number;
}

declare namespace MonotonicClock {
  let _referenceTime: number;
}

declare class Mouse extends PsychObject {
  constructor({ name, win, autoLog }?: { name: string; win: Window; autoLog?: boolean });
  _lastPos: number[];
  _prevPos: any;
  _movedistance: number;
  status: any;
  getPos(): number[];
  getRel(): number[];
  getWheelRel(): number[];
  getPressed(getTime?: boolean): number[] | Array<number[]>;
  isPressedIn(...args: any[]): boolean;
  mouseMoved(distance?: undefined | number | number[], reset?: boolean | string | number[]): boolean;
  mouseMoveTime(): number;
  clickReset(buttons?: number[]): void;
}

declare class MovieStim extends VisualStim {
  constructor({
    name,
    win,
    movie,
    pos,
    anchor,
    units,
    ori,
    size,
    color,
    opacity,
    contrast,
    interpolate,
    flipHoriz,
    flipVert,
    loop,
    volume,
    noAudio,
    autoPlay,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    movie?: any;
    pos?: any;
    anchor?: any;
    units?: any;
    ori?: any;
    size?: any;
    color?: any;
    opacity?: any;
    contrast?: any;
    interpolate?: any;
    flipHoriz?: any;
    flipVert?: any;
    loop?: any;
    volume?: any;
    noAudio?: any;
    autoPlay?: any;
    autoDraw?: any;
    autoLog?: any;
  });
  _hasFastSeek: boolean;
  setMovie(movie: any, log?: boolean): void;
  reset(log?: boolean): void;
  play(log?: boolean): void;
  pause(log?: boolean): void;
  stop(log?: boolean): void;
  seek(timePoint: number, log?: boolean): void;
  _boundingBox: any;
  _texture: any;
  anchor: any;
  protected _getDisplaySize(): number[];
}

declare class MultiStairHandler extends TrialHandler {
  constructor({
    psychoJS,
    varName,
    stairType,
    conditions,
    method,
    nTrials,
    randomSeed,
    name,
    autoLog
  }?: {
    psychoJS: PsychoJS;
    varName: string;
    stairType?: MultiStairHandler.StaircaseType;
    conditions?: Array<any> | string;
    method: any;
    nTrials?: number;
    randomSeed: number;
    name: string;
    autoLog?: boolean;
  });
  _multiMethod: any;
  get currentStaircase(): TrialHandler;
  get intensity(): number;
  addResponse(response: number, value?: number | undefined): void;
  protected _validateConditions(): void;
  protected _prepareStaircases(): void;
  _staircases: any[];
  _currentPass: any;
  _currentStaircase: any;
  protected _nextTrial(): void;
}

declare namespace MultiStairHandler {
  namespace StaircaseType {
    let SIMPLE: any;
    let QUEST: any;
  }
  type StaircaseType = Symbol;
  namespace StaircaseStatus {
    let RUNNING: any;
    let FINISHED: any;
  }
  type StaircaseStatus = Symbol;
}

declare function offerDataForDownload(filename: string, data: any, type: string): void;

declare function pad(n: any, width?: number): string;

declare class Polygon extends ShapeStim {
  constructor({
    name,
    win,
    lineWidth,
    lineColor,
    fillColor,
    opacity,
    edges,
    radius,
    pos,
    size,
    ori,
    units,
    contrast,
    depth,
    interpolate,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window;
    lineWidth?: number;
    lineColor?: Color;
    fillColor: Color;
    opacity?: number;
    edges?: number;
    radius?: number;
    pos?: number[];
    size?: number;
    ori?: number;
    units: string;
    contrast?: number;
    depth?: number;
    interpolate?: boolean;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  setRadius(radius: number, log?: boolean): void;
  setEdges(edges: number, log?: boolean): void;
  protected _updateVertices(): void;
}

declare function promiseToTupple(promise: Promise<any>): any[];

declare class PsychObject extends EventEmitter {
  constructor(psychoJS: PsychoJS, name: string);
  _psychoJS: PsychoJS;
  _userAttributes: any;
  set psychoJS(psychoJS: PsychoJS);
  get psychoJS(): PsychoJS;
  protected _setAttribute(
    attributeName: string,
    attributeValue: object,
    log?: boolean,
    operation?: string,
    stealth?: boolean
  ): boolean;
  protected _addAttribute(name: string, value: object, defaultValue?: object, onChange?: Function): void;
}

declare class PsychoJS {
  constructor({
    debug,
    collectIP,
    hosts,
    topLevelStatus,
    autoStartScheduler,
    saveResults,
    captureErrors,
    checkWebGLSupport
  }?: {
    hosts?: any;
    topLevelStatus?: any;
    autoStartScheduler?: any;
    saveResults?: any;
    captureErrors?: any;
    checkWebGLSupport?: any;
    debug?: boolean;
    collectIP?: boolean;
  });
  set status(status: any);
  get status(): any;
  _status: any;
  get config():
    | Record<string, any>
    | {
        environment: any;
        experiment: {
          name: string;
          saveFormat: any;
          saveIncompleteResults: boolean;
          keys: any[];
        };
      };
  get window(): Window_2;
  get serverManager(): ServerManager;
  get experiment(): ExperimentHandler;
  get scheduler(): Scheduler;
  get monotonicClock(): MonotonicClock;
  get logger(): any;
  get experimentLogger(): Logger;
  get eventManager(): EventManager;
  get gui(): GUI;
  get IP():
    | {
        IP: string;
        hostname: string;
        city: string;
        region: string;
        country: string;
        location: string;
        latitude?: undefined;
        longitude?: undefined;
      }
    | {
        IP?: undefined;
        hostname?: undefined;
        city?: undefined;
        region?: undefined;
        country?: undefined;
        location?: undefined;
        latitude?: undefined;
        longitude?: undefined;
      }
    | {
        IP: any;
        country: any;
        latitude: any;
        longitude: any;
        hostname?: undefined;
        city?: undefined;
        region?: undefined;
        location?: undefined;
      };
  get serverMsg(): any;
  get browser(): string;
  get shelf(): Shelf;
  _logger: Logger;
  _browser: string;
  _monotonicClock: MonotonicClock;
  _eventManager: EventManager;
  _serverManager: ServerManager;
  _hosts: any;
  _gui: GUI;
  _collectIP: boolean;
  _scheduler: Scheduler;
  _window: Window_2;
  _shelf: Shelf;
  _cancellationUrl: string;
  _completionUrl: string;
  _autoStartScheduler: any;
  _checkWebGLSupport: any;
  _saveResults: any;
  getEnvironment(): ExperimentHandler.Environment | undefined;
  openWindow({
    name,
    fullscr,
    color,
    gamma,
    units,
    waitBlanking,
    autoLog
  }?: {
    name?: string;
    fullscr?: boolean;
    gamma?: any;
    color?: Color;
    units?: string;
    autoLog?: boolean;
    waitBlanking?: boolean;
  }): void;
  setRedirectUrls(completionUrl: string, cancellationUrl: string): void;
  schedule(task: any, args?: any): void;
  scheduleCondition(condition: any, thenScheduler: Scheduler, elseScheduler: Scheduler): void;
  start({
    configURL,
    expName,
    expInfo,
    resources,
    dataFileName,
    surveyId
  }?: {
    resources?: any;
    dataFileName?: any;
    surveyIdL?: any;
    configURL?: string;
    surveyId?: any;
    expName?: string;
    expInfo?: Record<string, any>;
  }): Promise<void>;
  _IP:
    | {
        IP: string;
        hostname: string;
        city: string;
        region: string;
        country: string;
        location: string;
        latitude?: undefined;
        longitude?: undefined;
      }
    | {
        IP?: undefined;
        hostname?: undefined;
        city?: undefined;
        region?: undefined;
        country?: undefined;
        location?: undefined;
        latitude?: undefined;
        longitude?: undefined;
      }
    | {
        IP: any;
        country: any;
        latitude: any;
        longitude: any;
        hostname?: undefined;
        city?: undefined;
        region?: undefined;
        location?: undefined;
      };
  _experiment: ExperimentHandler;
  beforeunloadCallback: (event: any) => void;
  waitForResources(
    resources?: Array<{
      name: string;
      path: string;
    }>
  ): () => Promise<any>;
  importAttributes(obj: Record<string, any>): void;
  quit({
    message,
    isCompleted,
    closeWindow,
    showOK
  }?: {
    closeWindow?: any;
    showOK?: any;
    message?: string;
    isCompleted?: boolean;
  }): Promise<void>;
  protected _configure(configURL: string, name: string): Promise<void>;
  _config:
    | Record<string, any>
    | {
        environment: any;
        experiment: {
          name: string;
          saveFormat: any;
          saveIncompleteResults: boolean;
          keys: any[];
        };
      };
  _serverMsg: any;
  protected _getParticipantIPInfo(): Promise<void>;
  protected _captureErrors(): void;
  protected _makeStatusTopLevel(): void;
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
  type Status = Symbol;
}

declare class QuestHandler extends TrialHandler {
  constructor({
    psychoJS,
    varName,
    startVal,
    startValSd,
    minVal,
    maxVal,
    pThreshold,
    nTrials,
    stopInterval,
    method,
    beta,
    delta,
    gamma,
    grain,
    name,
    autoLog
  }?: {
    psychoJS: PsychoJS;
    varName: string;
    startVal: number;
    startValSd: number;
    minVal: number;
    maxVal: number;
    pThreshold?: number;
    nTrials: number;
    stopInterval: number;
    method: QuestHandler.Method;
    beta?: number;
    delta?: number;
    gamma?: number;
    grain?: number;
    name: string;
    autoLog?: boolean;
  });
  setMethod(method: any, log: boolean): void;
  addResponse(response: number, value: number | undefined, doAddData?: boolean): void;
  _jsQuest: any;
  simulate(trueValue: number): number;
  _questValue: any;
  mean(): number;
  sd(): number;
  mode(): number;
  quantile(quantileOrder: number): number;
  getQuestValue(): number;
  get intensity(): number;
  confInterval(getDifference?: boolean): number[] | number;
  protected _setupJsQuest(): void;
  protected _estimateQuestValue(): void;
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
  type Method = Symbol;
}

declare function randchoice(array: any[], randomNumberGenerator?: Function): any[];

declare function randint(min?: number, max?: number): number;

declare function range(...args: any[]): number[];

declare class Rect extends ShapeStim {
  constructor({
    name,
    win,
    lineWidth,
    lineColor,
    fillColor,
    opacity,
    width,
    height,
    pos,
    anchor,
    size,
    ori,
    units,
    contrast,
    depth,
    interpolate,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    lineWidth?: number;
    lineColor?: Color;
    fillColor?: Color;
    opacity?: number;
    width?: number;
    height?: number;
    pos?: number[];
    anchor?: string;
    size?: number;
    ori?: number;
    units?: string;
    contrast?: number;
    depth?: number;
    interpolate?: boolean;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  setWidth(width: number, log?: boolean): void;
  setHeight(height: number, log?: boolean): void;
  protected _updateVertices(): void;
}

declare function round(input: number, places?: number): number;

declare class Scheduler {
  constructor(psychoJS: PsychoJS);
  _psychoJS: PsychoJS;
  _taskList: any[];
  _currentTask: any;
  _argsList: any[];
  _currentArgs: any;
  _stopAtNextUpdate: boolean;
  _stopAtNextTask: boolean;
  _status: any;
  get status(): (args?: any) => any;
  add(task: any, ...args: any[]): void;
  addConditional(condition: any, thenScheduler: (args?: any) => any, elseScheduler: (args?: any) => any): void;
  start(): void;
  stop(): void;
  private _runNextTasks;
}

declare namespace Scheduler {
  namespace Event {
    let NEXT: any;
    let FLIP_REPEAT: any;
    let FLIP_NEXT: any;
    let QUIT: any;
  }
  type Event = Symbol;
  namespace Status {
    let RUNNING: any;
    let STOPPED: any;
  }
  type Status = Symbol;
}

declare function selectFromArray(array: Array<any>, selection: number | number[] | string): any | Array<any>;

declare class ServerManager extends PsychObject {
  public static readonly ALL_RESOURCES: Symbol;
  constructor({ psychoJS, autoLog }?: { psychoJS: PsychoJS; autoLog?: boolean });
  _session: {};
  _resources: any;
  _nbLoadedResources: number;
  getConfiguration(configURL: string): Promise<ServerManager.GetConfigurationPromise>;
  openSession(params?: any): Promise<ServerManager.OpenSessionPromise>;
  closeSession(isCompleted?: boolean, sync?: boolean): Promise<any> | void;
  getResource(name: string, errorIfNotDownloaded?: boolean): any;
  releaseResource(name: string): boolean;
  getResourceStatus(names: string | string[]): ServerManager.ResourceStatus;
  setStatus(status: any): any;
  _status: any;
  resetStatus(): typeof ServerManager.Status.READY;
  prepareResources(
    resources?:
      | string
      | Array<
          | {
              name: string;
              path: string;
              download: boolean;
            }
          | string
          | Symbol
        >
  ): Promise<any>;
  waitForResources(
    resources?: Array<{
      name: string;
      path: string;
    }>
  ): () => Promise<any>;
  _waitForDownloadComponent: {
    status: any;
    clock: Clock;
    resources: any;
  };
  uploadData(key: string, value: string, sync?: boolean): Promise<any>;
  uploadLog(logs: string, compressed?: boolean): Promise<any>;
  uploadAudioVideo({
    mediaBlob,
    tag,
    waitForCompletion,
    showDialog,
    dialogMsg
  }: {
    mediaBlob: any;
    tag: any;
    waitForCompletion?: boolean;
    showDialog?: boolean;
    dialogMsg?: string;
  }): Promise<any>;
  uploadSurveyResponse(surveyId: any, surveyResponse: any, isComplete: any): Promise<any>;
  getSurveyExperimentParameters(surveyId: any, experimentInfo: any): Promise<any>;
  protected _listResources(): any;
  protected _downloadResources(resources: any): Promise<void>;
  protected _setupPreloadQueue(): void;
  _preloadQueue: any;
  protected _queryServerAPI(method: any, path: any, data: any, contentType?: string): Promise<Response>;
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
  type Event = Symbol;
  namespace Status {
    let READY: any;
    let BUSY: any;
    let ERROR: any;
  }
  type Status = Symbol;
  namespace ResourceStatus {
    let ERROR_1: any;
    let REGISTERED: any;
    let DOWNLOADING: any;
    let DOWNLOADED: any;
  }
  type ResourceStatus = Symbol;
  type GetConfigurationPromise = {
    origin: string;
    context: string;
    config?: Record<string, any>;
    error?: Record<string, any>;
  };
  type OpenSessionPromise = {
    origin: string;
    context: string;
    token?: string;
    error?: Record<string, any>;
  };
}

declare class ShapeStim extends VisualStim {
  constructor({
    name,
    win,
    lineWidth,
    lineColor,
    fillColor,
    opacity,
    vertices,
    closeShape,
    pos,
    anchor,
    size,
    ori,
    units,
    contrast,
    depth,
    interpolate,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    lineWidth: number;
    lineColor?: Color;
    fillColor: Color;
    opacity?: number;
    vertices?: Array<number[]>;
    closeShape?: boolean;
    pos?: number[];
    anchor?: string;
    size?: number;
    ori?: number;
    units: string;
    contrast?: number;
    depth?: number;
    interpolate?: boolean;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  _pixiPolygon_px: any;
  _vertices_px: any;
  size: number[];
  setVertices(vertices: Array<number[]>, log?: boolean): void;
  _boundingBox: any;
  anchor: any;
  protected _getPixiPolygon(): any;
  protected _getVertices_px(): Array<number[]>;
}

declare namespace ShapeStim {
  namespace KnownShapes {
    let cross: number[][];
    let star7: number[][];
  }
}

declare class Shelf extends PsychObject {
  static '__#1@#MAX_KEY_LENGTH': number;
  constructor({ psychoJS, autoLog }?: { psychoJS: PsychoJS; autoLog?: boolean });
  _throttlingPeriod_ms: number;
  _lastCallTimestamp: number;
  _lastScheduledCallTimestamp: number;
  getBooleanValue({ key, defaultValue }?: { key: string[]; defaultValue: boolean }): Promise<boolean>;
  setBooleanValue({ key, value }?: { key: string[]; value: boolean }): Promise<boolean>;
  flipBooleanValue({ key }?: { key: string[] }): Promise<boolean>;
  getIntegerValue({ key, defaultValue }?: { key: string[]; defaultValue: number }): Promise<number>;
  setIntegerValue({ key, value }?: { key: string[]; value: number }): Promise<number>;
  addIntegerValue({ key, delta }?: { key: string[]; delta: number }): Promise<number>;
  getTextValue({ key, defaultValue }?: { key: string[]; defaultValue: string }): Promise<string>;
  setTextValue({ key, value }?: { key: string[]; value: string }): Promise<string>;
  getListValue({ key, defaultValue }?: { key: string[]; defaultValue: Array<any> }): Promise<Array<any>>;
  setListValue({ key, value }?: { key: string[]; value: Array<any> }): Promise<Array<any>>;
  appendListValue({ key, elements }?: { key: string[]; elements: any }): Promise<Array<any>>;
  popListValue({ key, index }?: { key: string[]; index?: number }): Promise<any>;
  clearListValue({ key }?: { key: string[] }): Promise<Array<any>>;
  shuffleListValue({ key }?: { key: string[] }): Promise<Array<any>>;
  getDictionaryFieldNames({ key }?: { key: string[] }): Promise<string[]>;
  getDictionaryFieldValue({
    key,
    fieldName,
    defaultValue
  }?: {
    key: string[];
    fieldName: string;
    defaultValue: boolean;
  }): Promise<any>;
  setDictionaryFieldValue({
    key,
    fieldName,
    fieldValue
  }?: {
    key: string[];
    fieldName: string;
    fieldValue: any;
  }): Promise<Record<string, any>>;
  getDictionaryValue({
    key,
    defaultValue
  }?: {
    key: string[];
    defaultValue: Record<string, any>;
  }): Promise<Record<string, any>>;
  setDictionaryValue({ key, value }?: { key: string[]; value: Record<string, any> }): Promise<Record<string, any>>;
  incrementComponent(key: any[], increment: number, callback: any): () => any;
  _status: any;
  counterBalanceSelect({
    key,
    groups,
    groupSizes
  }?: {
    key: string[];
    groups: string[];
    groupSizes: number[];
  }): Promise<{
    string: any;
    boolean: any;
  }>;
  _updateValue(key: string[], type: Shelf.Type, update: any): Promise<any>;
  _getValue(key: string[], type: Shelf.Type, options?: any): Promise<any>;
  _checkAvailability(methodName?: string): any;
  _checkKey(key: object): void;
}

declare namespace Shelf {
  namespace Status {
    let READY: any;
    let BUSY: any;
    let ERROR: any;
  }
  type Status = Symbol;
  namespace Type {
    let INTEGER: any;
    let TEXT: any;
    let DICTIONARY: any;
    let BOOLEAN: any;
    let LIST: any;
  }
  type Type = Symbol;
}

declare function shuffle(array: any[], randomNumberGenerator?: Function, startIndex?: any, endIndex?: any): any[];

declare function sliceArray(array: Array<any>, from?: number, to?: number, step?: number): Array<any>;

declare class Slider {
  constructor({
    name,
    win,
    pos,
    size,
    ori,
    units,
    color,
    markerColor,
    lineColor,
    contrast,
    opacity,
    depth,
    style,
    ticks,
    labels,
    startValue,
    granularity,
    flip,
    readOnly,
    font,
    bold,
    italic,
    fontSize,
    compact,
    clipMask,
    autoDraw,
    autoLog,
    dependentStims
  }?: {
    name: string;
    win: Window_2;
    pos?: number[];
    size: number[];
    markerColor?: any;
    lineColor?: any;
    depth?: any;
    ori?: number;
    units?: string;
    color?: Color;
    startValue?: any;
    contrast?: number;
    opacity?: number;
    style?: string;
    ticks?: number[];
    labels?: number[];
    granularity?: number;
    flip?: boolean;
    readOnly?: boolean;
    font?: string;
    bold?: boolean;
    italic?: boolean;
    fontSize?: number;
    compact?: boolean;
    clipMask: any;
    autoDraw?: boolean;
    autoLog?: boolean;
    dependentStims?: MinimalStim[];
  });
  _needMarkerUpdate: boolean;
  _skin: {};
  _responseClock: Clock;
  _pixiLabels: any[];
  _handlePointerDownBinded: any;
  _handlePointerUpBinded: any;
  _handlePointerMoveBinded: any;
  refresh(): void;
  reset(): void;
  _markerPos: number;
  _history: any[];
  _rating: any;
  status: any;
  _needPixiUpdate: boolean;
  _needUpdate: boolean;
  isMarkerDragging(): boolean;
  getRating(): number | undefined;
  getRT(): number | undefined;
  setReadOnly(readOnly?: boolean, log?: boolean): void;
  setMarkerPos(displayedRating: number, log?: boolean): void;
  setRating(rating: number, log?: boolean): void;
  setOri(ori?: number, log?: boolean): void;
  setAnchor(anchor?: string, log?: boolean): void;
  set borderColor(color: any);
  get borderColor(): any;
  lineColor: any;
  setBorderColor(color: any): void;
  getBorderColor(): any;
  set fillColor(color: any);
  get fillColor(): any;
  markerColor: any;
  setFillColor(color: any): void;
  getFillColor(): any;
  protected _estimateBoundingBox(): void;
  _tickSize_px: number[];
  _fontSize_px: any;
  _barSize_px: number[];
  _markerSize_px: number[];
  _tickPositions_px: number[][];
  _labelPositions_px: any[];
  _boundingBox: any;
  protected _sanitizeAttributes(): void;
  _isSliderStyle: boolean;
  _frozenMarker: boolean;
  _ticks: any;
  _isCategorical: boolean;
  _granularity: number;
  recordRating(rating: number, responseTime?: number, log?: boolean): void;
  release(log?: boolean): void;
  protected _updateIfNeeded(): void;
  anchor: any;
  protected _getPosition_px(): number[];
  protected _updateMarker(): void;
  protected _handlePointerDown(e: any): void;
  _markerDragging: boolean;
  protected _handlePointerMove(e: any): void;
  protected _handlePointerUp(e: any): void;
  protected _addEventListeners(): void;
  protected _removeEventListeners(): void;
  protected _setupSlider(): void;
  _pixi: any;
  _body: any;
  protected _setupBar(): void;
  protected _setupMarker(): void;
  _marker: any;
  protected _setupTicks(): void;
  protected _getTextStyle(): any;
  protected _setupLabels(): void;
  protected _setupStyle(): void;
  _barSize: any[];
  _tickSize: any[];
  _labelAnchor: any;
  _barLineWidth_px: number;
  _barLineColor: any;
  _barFillColor: any;
  _tickType: any;
  _tickColor: any;
  _markerType: any;
  _markerSize: any;
  _labelColor: any;
  _labelOri: number;
  granularity: number;
  protected _ratingToPos(ratings: number[]): Array<number[]>;
  protected _posToRating(pos_px: number[]): number;
  protected _isHorizontal(): boolean;
  protected _granularise(rating: number): number;
}

declare namespace Slider {
  namespace Shape {
    let DISC: any;
    let TRIANGLE: any;
    let LINE: any;
    let BOX: any;
  }
  type Shape = Symbol;
  namespace Style {
    let RATING: any;
    let TRIANGLE_MARKER: any;
    let SLIDER: any;
    let WHITE_ON_BLACK: any;
    let LABELS_45: any;
    let RADIO: any;
  }
  type Style = Symbol;
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
  handler: TrialHandler;
  name: string;
  nStim: number;
  nTotal: number;
  nRemaining: number;
  thisRepN: number;
  thisTrialN: number;
  thisN: number;
  thisIndex: number;
  ran: number;
  finished: number;
  trialAttributes: any;
};

declare function sort(input: any[]): any[];

declare class Sound extends PsychObject {
  constructor({
    name,
    win,
    value,
    octave,
    secs,
    startTime,
    stopTime,
    stereo,
    volume,
    loops,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    value?: number | string;
    octave?: number;
    secs?: number;
    startTime?: number;
    stopTime?: number;
    stereo?: boolean;
    volume?: number;
    loops?: number;
    autoLog?: boolean;
  });
  _player: any;
  status: any;
  play(loops: number, log?: boolean): void;
  stop({ log }?: { log?: boolean }): void;
  getDuration(): number;
  setVolume(volume: number, mute?: boolean, log?: boolean): void;
  setSound(sound: object, log?: boolean): this;
  setValue(value?: number | string, octave?: number, log?: boolean): void;
  setLoops(loops?: number, log?: boolean): void;
  setSecs(secs?: number, log?: boolean): void;
  protected _getPlayer(): SoundPlayer;
}

export declare namespace sound {
  export {
    Sound,
    SoundPlayer,
    TonePlayer,
    TrackPlayer,
    AudioClip,
    AudioClipPlayer,
    Microphone,
    Transcript,
    SpeechRecognition
  };
}

declare class SoundPlayer extends PsychObject {
  constructor(psychoJS: PsychoJS);
  play(loops?: number): void;
  stop(): void;
  getDuration(): void;
  setDuration(duration_s: any): void;
  setLoops(loops: number): void;
  setVolume(volume: number, mute?: boolean): void;
}

declare class SpeechRecognition extends PsychObject {
  constructor({
    psychoJS,
    name,
    bufferSize,
    continuous,
    lang,
    interimResults,
    maxAlternatives,
    tokens,
    clock,
    autoLog
  }?: {
    psychoJS: PsychoJS;
    name: string;
    bufferSize?: number;
    continuous?: string[];
    lang?: string[];
    interimResults?: string[];
    maxAlternatives?: string[];
    tokens?: string[];
    clock?: Clock;
    autoLog?: boolean;
  });
  start(): Promise<any>;
  _status: any;
  stop(): Promise<any>;
  getTranscripts({ transcriptList, clear }?: { transcriptList?: string[]; clear?: boolean }): Transcript[];
  clearTranscripts(): void;
  _circularBuffer: any[];
  _bufferLength: number;
  _bufferIndex: number;
  protected _onChange(): void;
  protected _prepareRecognition(): void;
  _recognition: any;
  _currentSpeechStart: any;
  _currentSpeechEnd: any;
  _recognitionTime: any;
}

declare function sum(input?: any[], start?: number): number;

declare class Survey extends VisualStim {
  static SURVEY_EXPERIMENT_PARAMETERS: string[];
  static SURVEY_FLOW_PLAYBACK_TYPES: {
    DIRECT: string;
    CONDITIONAL: string;
    EMBEDDED_DATA: string;
    RANDOMIZER: string;
    SEQUENTIAL: string;
    ENDSURVEY: string;
  };
  static CAPTIONS: {
    NEXT: string;
  };
  static SURVEY_COMPLETION_CODES: {
    NORMAL: number;
    SKIP_TO_END_OF_BLOCK: number;
    SKIP_TO_END_OF_SURVEY: number;
  };
  static NODE_EXIT_CODES: {
    NORMAL: number;
    BREAK_FLOW: number;
  };
  constructor({
    name,
    win,
    model,
    surveyId,
    pos,
    units,
    ori,
    size,
    depth,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window;
    surveyId?: string;
    model?: any | string;
    units?: string;
    pos?: number[];
    ori?: number;
    size?: number;
    depth?: number;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  isFinished: boolean;
  _isCompletedAll: boolean;
  _questionAnswerTimestamps: {};
  _questionAnswerTimestampClock: Clock;
  _overallSurveyResults: {};
  _surveyData: any;
  _surveyModel: any;
  _expressionsRunner: any;
  _lastPageSwitchHandledIdx: number;
  _variables: {};
  _surveyRunningPromise: any;
  _surveyRunningPromiseResolve: any;
  _surveyRunningPromiseReject: any;
  _onFinishedCallback: () => void;
  size: number[];
  _hasSelfGeneratedSurveyId: boolean;
  get isCompleted(): boolean;
  setModel(model: any | string, log?: boolean): void;
  setSurveyId(surveyId: string, log?: boolean): void;
  setVariables(variables: any, excludedNames?: string[]): void;
  evaluateExpression(expression: string): any;
  onFinished(callback: any): void;
  getResponse(): {};
  save(): Promise<any>;
  _boundingBox: any;
  protected _registerCustomExpressionFunctions(Survey: any, customFuncs?: any[]): void;
  protected _registerWidgets(Survey: any): void;
  protected _registerCustomSurveyProperties(Survey: any): void;
  _registerCustomComponentCallbacks(surveyModel: any): void;
  protected _onQuestionValueChanged(survey: any, questionData: any): void;
  _composeModelWithRandomizedQuestions(
    surveyModel: any,
    inBlockRandomizationSettings: any
  ): {
    pages: {
      elements: any[];
    }[];
  };
  _applyInQuestionRandomization(questionData: any, inQuestionRandomizationSettings: any, surveyData: any): void;
  _processSurveyData(surveyData: any, surveyIdx: any): any;
  protected _onCurrentPageChanging(surveyModel: any, options: any): void;
  protected _onSurveyComplete(surveyModel: any, options: any): void;
  _onFlowComplete(): void;
  _onTextMarkdown(survey: any, options: any): void;
  protected _beginSurvey(surveyData: any, surveyFlowBlock: any): void;
  _runSurveyFlow(surveyBlock: any, surveyData: any, prevBlockResults?: {}): Promise<number>;
  _resetState(): void;
  _handleSignaturePadResize(entries: any): void;
  _addEventListeners(): void;
  _signaturePadRO: ResizeObserver;
  _handleAfterQuestionRender(sender: any, options: any): void;
  _detachResizeObservers(): void;
  protected _initSurveyJS(): void;
  _surveyDivId: string;
}

declare type TEXT_DIRECTION = any;

declare namespace TEXT_DIRECTION {
  let LTR: string;
  let RTL: string;
  let Arabic: string;
}

declare class TextBox extends VisualStim {
  constructor({
    name,
    win,
    pos,
    anchor,
    size,
    units,
    ori,
    opacity,
    depth,
    text,
    placeholder,
    font,
    letterHeight,
    bold,
    italic,
    alignment,
    color,
    contrast,
    flipHoriz,
    flipVert,
    fillColor,
    languageStyle,
    borderColor,
    borderWidth,
    padding,
    editable,
    multiline,
    autofocus,
    clipMask,
    autoDraw,
    autoLog,
    fitToContent
  }?: {
    name: string;
    win: Window_2;
    text?: string;
    font?: string;
    pos?: number[];
    color?: Color;
    opacity?: number;
    depth?: number;
    contrast?: number;
    units?: string;
    ori?: number;
    letterHeight?: number;
    bold?: any;
    italic?: any;
    anchor?: any;
    size?: any;
    placeholder?: any;
    alignment?: any;
    flipHoriz?: any;
    flipVert?: any;
    fillColor?: any;
    languageStyle?: any;
    borderColor?: any;
    borderWidth?: any;
    padding?: any;
    editable?: any;
    multiline?: any;
    autofocus?: any;
    clipMask?: any;
    autoDraw?: any;
    autoLog?: any;
    fitToContent?: any;
  });
  reset(): void;
  clear(): void;
  setAlignment(alignment?: boolean, log?: boolean): void;
  setLanguageStyle(languageStyle?: string, log?: boolean): void;
  setText(text?: string): void;
  _text: any;
  setFont(font?: string, log?: boolean): void;
  setLetterHeight(fontSize?: string, log?: boolean): void;
  getText(): string;
  setColor(color: boolean, log?: boolean): void;
  setFillColor(fillColor: boolean, log?: boolean): void;
  setBorderColor(borderColor: Color, log?: boolean): void;
  setFitToContent(fitToContent: boolean, log?: boolean): void;
  setSize(...args: any[]): void;
  fitToContent: boolean;
  protected _addEventListeners(): void;
  protected _getDefaultLetterHeight(): number;
  protected _getTextInputOptions(): {
    input: {
      display: string;
      flexDirection: string;
      fontFamily: any;
      fontSize: string;
      color: string;
      fontWeight: string;
      fontStyle: string;
      direction: any;
      justifyContent: any;
      textAlign: any;
      padding: string;
      multiline: any;
      text: any;
      height: string;
      width: string;
      maxWidth: string;
      maxHeight: string;
      overflow: string;
      pointerEvents: string;
    };
    box: {
      fill: number;
      alpha: number;
      rounded: number;
      stroke: {
        color: number;
        width: number;
        alpha: number;
      };
    };
  };
  _boundingBox: any;
  text: string;
  anchor: any;
}

declare namespace TextBox {
  let _alignmentToFlexboxMap: any;
  let _defaultLetterHeightMap: any;
  let _defaultSizeMap: any;
}

declare class TextInput extends PIXI.Container {
  constructor(styles: any);
  _input_style: any;
  _box_generator: any;
  _multiline: boolean;
  _anchor: any;
  _box_cache: {};
  _previous: {};
  _dom_added: boolean;
  _dom_visible: boolean;
  _placeholder: string;
  _placeholderColor: number;
  _selection: number[];
  _restrict_value: string;
  set substituteText(substitute: any);
  get substituteText(): any;
  _substituted: any;
  set placeholder(text: string);
  get placeholder(): string;
  set disabled(disabled: any);
  get disabled(): any;
  _disabled: any;
  set maxLength(length: any);
  get maxLength(): any;
  _max_length: any;
  set restrict(regex: any);
  get restrict(): any;
  _restrict_regex: any;
  set text(text: any);
  get text(): any;
  get htmlInput(): HTMLDivElement | HTMLInputElement;
  set anchor(v: any);
  get anchor(): any;
  focus(options?: { preventScroll: boolean }): void;
  blur(): void;
  select(): void;
  setInputStyle(key: any, value: any): void;
  getInputStyle(key: any): string;
  destroy(options: any): void;
  _createDOMInput(): void;
  _dom_input: HTMLDivElement | HTMLInputElement;
  _addListeners(): void;
  _onAnchorUpdate(): void;
  _onInputKeyDown(e: any): void;
  _onInputInput(e: any): void;
  _onInputKeyUp(e: any): void;
  _onFocused(): void;
  _onBlurred(): void;
  _onAdded(): void;
  _onRemoved(): void;
  _setState(state: any): void;
  state: any;
  renderWebGL(renderer: any): void;
  renderCanvas(renderer: any): void;
  render(renderer: any): void;
  _renderInternal(renderer: any): void;
  _resolution: any;
  _last_renderer: any;
  _canvas_bounds: {
    top: any;
    left: any;
    width: any;
    height: any;
  };
  _update(): void;
  _updateBox(): void;
  _box: any;
  _updateSubstitution(): void;
  _updateDOMInput(): void;
  _applyRestriction(): void;
  _needsUpdate(): boolean;
  _needsNewBoxCache(): boolean;
  _createSurrogate(): void;
  _surrogate_hitbox: any;
  _surrogate_mask: any;
  _surrogate: any;
  _updateSurrogate(): void;
  _updateSurrogateHitbox(bounds: any): void;
  _updateSurrogateMask(bounds: any, padding: any): void;
  _destroySurrogate(): void;
  _onSurrogateFocus(): void;
  _ensureFocus(): void;
  _deriveSurrogateStyle(): any;
  _deriveSurrogatePadding(): any;
  _deriveSurrogateText(): any;
  _updateFontMetrics(): void;
  _font_metrics: any;
  _buildBoxCache(): void;
  _destroyBoxCache(): void;
  _hasFocus(): boolean;
  _setDOMInputVisible(visible: any): void;
  _getCanvasBounds(): {
    top: any;
    left: any;
    width: any;
    height: any;
  };
  _getDOMInputBounds(): DOMRect;
  _getDOMRelativeWorldTransform(): any;
  _pixiMatrixToCSS(m: any): string;
  _comparePixiMatrices(m1: any, m2: any): boolean;
  _compareClientRects(r1: any, r2: any): boolean;
}

declare class TextStim extends VisualStim {
  constructor({
    name,
    win,
    text,
    font,
    pos,
    anchor,
    color,
    opacity,
    depth,
    contrast,
    units,
    ori,
    height,
    bold,
    italic,
    alignHoriz,
    alignVert,
    wrapWidth,
    flipHoriz,
    flipVert,
    clipMask,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    text?: string;
    font?: string;
    pos?: number[];
    anchor?: string;
    color?: Color;
    opacity?: number;
    depth?: number;
    contrast?: number;
    units?: string;
    ori: number;
    height?: number;
    bold?: boolean;
    italic?: boolean;
    alignHoriz?: string;
    alignVert?: string;
    wrapWidth: boolean;
    flipHoriz?: boolean;
    flipVert?: boolean;
    clipMask?: any;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  _textMetrics: any;
  anchor: string;
  getTextMetrics(): any;
  protected _getDefaultLetterHeight(): any;
  protected _getDefaultWrapWidth(): any;
  protected getBoundingBox(tight?: boolean): number[];
  _boundingBox: any;
  protected _getTextStyle(): any;
  setColor(color: undefined | null | number, log?: boolean): void;
  _size: number[];
  protected _getAnchor(): number[];
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
  static accept(value: string | number, octave: number): any | boolean;
  constructor({
    psychoJS,
    note,
    secs,
    volume,
    loops,
    soundLibrary,
    autoLog
  }?: {
    psychoJS: PsychoJS;
    secs?: number;
    note?: string | number;
    volume?: number;
    loops?: number;
    soundLibrary?: any;
    autoLog?: any;
  });
  _toneLoop: any;
  getDuration(): number;
  setDuration(secs: number): void;
  duration_s: number;
  _loops: number | boolean;
  _volume: number;
  setTone(value?: string | number, octave?: number): void;
  _note: any;
  play(loops?: any): void;
  _toneId: number;
  protected _initSoundLibrary(): void;
  _synthOtions: {
    oscillator: {
      type: string;
    };
    envelope: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    };
  };
  _synth: any;
  _volumeNode: any;
  _audioContext: any;
}

declare namespace TonePlayer {
  let SoundLibrary: {
    TONE_JS: any;
    AUDIO_CONTEXT: any;
  };
}

declare function toNumerical(obj: any): number | number[];

declare function toString_2(object: any): string;

declare class TrackPlayer extends SoundPlayer {
  static checkValueSupport(value: string): boolean;
  static accept(psychoJS: PsychoJS, value: string): any | boolean;
  constructor({
    psychoJS,
    howl,
    startTime,
    stopTime,
    stereo,
    volume,
    loops
  }?: {
    psychoJS: PsychoJS;
    howl: any;
    startTime?: number;
    stopTime?: number;
    stereo?: boolean;
    volume?: number;
    loops?: number;
  });
  _currentLoopIndex: number;
  getDuration(): number;
  setDuration(duration_s: number): void;
  _volume: number;
  _loops: number;
  setTrack(track: any | string): void;
  _howl: any;
  play(loops: number, fadeDuration?: number): void;
  _id: any;
  stop(fadeDuration?: number): void;
}

declare class Transcript {
  constructor(transcriber: SpeechRecognition, text?: string, confidence?: number);
  text: string;
  confidence: number;
  speechStart: any;
  speechEnd: any;
  time: any;
}

declare class TrialHandler extends PsychObject {
  static fromSnapshot(snapshot: Snapshot): void;
  static importConditions(serverManager: ServerManager, resourceName: string, selection?: any): any;
  constructor({
    psychoJS,
    trialList,
    nReps,
    method,
    extraInfo,
    seed,
    name,
    autoLog
  }?: {
    psychoJS: PsychoJS;
    trialList?: Array<any> | string;
    nReps: number;
    method: any;
    extraInfo: any;
    name?: any;
    seed: number;
    autoLog?: boolean;
  });
  set experimentHandler(exp: any);
  get experimentHandler(): any;
  _experimentHandler: any;
  nStim: any;
  nTotal: number;
  nRemaining: number;
  thisRepN: number;
  thisTrialN: number;
  thisN: number;
  thisIndex: number;
  ran: number;
  order: number;
  _snapshots: any[];
  thisTrial: any;
  _finished: boolean;
  next(): any;
  forEach(callback: any): void;
  getSnapshot(): Snapshot;
  setSeed(seed: boolean, log: boolean): void;
  _randomNumberGenerator: any;
  set finished(isFinished: boolean);
  get finished(): boolean;
  getTrialIndex(): number;
  setTrialIndex(index: number): void;
  getAttributes(): string[];
  getCurrentTrial(): any;
  getTrial(index?: number): any | undefined;
  getFutureTrial(n?: number): any | undefined;
  getEarlierTrial(n?: number): any | undefined;
  addData(key: any, value: any): void;
  protected _prepareTrialList(): void;
  trialList: any;
  protected _prepareSequence(): any;
  _trialSequence: any;
}

declare namespace TrialHandler {
  namespace Method {
    let SEQUENTIAL: any;
    let RANDOM: any;
    let FULL_RANDOM: any;
    let FULLRANDOM: any;
  }
  type Method = Symbol;
}

declare function turnSquareBracketsIntoArrays(input: string, max?: string): any[];

export declare namespace util {
  export {
    MonotonicClock,
    Clock,
    CountdownTimer,
    Color,
    ColorMixin,
    EventEmitter,
    to_pixiPoint,
    PsychObject,
    Scheduler,
    promiseToTupple,
    makeUuid,
    getErrorStack,
    isEmpty,
    detectBrowser,
    toNumerical,
    isNumeric,
    IsPointInsidePolygon,
    shuffle,
    randchoice,
    getPositionFromObject,
    to_px,
    to_norm,
    to_height,
    to_win,
    to_unit,
    toString_2 as toString,
    getRequestError,
    isInt,
    getUrlParameters,
    addInfoFromUrl,
    selectFromArray,
    flattenArray,
    sliceArray,
    offerDataForDownload,
    turnSquareBracketsIntoArrays,
    randint,
    round,
    sum,
    average,
    sort,
    range,
    count,
    pad,
    index,
    extensionFromMimeType,
    getDownloadSpeed,
    loadCss,
    mix,
    TEXT_DIRECTION
  };
}

export declare namespace visual {
  export {
    ButtonStim,
    Form,
    ImageStim,
    GratingStim,
    MovieStim,
    Polygon,
    Rect,
    ShapeStim,
    Slider,
    TextBox,
    TextInput,
    TextStim,
    VisualStim,
    FaceDetector,
    Survey
  };
}

declare class VisualStim extends MinimalStim {
  constructor({
    name,
    win,
    units,
    ori,
    opacity,
    depth,
    pos,
    anchor,
    size,
    clipMask,
    autoDraw,
    autoLog
  }?: {
    name: string;
    win: Window_2;
    units?: string;
    ori?: number;
    opacity?: number;
    depth?: number;
    pos?: number[];
    anchor?: string;
    size?: number;
    clipMask?: any;
    autoDraw?: boolean;
    autoLog?: boolean;
  });
  _needPixiUpdate: boolean;
  refresh(): void;
  setSize(size: undefined | null | number | number[], log?: boolean): void;
  setOri(ori: number, log?: boolean): void;
  _rotationMatrix: number[][];
  setPos(pos: number[], log?: boolean): void;
  setDepth(depth?: number[], log?: boolean): void;
  contains(object: any, units: string): boolean;
  setAnchor(anchor?: string, log?: boolean): void;
  protected _anchorTextToNum(anchorText?: string): number[];
  protected _estimateBoundingBox(): void;
  protected _getBoundingBox_px(): any;
  protected _onChange(withPixi?: boolean, withBoundingBox?: boolean): Function;
}

declare class Window_2 extends PsychObject {
  static checkWebGLSupport(): boolean;
  protected static _resizePixiRenderer(pjsWindow: Window_2, event: any): void;
  constructor({
    psychoJS,
    name,
    fullscr,
    color,
    gamma,
    contrast,
    units,
    waitBlanking,
    autoLog
  }?: {
    psychoJS: PsychoJS;
    name?: string;
    fullscr?: boolean;
    color?: Color;
    gamma?: number;
    contrast?: number;
    units?: string;
    waitBlanking?: boolean;
    autoLog?: boolean;
  });
  get monitorFramePeriod(): number;
  _msgToBeLogged: any[];
  _adjustmentFilter: any;
  _drawList: any[];
  _frameCount: number;
  _flipCallbacks: any[];
  _windowAlreadyInFullScreen: boolean;
  close(): void;
  _renderer: any;
  getActualFrameRate(): number;
  adjustScreenSize(): void;
  closeFullScreen(): void;
  logOnFlip({ msg, level, obj }?: { level?: any; obj?: any; msg: string }): void;
  callOnFlip(flipCallback: any, ...flipCallbackArgs: any[]): void;
  addPixiObject(pixiObject: any): void;
  removePixiObject(pixiObject: any): void;
  render(): void;
  protected _updateIfNeeded(): void;
  _needUpdate: boolean;
  protected _refresh(): void;
  protected _fullRefresh(): void;
  protected _setupPixi(): void;
  _backgroundSprite: any;
  _stimsContainer: any;
  _rootContainer: any;
  _resizeCallback: (e: any) => void;
  protected _writeLogOnFlip(): void;
}

declare function WindowMixin(superclass: any): {
  new (args: any): {
    [x: string]: any;
    _getLengthPix(length: number, integerCoordinates?: boolean): number;
    _getLengthUnits(length_px: number): number;
    _getHorLengthPix(length: number): number;
    _getVerLengthPix(length: number): number;
  };
  [x: string]: any;
};
