interface JQueryAjaxSettings {
  accepts?: any;
  async?: boolean | undefined;
  beforeSend?(jqXHR: JQueryXHR, settings: JQueryAjaxSettings): any;
  cache?: boolean | undefined;
  complete?(jqXHR: JQueryXHR, textStatus: string): any;
  contentType?: any;
  contents?: { [key: string]: any } | undefined;
  context?: any;
  converters?: { [key: string]: any } | undefined;
  crossDomain?: boolean | undefined;
  data?: any;
  dataFilter?(data: any, ty: any): any;
  dataType?: string | undefined;
  error?(jqXHR: JQueryXHR, textStatus: string, errorThrown: string): any;
  global?: boolean | undefined;
  headers?: { [key: string]: any } | undefined;
  ifModified?: boolean | undefined;
  isLocal?: boolean | undefined;
  jsonp?: any;
  jsonpCallback?: any;
  method?: string | undefined;
  mimeType?: string | undefined;
  password?: string | undefined;
  processData?: boolean | undefined;
  scriptCharset?: string | undefined;
  statusCode?: { [key: string]: any } | undefined;
  success?(data: any, textStatus: string, jqXHR: JQueryXHR): any;
  timeout?: number | undefined;
  traditional?: boolean | undefined;
  type?: string | undefined;
  url?: string | undefined;
  username?: string | undefined;
  xhr?: any;
  xhrFields?: { [key: string]: any } | undefined;
}
interface JQueryXHR extends XMLHttpRequest, JQueryPromise<any> {
  abort(statusText?: string): void;
  error(xhr: JQueryXHR, textStatus: string, errorThrown: string): void;
  overrideMimeType(mimeType: string): any;
  responseJSON?: any;
  then<R>(
    doneCallback: (data: any, textStatus: string, jqXHR: JQueryXHR) => JQueryPromise<R> | R,
    failCallback?: (jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => void
  ): JQueryPromise<R>;
}
interface JQueryCallback {
  add(callbacks: Function): JQueryCallback;
  add(callbacks: Function[]): JQueryCallback;
  disable(): JQueryCallback;
  disabled(): boolean;
  empty(): JQueryCallback;
  fire(...arguments: any[]): JQueryCallback;
  fireWith(context?: any, args?: any[]): JQueryCallback;
  fired(): boolean;
  has(callback: Function): boolean;
  lock(): JQueryCallback;
  locked(): boolean;
  remove(callbacks: Function): JQueryCallback;
  remove(callbacks: Function[]): JQueryCallback;
}
interface JQueryGenericPromise<T> {
  then(
    doneFilter: (value?: T, ...values: any[]) => void,
    failFilter?: (...reasons: any[]) => any,
    progressFilter?: (...progression: any[]) => any
  ): JQueryPromise<void>;
  then<U>(
    doneFilter: (value?: T, ...values: any[]) => JQueryPromise<U> | U,
    failFilter?: (...reasons: any[]) => any,
    progressFilter?: (...progression: any[]) => any
  ): JQueryPromise<U>;
}
interface JQueryPromiseCallback<T> {
  (value?: T, ...args: any[]): void;
}
interface JQueryPromise<T> extends JQueryGenericPromise<T> {
  always(
    alwaysCallback1?: Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>,
    ...alwaysCallbackN: Array<Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>>
  ): JQueryPromise<T>;
  done(
    doneCallback1?: Array<JQueryPromiseCallback<T>> | JQueryPromiseCallback<T>,
    ...doneCallbackN: Array<Array<JQueryPromiseCallback<T>> | JQueryPromiseCallback<T>>
  ): JQueryPromise<T>;
  fail(
    failCallback1?: Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>,
    ...failCallbackN: Array<Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>>
  ): JQueryPromise<T>;
  pipe(
    doneFilter?: (x: any) => any,
    failFilter?: (x: any) => any,
    progressFilter?: (x: any) => any
  ): JQueryPromise<any>;
  progress(
    progressCallback1?: Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>,
    ...progressCallbackN: Array<Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>>
  ): JQueryPromise<T>;
  promise(target?: any): JQueryPromise<T>;
  state(): string;
}
interface JQueryDeferred<T> extends JQueryGenericPromise<T> {
  always(
    alwaysCallback1?: Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>,
    ...alwaysCallbackN: Array<Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>>
  ): JQueryDeferred<T>;
  done(
    doneCallback1?: Array<JQueryPromiseCallback<T>> | JQueryPromiseCallback<T>,
    ...doneCallbackN: Array<Array<JQueryPromiseCallback<T>> | JQueryPromiseCallback<T>>
  ): JQueryDeferred<T>;
  fail(
    failCallback1?: Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>,
    ...failCallbackN: Array<Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>>
  ): JQueryDeferred<T>;
  notify(value?: any, ...args: any[]): JQueryDeferred<T>;
  notifyWith(context: any, args?: any[]): JQueryDeferred<T>;
  pipe(
    doneFilter?: (x: any) => any,
    failFilter?: (x: any) => any,
    progressFilter?: (x: any) => any
  ): JQueryPromise<any>;
  progress(
    progressCallback1?: Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>,
    ...progressCallbackN: Array<Array<JQueryPromiseCallback<any>> | JQueryPromiseCallback<any>>
  ): JQueryDeferred<T>;
  promise(target?: any): JQueryPromise<T>;
  reject(value?: any, ...args: any[]): JQueryDeferred<T>;
  rejectWith(context: any, args?: any[]): JQueryDeferred<T>;
  resolve(value?: T, ...args: any[]): JQueryDeferred<T>;
  resolveWith(context: any, args?: T[]): JQueryDeferred<T>;
  state(): string;
}
interface BaseJQueryEventObject extends Event {
  currentTarget: Element;
  data: any;
  delegateTarget: Element;
  isDefaultPrevented(): boolean;
  isImmediatePropagationStopped(): boolean;
  isPropagationStopped(): boolean;
  metaKey: boolean;
  namespace: string;
  originalEvent: Event;
  pageX: number;
  pageY: number;
  preventDefault(): any;
  relatedTarget: Element;
  result: any;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  target: Element;
  which: number;
}
interface JQueryInputEventObject extends BaseJQueryEventObject {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}
interface JQueryMouseEventObject extends JQueryInputEventObject {
  button: number;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
}
interface JQueryKeyEventObject extends JQueryInputEventObject {
  char: string;
  charCode: number;
  key: string;
  keyCode: number;
}
interface JQueryEventObject
  extends BaseJQueryEventObject,
    JQueryInputEventObject,
    JQueryMouseEventObject,
    JQueryKeyEventObject {}
interface JQuerySupport {
  ajax?: boolean | undefined;
  boxModel?: boolean | undefined;
  changeBubbles?: boolean | undefined;
  checkClone?: boolean | undefined;
  checkOn?: boolean | undefined;
  cors?: boolean | undefined;
  cssFloat?: boolean | undefined;
  hrefNormalized?: boolean | undefined;
  htmlSerialize?: boolean | undefined;
  leadingWhitespace?: boolean | undefined;
  noCloneChecked?: boolean | undefined;
  noCloneEvent?: boolean | undefined;
  opacity?: boolean | undefined;
  optDisabled?: boolean | undefined;
  optSelected?: boolean | undefined;
  scriptEval?(): boolean;
  style?: boolean | undefined;
  submitBubbles?: boolean | undefined;
  tbody?: boolean | undefined;
}
interface JQueryParam {
  (obj: any): string;
  (obj: any, traditional: boolean): string;
}
interface JQueryEventConstructor {
  (name: string, eventProperties?: any): JQueryEventObject;
  new (name: string, eventProperties?: any): JQueryEventObject;
}
interface JQueryCoordinates {
  left: number;
  top: number;
}
interface cssPropertySetter {
  (index: number, value?: string): number | string;
}
interface JQueryCssProperties {
  [propertyName: string]: cssPropertySetter | number | string;
}
interface JQuerySerializeArrayElement {
  name: string;
  value: string;
}
interface JQueryAnimationOptions {
  always?: ((animation: JQueryPromise<any>, jumpedToEnd: boolean) => any) | undefined;
  complete?: Function | undefined;
  done?: ((animation: JQueryPromise<any>, jumpedToEnd: boolean) => any) | undefined;
  duration?: any;
  easing?: string | undefined;
  fail?: ((animation: JQueryPromise<any>, jumpedToEnd: boolean) => any) | undefined;
  progress?: ((animation: JQueryPromise<any>, progress: number, remainingMs: number) => any) | undefined;
  queue?: any;
  specialEasing?: Object | undefined;
  start?: ((animation: JQueryPromise<any>) => any) | undefined;
  step?: ((now: number, tween: any) => any) | undefined;
}
interface JQueryEasingFunction {
  (percent: number): number;
}
interface JQueryEasingFunctions {
  [name: string]: JQueryEasingFunction;
  linear: JQueryEasingFunction;
  swing: JQueryEasingFunction;
}
interface JQueryStatic {
  Callbacks(flags?: string): JQueryCallback;
  ajax(settings: JQueryAjaxSettings): JQueryXHR;
  ajax(url: string, settings?: JQueryAjaxSettings): JQueryXHR;
  ajaxPrefilter(
    dataTypes: string,
    handler: (opts: any, originalOpts: JQueryAjaxSettings, jqXHR: JQueryXHR) => any
  ): void;
  ajaxPrefilter(handler: (opts: any, originalOpts: JQueryAjaxSettings, jqXHR: JQueryXHR) => any): void;
  ajaxSettings: JQueryAjaxSettings;
  ajaxSetup(options: JQueryAjaxSettings): void;
  ajaxTransport(
    dataType: string,
    handler: (opts: any, originalOpts: JQueryAjaxSettings, jqXHR: JQueryXHR) => any
  ): void;
  get(
    url: string,
    data?: Object | string,
    success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any,
    dataType?: string
  ): JQueryXHR;
  get(settings: JQueryAjaxSettings): JQueryXHR;
  get(url: string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any, dataType?: string): JQueryXHR;
  getJSON(
    url: string,
    data?: Object | string,
    success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any
  ): JQueryXHR;
  getJSON(url: string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any): JQueryXHR;
  getScript(url: string, success?: (script: string, textStatus: string, jqXHR: JQueryXHR) => any): JQueryXHR;
  holdReady(hold: boolean): void;
  param: JQueryParam;
  post(
    url: string,
    data?: Object | string,
    success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any,
    dataType?: string
  ): JQueryXHR;
  post(settings: JQueryAjaxSettings): JQueryXHR;
  post(url: string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any, dataType?: string): JQueryXHR;
  (selector: string, context?: Element | JQuery): JQuery;
  (element: Element): JQuery;
  (elementArray: Element[]): JQuery;
  (callback: (jQueryAlias?: JQueryStatic) => any): JQuery;
  (object: {}): JQuery;
  (object: JQuery): JQuery;
  (): JQuery;
  (html: string, ownerDocument?: Document): JQuery;
  (html: string, attributes: Object): JQuery;
  Deferred<T>(beforeStart?: (deferred: JQueryDeferred<T>) => any): JQueryDeferred<T>;
  Event: JQueryEventConstructor;
  contains(container: Element, contained: Element): boolean;
  cssHooks: { [key: string]: any };
  cssNumber: any;
  data(element: Element): any;
  data(element: Element, key: string): any;
  data<T>(element: Element, key: string, value: T): T;
  dequeue(element: Element, queueName?: string): void;
  each<T extends Object>(collection: T, callback: (keyInObject: string, valueOfElement: any) => boolean | void): T;
  each<T>(collection: T[], callback: (indexInArray: number, valueOfElement: T) => boolean | void): T[];
  easing: JQueryEasingFunctions;
  error(message: any): JQuery;
  expr: any;
  extend(deep: boolean, target: any, object1?: any, ...objectN: any[]): any;
  extend(target: any, object1?: any, ...objectN: any[]): any;
  readonly fn: JQuery;
  fx: {
    interval: number;
    off: boolean;
    speeds: { fast: number; slow: number };
    step: any;
    stop: () => void;
    tick: () => void;
  };
  globalEval(code: string): any;
  grep<T>(array: T[], func: (elementOfArray?: T, indexInArray?: number) => boolean, invert?: boolean): T[];
  hasData(element: Element): boolean;
  inArray<T>(value: T, array: T[], fromIndex?: number): number;
  isArray(obj: any): obj is any[];
  isEmptyObject(obj: any): boolean;
  isFunction(obj: any): obj is Function;
  isNumeric(value: any): boolean;
  isPlainObject(obj: any): boolean;
  isReady: boolean;
  isWindow(obj: any): obj is Window;
  isXMLDoc(node: Node): boolean;
  makeArray(obj: any): any[];
  map(arrayOrObject: any, callback: (value?: any, indexOrKey?: any) => any): any;
  map<T, U>(array: T[], callback: (elementOfArray?: T, indexInArray?: number) => U): U[];
  merge<T>(first: T[], second: T[]): T[];
  noConflict(removeAll?: boolean): JQueryStatic;
  noop(): any;
  now(): number;
  parseHTML(data: string, context?: Document, keepScripts?: boolean): any[];
  parseHTML(data: string, context?: HTMLElement, keepScripts?: boolean): any[];
  parseJSON(json: string): any;
  parseXML(data: string): XMLDocument;
  proxy(context: Object, name: string, ...additionalArguments: any[]): any;
  proxy(func: (...args: any[]) => any, context: Object, ...additionalArguments: any[]): any;
  queue(element: Element, queueName: string, callback: Function): JQuery;
  queue(element: Element, queueName: string, newQueue: Function[]): JQuery;
  queue(element: Element, queueName?: string): any[];
  removeData(element: Element, name?: string): JQuery;
  support: JQuerySupport;
  trim(str: string): string;
  type(
    obj: any
  ):
    | 'array'
    | 'boolean'
    | 'date'
    | 'error'
    | 'function'
    | 'null'
    | 'number'
    | 'object'
    | 'regexp'
    | 'string'
    | 'symbol'
    | 'undefined';
  unique<T extends Element>(array: T[]): T[];
  when<T>(...deferreds: Array<JQueryPromise<T> | T>): JQueryPromise<T>;
}
interface JQuery {
  [index: number]: HTMLElement;
  add(...elements: Element[]): JQuery;
  add(html: string): JQuery;
  add(obj: JQuery): JQuery;
  add(selector: string, context?: Element): JQuery;
  addBack(selector?: string): JQuery;
  addClass(className: string): JQuery;
  addClass(func: (index: number, className: string) => string): JQuery;
  after(content1: DocumentFragment | Element | JQuery | Text | any[] | string, ...content2: any[]): JQuery;
  after(func: (index: number, html: string) => Element | JQuery | string): JQuery;
  ajaxComplete(handler: (event: JQueryEventObject, XMLHttpRequest: XMLHttpRequest, ajaxOptions: any) => any): JQuery;
  ajaxError(
    handler: (event: JQueryEventObject, jqXHR: JQueryXHR, ajaxSettings: JQueryAjaxSettings, thrownError: any) => any
  ): JQuery;
  ajaxSend(handler: (event: JQueryEventObject, jqXHR: JQueryXHR, ajaxOptions: JQueryAjaxSettings) => any): JQuery;
  ajaxStart(handler: () => any): JQuery;
  ajaxStop(handler: () => any): JQuery;
  ajaxSuccess(
    handler: (event: JQueryEventObject, XMLHttpRequest: XMLHttpRequest, ajaxOptions: JQueryAjaxSettings) => any
  ): JQuery;
  animate(properties: Object, duration?: number | string, complete?: Function): JQuery;
  animate(properties: Object, duration?: number | string, easing?: string, complete?: Function): JQuery;
  animate(properties: Object, options: JQueryAnimationOptions): JQuery;
  append(content1: DocumentFragment | Element | JQuery | Text | any[] | string, ...content2: any[]): JQuery;
  append(func: (index: number, html: string) => Element | JQuery | string): JQuery;
  appendTo(target: Element | JQuery | any[] | string): JQuery;
  attr(attributeName: string): string;
  attr(attributeName: string, func: (index: number, attr: string) => number | string): JQuery;
  attr(attributeName: string, value: null | number | string): JQuery;
  attr(attributes: Object): JQuery;
  before(content1: DocumentFragment | Element | JQuery | Text | any[] | string, ...content2: any[]): JQuery;
  before(func: (index: number, html: string) => Element | JQuery | string): JQuery;
  bind(eventType: string, eventData: any, handler: (eventObject: JQueryEventObject) => any): JQuery;
  bind(eventType: string, eventData: any, preventBubble: boolean): JQuery;
  bind(eventType: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
  bind(eventType: string, preventBubble: boolean): JQuery;
  bind(events: any): JQuery;
  blur(): JQuery;
  blur(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  blur(handler: (eventObject: JQueryEventObject) => any): JQuery;
  change(): JQuery;
  change(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  change(handler: (eventObject: JQueryEventObject) => any): JQuery;
  children(selector?: string): JQuery;
  clearQueue(queueName?: string): JQuery;
  click(): JQuery;
  click(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  click(handler: (eventObject: JQueryEventObject) => any): JQuery;
  clone(withDataAndEvents?: boolean, deepWithDataAndEvents?: boolean): JQuery;
  closest(element: Element): JQuery;
  closest(obj: JQuery): JQuery;
  closest(selector: string): JQuery;
  closest(selector: string, context?: Element): JQuery;
  closest(selectors: any, context?: Element): any[];
  contents(): JQuery;
  context: Element;
  contextmenu(): JQuery;
  contextmenu(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  contextmenu(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  css(properties: JQueryCssProperties): JQuery;
  css(propertyName: string): string;
  css(propertyName: string, value: (index: number, value: string) => number | string): JQuery;
  css(propertyName: string, value: number | string): JQuery;
  css(propertyNames: string[]): any;
  data(): any;
  data(key: string): any;
  data(key: string, value: any): JQuery;
  data(obj: { [key: string]: any }): JQuery;
  dblclick(): JQuery;
  dblclick(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  dblclick(handler: (eventObject: JQueryEventObject) => any): JQuery;
  delay(duration: number, queueName?: string): JQuery;
  delegate(selector: any, eventType: string, eventData: any, handler: (eventObject: JQueryEventObject) => any): JQuery;
  delegate(selector: any, eventType: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
  dequeue(queueName?: string): JQuery;
  detach(selector?: string): JQuery;
  each(func: (index: number, elem: Element) => boolean | void): JQuery;
  empty(): JQuery;
  end(): JQuery;
  eq(index: number): JQuery;
  error(eventData: any, handler: (eventObject: JQueryEventObject) => any): JQuery;
  error(handler: (eventObject: JQueryEventObject) => any): JQuery;
  extend(object: { [method: string]: (...args: any[]) => any }): JQuery;
  fadeIn(duration?: number | string, complete?: Function): JQuery;
  fadeIn(duration?: number | string, easing?: string, complete?: Function): JQuery;
  fadeIn(options: JQueryAnimationOptions): JQuery;
  fadeOut(duration?: number | string, complete?: Function): JQuery;
  fadeOut(duration?: number | string, easing?: string, complete?: Function): JQuery;
  fadeOut(options: JQueryAnimationOptions): JQuery;
  fadeTo(duration: number | string, opacity: number, complete?: Function): JQuery;
  fadeTo(duration: number | string, opacity: number, easing?: string, complete?: Function): JQuery;
  fadeToggle(duration?: number | string, complete?: Function): JQuery;
  fadeToggle(duration?: number | string, easing?: string, complete?: Function): JQuery;
  fadeToggle(options: JQueryAnimationOptions): JQuery;
  filter(element: Element): JQuery;
  filter(func: (index: number, element: Element) => boolean): JQuery;
  filter(obj: JQuery): JQuery;
  filter(selector: string): JQuery;
  find(element: Element): JQuery;
  find(obj: JQuery): JQuery;
  find(selector: string): JQuery;
  finish(queue?: string): JQuery;
  first(): JQuery;
  focus(): JQuery;
  focus(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  focus(handler: (eventObject: JQueryEventObject) => any): JQuery;
  focusin(): JQuery;
  focusin(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;
  focusin(handler: (eventObject: JQueryEventObject) => any): JQuery;
  focusout(): JQuery;
  focusout(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;
  focusout(handler: (eventObject: JQueryEventObject) => any): JQuery;
  get(): HTMLElement[];
  get(index: number): HTMLElement;
  has(contained: Element): JQuery;
  has(selector: string): JQuery;
  hasClass(className: string): boolean;
  height(): number;
  height(func: (index: number, height: number) => number | string): JQuery;
  height(value: number | string): JQuery;
  hide(duration?: number | string, complete?: Function): JQuery;
  hide(duration?: number | string, easing?: string, complete?: Function): JQuery;
  hide(options: JQueryAnimationOptions): JQuery;
  hover(
    handlerIn: (eventObject: JQueryEventObject) => any,
    handlerOut: (eventObject: JQueryEventObject) => any
  ): JQuery;
  hover(handlerInOut: (eventObject: JQueryEventObject) => any): JQuery;
  html(): string;
  html(func: (index: number, oldhtml: string) => string): JQuery;
  html(htmlString: string): JQuery;
  index(): number;
  index(selector: Element | JQuery | string): number;
  innerHeight(): number;
  innerHeight(value: number | string): JQuery;
  innerWidth(): number;
  innerWidth(value: number | string): JQuery;
  insertAfter(target: Element | JQuery | Text | any[] | string): JQuery;
  insertBefore(target: Element | JQuery | Text | any[] | string): JQuery;
  is(elements: any): boolean;
  is(func: (index: number, element: Element) => boolean): boolean;
  is(obj: JQuery): boolean;
  is(selector: string): boolean;
  jquery: string;
  keydown(): JQuery;
  keydown(eventData?: any, handler?: (eventObject: JQueryKeyEventObject) => any): JQuery;
  keydown(handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
  keypress(): JQuery;
  keypress(eventData?: any, handler?: (eventObject: JQueryKeyEventObject) => any): JQuery;
  keypress(handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
  keyup(): JQuery;
  keyup(eventData?: any, handler?: (eventObject: JQueryKeyEventObject) => any): JQuery;
  keyup(handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
  last(): JQuery;
  length: number;
  load(
    url: string,
    data?: Object | string,
    complete?: (responseText: string, textStatus: string, XMLHttpRequest: XMLHttpRequest) => any
  ): JQuery;
  load(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  load(handler: (eventObject: JQueryEventObject) => any): JQuery;
  map(callback: (index: number, domElement: Element) => any): JQuery;
  mousedown(): JQuery;
  mousedown(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mousedown(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseenter(): JQuery;
  mouseenter(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseenter(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseleave(): JQuery;
  mouseleave(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseleave(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mousemove(): JQuery;
  mousemove(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mousemove(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseout(): JQuery;
  mouseout(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseout(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseover(): JQuery;
  mouseover(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseover(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseup(): JQuery;
  mouseup(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  mouseup(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
  next(selector?: string): JQuery;
  nextAll(selector?: string): JQuery;
  nextUntil(element?: Element, filter?: string): JQuery;
  nextUntil(obj?: JQuery, filter?: string): JQuery;
  nextUntil(selector?: string, filter?: string): JQuery;
  not(elements: Element | Element[]): JQuery;
  not(func: (index: number, element: Element) => boolean): JQuery;
  not(obj: JQuery): JQuery;
  not(selector: string): JQuery;
  off(): JQuery;
  off(events: { [key: string]: any }, selector?: string): JQuery;
  off(events: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
  off(events: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
  off(events: string, selector?: string, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  offset(): JQueryCoordinates | undefined;
  offset(coordinates: JQueryCoordinates): JQuery;
  offset(func: (index: number, coords: JQueryCoordinates) => JQueryCoordinates): JQuery;
  offsetParent(): JQuery;
  on(
    events: { [key: string]: (eventObject: JQueryEventObject, ...args: any[]) => any },
    selector?: string,
    data?: any
  ): JQuery;
  on(
    events: string,
    selector: string,
    data: any,
    handler: (eventObject: JQueryEventObject, ...eventData: any[]) => any
  ): JQuery;
  on(events: { [key: string]: (eventObject: JQueryEventObject, ...args: any[]) => any }, data?: any): JQuery;
  on(events: string, data: any, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
  on(events: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
  on(events: string, selector: string, handler: (eventObject: JQueryEventObject, ...eventData: any[]) => any): JQuery;
  one(events: { [key: string]: any }, data?: any): JQuery;
  one(events: { [key: string]: any }, selector?: string, data?: any): JQuery;
  one(events: string, data: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;
  one(events: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
  one(events: string, selector: string, data: any, handler: (eventObject: JQueryEventObject) => any): JQuery;
  one(events: string, selector: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
  outerHeight(includeMargin?: boolean): number;
  outerHeight(value: number | string): JQuery;
  outerWidth(includeMargin?: boolean): number;
  outerWidth(value: number | string): JQuery;
  parent(selector?: string): JQuery;
  parents(selector?: string): JQuery;
  parentsUntil(element?: Element, filter?: string): JQuery;
  parentsUntil(obj?: JQuery, filter?: string): JQuery;
  parentsUntil(selector?: string, filter?: string): JQuery;
  position(): JQueryCoordinates;
  prepend(content1: DocumentFragment | Element | JQuery | Text | any[] | string, ...content2: any[]): JQuery;
  prepend(func: (index: number, html: string) => Element | JQuery | string): JQuery;
  prependTo(target: Element | JQuery | any[] | string): JQuery;
  prev(selector?: string): JQuery;
  prevAll(selector?: string): JQuery;
  prevUntil(element?: Element, filter?: string): JQuery;
  prevUntil(obj?: JQuery, filter?: string): JQuery;
  prevUntil(selector?: string, filter?: string): JQuery;
  promise(type?: string, target?: Object): JQueryPromise<any>;
  prop(properties: Object): JQuery;
  prop(propertyName: string): any;
  prop(propertyName: string, func: (index: number, oldPropertyValue: any) => any): JQuery;
  prop(propertyName: string, value: boolean | number | string): JQuery;
  pushStack(elements: any[]): JQuery;
  pushStack(elements: any[], name: string, arguments: any[]): JQuery;
  queue(callback: Function): JQuery;
  queue(newQueue: Function[]): JQuery;
  queue(queueName: string, callback: Function): JQuery;
  queue(queueName: string, newQueue: Function[]): JQuery;
  queue(queueName?: string): any[];
  ready(handler: (jQueryAlias?: JQueryStatic) => any): JQuery;
  remove(selector?: string): JQuery;
  removeAttr(attributeName: string): JQuery;
  removeClass(className?: string): JQuery;
  removeClass(func: (index: number, className: string) => string): JQuery;
  removeData(): JQuery;
  removeData(list: string[]): JQuery;
  removeData(name: string): JQuery;
  removeProp(propertyName: string): JQuery;
  replaceAll(target: Element | JQuery | any[] | string): JQuery;
  replaceWith(func: () => Element | JQuery): JQuery;
  replaceWith(newContent: Element | JQuery | Text | any[] | string): JQuery;
  resize(): JQuery;
  resize(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;
  resize(handler: (eventObject: JQueryEventObject) => any): JQuery;
  scroll(): JQuery;
  scroll(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;
  scroll(handler: (eventObject: JQueryEventObject) => any): JQuery;
  scrollLeft(): number;
  scrollLeft(value: number): JQuery;
  scrollTop(): number;
  scrollTop(value: number): JQuery;
  select(): JQuery;
  select(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;
  select(handler: (eventObject: JQueryEventObject) => any): JQuery;
  selector: string;
  serialize(): string;
  serializeArray(): JQuerySerializeArrayElement[];
  show(duration?: number | string, complete?: Function): JQuery;
  show(duration?: number | string, easing?: string, complete?: Function): JQuery;
  show(options: JQueryAnimationOptions): JQuery;
  siblings(selector?: string): JQuery;
  slice(start: number, end?: number): JQuery;
  slideDown(duration?: number | string, complete?: Function): JQuery;
  slideDown(duration?: number | string, easing?: string, complete?: Function): JQuery;
  slideDown(options: JQueryAnimationOptions): JQuery;
  slideToggle(duration?: number | string, complete?: Function): JQuery;
  slideToggle(duration?: number | string, easing?: string, complete?: Function): JQuery;
  slideToggle(options: JQueryAnimationOptions): JQuery;
  slideUp(duration?: number | string, complete?: Function): JQuery;
  slideUp(duration?: number | string, easing?: string, complete?: Function): JQuery;
  slideUp(options: JQueryAnimationOptions): JQuery;
  stop(clearQueue?: boolean, jumpToEnd?: boolean): JQuery;
  stop(queue?: string, clearQueue?: boolean, jumpToEnd?: boolean): JQuery;
  submit(): JQuery;
  submit(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  submit(handler: (eventObject: JQueryEventObject) => any): JQuery;
  text(): string;
  text(func: (index: number, text: string) => string): JQuery;
  text(text: boolean | number | string): JQuery;
  toArray(): HTMLElement[];
  toggle(duration?: number | string, complete?: Function): JQuery;
  toggle(duration?: number | string, easing?: string, complete?: Function): JQuery;
  toggle(options: JQueryAnimationOptions): JQuery;
  toggle(showOrHide: boolean): JQuery;
  toggleClass(className: string, swtch?: boolean): JQuery;
  toggleClass(func: (index: number, className: string, swtch: boolean) => string, swtch?: boolean): JQuery;
  toggleClass(swtch?: boolean): JQuery;
  trigger(event: JQueryEventObject, extraParameters?: Object | any[]): JQuery;
  trigger(eventType: string, extraParameters?: Object | any[]): JQuery;
  triggerHandler(event: JQueryEventObject, ...extraParameters: any[]): Object;
  triggerHandler(eventType: string, ...extraParameters: any[]): Object;
  unbind(eventType: string, fls: boolean): JQuery;
  unbind(eventType?: string, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  unbind(evt: any): JQuery;
  undelegate(): JQuery;
  undelegate(namespace: string): JQuery;
  undelegate(selector: string, eventType: string, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  undelegate(selector: string, events: Object): JQuery;
  unload(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;
  unload(handler: (eventObject: JQueryEventObject) => any): JQuery;
  unwrap(): JQuery;
  val(): any;
  val(func: (index: number, value: string) => string): JQuery;
  val(value: number | string | string[]): JQuery;
  width(): number;
  width(func: (index: number, width: number) => number | string): JQuery;
  width(value: number | string): JQuery;
  wrap(func: (index: number) => JQuery | string): JQuery;
  wrap(wrappingElement: Element | JQuery | string): JQuery;
  wrapAll(func: (index: number) => string): JQuery;
  wrapAll(wrappingElement: Element | JQuery | string): JQuery;
  wrapInner(func: (index: number) => string): JQuery;
  wrapInner(wrappingElement: Element | JQuery | string): JQuery;
}

declare var jQuery: JQueryStatic;

export { jQuery, jQuery as $, jQuery as default };
