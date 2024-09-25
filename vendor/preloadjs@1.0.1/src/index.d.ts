export declare namespace createjs {
  class Event {
    bubbles: boolean;
    cancelable: boolean;
    currentTarget: any;
    data: any;
    defaultPrevented: boolean;
    delta: number;
    error: string;
    eventPhase: number;
    id: string;
    immediatePropagationStopped: boolean;
    item: any;
    loaded: number;
    name: string;
    next: string;
    params: any;
    paused: boolean;
    progress: number;
    propagationStopped: boolean;
    rawResult: any;
    removed: boolean;
    result: any;
    runTime: number;
    src: string;
    target: any;
    time: number;
    timeStamp: number;
    total: number;
    type: string;
    constructor(type: string, bubbles: boolean, cancelable: boolean);
    clone(): Event;
    preventDefault(): void;
    remove(): void;
    set(props: object): Event;
    stopImmediatePropagation(): void;
    stopPropagation(): void;
    toString(): string;
  }

  class EventDispatcher {
    constructor();
    static initialize(target: object): void;
    addEventListener(type: string, listener: (eventObj: object) => any, useCapture?: boolean): (...args: any[]) => any;
    addEventListener(type: string, listener: { handleEvent: (eventObj: object) => any }, useCapture?: boolean): object;
    dispatchEvent(eventObj: Event | object | string, target?: object): boolean;
    hasEventListener(type: string): boolean;
    off(type: string, listener: (eventObj: object) => any, useCapture?: boolean): void;
    off(type: string, listener: { handleEvent: (eventObj: object) => any }, useCapture?: boolean): void;
    off(type: string, listener: (...args: any[]) => any, useCapture?: boolean): void;
    on(
      type: string,
      listener: (eventObj: object) => any,
      scope?: object,
      once?: boolean,
      data?: any,
      useCapture?: boolean
    ): (...args: any[]) => any;
    on(
      type: string,
      listener: { handleEvent: (eventObj: object) => any },
      scope?: object,
      once?: boolean,
      data?: any,
      useCapture?: boolean
    ): object;
    removeAllEventListeners(type?: string): void;
    removeEventListener(type: string, listener: (eventObj: object) => any, useCapture?: boolean): void;
    removeEventListener(type: string, listener: { handleEvent: (eventObj: object) => any }, useCapture?: boolean): void;
    removeEventListener(type: string, listener: (...args: any[]) => any, useCapture?: boolean): void;
    toString(): string;
    willTrigger(type: string): boolean;
  }

  function extend(
    subclass: new (...args: any[]) => any,
    superclass: new (...args: any[]) => any
  ): new (...args: any[]) => any;
  function indexOf(array: any[], searchElement: any): number;
  function promote(subclass: new (...args: any[]) => any, prefix: string): new (...args: any[]) => any;
  function proxy(method: (eventObj: object) => any, scope: object, ...args: any[]): (eventObj: object) => any;
  function proxy(
    method: { handleEvent: (eventObj: object) => boolean },
    scope: object,
    ...args: any[]
  ): (eventObj: object) => any;
  function proxy(
    method: { handleEvent: (eventObj: object) => void },
    scope: object,
    ...args: any[]
  ): (eventObj: object) => any;

  class AbstractLoader extends EventDispatcher {
    static BINARY: string;
    static CSS: string;
    static GET: string;
    static IMAGE: string;
    static JAVASCRIPT: string;
    static JSON: string;
    static JSONP: string;
    static MANIFEST: string;
    static POST: string;
    static SOUND: string;
    static SPRITESHEET: string;
    static SVG: string;
    static TEXT: string;
    static VIDEO: string;
    static XML: string;
    canceled: boolean;
    loaded: boolean;
    progress: number;
    resultFormatter: () => any;
    type: string;
    cancel(): void;
    destroy(): void;
    getItem(value?: string): object;
    getLoadedItems(): object[];
    getResult(value?: any, rawResult?: boolean): object;
    getTag(): object;
    load(): void;
    setTag(tag: object): void;
    toString(): string;
  }

  class AbstractMediaLoader {
    constructor(loadItem: object, preferXHR: boolean, type: string);
  }

  class AbstractRequest {
    constructor(item: LoadItem);
    cancel(): void;
    destroy(): void;
    load(): void;
  }

  class BinaryLoader extends AbstractLoader {
    constructor(loadItem: object);
    static canLoadItem(item: object): boolean;
  }

  class CSSLoader extends AbstractLoader {
    constructor(loadItem: object, preferXHR: boolean);
    canLoadItem(item: object): boolean;
  }

  class DataUtils {
    static parseJSON(value: string): object;
    static parseXML(text: string, type: string): XMLDocument;
  }

  class ErrorEvent {
    data: object;
    message: string;
    title: string;
    constructor(title?: string, message?: string, data?: object);
  }

  class ImageLoader extends AbstractLoader {
    constructor(loadItem: object, preferXHR: boolean);
    static canLoadItem(item: object): boolean;
  }

  class JavaScriptLoader extends AbstractLoader {
    constructor(loadItem: object, preferXHR: boolean);
    static canLoadItem(item: object): boolean;
  }

  class JSONLoader extends AbstractLoader {
    constructor(loadItem: object);
    static canLoadItem(item: object): boolean;
  }

  class JSONPLoader extends AbstractLoader {
    constructor(loadItem: object);
    static canLoadItem(item: object): boolean;
  }

  class LoadItem {
    callback: string;
    crossOrigin: boolean;
    data: object;
    headers: object;
    id: string;
    loadTimeout: number;
    maintainOrder: boolean;
    method: string;
    mimeType: string;
    src: string;
    type: string;
    values: object;
    withCredentials: boolean;
    static create(value: LoadItem | object | string): LoadItem | object;
    set(props: object): LoadItem;
  }

  class LoadQueue extends AbstractLoader {
    maintainScriptOrder: boolean;
    next: LoadQueue;
    stopOnError: boolean;
    constructor(preferXHR?: boolean, basePath?: string, crossOrigin?: boolean | string);
    close(): void;
    getItems(loaded: boolean): object[];
    installPlugin(plugin: any): void;
    loadFile(file: object | string, loadNow?: boolean, basePath?: string): void;
    loadManifest(manifest: any[] | object | string, loadNow?: boolean, basePath?: string): void;
    registerLoader(loader: AbstractLoader): void;
    remove(idsOrUrls: any[] | string): void;
    removeAll(): void;
    reset(): void;
    setMaxConnections(value: number): void;
    setPaused(value: boolean): void;
    setPreferXHR(value: boolean): boolean;
    /** @deprecated - use 'preferXHR' property instead (or setUseXHR()) */
    setUseXHR(value: boolean): void;
    unregisterLoader(loader: AbstractLoader): void;
  }

  class ManifestLoader extends AbstractLoader {
    constructor(loadItem: LoadItem | object);
    static canLoadItem(item: LoadItem | object): boolean;
  }

  class MediaTagRequest {
    constructor(loadItem: LoadItem, tag: HTMLAudioElement | HTMLVideoElement, srcAttribute: string);
  }

  class PreloadJS {
    static buildDate: string;
    static version: string;
  }

  class ProgressEvent {
    loaded: number;
    progress: number;
    total: number;
    constructor(loaded: number, total?: number);
    clone(): ProgressEvent;
  }

  class RequestUtils {
    static ABSOLUTE_PATH: RegExp;
    static EXTENSION_PATT: RegExp;
    static RELATIVE_PATH: RegExp;
    static buildPath(src: string, data?: object): string;
    static formatQueryString(data: object, query?: object[]): string;
    static getTypeByExtension(extension: string): string;
    static isAudioTag(item: object): boolean;
    static isBinary(type: string): boolean;
    static isCrossDomain(item: object): boolean;
    static isImageTag(item: object): boolean;
    static isLocal(item: object): boolean;
    static isText(type: string): boolean;
    static isVideoTag(item: object): boolean;
    static parseURI(path: string): object;
  }

  class SoundLoader extends AbstractLoader {
    constructor(loadItem: object, preferXHR: boolean);
    static canLoadItem(item: object): boolean;
  }

  class SpriteSheetLoader extends AbstractLoader {
    constructor(loadItem: object);
    static canLoadItem(item: object): boolean;
  }

  class SVGLoader extends AbstractLoader {
    constructor(loadItem: object, preferXHR: boolean);
    static canLoadItem(item: object): boolean;
  }

  class TagRequest {}

  class TextLoader extends AbstractLoader {
    constructor(loadItem: object);
    static canLoadItem(item: object): boolean;
  }

  class VideoLoader extends AbstractLoader {
    constructor(loadItem: object, preferXHR: boolean);
    static canLoadItem(item: object): boolean;
  }

  class XHRRequest extends AbstractLoader {
    constructor(item: object);
    getAllResponseHeaders(): string;
    getResponseHeader(header: string): string;
  }

  class XMLLoader extends AbstractLoader {
    constructor(loadItem: object);
    static canLoadItem(item: object): boolean;
  }
}
