declare interface BaseJQueryEventObject extends Event {
  currentTarget: Element;
  data: any;
  delegateTarget: Element;
  isDefaultPrevented(): boolean;
  isImmediatePropagationStopped(): boolean;
  isPropagationStopped(): boolean;
  namespace: string;
  originalEvent: Event;
  preventDefault(): any;
  relatedTarget: Element;
  result: any;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  target: Element;
  pageX: number;
  pageY: number;
  which: number;
  metaKey: boolean;
}

declare type _DragEvent = DragEvent;

declare type _Event = Event;

declare type _FocusEvent = FocusEvent;

declare interface JQuery<TElement = HTMLElement> extends Iterable<TElement> {
  [n: number]: TElement;
  add(selector_elements_html_selection: JQuery | JQuery.Node | JQuery.Selector | JQuery.TypeOrArray<Element>): this;
  add(selector: JQuery.Selector, context: Element): this;
  addBack(selector?: JQuery.Selector): this;
  addClass(
    className_function:
      | ((this: TElement, index: number, currentClassName: string) => string)
      | JQuery.TypeOrArray<string>
  ): this;
  after(
    function_functionｰhtml: (
      this: TElement,
      index: number,
      html: string
    ) => JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>
  ): this;
  after(...contents: Array<JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>>): this;
  ajaxComplete(
    handler: (
      this: Document,
      event: JQuery.TriggeredEvent<Document, undefined, Document, Document>,
      jqXHR: JQuery.jqXHR,
      ajaxOptions: JQuery.AjaxSettings
    ) => false | void
  ): this;
  ajaxError(
    handler: (
      this: Document,
      event: JQuery.TriggeredEvent<Document, undefined, Document, Document>,
      jqXHR: JQuery.jqXHR,
      ajaxSettings: JQuery.AjaxSettings,
      thrownError: string
    ) => false | void
  ): this;
  ajaxSend(
    handler: (
      this: Document,
      event: JQuery.TriggeredEvent<Document, undefined, Document, Document>,
      jqXHR: JQuery.jqXHR,
      ajaxOptions: JQuery.AjaxSettings
    ) => false | void
  ): this;
  ajaxStart(handler: (this: Document) => false | void): this;
  ajaxStop(handler: (this: Document) => false | void): this;
  ajaxSuccess(
    handler: (
      this: Document,
      event: JQuery.TriggeredEvent<Document, undefined, Document, Document>,
      jqXHR: JQuery.jqXHR,
      ajaxOptions: JQuery.AjaxSettings,
      data: JQuery.PlainObject
    ) => false | void
  ): this;
  animate(
    properties: JQuery.PlainObject,
    duration: JQuery.Duration,
    easing: string,
    complete?: (this: TElement) => void
  ): this;
  animate(
    properties: JQuery.PlainObject,
    duration_easing: JQuery.Duration | string,
    complete?: (this: TElement) => void
  ): this;
  animate(properties: JQuery.PlainObject, complete?: (this: TElement) => void): this;
  animate(properties: JQuery.PlainObject, options: JQuery.EffectsOptions<TElement>): this;
  append(
    funсtion: (
      this: TElement,
      index: number,
      html: string
    ) => JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>
  ): this;
  append(...contents: Array<JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>>): this;
  appendTo(target: JQuery | JQuery.Selector | JQuery.TypeOrArray<DocumentFragment | Element>): this;
  attr(
    attributeName: string,
    value_function:
      | ((this: TElement, index: number, attr: string) => number | string | undefined | void)
      | null
      | number
      | string
  ): this;
  attr(attributeName: string): string | undefined;
  attr(attributes: JQuery.PlainObject): this;
  before(
    function_functionｰhtml: (
      this: TElement,
      index: number,
      html: string
    ) => JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>
  ): this;
  before(...contents: Array<JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>>): this;
  bind(events: JQuery.TypeEventHandlers<TElement, undefined, TElement, TElement>): this;
  bind<TType extends string, TData>(
    eventType: TType,
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, TType>
  ): this;
  bind<TType extends string>(
    eventType: TType,
    handler_preventBubble:
      | false
      | JQuery.TypeEventHandler<TElement, undefined, TElement, TElement, TType>
      | null
      | undefined
  ): this;
  blur(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'blur'>): this;
  blur<TData>(eventData: TData, handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'blur'>): this;
  change(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'change'>): this;
  change<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'change'>
  ): this;
  children(selector?: JQuery.Selector): JQuery;
  children<K extends keyof HTMLElementTagNameMap>(selector: K): JQuery<HTMLElementTagNameMap[K]>;
  children<K extends keyof SVGElementTagNameMap>(selector: K): JQuery<SVGElementTagNameMap[K]>;
  clearQueue(queueName?: string): this;
  click(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'click'>): this;
  click<TData>(eventData: TData, handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'click'>): this;
  clone(withDataAndEvents?: boolean, deepWithDataAndEvents?: boolean): this;
  closest(selector: JQuery.Selector, context: Element): this;
  closest(selector_selection_element: Element | JQuery | JQuery.Selector): this;
  contents(): JQuery<Comment | Document | TElement | Text>;
  contextmenu(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'contextmenu'>): this;
  contextmenu<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'contextmenu'>
  ): this;
  css(
    properties: JQuery.PlainObject<
      ((this: TElement, index: number, value: string) => number | string | undefined | void) | number | string
    >
  ): this;
  css(
    propertyName: string,
    value_function:
      | ((this: TElement, index: number, value: string) => number | string | undefined | void)
      | number
      | string
  ): this;
  css(propertyName: string): string;
  css(propertyNames: string[]): JQuery.PlainObject<string>;
  data(): JQuery.PlainObject;
  data(key: string): any;
  data(key: string, value: boolean | null | number | object | string | symbol): this;
  data(key: string, value: undefined): any;
  data(obj: JQuery.PlainObject): this;
  dblclick(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'dblclick'>): this;
  dblclick<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'dblclick'>
  ): this;
  delay(duration: JQuery.Duration, queueName?: string): this;
  delegate(selector: JQuery.Selector, events: JQuery.TypeEventHandlers<TElement, undefined, any, any>): this;
  delegate<TType extends string, TData>(
    selector: JQuery.Selector,
    eventType: TType,
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, any, any, TType>
  ): this;
  delegate<TType extends string>(
    selector: JQuery.Selector,
    eventType: TType,
    handler: false | JQuery.TypeEventHandler<TElement, undefined, any, any, TType>
  ): this;
  dequeue(queueName?: string): this;
  detach(selector?: JQuery.Selector): this;
  each(funсtion: (this: TElement, index: number, element: TElement) => false | void): this;
  empty(): this;
  end(): this;
  eq(index: number): this;
  even(): this;
  extend(obj: object): this;
  fadeIn(
    duration_easing_complete_options?:
      | ((this: TElement) => void)
      | JQuery.Duration
      | JQuery.EffectsOptions<TElement>
      | string
  ): this;
  fadeIn(duration: JQuery.Duration, easing: string, complete?: (this: TElement) => void): this;
  fadeIn(duration_easing: JQuery.Duration | string, complete: (this: TElement) => void): this;
  fadeOut(
    duration_easing_complete_options?:
      | ((this: TElement) => void)
      | JQuery.Duration
      | JQuery.EffectsOptions<TElement>
      | string
  ): this;
  fadeOut(duration: JQuery.Duration, easing: string, complete?: (this: TElement) => void): this;
  fadeOut(duration_easing: JQuery.Duration | string, complete: (this: TElement) => void): this;
  fadeTo(duration: JQuery.Duration, opacity: number, complete?: (this: TElement) => void): this;
  fadeTo(duration: JQuery.Duration, opacity: number, easing: string, complete?: (this: TElement) => void): this;
  fadeToggle(
    duration_easing_complete_options?:
      | ((this: TElement) => void)
      | JQuery.Duration
      | JQuery.EffectsOptions<TElement>
      | string
  ): this;
  fadeToggle(duration: JQuery.Duration, easing: string, complete?: (this: TElement) => void): this;
  fadeToggle(duration_easing: JQuery.Duration | string, complete: (this: TElement) => void): this;
  filter(
    selector_elements_selection_function:
      | ((this: TElement, index: number, element: TElement) => boolean)
      | JQuery
      | JQuery.Selector
      | JQuery.TypeOrArray<Element>
  ): this;
  find<E extends HTMLElement>(selector_element: E | Element | JQuery.Selector | JQuery<E>): JQuery<E>;
  find<K extends keyof HTMLElementTagNameMap>(selector_element: JQuery<K> | K): JQuery<HTMLElementTagNameMap[K]>;
  find<K extends keyof SVGElementTagNameMap>(selector_element: JQuery<K> | K): JQuery<SVGElementTagNameMap[K]>;
  finish(queue?: string): this;
  first(): this;
  focus(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'focus'>): this;
  focus<TData>(eventData: TData, handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'focus'>): this;
  focusin(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'focusin'>): this;
  focusin<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'focusin'>
  ): this;
  focusout(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'focusout'>): this;
  focusout<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'focusout'>
  ): this;
  get(): TElement[];
  get(index: number): TElement | undefined;
  has(selector_contained: Element | string): this;
  hasClass(className: string): boolean;
  height(): number | undefined;
  height(value_function: ((this: TElement, index: number, height: number) => number | string) | number | string): this;
  hide(
    duration_complete_options?: ((this: TElement) => void) | JQuery.Duration | JQuery.EffectsOptions<TElement>
  ): this;
  hide(duration: JQuery.Duration, easing: string, complete: (this: TElement) => void): this;
  hide(duration: JQuery.Duration, easing_complete: ((this: TElement) => void) | string): this;
  hover(
    handlerIn: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mouseenter'>,
    handlerOut: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mouseleave'>
  ): this;
  hover(
    handlerInOut: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mouseenter' | 'mouseleave'>
  ): this;
  html(
    htmlString_function:
      | ((this: TElement, index: number, oldhtml: JQuery.htmlString) => JQuery.htmlString | JQuery.Node)
      | JQuery.htmlString
      | JQuery.Node
  ): this;
  html(): string;
  index(selector_element?: Element | JQuery | JQuery.Selector): number;
  innerHeight(
    value_function: ((this: TElement, index: number, height: number) => number | string) | number | string
  ): this;
  innerHeight(): number | undefined;
  innerWidth(
    value_function: ((this: TElement, index: number, width: number) => number | string) | number | string
  ): this;
  innerWidth(): number | undefined;
  insertAfter(target: JQuery.Selector | JQuery.TypeOrArray<Node> | JQuery<Node>): this;
  insertBefore(target: JQuery.Selector | JQuery.TypeOrArray<Node> | JQuery<Node>): this;
  is(
    selector_function_selection_elements:
      | ((this: TElement, index: number, element: TElement) => boolean)
      | JQuery
      | JQuery.Selector
      | JQuery.TypeOrArray<Element>
  ): boolean;
  jquery: string;
  keydown(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'keydown'>): this;
  keydown<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'keydown'>
  ): this;
  keypress(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'keypress'>): this;
  keypress<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'keypress'>
  ): this;
  keyup(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'keyup'>): this;
  keyup<TData>(eventData: TData, handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'keyup'>): this;
  last(): this;
  length: number;
  load(
    url: string,
    complete_data?:
      | ((this: TElement, responseText: string, textStatus: JQuery.Ajax.TextStatus, jqXHR: JQuery.jqXHR) => void)
      | JQuery.PlainObject
      | string
  ): this;
  load(
    url: string,
    data: JQuery.PlainObject | string,
    complete: (this: TElement, responseText: string, textStatus: JQuery.Ajax.TextStatus, jqXHR: JQuery.jqXHR) => void
  ): this;
  map<TReturn>(
    callback: (this: TElement, index: number, domElement: TElement) => JQuery.TypeOrArray<TReturn> | null | undefined
  ): JQuery<TReturn>;
  mousedown(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mousedown'>): this;
  mousedown<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'mousedown'>
  ): this;
  mouseenter(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mouseenter'>): this;
  mouseenter<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'mouseenter'>
  ): this;
  mouseleave(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mouseleave'>): this;
  mouseleave<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'mouseleave'>
  ): this;
  mousemove(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mousemove'>): this;
  mousemove<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'mousemove'>
  ): this;
  mouseout(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mouseout'>): this;
  mouseout<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'mouseout'>
  ): this;
  mouseover(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mouseover'>): this;
  mouseover<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'mouseover'>
  ): this;
  mouseup(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'mouseup'>): this;
  mouseup<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'mouseup'>
  ): this;
  next(selector?: JQuery.Selector): this;
  nextAll(selector?: string): this;
  nextUntil(selector_element?: Element | JQuery | JQuery.Selector, filter?: JQuery.Selector): this;
  not(
    selector_function_selection:
      | ((this: TElement, index: number, element: TElement) => boolean)
      | JQuery
      | JQuery.Selector
      | JQuery.TypeOrArray<Element>
  ): this;
  odd(): this;
  off(event?: JQuery.TriggeredEvent<TElement>): this;
  off(events: JQuery.TypeEventHandlers<TElement, any, any, any>, selector?: JQuery.Selector): this;
  off<TType extends string>(
    events: TType,
    selector: JQuery.Selector,
    handler: false | JQuery.TypeEventHandler<TElement, any, any, any, TType>
  ): this;
  off<TType extends string>(
    events: TType,
    selector_handler?: false | JQuery.Selector | JQuery.TypeEventHandler<TElement, any, any, any, TType>
  ): this;
  offset(
    coordinates_function:
      | ((this: TElement, index: number, coords: JQuery.Coordinates) => JQuery.CoordinatesPartial)
      | JQuery.CoordinatesPartial
  ): this;
  offset(): JQuery.Coordinates | undefined;
  offsetParent(): this;
  on(
    events: string,
    selector: JQuery.Selector | null | undefined,
    data: any,
    handler: (event: JQueryEventObject) => void
  ): this;
  on(events: JQuery.TypeEventHandlers<TElement, undefined, any, any>, selector: JQuery.Selector): this;
  on(events: JQuery.TypeEventHandlers<TElement, undefined, TElement, TElement>): this;
  on(events: string, handler: (event: JQueryEventObject) => void): this;
  on(events: string, selector_data: any, handler: (event: JQueryEventObject) => void): this;
  on<TData>(
    events: JQuery.TypeEventHandlers<TElement, TData, TElement, TElement>,
    selector: null | undefined,
    data: TData
  ): this;
  on<TData>(events: JQuery.TypeEventHandlers<TElement, TData, any, any>, selector: JQuery.Selector, data: TData): this;
  on<TData>(events: JQuery.TypeEventHandlers<TElement, TData, TElement, TElement>, data: TData): this;
  on<TType extends string, TData>(
    events: TType,
    data: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, TType>
  ): this;
  on<TType extends string, TData>(
    events: TType,
    selector: JQuery.Selector,
    data: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, any, any, TType>
  ): this;
  on<TType extends string, TData>(
    events: TType,
    selector: null | undefined,
    data: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, TType>
  ): this;
  on<TType extends string>(
    events: TType,
    handler: false | JQuery.TypeEventHandler<TElement, undefined, TElement, TElement, TType>
  ): this;
  on<TType extends string>(
    events: TType,
    selector: JQuery.Selector,
    handler: false | JQuery.TypeEventHandler<TElement, undefined, any, any, TType>
  ): this;
  one(events: JQuery.TypeEventHandlers<TElement, undefined, any, any>, selector: JQuery.Selector): this;
  one(events: JQuery.TypeEventHandlers<TElement, undefined, TElement, TElement>): this;
  one<TData>(
    events: JQuery.TypeEventHandlers<TElement, TData, TElement, TElement>,
    selector: null | undefined,
    data: TData
  ): this;
  one<TData>(events: JQuery.TypeEventHandlers<TElement, TData, any, any>, selector: JQuery.Selector, data: TData): this;
  one<TData>(events: JQuery.TypeEventHandlers<TElement, TData, TElement, TElement>, data: TData): this;
  one<TType extends string, TData>(
    events: TType,
    data: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, TType>
  ): this;
  one<TType extends string, TData>(
    events: TType,
    selector: JQuery.Selector,
    data: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, any, any, TType>
  ): this;
  one<TType extends string, TData>(
    events: TType,
    selector: null | undefined,
    data: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, TType>
  ): this;
  one<TType extends string>(
    events: TType,
    handler: false | JQuery.TypeEventHandler<TElement, undefined, TElement, TElement, TType>
  ): this;
  one<TType extends string>(
    events: TType,
    selector: JQuery.Selector,
    handler: false | JQuery.TypeEventHandler<TElement, undefined, any, any, TType>
  ): this;
  outerHeight(
    value_function: ((this: TElement, index: number, height: number) => number | string) | number | string,
    includeMargin?: boolean
  ): this;
  outerHeight(includeMargin?: boolean): number | undefined;
  outerWidth(
    value_function: ((this: TElement, index: number, width: number) => number | string) | number | string,
    includeMargin?: boolean
  ): this;
  outerWidth(includeMargin?: boolean): number | undefined;
  parent(selector?: JQuery.Selector): this;
  parents<E extends HTMLElement>(selector?: JQuery.Selector): JQuery<E>;
  parents<K extends keyof HTMLElementTagNameMap>(selector: JQuery<K> | K): JQuery<HTMLElementTagNameMap[K]>;
  parents<K extends keyof SVGElementTagNameMap>(selector: JQuery<K> | K): JQuery<SVGElementTagNameMap[K]>;
  parentsUntil(selector_element?: Element | JQuery | JQuery.Selector, filter?: JQuery.Selector): this;
  position(): JQuery.Coordinates;
  prepend(
    funсtion: (
      this: TElement,
      index: number,
      html: string
    ) => JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>
  ): this;
  prepend(...contents: Array<JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>>): this;
  prependTo(target: JQuery | JQuery.Selector | JQuery.TypeOrArray<DocumentFragment | Element>): this;
  prev(selector?: JQuery.Selector): this;
  prevAll(selector?: JQuery.Selector): this;
  prevUntil(selector_element?: Element | JQuery | JQuery.Selector, filter?: JQuery.Selector): this;
  promise(type?: string): JQuery.Promise<this>;
  promise<T extends object>(target: T): JQuery.Promise<this> & T;
  promise<T extends object>(type: string, target: T): JQuery.Promise<this> & T;
  prop(
    propertyName: string,
    value_function:
      | ((this: TElement, index: number, oldPropertyValue: any) => any)
      | boolean
      | null
      | number
      | object
      | string
      | symbol
      | undefined
  ): this;
  prop(properties: JQuery.PlainObject): this;
  prop(propertyName: string): any;
  pushStack(elements: ArrayLike<Element>): this;
  pushStack(elements: ArrayLike<Element>, name: string, args: any[]): this;
  queue(newQueue: JQuery.TypeOrArray<JQuery.QueueFunction<TElement>>): this;
  queue(queueName: string, newQueue: JQuery.TypeOrArray<JQuery.QueueFunction<TElement>>): this;
  queue(queueName?: string): JQuery.Queue<Node>;
  ready(handler: ($: JQueryStatic) => void): this;
  remove(selector?: string): this;
  removeAttr(attributeName: string): this;
  removeClass(
    className_function?: ((this: TElement, index: number, className: string) => string) | JQuery.TypeOrArray<string>
  ): this;
  removeData(name?: JQuery.TypeOrArray<string>): this;
  removeProp(propertyName: string): this;
  replaceAll(target: JQuery | JQuery.Selector | JQuery.TypeOrArray<Element>): this;
  replaceWith(
    newContent_function:
      | ((
          this: TElement,
          index: number,
          oldhtml: JQuery.htmlString
        ) => JQuery.htmlString | JQuery.Node | JQuery.TypeOrArray<Element> | JQuery<JQuery.Node>)
      | JQuery.htmlString
      | JQuery.Node
      | JQuery.TypeOrArray<Element>
      | JQuery<JQuery.Node>
  ): this;
  resize(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'resize'>): this;
  resize<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'resize'>
  ): this;
  scroll(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'scroll'>): this;
  scroll<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'scroll'>
  ): this;
  scrollLeft(): number | undefined;
  scrollLeft(value: number): this;
  scrollTop(): number | undefined;
  scrollTop(value: number): this;
  select(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'select'>): this;
  select<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'select'>
  ): this;
  serialize(): string;
  serializeArray(): JQuery.NameValuePair[];
  show(
    duration_complete_options?: ((this: TElement) => void) | JQuery.Duration | JQuery.EffectsOptions<TElement>
  ): this;
  show(duration: JQuery.Duration, easing: string, complete: (this: TElement) => void): this;
  show(duration: JQuery.Duration, easing_complete: ((this: TElement) => void) | string): this;
  siblings(selector?: JQuery.Selector): this;
  slice(start: number, end?: number): this;
  slideDown(
    duration_easing_complete_options?:
      | ((this: TElement) => void)
      | JQuery.Duration
      | JQuery.EffectsOptions<TElement>
      | string
  ): this;
  slideDown(duration: JQuery.Duration, easing: string, complete?: (this: TElement) => void): this;
  slideDown(duration_easing: JQuery.Duration | string, complete: (this: TElement) => void): this;
  slideToggle(
    duration_easing_complete_options?:
      | ((this: TElement) => void)
      | JQuery.Duration
      | JQuery.EffectsOptions<TElement>
      | string
  ): this;
  slideToggle(duration: JQuery.Duration, easing: string, complete?: (this: TElement) => void): this;
  slideToggle(duration_easing: JQuery.Duration | string, complete: (this: TElement) => void): this;
  slideUp(
    duration_easing_complete_options?:
      | ((this: TElement) => void)
      | JQuery.Duration
      | JQuery.EffectsOptions<TElement>
      | string
  ): this;
  slideUp(duration: JQuery.Duration, easing: string, complete?: (this: TElement) => void): this;
  slideUp(duration_easing: JQuery.Duration | string, complete: (this: TElement) => void): this;
  stop(clearQueue?: boolean, jumpToEnd?: boolean): this;
  stop(queue: string, clearQueue?: boolean, jumpToEnd?: boolean): this;
  submit(handler?: false | JQuery.TypeEventHandler<TElement, null, TElement, TElement, 'submit'>): this;
  submit<TData>(
    eventData: TData,
    handler: JQuery.TypeEventHandler<TElement, TData, TElement, TElement, 'submit'>
  ): this;
  text(
    text_function:
      | ((this: TElement, index: number, text: string) => boolean | number | string)
      | boolean
      | number
      | string
  ): this;
  text(): string;
  toArray(): TElement[];
  toggle(
    duration_complete_options_display?:
      | ((this: TElement) => void)
      | boolean
      | JQuery.Duration
      | JQuery.EffectsOptions<TElement>
  ): this;
  toggle(duration: JQuery.Duration, complete: (this: TElement) => void): this;
  toggle(duration: JQuery.Duration, easing: string, complete?: (this: TElement) => void): this;
  toggleClass(state?: boolean): this;
  toggleClass<TState extends boolean>(
    className_function:
      | ((this: TElement, index: number, className: string, state: TState) => string)
      | JQuery.TypeOrArray<string>,
    state?: TState
  ): this;
  trigger(
    eventType_event: JQuery.Event | string,
    extraParameters?: any[] | boolean | JQuery.PlainObject | number | string
  ): this;
  triggerHandler(
    eventType_event: JQuery.Event | string,
    extraParameters?: any[] | boolean | JQuery.PlainObject | number | string
  ): any;
  unbind(event?: JQuery.TriggeredEvent<TElement> | string): this;
  unbind<TType extends string>(
    event: TType,
    handler: false | JQuery.TypeEventHandler<TElement, any, TElement, TElement, TType>
  ): this;
  undelegate(
    selector: JQuery.Selector,
    eventType_events: JQuery.TypeEventHandlers<TElement, any, any, any> | string
  ): this;
  undelegate(namespace?: string): this;
  undelegate<TType extends string>(
    selector: JQuery.Selector,
    eventType: TType,
    handler: false | JQuery.TypeEventHandler<TElement, any, any, any, TType>
  ): this;
  unwrap(selector?: string): this;
  val():
    | (TElement extends { type: 'select-one' } & HTMLSelectElement
        ? string
        : TElement extends { type: 'select-multiple' } & HTMLSelectElement
          ? string[]
          : TElement extends HTMLSelectElement
            ? string | string[]
            : TElement extends { value: number | string }
              ? TElement['value']
              : number | string | string[])
    | undefined;
  val(value_function: ((this: TElement, index: number, value: string) => string) | number | string | string[]): this;
  width(): number | undefined;
  width(value_function: ((this: TElement, index: number, value: number) => number | string) | number | string): this;
  wrap(
    wrappingElement_function: ((this: TElement, index: number) => JQuery | string) | Element | JQuery | JQuery.Selector
  ): this;
  wrapAll(wrappingElement_function: ((this: TElement) => JQuery | string) | Element | JQuery | JQuery.Selector): this;
  wrapInner(
    wrappingElement_function:
      | ((this: TElement, index: number) => Element | JQuery | string)
      | Element
      | JQuery
      | JQuery.Selector
  ): this;
}

declare namespace JQuery {
  type TypeOrArray<T> = T | T[];
  type Node = Comment | Document | DocumentFragment | Element | Text;
  type htmlString = string;
  type Selector = string;
  interface PlainObject<T = any> {
    [key: string]: T;
  }
  interface Selectors extends Sizzle.Selectors {
    ':': Sizzle.Selectors.PseudoFunctions;
    filter: Sizzle.Selectors.FilterFunctions;
  }
  interface AjaxSettings<TContext = any> extends Ajax.AjaxSettingsBase<TContext> {
    url?: string | undefined;
  }
  interface UrlAjaxSettings<TContext = any> extends Ajax.AjaxSettingsBase<TContext> {
    url: string;
  }
  namespace Ajax {
    type SuccessTextStatus = 'nocontent' | 'notmodified' | 'success';
    type ErrorTextStatus = 'abort' | 'error' | 'parsererror' | 'timeout';
    type TextStatus = ErrorTextStatus | SuccessTextStatus;
    type SuccessCallback<TContext> = (this: TContext, data: any, textStatus: SuccessTextStatus, jqXHR: jqXHR) => void;
    type ErrorCallback<TContext> = (
      this: TContext,
      jqXHR: jqXHR,
      textStatus: ErrorTextStatus,
      errorThrown: string
    ) => void;
    type CompleteCallback<TContext> = (this: TContext, jqXHR: jqXHR, textStatus: TextStatus) => void;
    interface AjaxSettingsBase<TContext> {
      accepts?: PlainObject<string> | undefined;
      async?: boolean | undefined;
      beforeSend?(this: TContext, jqXHR: jqXHR, settings: this): false | void;
      cache?: boolean | undefined;
      complete?: TypeOrArray<CompleteCallback<TContext>> | undefined;
      contents?: PlainObject<RegExp> | undefined;
      contentType?: false | string | undefined;
      context?: TContext | undefined;
      converters?: PlainObject<((value: any) => any) | true> | undefined;
      crossDomain?: boolean | undefined;
      data?: PlainObject | string | undefined;
      dataFilter?(data: string, type: string): any;
      dataType?: 'html' | 'json' | 'jsonp' | 'script' | 'text' | 'xml' | string | undefined;
      enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain' | undefined;
      error?: TypeOrArray<ErrorCallback<TContext>> | undefined;
      global?: boolean | undefined;
      headers?: PlainObject<null | string | undefined> | undefined;
      ifModified?: boolean | undefined;
      isLocal?: boolean | undefined;
      jsonp?: false | string | undefined;
      jsonpCallback?: ((this: TContext) => string) | string | undefined;
      method?: string | undefined;
      mimeType?: string | undefined;
      password?: string | undefined;
      processData?: boolean | undefined;
      scriptCharset?: string | undefined;
      statusCode?: StatusCodeCallbacks<TContext> | undefined;
      success?: TypeOrArray<SuccessCallback<TContext>> | undefined;
      timeout?: number | undefined;
      traditional?: boolean | undefined;
      type?: string | undefined;
      username?: string | undefined;
      xhr?(): XMLHttpRequest;
      xhrFields?: undefined | XHRFields;
    }
    type StatusCodeCallbacks<TContext> = {
      200?: SuccessCallback<TContext> | undefined;
      201?: SuccessCallback<TContext> | undefined;
      202?: SuccessCallback<TContext> | undefined;
      203?: SuccessCallback<TContext> | undefined;
      204?: SuccessCallback<TContext> | undefined;
      205?: SuccessCallback<TContext> | undefined;
      206?: SuccessCallback<TContext> | undefined;
      207?: SuccessCallback<TContext> | undefined;
      208?: SuccessCallback<TContext> | undefined;
      209?: SuccessCallback<TContext> | undefined;
      210?: SuccessCallback<TContext> | undefined;
      211?: SuccessCallback<TContext> | undefined;
      212?: SuccessCallback<TContext> | undefined;
      213?: SuccessCallback<TContext> | undefined;
      214?: SuccessCallback<TContext> | undefined;
      215?: SuccessCallback<TContext> | undefined;
      216?: SuccessCallback<TContext> | undefined;
      217?: SuccessCallback<TContext> | undefined;
      218?: SuccessCallback<TContext> | undefined;
      219?: SuccessCallback<TContext> | undefined;
      220?: SuccessCallback<TContext> | undefined;
      221?: SuccessCallback<TContext> | undefined;
      222?: SuccessCallback<TContext> | undefined;
      223?: SuccessCallback<TContext> | undefined;
      224?: SuccessCallback<TContext> | undefined;
      225?: SuccessCallback<TContext> | undefined;
      226?: SuccessCallback<TContext> | undefined;
      227?: SuccessCallback<TContext> | undefined;
      228?: SuccessCallback<TContext> | undefined;
      229?: SuccessCallback<TContext> | undefined;
      230?: SuccessCallback<TContext> | undefined;
      231?: SuccessCallback<TContext> | undefined;
      232?: SuccessCallback<TContext> | undefined;
      233?: SuccessCallback<TContext> | undefined;
      234?: SuccessCallback<TContext> | undefined;
      235?: SuccessCallback<TContext> | undefined;
      236?: SuccessCallback<TContext> | undefined;
      237?: SuccessCallback<TContext> | undefined;
      238?: SuccessCallback<TContext> | undefined;
      239?: SuccessCallback<TContext> | undefined;
      240?: SuccessCallback<TContext> | undefined;
      241?: SuccessCallback<TContext> | undefined;
      242?: SuccessCallback<TContext> | undefined;
      243?: SuccessCallback<TContext> | undefined;
      244?: SuccessCallback<TContext> | undefined;
      245?: SuccessCallback<TContext> | undefined;
      246?: SuccessCallback<TContext> | undefined;
      247?: SuccessCallback<TContext> | undefined;
      248?: SuccessCallback<TContext> | undefined;
      249?: SuccessCallback<TContext> | undefined;
      250?: SuccessCallback<TContext> | undefined;
      251?: SuccessCallback<TContext> | undefined;
      252?: SuccessCallback<TContext> | undefined;
      253?: SuccessCallback<TContext> | undefined;
      254?: SuccessCallback<TContext> | undefined;
      255?: SuccessCallback<TContext> | undefined;
      256?: SuccessCallback<TContext> | undefined;
      257?: SuccessCallback<TContext> | undefined;
      258?: SuccessCallback<TContext> | undefined;
      259?: SuccessCallback<TContext> | undefined;
      260?: SuccessCallback<TContext> | undefined;
      261?: SuccessCallback<TContext> | undefined;
      262?: SuccessCallback<TContext> | undefined;
      263?: SuccessCallback<TContext> | undefined;
      264?: SuccessCallback<TContext> | undefined;
      265?: SuccessCallback<TContext> | undefined;
      266?: SuccessCallback<TContext> | undefined;
      267?: SuccessCallback<TContext> | undefined;
      268?: SuccessCallback<TContext> | undefined;
      269?: SuccessCallback<TContext> | undefined;
      270?: SuccessCallback<TContext> | undefined;
      271?: SuccessCallback<TContext> | undefined;
      272?: SuccessCallback<TContext> | undefined;
      273?: SuccessCallback<TContext> | undefined;
      274?: SuccessCallback<TContext> | undefined;
      275?: SuccessCallback<TContext> | undefined;
      276?: SuccessCallback<TContext> | undefined;
      277?: SuccessCallback<TContext> | undefined;
      278?: SuccessCallback<TContext> | undefined;
      279?: SuccessCallback<TContext> | undefined;
      280?: SuccessCallback<TContext> | undefined;
      281?: SuccessCallback<TContext> | undefined;
      282?: SuccessCallback<TContext> | undefined;
      283?: SuccessCallback<TContext> | undefined;
      284?: SuccessCallback<TContext> | undefined;
      285?: SuccessCallback<TContext> | undefined;
      286?: SuccessCallback<TContext> | undefined;
      287?: SuccessCallback<TContext> | undefined;
      288?: SuccessCallback<TContext> | undefined;
      289?: SuccessCallback<TContext> | undefined;
      290?: SuccessCallback<TContext> | undefined;
      291?: SuccessCallback<TContext> | undefined;
      292?: SuccessCallback<TContext> | undefined;
      293?: SuccessCallback<TContext> | undefined;
      294?: SuccessCallback<TContext> | undefined;
      295?: SuccessCallback<TContext> | undefined;
      296?: SuccessCallback<TContext> | undefined;
      297?: SuccessCallback<TContext> | undefined;
      298?: SuccessCallback<TContext> | undefined;
      299?: SuccessCallback<TContext> | undefined;
      300?: ErrorCallback<TContext> | undefined;
      301?: ErrorCallback<TContext> | undefined;
      302?: ErrorCallback<TContext> | undefined;
      303?: ErrorCallback<TContext> | undefined;
      304?: SuccessCallback<TContext> | undefined;
      305?: ErrorCallback<TContext> | undefined;
      306?: ErrorCallback<TContext> | undefined;
      307?: ErrorCallback<TContext> | undefined;
      308?: ErrorCallback<TContext> | undefined;
      309?: ErrorCallback<TContext> | undefined;
      310?: ErrorCallback<TContext> | undefined;
      311?: ErrorCallback<TContext> | undefined;
      312?: ErrorCallback<TContext> | undefined;
      313?: ErrorCallback<TContext> | undefined;
      314?: ErrorCallback<TContext> | undefined;
      315?: ErrorCallback<TContext> | undefined;
      316?: ErrorCallback<TContext> | undefined;
      317?: ErrorCallback<TContext> | undefined;
      318?: ErrorCallback<TContext> | undefined;
      319?: ErrorCallback<TContext> | undefined;
      320?: ErrorCallback<TContext> | undefined;
      321?: ErrorCallback<TContext> | undefined;
      322?: ErrorCallback<TContext> | undefined;
      323?: ErrorCallback<TContext> | undefined;
      324?: ErrorCallback<TContext> | undefined;
      325?: ErrorCallback<TContext> | undefined;
      326?: ErrorCallback<TContext> | undefined;
      327?: ErrorCallback<TContext> | undefined;
      328?: ErrorCallback<TContext> | undefined;
      329?: ErrorCallback<TContext> | undefined;
      330?: ErrorCallback<TContext> | undefined;
      331?: ErrorCallback<TContext> | undefined;
      332?: ErrorCallback<TContext> | undefined;
      333?: ErrorCallback<TContext> | undefined;
      334?: ErrorCallback<TContext> | undefined;
      335?: ErrorCallback<TContext> | undefined;
      336?: ErrorCallback<TContext> | undefined;
      337?: ErrorCallback<TContext> | undefined;
      338?: ErrorCallback<TContext> | undefined;
      339?: ErrorCallback<TContext> | undefined;
      340?: ErrorCallback<TContext> | undefined;
      341?: ErrorCallback<TContext> | undefined;
      342?: ErrorCallback<TContext> | undefined;
      343?: ErrorCallback<TContext> | undefined;
      344?: ErrorCallback<TContext> | undefined;
      345?: ErrorCallback<TContext> | undefined;
      346?: ErrorCallback<TContext> | undefined;
      347?: ErrorCallback<TContext> | undefined;
      348?: ErrorCallback<TContext> | undefined;
      349?: ErrorCallback<TContext> | undefined;
      350?: ErrorCallback<TContext> | undefined;
      351?: ErrorCallback<TContext> | undefined;
      352?: ErrorCallback<TContext> | undefined;
      353?: ErrorCallback<TContext> | undefined;
      354?: ErrorCallback<TContext> | undefined;
      355?: ErrorCallback<TContext> | undefined;
      356?: ErrorCallback<TContext> | undefined;
      357?: ErrorCallback<TContext> | undefined;
      358?: ErrorCallback<TContext> | undefined;
      359?: ErrorCallback<TContext> | undefined;
      360?: ErrorCallback<TContext> | undefined;
      361?: ErrorCallback<TContext> | undefined;
      362?: ErrorCallback<TContext> | undefined;
      363?: ErrorCallback<TContext> | undefined;
      364?: ErrorCallback<TContext> | undefined;
      365?: ErrorCallback<TContext> | undefined;
      366?: ErrorCallback<TContext> | undefined;
      367?: ErrorCallback<TContext> | undefined;
      368?: ErrorCallback<TContext> | undefined;
      369?: ErrorCallback<TContext> | undefined;
      370?: ErrorCallback<TContext> | undefined;
      371?: ErrorCallback<TContext> | undefined;
      372?: ErrorCallback<TContext> | undefined;
      373?: ErrorCallback<TContext> | undefined;
      374?: ErrorCallback<TContext> | undefined;
      375?: ErrorCallback<TContext> | undefined;
      376?: ErrorCallback<TContext> | undefined;
      377?: ErrorCallback<TContext> | undefined;
      378?: ErrorCallback<TContext> | undefined;
      379?: ErrorCallback<TContext> | undefined;
      380?: ErrorCallback<TContext> | undefined;
      381?: ErrorCallback<TContext> | undefined;
      382?: ErrorCallback<TContext> | undefined;
      383?: ErrorCallback<TContext> | undefined;
      384?: ErrorCallback<TContext> | undefined;
      385?: ErrorCallback<TContext> | undefined;
      386?: ErrorCallback<TContext> | undefined;
      387?: ErrorCallback<TContext> | undefined;
      388?: ErrorCallback<TContext> | undefined;
      389?: ErrorCallback<TContext> | undefined;
      390?: ErrorCallback<TContext> | undefined;
      391?: ErrorCallback<TContext> | undefined;
      392?: ErrorCallback<TContext> | undefined;
      393?: ErrorCallback<TContext> | undefined;
      394?: ErrorCallback<TContext> | undefined;
      395?: ErrorCallback<TContext> | undefined;
      396?: ErrorCallback<TContext> | undefined;
      397?: ErrorCallback<TContext> | undefined;
      398?: ErrorCallback<TContext> | undefined;
      399?: ErrorCallback<TContext> | undefined;
      400?: ErrorCallback<TContext> | undefined;
      401?: ErrorCallback<TContext> | undefined;
      402?: ErrorCallback<TContext> | undefined;
      403?: ErrorCallback<TContext> | undefined;
      404?: ErrorCallback<TContext> | undefined;
      405?: ErrorCallback<TContext> | undefined;
      406?: ErrorCallback<TContext> | undefined;
      407?: ErrorCallback<TContext> | undefined;
      408?: ErrorCallback<TContext> | undefined;
      409?: ErrorCallback<TContext> | undefined;
      410?: ErrorCallback<TContext> | undefined;
      411?: ErrorCallback<TContext> | undefined;
      412?: ErrorCallback<TContext> | undefined;
      413?: ErrorCallback<TContext> | undefined;
      414?: ErrorCallback<TContext> | undefined;
      415?: ErrorCallback<TContext> | undefined;
      416?: ErrorCallback<TContext> | undefined;
      417?: ErrorCallback<TContext> | undefined;
      418?: ErrorCallback<TContext> | undefined;
      419?: ErrorCallback<TContext> | undefined;
      420?: ErrorCallback<TContext> | undefined;
      421?: ErrorCallback<TContext> | undefined;
      422?: ErrorCallback<TContext> | undefined;
      423?: ErrorCallback<TContext> | undefined;
      424?: ErrorCallback<TContext> | undefined;
      425?: ErrorCallback<TContext> | undefined;
      426?: ErrorCallback<TContext> | undefined;
      427?: ErrorCallback<TContext> | undefined;
      428?: ErrorCallback<TContext> | undefined;
      429?: ErrorCallback<TContext> | undefined;
      430?: ErrorCallback<TContext> | undefined;
      431?: ErrorCallback<TContext> | undefined;
      432?: ErrorCallback<TContext> | undefined;
      433?: ErrorCallback<TContext> | undefined;
      434?: ErrorCallback<TContext> | undefined;
      435?: ErrorCallback<TContext> | undefined;
      436?: ErrorCallback<TContext> | undefined;
      437?: ErrorCallback<TContext> | undefined;
      438?: ErrorCallback<TContext> | undefined;
      439?: ErrorCallback<TContext> | undefined;
      440?: ErrorCallback<TContext> | undefined;
      441?: ErrorCallback<TContext> | undefined;
      442?: ErrorCallback<TContext> | undefined;
      443?: ErrorCallback<TContext> | undefined;
      444?: ErrorCallback<TContext> | undefined;
      445?: ErrorCallback<TContext> | undefined;
      446?: ErrorCallback<TContext> | undefined;
      447?: ErrorCallback<TContext> | undefined;
      448?: ErrorCallback<TContext> | undefined;
      449?: ErrorCallback<TContext> | undefined;
      450?: ErrorCallback<TContext> | undefined;
      451?: ErrorCallback<TContext> | undefined;
      452?: ErrorCallback<TContext> | undefined;
      453?: ErrorCallback<TContext> | undefined;
      454?: ErrorCallback<TContext> | undefined;
      455?: ErrorCallback<TContext> | undefined;
      456?: ErrorCallback<TContext> | undefined;
      457?: ErrorCallback<TContext> | undefined;
      458?: ErrorCallback<TContext> | undefined;
      459?: ErrorCallback<TContext> | undefined;
      460?: ErrorCallback<TContext> | undefined;
      461?: ErrorCallback<TContext> | undefined;
      462?: ErrorCallback<TContext> | undefined;
      463?: ErrorCallback<TContext> | undefined;
      464?: ErrorCallback<TContext> | undefined;
      465?: ErrorCallback<TContext> | undefined;
      466?: ErrorCallback<TContext> | undefined;
      467?: ErrorCallback<TContext> | undefined;
      468?: ErrorCallback<TContext> | undefined;
      469?: ErrorCallback<TContext> | undefined;
      470?: ErrorCallback<TContext> | undefined;
      471?: ErrorCallback<TContext> | undefined;
      472?: ErrorCallback<TContext> | undefined;
      473?: ErrorCallback<TContext> | undefined;
      474?: ErrorCallback<TContext> | undefined;
      475?: ErrorCallback<TContext> | undefined;
      476?: ErrorCallback<TContext> | undefined;
      477?: ErrorCallback<TContext> | undefined;
      478?: ErrorCallback<TContext> | undefined;
      479?: ErrorCallback<TContext> | undefined;
      480?: ErrorCallback<TContext> | undefined;
      481?: ErrorCallback<TContext> | undefined;
      482?: ErrorCallback<TContext> | undefined;
      483?: ErrorCallback<TContext> | undefined;
      484?: ErrorCallback<TContext> | undefined;
      485?: ErrorCallback<TContext> | undefined;
      486?: ErrorCallback<TContext> | undefined;
      487?: ErrorCallback<TContext> | undefined;
      488?: ErrorCallback<TContext> | undefined;
      489?: ErrorCallback<TContext> | undefined;
      490?: ErrorCallback<TContext> | undefined;
      491?: ErrorCallback<TContext> | undefined;
      492?: ErrorCallback<TContext> | undefined;
      493?: ErrorCallback<TContext> | undefined;
      494?: ErrorCallback<TContext> | undefined;
      495?: ErrorCallback<TContext> | undefined;
      496?: ErrorCallback<TContext> | undefined;
      497?: ErrorCallback<TContext> | undefined;
      498?: ErrorCallback<TContext> | undefined;
      499?: ErrorCallback<TContext> | undefined;
      500?: ErrorCallback<TContext> | undefined;
      501?: ErrorCallback<TContext> | undefined;
      502?: ErrorCallback<TContext> | undefined;
      503?: ErrorCallback<TContext> | undefined;
      504?: ErrorCallback<TContext> | undefined;
      505?: ErrorCallback<TContext> | undefined;
      506?: ErrorCallback<TContext> | undefined;
      507?: ErrorCallback<TContext> | undefined;
      508?: ErrorCallback<TContext> | undefined;
      509?: ErrorCallback<TContext> | undefined;
      510?: ErrorCallback<TContext> | undefined;
      511?: ErrorCallback<TContext> | undefined;
      512?: ErrorCallback<TContext> | undefined;
      513?: ErrorCallback<TContext> | undefined;
      514?: ErrorCallback<TContext> | undefined;
      515?: ErrorCallback<TContext> | undefined;
      516?: ErrorCallback<TContext> | undefined;
      517?: ErrorCallback<TContext> | undefined;
      518?: ErrorCallback<TContext> | undefined;
      519?: ErrorCallback<TContext> | undefined;
      520?: ErrorCallback<TContext> | undefined;
      521?: ErrorCallback<TContext> | undefined;
      522?: ErrorCallback<TContext> | undefined;
      523?: ErrorCallback<TContext> | undefined;
      524?: ErrorCallback<TContext> | undefined;
      525?: ErrorCallback<TContext> | undefined;
      526?: ErrorCallback<TContext> | undefined;
      527?: ErrorCallback<TContext> | undefined;
      528?: ErrorCallback<TContext> | undefined;
      529?: ErrorCallback<TContext> | undefined;
      530?: ErrorCallback<TContext> | undefined;
      531?: ErrorCallback<TContext> | undefined;
      532?: ErrorCallback<TContext> | undefined;
      533?: ErrorCallback<TContext> | undefined;
      534?: ErrorCallback<TContext> | undefined;
      535?: ErrorCallback<TContext> | undefined;
      536?: ErrorCallback<TContext> | undefined;
      537?: ErrorCallback<TContext> | undefined;
      538?: ErrorCallback<TContext> | undefined;
      539?: ErrorCallback<TContext> | undefined;
      540?: ErrorCallback<TContext> | undefined;
      541?: ErrorCallback<TContext> | undefined;
      542?: ErrorCallback<TContext> | undefined;
      543?: ErrorCallback<TContext> | undefined;
      544?: ErrorCallback<TContext> | undefined;
      545?: ErrorCallback<TContext> | undefined;
      546?: ErrorCallback<TContext> | undefined;
      547?: ErrorCallback<TContext> | undefined;
      548?: ErrorCallback<TContext> | undefined;
      549?: ErrorCallback<TContext> | undefined;
      550?: ErrorCallback<TContext> | undefined;
      551?: ErrorCallback<TContext> | undefined;
      552?: ErrorCallback<TContext> | undefined;
      553?: ErrorCallback<TContext> | undefined;
      554?: ErrorCallback<TContext> | undefined;
      555?: ErrorCallback<TContext> | undefined;
      556?: ErrorCallback<TContext> | undefined;
      557?: ErrorCallback<TContext> | undefined;
      558?: ErrorCallback<TContext> | undefined;
      559?: ErrorCallback<TContext> | undefined;
      560?: ErrorCallback<TContext> | undefined;
      561?: ErrorCallback<TContext> | undefined;
      562?: ErrorCallback<TContext> | undefined;
      563?: ErrorCallback<TContext> | undefined;
      564?: ErrorCallback<TContext> | undefined;
      565?: ErrorCallback<TContext> | undefined;
      566?: ErrorCallback<TContext> | undefined;
      567?: ErrorCallback<TContext> | undefined;
      568?: ErrorCallback<TContext> | undefined;
      569?: ErrorCallback<TContext> | undefined;
      570?: ErrorCallback<TContext> | undefined;
      571?: ErrorCallback<TContext> | undefined;
      572?: ErrorCallback<TContext> | undefined;
      573?: ErrorCallback<TContext> | undefined;
      574?: ErrorCallback<TContext> | undefined;
      575?: ErrorCallback<TContext> | undefined;
      576?: ErrorCallback<TContext> | undefined;
      577?: ErrorCallback<TContext> | undefined;
      578?: ErrorCallback<TContext> | undefined;
      579?: ErrorCallback<TContext> | undefined;
      580?: ErrorCallback<TContext> | undefined;
      581?: ErrorCallback<TContext> | undefined;
      582?: ErrorCallback<TContext> | undefined;
      583?: ErrorCallback<TContext> | undefined;
      584?: ErrorCallback<TContext> | undefined;
      585?: ErrorCallback<TContext> | undefined;
      586?: ErrorCallback<TContext> | undefined;
      587?: ErrorCallback<TContext> | undefined;
      588?: ErrorCallback<TContext> | undefined;
      589?: ErrorCallback<TContext> | undefined;
      590?: ErrorCallback<TContext> | undefined;
      591?: ErrorCallback<TContext> | undefined;
      592?: ErrorCallback<TContext> | undefined;
      593?: ErrorCallback<TContext> | undefined;
      594?: ErrorCallback<TContext> | undefined;
      595?: ErrorCallback<TContext> | undefined;
      596?: ErrorCallback<TContext> | undefined;
      597?: ErrorCallback<TContext> | undefined;
      598?: ErrorCallback<TContext> | undefined;
      599?: ErrorCallback<TContext> | undefined;
    } & {
      [index: number]: ErrorCallback<TContext> | SuccessCallback<TContext>;
    };
    interface XHRFields
      extends Partial<Pick<XMLHttpRequest, 'onreadystatechange' | 'responseType' | 'timeout' | 'withCredentials'>> {
      msCaching?: string | undefined;
    }
  }
  interface Transport {
    send(headers: PlainObject, completeCallback: Transport.SuccessCallback): void;
    abort(): void;
  }
  namespace Transport {
    type SuccessCallback = (
      status: number,
      statusText: Ajax.TextStatus,
      responses?: PlainObject,
      headers?: string
    ) => void;
  }
  interface jqXHR<TResolve = any>
    extends Promise3<
        TResolve,
        jqXHR<TResolve>,
        never,
        Ajax.SuccessTextStatus,
        Ajax.ErrorTextStatus,
        never,
        jqXHR<TResolve>,
        string,
        never
      >,
      Pick<
        XMLHttpRequest,
        | 'abort'
        | 'getAllResponseHeaders'
        | 'getResponseHeader'
        | 'overrideMimeType'
        | 'readyState'
        | 'responseText'
        | 'setRequestHeader'
        | 'status'
        | 'statusText'
      >,
      Partial<Pick<XMLHttpRequest, 'responseXML'>> {
    responseJSON?: any;
    abort(statusText?: string): void;
    state(): 'pending' | 'rejected' | 'resolved';
    statusCode(map: Ajax.StatusCodeCallbacks<any>): void;
  }
  namespace jqXHR {
    interface DoneCallback<TResolve = any, TjqXHR = jqXHR<TResolve>>
      extends Deferred.Callback3<TResolve, Ajax.SuccessTextStatus, TjqXHR> {}
    interface FailCallback<TjqXHR> extends Deferred.Callback3<TjqXHR, Ajax.ErrorTextStatus, string> {}
    interface AlwaysCallback<TResolve = any, TjqXHR = jqXHR<TResolve>>
      extends Deferred.Callback3<TjqXHR | TResolve, Ajax.TextStatus, string | TjqXHR> {}
  }
  interface CallbacksStatic {
    <T extends Function>(flags?: string): Callbacks<T>;
  }
  interface Callbacks<T extends Function = Function> {
    add(callback: TypeOrArray<T>, ...callbacks: Array<TypeOrArray<T>>): this;
    disable(): this;
    disabled(): boolean;
    empty(): this;
    fire(...args: any[]): this;
    fired(): boolean;
    fireWith(context: object, args?: ArrayLike<any>): this;
    has(callback?: T): boolean;
    lock(): this;
    locked(): boolean;
    remove(...callbacks: T[]): this;
  }
  type CSSHook<TElement> = Partial<_CSSHook<TElement>> &
    (Pick<_CSSHook<TElement>, 'get'> | Pick<_CSSHook<TElement>, 'set'>);
  interface _CSSHook<TElement> {
    get(elem: TElement, computed: any, extra: any): any;
    set(elem: TElement, value: any): void;
  }
  interface CSSHooks {
    [propertyName: string]: CSSHook<HTMLElement>;
  }
  interface Thenable<T> extends PromiseLike<T> {}
  interface PromiseBase<TR, TJ, TN, UR, UJ, UN, VR, VJ, VN, SR, SJ, SN> {
    always(
      alwaysCallback: TypeOrArray<Deferred.CallbackBase<TJ | TR, UJ | UR, VJ | VR, SJ | SR>>,
      ...alwaysCallbacks: Array<TypeOrArray<Deferred.CallbackBase<TJ | TR, UJ | UR, VJ | VR, SJ | SR>>>
    ): this;
    done(
      doneCallback: TypeOrArray<Deferred.CallbackBase<TR, UR, VR, SR>>,
      ...doneCallbacks: Array<TypeOrArray<Deferred.CallbackBase<TR, UR, VR, SR>>>
    ): this;
    fail(
      failCallback: TypeOrArray<Deferred.CallbackBase<TJ, UJ, VJ, SJ>>,
      ...failCallbacks: Array<TypeOrArray<Deferred.CallbackBase<TJ, UJ, VJ, SJ>>>
    ): this;
    progress(
      progressCallback: TypeOrArray<Deferred.CallbackBase<TN, UN, VN, SN>>,
      ...progressCallbacks: Array<TypeOrArray<Deferred.CallbackBase<TN, UN, VN, SN>>>
    ): this;
    promise<TTarget extends object>(target: TTarget): this & TTarget;
    promise(): this;
    state(): 'pending' | 'rejected' | 'resolved';
    pipe<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: (
        t: TR,
        u: UR,
        v: VR,
        ...s: SR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: (
        t: TJ,
        u: UJ,
        v: VJ,
        ...s: SJ[]
      ) => AJF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<AJF>,
      progressFilter: (
        t: TN,
        u: UN,
        v: VN,
        ...s: SN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARD | ARF | ARP,
      AJD | AJF | AJP,
      AND | ANF | ANP,
      BRD | BRF | BRP,
      BJD | BJF | BJP,
      BND | BNF | BNP,
      CRD | CRF | CRP,
      CJD | CJF | CJP,
      CND | CNF | CNP,
      RRD | RRF | RRP,
      RJD | RJF | RJP,
      RND | RNF | RNP
    >;
    pipe<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: null,
      failFilter: (
        t: TJ,
        u: UJ,
        v: VJ,
        ...s: SJ[]
      ) => AJF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<AJF>,
      progressFilter: (
        t: TN,
        u: UN,
        v: VN,
        ...s: SN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARF | ARP,
      AJF | AJP,
      ANF | ANP,
      BRF | BRP,
      BJF | BJP,
      BNF | BNP,
      CRF | CRP,
      CJF | CJP,
      CNF | CNP,
      RRF | RRP,
      RJF | RJP,
      RNF | RNP
    >;
    pipe<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: (
        t: TR,
        u: UR,
        v: VR,
        ...s: SR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: null,
      progressFilter: (
        t: TN,
        u: UN,
        v: VN,
        ...s: SN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARD | ARP,
      AJD | AJP,
      AND | ANP,
      BRD | BRP,
      BJD | BJP,
      BND | BNP,
      CRD | CRP,
      CJD | CJP,
      CND | CNP,
      RRD | RRP,
      RJD | RJP,
      RND | RNP
    >;
    pipe<
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: null,
      failFilter: null,
      progressFilter?: (
        t: TN,
        u: UN,
        v: VN,
        ...s: SN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP>;
    pipe<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      doneFilter: (
        t: TR,
        u: UR,
        v: VR,
        ...s: SR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: (
        t: TJ,
        u: UJ,
        v: VJ,
        ...s: SJ[]
      ) => AJF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<AJF>,
      progressFilter?: null
    ): PromiseBase<
      ARD | ARF,
      AJD | AJF,
      AND | ANF,
      BRD | BRF,
      BJD | BJF,
      BND | BNF,
      CRD | CRF,
      CJD | CJF,
      CND | CNF,
      RRD | RRF,
      RJD | RJF,
      RND | RNF
    >;
    pipe<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      doneFilter: null,
      failFilter: (
        t: TJ,
        u: UJ,
        v: VJ,
        ...s: SJ[]
      ) => AJF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<AJF>,
      progressFilter?: null
    ): PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF>;
    pipe<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never
    >(
      doneFilter: (
        t: TR,
        u: UR,
        v: VR,
        ...s: SR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter?: null,
      progressFilter?: null
    ): PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND>;
    then<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: (
        t: TR,
        u: UR,
        v: VR,
        ...s: SR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: (
        t: TJ,
        u: UJ,
        v: VJ,
        ...s: SJ[]
      ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>,
      progressFilter: (
        t: TN,
        u: UN,
        v: VN,
        ...s: SN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARD | ARF | ARP,
      AJD | AJF | AJP,
      AND | ANF | ANP,
      BRD | BRF | BRP,
      BJD | BJF | BJP,
      BND | BNF | BNP,
      CRD | CRF | CRP,
      CJD | CJF | CJP,
      CND | CNF | CNP,
      RRD | RRF | RRP,
      RJD | RJF | RJP,
      RND | RNF | RNP
    >;
    then<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: null,
      failFilter: (
        t: TJ,
        u: UJ,
        v: VJ,
        ...s: SJ[]
      ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>,
      progressFilter: (
        t: TN,
        u: UN,
        v: VN,
        ...s: SN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARF | ARP,
      AJF | AJP,
      ANF | ANP,
      BRF | BRP,
      BJF | BJP,
      BNF | BNP,
      CRF | CRP,
      CJF | CJP,
      CNF | CNP,
      RRF | RRP,
      RJF | RJP,
      RNF | RNP
    >;
    then<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: (
        t: TR,
        u: UR,
        v: VR,
        ...s: SR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: null,
      progressFilter: (
        t: TN,
        u: UN,
        v: VN,
        ...s: SN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARD | ARP,
      AJD | AJP,
      AND | ANP,
      BRD | BRP,
      BJD | BJP,
      BND | BNP,
      CRD | CRP,
      CJD | CJP,
      CND | CNP,
      RRD | RRP,
      RJD | RJP,
      RND | RNP
    >;
    then<
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: null,
      failFilter: null,
      progressFilter?: (
        t: TN,
        u: UN,
        v: VN,
        ...s: SN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP>;
    then<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      doneFilter: (
        t: TR,
        u: UR,
        v: VR,
        ...s: SR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: (
        t: TJ,
        u: UJ,
        v: VJ,
        ...s: SJ[]
      ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>,
      progressFilter?: null
    ): PromiseBase<
      ARD | ARF,
      AJD | AJF,
      AND | ANF,
      BRD | BRF,
      BJD | BJF,
      BND | BNF,
      CRD | CRF,
      CJD | CJF,
      CND | CNF,
      RRD | RRF,
      RJD | RJF,
      RND | RNF
    >;
    then<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      doneFilter: null,
      failFilter: (
        t: TJ,
        u: UJ,
        v: VJ,
        ...s: SJ[]
      ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>,
      progressFilter?: null
    ): PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF>;
    then<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never
    >(
      doneFilter: (
        t: TR,
        u: UR,
        v: VR,
        ...s: SR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter?: null,
      progressFilter?: null
    ): PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND>;
    catch<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      failFilter?:
        | ((
            t: TJ,
            u: UJ,
            v: VJ,
            ...s: SJ[]
          ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>)
        | null
    ): PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF>;
  }
  interface Promise3<TR, TJ, TN, UR, UJ, UN, VR, VJ, VN>
    extends PromiseBase<TR, TJ, TN, UR, UJ, UN, VR, VJ, VN, never, never, never> {}
  interface Promise2<TR, TJ, TN, UR, UJ, UN>
    extends PromiseBase<TR, TJ, TN, UR, UJ, UN, never, never, never, never, never, never> {}
  interface Promise<TR, TJ = any, TN = any> extends PromiseBase<TR, TJ, TN, TR, TJ, TN, TR, TJ, TN, TR, TJ, TN> {}
  interface DeferredStatic {
    exceptionHook: any;
    <TR = any, TJ = any, TN = any>(
      beforeStart?: (this: Deferred<TR, TJ, TN>, deferred: Deferred<TR, TJ, TN>) => void
    ): Deferred<TR, TJ, TN>;
  }
  interface Deferred<TR, TJ = any, TN = any> {
    notify(...args: TN[]): this;
    notifyWith(context: object, args?: ArrayLike<TN>): this;
    reject(...args: TJ[]): this;
    rejectWith(context: object, args?: ArrayLike<TJ>): this;
    resolve(...args: TR[]): this;
    resolveWith(context: object, args?: ArrayLike<TR>): this;
    always(
      alwaysCallback: TypeOrArray<Deferred.Callback<TJ | TR>>,
      ...alwaysCallbacks: Array<TypeOrArray<Deferred.Callback<TJ | TR>>>
    ): this;
    done(
      doneCallback: TypeOrArray<Deferred.Callback<TR>>,
      ...doneCallbacks: Array<TypeOrArray<Deferred.Callback<TR>>>
    ): this;
    fail(
      failCallback: TypeOrArray<Deferred.Callback<TJ>>,
      ...failCallbacks: Array<TypeOrArray<Deferred.Callback<TJ>>>
    ): this;
    progress(
      progressCallback: TypeOrArray<Deferred.Callback<TN>>,
      ...progressCallbacks: Array<TypeOrArray<Deferred.Callback<TN>>>
    ): this;
    promise<TTarget extends object>(target: TTarget): Promise<TR, TJ, TN> & TTarget;
    promise(): Promise<TR, TJ, TN>;
    state(): 'pending' | 'rejected' | 'resolved';
    pipe<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: (
        ...t: TR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: (
        ...t: TJ[]
      ) => AJF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<AJF>,
      progressFilter: (
        ...t: TN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARD | ARF | ARP,
      AJD | AJF | AJP,
      AND | ANF | ANP,
      BRD | BRF | BRP,
      BJD | BJF | BJP,
      BND | BNF | BNP,
      CRD | CRF | CRP,
      CJD | CJF | CJP,
      CND | CNF | CNP,
      RRD | RRF | RRP,
      RJD | RJF | RJP,
      RND | RNF | RNP
    >;
    pipe<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: null,
      failFilter: (
        ...t: TJ[]
      ) => AJF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<AJF>,
      progressFilter: (
        ...t: TN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARF | ARP,
      AJF | AJP,
      ANF | ANP,
      BRF | BRP,
      BJF | BJP,
      BNF | BNP,
      CRF | CRP,
      CJF | CJP,
      CNF | CNP,
      RRF | RRP,
      RJF | RJP,
      RNF | RNP
    >;
    pipe<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: (
        ...t: TR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: null,
      progressFilter: (
        ...t: TN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARD | ARP,
      AJD | AJP,
      AND | ANP,
      BRD | BRP,
      BJD | BJP,
      BND | BNP,
      CRD | CRP,
      CJD | CJP,
      CND | CNP,
      RRD | RRP,
      RJD | RJP,
      RND | RNP
    >;
    pipe<
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: null,
      failFilter: null,
      progressFilter?: (
        ...t: TN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP>;
    pipe<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      doneFilter: (
        ...t: TR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: (
        ...t: TJ[]
      ) => AJF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<AJF>,
      progressFilter?: null
    ): PromiseBase<
      ARD | ARF,
      AJD | AJF,
      AND | ANF,
      BRD | BRF,
      BJD | BJF,
      BND | BNF,
      CRD | CRF,
      CJD | CJF,
      CND | CNF,
      RRD | RRF,
      RJD | RJF,
      RND | RNF
    >;
    pipe<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      doneFilter: null,
      failFilter: (
        ...t: TJ[]
      ) => AJF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<AJF>,
      progressFilter?: null
    ): PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF>;
    pipe<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never
    >(
      doneFilter: (
        ...t: TR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter?: null,
      progressFilter?: null
    ): PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND>;
    then<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: (
        ...t: TR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: (
        ...t: TJ[]
      ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>,
      progressFilter: (
        ...t: TN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARD | ARF | ARP,
      AJD | AJF | AJP,
      AND | ANF | ANP,
      BRD | BRF | BRP,
      BJD | BJF | BJP,
      BND | BNF | BNP,
      CRD | CRF | CRP,
      CJD | CJF | CJP,
      CND | CNF | CNP,
      RRD | RRF | RRP,
      RJD | RJF | RJP,
      RND | RNF | RNP
    >;
    then<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: null,
      failFilter: (
        ...t: TJ[]
      ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>,
      progressFilter: (
        ...t: TN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARF | ARP,
      AJF | AJP,
      ANF | ANP,
      BRF | BRP,
      BJF | BJP,
      BNF | BNP,
      CRF | CRP,
      CJF | CJP,
      CNF | CNP,
      RRF | RRP,
      RJF | RJP,
      RNF | RNP
    >;
    then<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: (
        ...t: TR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: null,
      progressFilter: (
        ...t: TN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<
      ARD | ARP,
      AJD | AJP,
      AND | ANP,
      BRD | BRP,
      BJD | BJP,
      BND | BNP,
      CRD | CRP,
      CJD | CJP,
      CND | CNP,
      RRD | RRP,
      RJD | RJP,
      RND | RNP
    >;
    then<
      ARP = never,
      AJP = never,
      ANP = never,
      BRP = never,
      BJP = never,
      BNP = never,
      CRP = never,
      CJP = never,
      CNP = never,
      RRP = never,
      RJP = never,
      RNP = never
    >(
      doneFilter: null,
      failFilter: null,
      progressFilter?: (
        ...t: TN[]
      ) => ANP | PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP> | Thenable<ANP>
    ): PromiseBase<ARP, AJP, ANP, BRP, BJP, BNP, CRP, CJP, CNP, RRP, RJP, RNP>;
    then<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never,
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      doneFilter: (
        ...t: TR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter: (
        ...t: TJ[]
      ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>,
      progressFilter?: null
    ): PromiseBase<
      ARD | ARF,
      AJD | AJF,
      AND | ANF,
      BRD | BRF,
      BJD | BJF,
      BND | BNF,
      CRD | CRF,
      CJD | CJF,
      CND | CNF,
      RRD | RRF,
      RJD | RJF,
      RND | RNF
    >;
    then<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      doneFilter: null,
      failFilter: (
        ...t: TJ[]
      ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>,
      progressFilter?: null
    ): PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF>;
    then<
      ARD = never,
      AJD = never,
      AND = never,
      BRD = never,
      BJD = never,
      BND = never,
      CRD = never,
      CJD = never,
      CND = never,
      RRD = never,
      RJD = never,
      RND = never
    >(
      doneFilter: (
        ...t: TR[]
      ) => ARD | PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND> | Thenable<ARD>,
      failFilter?: null,
      progressFilter?: null
    ): PromiseBase<ARD, AJD, AND, BRD, BJD, BND, CRD, CJD, CND, RRD, RJD, RND>;
    catch<
      ARF = never,
      AJF = never,
      ANF = never,
      BRF = never,
      BJF = never,
      BNF = never,
      CRF = never,
      CJF = never,
      CNF = never,
      RRF = never,
      RJF = never,
      RNF = never
    >(
      failFilter?:
        | ((
            ...t: TJ[]
          ) => ARF | PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF> | Thenable<ARF>)
        | null
    ): PromiseBase<ARF, AJF, ANF, BRF, BJF, BNF, CRF, CJF, CNF, RRF, RJF, RNF>;
  }
  namespace Deferred {
    type CallbackBase<T, U, V, R> = (t: T, u: U, v: V, ...r: R[]) => void;
    interface Callback3<T, U, V> extends CallbackBase<T, U, V, never> {}
    type Callback<T> = (...args: T[]) => void;
    interface DoneCallback<TResolve> extends Callback<TResolve> {}
    interface FailCallback<TReject> extends Callback<TReject> {}
    interface AlwaysCallback<TResolve, TReject> extends Callback<TReject | TResolve> {}
    interface ProgressCallback<TNotify> extends Callback<TNotify> {}
  }
  type Duration = 'fast' | 'slow' | number;
  interface EffectsOptions<TElement> extends PlainObject {
    always?(this: TElement, animation: Animation<TElement>, jumpedToEnd: boolean): void;
    complete?(this: TElement): void;
    done?(this: TElement, animation: Animation<TElement>, jumpedToEnd: boolean): void;
    duration?: Duration | undefined;
    easing?: string | undefined;
    fail?(this: TElement, animation: Animation<TElement>, jumpedToEnd: boolean): void;
    progress?(this: TElement, animation: Animation<TElement>, progress: number, remainingMs: number): void;
    queue?: boolean | string | undefined;
    specialEasing?: PlainObject<string> | undefined;
    start?(this: TElement, animation: Animation<TElement>): void;
    step?(this: TElement, now: number, tween: Tween<TElement>): void;
  }
  interface AnimationStatic {
    <TElement>(element: TElement, props: PlainObject, opts: EffectsOptions<TElement>): Animation<TElement>;
    prefilter<TElement>(
      callback: (
        this: Animation<TElement>,
        element: TElement,
        props: PlainObject,
        opts: EffectsOptions<TElement>
      ) => _Falsy | Animation<TElement> | void,
      prepend?: boolean
    ): void;
    tweener(props: string, callback: Tweener<any>): void;
  }
  interface Animation<TElement>
    extends Promise3<
      Animation<TElement>,
      Animation<TElement>,
      Animation<TElement>,
      true | undefined,
      false,
      number,
      never,
      never,
      number
    > {
    duration: number;
    elem: TElement;
    props: PlainObject;
    opts: EffectsOptions<TElement>;
    originalProps: PlainObject;
    originalOpts: EffectsOptions<TElement>;
    startTime: number;
    tweens: Array<Tween<TElement>>;
    createTween(propName: string, finalValue: number): Tween<TElement>;
    stop(gotoEnd: boolean): this;
  }
  type Tweener<TElement> = (this: Animation<TElement>, propName: string, finalValue: number) => Tween<TElement>;
  interface TweenStatic {
    propHooks: PropHooks;
    <TElement>(
      elem: TElement,
      options: EffectsOptions<TElement>,
      prop: string,
      end: number,
      easing?: string,
      unit?: string
    ): Tween<TElement>;
  }
  interface Tween<TElement> {
    easing: string;
    elem: TElement;
    end: number;
    now: number;
    options: EffectsOptions<TElement>;
    pos?: number | undefined;
    prop: string;
    start: number;
    unit: string;
    cur(): any;
    run(progress: number): this;
  }
  type PropHook<TElement> =
    | {
        [key: string]: never;
      }
    | {
        get(tween: Tween<TElement>): any;
      }
    | {
        set(tween: Tween<TElement>): void;
      };
  interface PropHooks {
    [property: string]: PropHook<Node>;
  }
  type EasingMethod = (percent: number) => number;
  interface Easings {
    [name: string]: EasingMethod;
  }
  interface Effects {
    interval: number;
    off: boolean;
    step: PlainObject<AnimationHook<Node>>;
    stop(): void;
    tick(): void;
    timer(tickFunction: TickFunction<any>): void;
  }
  type AnimationHook<TElement> = (fx: Tween<TElement>) => void;
  interface TickFunction<TElement> {
    anim: Animation<TElement>;
    elem: TElement;
    queue: boolean | string;
    (): any;
  }
  type Queue<TElement> = { 0: string } & Array<QueueFunction<TElement>>;
  type QueueFunction<TElement> = (this: TElement, next: () => void) => void;
  type SpeedSettings<TElement> =
    | {
        [key: string]: never;
      }
    | {
        complete(this: TElement): void;
      }
    | {
        duration: Duration;
      }
    | {
        easing: string;
      };
  interface EventStatic {
    <T extends object>(event: string, properties?: T): Event & T;
    new <T extends object>(event: string, properties?: T): Event & T;
  }
  interface Event {
    bubbles: boolean | undefined;
    cancelable: boolean | undefined;
    eventPhase: number | undefined;
    detail: number | undefined;
    view: undefined | Window;
    button: number | undefined;
    buttons: number | undefined;
    clientX: number | undefined;
    clientY: number | undefined;
    offsetX: number | undefined;
    offsetY: number | undefined;
    pageX: number | undefined;
    pageY: number | undefined;
    screenX: number | undefined;
    screenY: number | undefined;
    toElement: Element | undefined;
    pointerId: number | undefined;
    pointerType: string | undefined;
    char: string | undefined;
    charCode: number | undefined;
    key: string | undefined;
    keyCode: number | undefined;
    changedTouches: TouchList | undefined;
    targetTouches: TouchList | undefined;
    touches: TouchList | undefined;
    which: number | undefined;
    altKey: boolean | undefined;
    ctrlKey: boolean | undefined;
    metaKey: boolean | undefined;
    shiftKey: boolean | undefined;
    timeStamp: number;
    type: string;
    isDefaultPrevented(): boolean;
    isImmediatePropagationStopped(): boolean;
    isPropagationStopped(): boolean;
    preventDefault(): void;
    stopImmediatePropagation(): void;
    stopPropagation(): void;
  }
  interface TriggeredEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any> extends Event {
    currentTarget: TCurrentTarget;
    delegateTarget: TDelegateTarget;
    target: TTarget;
    data: TData;
    namespace?: string | undefined;
    originalEvent?: _Event | undefined;
    result?: any;
  }
  interface EventBase<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends TriggeredEvent<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: undefined;
    bubbles: boolean;
    cancelable: boolean;
    eventPhase: number;
    detail: undefined;
    view: undefined;
    button: undefined;
    buttons: undefined;
    clientX: undefined;
    clientY: undefined;
    offsetX: undefined;
    offsetY: undefined;
    pageX: undefined;
    pageY: undefined;
    screenX: undefined;
    screenY: undefined;
    toElement: undefined;
    pointerId: undefined;
    pointerType: undefined;
    char: undefined;
    charCode: undefined;
    key: undefined;
    keyCode: undefined;
    changedTouches: undefined;
    targetTouches: undefined;
    touches: undefined;
    which: undefined;
    altKey: undefined;
    ctrlKey: undefined;
    metaKey: undefined;
    shiftKey: undefined;
    originalEvent?: _Event | undefined;
  }
  interface ChangeEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends EventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'change';
  }
  interface ResizeEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends EventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'resize';
  }
  interface ScrollEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends EventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'scroll';
  }
  interface SelectEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends EventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'select';
  }
  interface SubmitEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends EventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'submit';
  }
  interface UIEventBase<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends TriggeredEvent<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    bubbles: boolean;
    cancelable: boolean;
    eventPhase: number;
    detail: number;
    view: Window;
    originalEvent?: _UIEvent | undefined;
  }
  interface MouseEventBase<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends UIEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: EventTarget | null | undefined;
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
    toElement: Element;
    pointerId: undefined;
    pointerType: undefined;
    char: undefined;
    charCode: undefined;
    key: undefined;
    keyCode: undefined;
    changedTouches: undefined;
    targetTouches: undefined;
    touches: undefined;
    which: number;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    originalEvent?: _MouseEvent | undefined;
  }
  interface ClickEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: null | undefined;
    type: 'click';
  }
  interface ContextMenuEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: null | undefined;
    type: 'contextmenu';
  }
  interface DoubleClickEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: null | undefined;
    type: 'dblclick';
  }
  interface MouseDownEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: null | undefined;
    type: 'mousedown';
  }
  interface MouseEnterEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'mouseover';
  }
  interface MouseLeaveEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'mouseout';
  }
  interface MouseMoveEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: null | undefined;
    type: 'mousemove';
  }
  interface MouseOutEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'mouseout';
  }
  interface MouseOverEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'mouseover';
  }
  interface MouseUpEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends MouseEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: null | undefined;
    type: 'mouseup';
  }
  interface DragEventBase<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends UIEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    originalEvent?: _DragEvent | undefined;
  }
  interface DragEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends DragEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'drag';
  }
  interface DragEndEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends DragEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'dragend';
  }
  interface DragEnterEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends DragEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'dragenter';
  }
  interface DragExitEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends DragEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'dragexit';
  }
  interface DragLeaveEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends DragEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'dragleave';
  }
  interface DragOverEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends DragEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'dragover';
  }
  interface DragStartEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends DragEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'dragstart';
  }
  interface DropEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends DragEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'drop';
  }
  interface KeyboardEventBase<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends UIEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: undefined;
    button: undefined;
    buttons: undefined;
    clientX: undefined;
    clientY: undefined;
    offsetX: undefined;
    offsetY: undefined;
    pageX: undefined;
    pageY: undefined;
    screenX: undefined;
    screenY: undefined;
    toElement: undefined;
    pointerId: undefined;
    pointerType: undefined;
    char: string | undefined;
    charCode: number;
    code: string;
    key: string;
    keyCode: number;
    changedTouches: undefined;
    targetTouches: undefined;
    touches: undefined;
    which: number;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    originalEvent?: _KeyboardEvent | undefined;
  }
  interface KeyDownEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends KeyboardEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'keydown';
  }
  interface KeyPressEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends KeyboardEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'keypress';
  }
  interface KeyUpEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends KeyboardEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'keyup';
  }
  interface TouchEventBase<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends UIEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: undefined;
    button: undefined;
    buttons: undefined;
    clientX: undefined;
    clientY: undefined;
    offsetX: undefined;
    offsetY: undefined;
    pageX: undefined;
    pageY: undefined;
    screenX: undefined;
    screenY: undefined;
    toElement: undefined;
    pointerId: undefined;
    pointerType: undefined;
    char: undefined;
    charCode: undefined;
    key: undefined;
    keyCode: undefined;
    changedTouches: TouchList;
    targetTouches: TouchList;
    touches: TouchList;
    which: undefined;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    originalEvent?: _TouchEvent | undefined;
  }
  interface TouchCancelEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends TouchEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'touchcancel';
  }
  interface TouchEndEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends TouchEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'touchend';
  }
  interface TouchMoveEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends TouchEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'touchmove';
  }
  interface TouchStartEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends TouchEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'touchstart';
  }
  interface FocusEventBase<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends UIEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    relatedTarget?: EventTarget | null | undefined;
    button: undefined;
    buttons: undefined;
    clientX: undefined;
    clientY: undefined;
    offsetX: undefined;
    offsetY: undefined;
    pageX: undefined;
    pageY: undefined;
    screenX: undefined;
    screenY: undefined;
    toElement: undefined;
    pointerId: undefined;
    pointerType: undefined;
    char: undefined;
    charCode: undefined;
    key: undefined;
    keyCode: undefined;
    changedTouches: undefined;
    targetTouches: undefined;
    touches: undefined;
    which: undefined;
    altKey: undefined;
    ctrlKey: undefined;
    metaKey: undefined;
    shiftKey: undefined;
    originalEvent?: _FocusEvent | undefined;
  }
  interface BlurEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends FocusEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'blur';
  }
  interface FocusEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends FocusEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'focus';
  }
  interface FocusInEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends FocusEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'focusin';
  }
  interface FocusOutEvent<TDelegateTarget = any, TData = any, TCurrentTarget = any, TTarget = any>
    extends FocusEventBase<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    type: 'focusout';
  }
  interface TypeToTriggeredEventMap<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    change: ChangeEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    resize: ResizeEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    scroll: ScrollEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    select: SelectEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    submit: SubmitEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    click: ClickEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    contextmenu: ContextMenuEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    dblclick: DoubleClickEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    mousedown: MouseDownEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    mouseenter: MouseEnterEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    mouseleave: MouseLeaveEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    mousemove: MouseMoveEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    mouseout: MouseOutEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    mouseover: MouseOverEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    mouseup: MouseUpEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    drag: DragEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    dragend: DragEndEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    dragenter: DragEnterEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    dragexit: DragExitEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    dragleave: DragLeaveEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    dragover: DragOverEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    dragstart: DragStartEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    drop: DropEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    keydown: KeyDownEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    keypress: KeyPressEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    keyup: KeyUpEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    touchcancel: TouchCancelEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    touchend: TouchEndEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    touchmove: TouchMoveEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    touchstart: TouchStartEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    blur: BlurEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    focus: FocusEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    focusin: FocusInEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    focusout: FocusOutEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
    [type: string]: TriggeredEvent<TDelegateTarget, TData, TCurrentTarget, TTarget>;
  }
  type EventHandlerBase<TContext, T> = (this: TContext, t: T, ...args: any[]) => any;
  type EventHandler<TCurrentTarget, TData = undefined> = EventHandlerBase<
    TCurrentTarget,
    TriggeredEvent<TCurrentTarget, TData>
  >;
  type TypeEventHandler<
    TDelegateTarget,
    TData,
    TCurrentTarget,
    TTarget,
    TType extends keyof TypeToTriggeredEventMap<TDelegateTarget, TData, TCurrentTarget, TTarget>
  > = EventHandlerBase<TCurrentTarget, TypeToTriggeredEventMap<TDelegateTarget, TData, TCurrentTarget, TTarget>[TType]>;
  interface TypeEventHandlers<TDelegateTarget, TData, TCurrentTarget, TTarget>
    extends _TypeEventHandlers<TDelegateTarget, TData, TCurrentTarget, TTarget> {
    [type: string]:
      | false
      | object
      | TypeEventHandler<TDelegateTarget, TData, TCurrentTarget, TTarget, string>
      | undefined;
  }
  type _TypeEventHandlers<TDelegateTarget, TData, TCurrentTarget, TTarget> = {
    [TType in keyof TypeToTriggeredEventMap<TDelegateTarget, TData, TCurrentTarget, TTarget>]?:
      | false
      | object
      | TypeEventHandler<TDelegateTarget, TData, TCurrentTarget, TTarget, TType>;
  };
  interface EventExtensions {
    special: SpecialEventHooks;
  }
  type SpecialEventHook<TTarget, TData> =
    | {
        _default(event: TriggeredEvent<TTarget, TData>, data: TData): void | false;
      }
    | {
        preDispatch(this: TTarget, event: Event): false | void;
      }
    | {
        setup(this: TTarget, data: TData, namespaces: string, eventHandle: EventHandler<TTarget, TData>): void | false;
      }
    | {
        teardown(this: TTarget): void | false;
      }
    | {
        trigger(this: TTarget, event: Event, data: TData): void | false;
      }
    | {
        [key: string]: any;
      }
    | {
        add(this: TTarget, handleObj: HandleObject<TTarget, TData>): void;
      }
    | {
        bindType: string;
      }
    | {
        delegateType: string;
      }
    | {
        handle(
          this: TTarget,
          event: TriggeredEvent<TTarget, TData> & { handleObj: HandleObject<TTarget, TData> },
          ...data: TData[]
        ): void;
      }
    | {
        noBubble: boolean;
      }
    | {
        postDispatch(this: TTarget, event: Event): void;
      }
    | {
        remove(this: TTarget, handleObj: HandleObject<TTarget, TData>): void;
      };
  interface SpecialEventHooks {
    [event: string]: SpecialEventHook<EventTarget, any>;
  }
  interface HandleObject<TTarget, TData> {
    readonly type: string;
    readonly origType: string;
    readonly namespace: string;
    readonly selector: null | string | undefined;
    readonly data: TData;
    readonly handler: EventHandler<TTarget, TData>;
  }
  interface NameValuePair {
    name: string;
    value: string;
  }
  interface Coordinates {
    left: number;
    top: number;
  }
  type CoordinatesPartial = { [key: string]: never } | Pick<Coordinates, 'left'> | Pick<Coordinates, 'top'>;
  type ValHook<TElement> =
    | {
        [key: string]: never;
      }
    | {
        get(elem: TElement): any;
      }
    | {
        set(elem: TElement, value: any): any;
      };
  interface ValHooks {
    [nodeName: string]: ValHook<HTMLElement>;
  }
  type _Falsy = '' | 0 | false | null | typeof document.all | undefined;
}

declare interface JQueryEventObject
  extends BaseJQueryEventObject,
    JQueryInputEventObject,
    JQueryMouseEventObject,
    JQueryKeyEventObject {}

declare interface JQueryInputEventObject extends BaseJQueryEventObject {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

declare interface JQueryKeyEventObject extends JQueryInputEventObject {
  char: string;
  charCode: number;
  key: string;
  keyCode: number;
}

declare interface JQueryMouseEventObject extends JQueryInputEventObject {
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

declare interface JQueryStatic {
  ajaxSettings: JQuery.AjaxSettings;
  Animation: JQuery.AnimationStatic;
  Callbacks: JQuery.CallbacksStatic;
  cssHooks: JQuery.CSSHooks;
  cssNumber: JQuery.PlainObject<boolean>;
  Deferred: JQuery.DeferredStatic;
  easing: JQuery.Easings;
  Event: JQuery.EventStatic;
  event: JQuery.EventExtensions;
  expr: JQuery.Selectors;
  readonly fn: JQuery;
  fx: JQuery.Effects;
  ready: JQuery.Thenable<JQueryStatic>;
  support: JQuery.PlainObject;
  timers: Array<JQuery.TickFunction<any>>;
  Tween: JQuery.TweenStatic;
  valHooks: JQuery.ValHooks;
  (window: Window, discriminator: boolean): JQueryStatic;
  <TElement extends HTMLElement = HTMLElement>(
    html: JQuery.htmlString,
    ownerDocument_attributes?: Document | JQuery.PlainObject
  ): JQuery<TElement>;
  <TElement extends Element = HTMLElement>(
    selector: JQuery.Selector,
    context?: Document | Element | JQuery | JQuery.Selector
  ): JQuery<TElement>;
  (element: HTMLSelectElement): JQuery<HTMLSelectElement>;
  <T extends Element>(element_elementArray: ArrayLike<T> | T): JQuery<T>;
  <T>(selection: JQuery<T>): JQuery<T>;
  <TElement = HTMLElement>(callback: (this: Document, $: JQueryStatic) => void): JQuery<TElement>;
  <T extends JQuery.PlainObject>(object: T): JQuery<T>;
  <TElement = HTMLElement>(): JQuery<TElement>;
  ajax(settings?: JQuery.AjaxSettings): JQuery.jqXHR;
  ajax(url: string, settings?: JQuery.AjaxSettings): JQuery.jqXHR;
  ajaxPrefilter(
    dataTypes: string,
    handler: (options: JQuery.AjaxSettings, originalOptions: JQuery.AjaxSettings, jqXHR: JQuery.jqXHR) => string | void
  ): void;
  ajaxPrefilter(
    handler: (options: JQuery.AjaxSettings, originalOptions: JQuery.AjaxSettings, jqXHR: JQuery.jqXHR) => string | void
  ): void;
  ajaxSetup(options: JQuery.AjaxSettings): JQuery.AjaxSettings;
  ajaxTransport(
    dataType: string,
    handler: (
      options: JQuery.AjaxSettings,
      originalOptions: JQuery.AjaxSettings,
      jqXHR: JQuery.jqXHR
    ) => JQuery.Transport | void
  ): void;
  camelCase(value: string): string;
  cleanData(elems: ArrayLike<Document | Element | JQuery.PlainObject | Window>): void;
  contains(container: Element, contained: Element): boolean;
  css(elem: Element, name: string): any;
  data(element: Document | Element | JQuery.PlainObject | Window, key: string, value: undefined): any;
  data(element: Document | Element | JQuery.PlainObject | Window, key?: string): any;
  data<T extends boolean | null | number | object | string | symbol>(
    element: Document | Element | JQuery.PlainObject | Window,
    key: string,
    value: T
  ): T;
  dequeue(element: Element, queueName?: string): void;
  each<T, K extends keyof T>(obj: T, callback: (this: T[K], propertyName: K, valueOfProperty: T[K]) => any): T;
  each<T>(array: ArrayLike<T>, callback: (this: T, indexInArray: number, value: T) => any): ArrayLike<T>;
  error(message: string): any;
  escapeSelector(selector: JQuery.Selector): JQuery.Selector;
  extend(deep: true, target: any, object1: any, ...objectN: any[]): any;
  extend(target: any, object1: any, ...objectN: any[]): any;
  extend<T, U, V, W, X, Y, Z>(
    deep: true,
    target: T,
    object1: U,
    object2: V,
    object3: W,
    object4: X,
    object5: Y,
    object6: Z
  ): T & U & V & W & X & Y & Z;
  extend<T, U, V, W, X, Y, Z>(
    target: T,
    object1: U,
    object2: V,
    object3: W,
    object4: X,
    object5: Y,
    object6: Z
  ): T & U & V & W & X & Y & Z;
  extend<T, U, V, W, X, Y>(
    deep: true,
    target: T,
    object1: U,
    object2: V,
    object3: W,
    object4: X,
    object5: Y
  ): T & U & V & W & X & Y;
  extend<T, U, V, W, X, Y>(
    target: T,
    object1: U,
    object2: V,
    object3: W,
    object4: X,
    object5: Y
  ): T & U & V & W & X & Y;
  extend<T, U, V, W, X>(deep: true, target: T, object1: U, object2: V, object3: W, object4: X): T & U & V & W & X;
  extend<T, U, V, W, X>(target: T, object1: U, object2: V, object3: W, object4: X): T & U & V & W & X;
  extend<T, U, V, W>(deep: true, target: T, object1: U, object2: V, object3: W): T & U & V & W;
  extend<T, U, V, W>(target: T, object1: U, object2: V, object3: W): T & U & V & W;
  extend<T, U, V>(deep: true, target: T, object1: U, object2: V): T & U & V;
  extend<T, U, V>(target: T, object1: U, object2: V): T & U & V;
  extend<T, U>(deep: true, target: T, object1: U): T & U;
  extend<T, U>(target: T, object1: U): T & U;
  extend<T>(deep: true, target: T): T & this;
  extend<T>(target: T): T & this;
  get(
    url: string,
    data: JQuery.PlainObject | string,
    success: JQuery.jqXHR.DoneCallback | null,
    dataType?: string
  ): JQuery.jqXHR;
  get(
    url: string,
    data_success: JQuery.jqXHR.DoneCallback | JQuery.PlainObject | null | string,
    dataType: string
  ): JQuery.jqXHR;
  get(url: string, success_data: JQuery.jqXHR.DoneCallback | JQuery.PlainObject | string): JQuery.jqXHR;
  get(url_settings?: JQuery.UrlAjaxSettings | string): JQuery.jqXHR;
  getJSON(url: string, data: JQuery.PlainObject | string, success: JQuery.jqXHR.DoneCallback): JQuery.jqXHR;
  getJSON(url: string, success_data?: JQuery.jqXHR.DoneCallback | JQuery.PlainObject | string): JQuery.jqXHR;
  getScript(options: JQuery.UrlAjaxSettings): JQuery.jqXHR<string | undefined>;
  getScript(url: string, success?: JQuery.jqXHR.DoneCallback<string | undefined>): JQuery.jqXHR<string | undefined>;
  globalEval(code: string): void;
  grep<T>(array: ArrayLike<T>, funсtion: (elementOfArray: T, indexInArray: number) => boolean, invert?: boolean): T[];
  hasData(element: Document | Element | JQuery.PlainObject | Window): boolean;
  holdReady(hold: boolean): void;
  htmlPrefilter(html: JQuery.htmlString): JQuery.htmlString;
  inArray<T>(value: T, array: T[], fromIndex?: number): number;
  isArray(obj: any): obj is any[];
  isEmptyObject(obj: any): boolean;
  isFunction(obj: any): obj is Function;
  isNumeric(value: any): boolean;
  isPlainObject(obj: any): boolean;
  isWindow(obj: any): obj is Window;
  isXMLDoc(node: Node): boolean;
  makeArray<T>(obj: ArrayLike<T>): T[];
  map<T, K extends keyof T, TReturn>(
    obj: T,
    callback: (this: Window, propertyOfObject: T[K], key: K) => JQuery.TypeOrArray<TReturn> | null | undefined
  ): TReturn[];
  map<T, TReturn>(
    array: T[],
    callback: (this: Window, elementOfArray: T, indexInArray: number) => JQuery.TypeOrArray<TReturn> | null | undefined
  ): TReturn[];
  merge<T, U>(first: ArrayLike<T>, second: ArrayLike<U>): Array<T | U>;
  noConflict(removeAll?: boolean): this;
  nodeName(elem: Node, name: string): boolean;
  noop(): undefined;
  now(): number;
  param(obj: any[] | JQuery | JQuery.PlainObject, traditional?: boolean): string;
  parseHTML(data: string, context: Document | null | undefined, keepScripts: boolean): JQuery.Node[];
  parseHTML(data: string, context_keepScripts?: boolean | Document | null): JQuery.Node[];
  parseJSON(json: string): any;
  parseXML(data: string): XMLDocument;
  post(
    url: string,
    data: JQuery.PlainObject | string,
    success: JQuery.jqXHR.DoneCallback | null,
    dataType?: string
  ): JQuery.jqXHR;
  post(
    url: string,
    data_success: JQuery.jqXHR.DoneCallback | JQuery.PlainObject | null | string,
    dataType: string
  ): JQuery.jqXHR;
  post(url: string, success_data: JQuery.jqXHR.DoneCallback | JQuery.PlainObject | string): JQuery.jqXHR;
  post(url_settings?: JQuery.UrlAjaxSettings | string): JQuery.jqXHR;
  proxy<TContext, TReturn, A, B, C, D, E, F, G, T, U, V, W, X, Y, Z>(
    funсtion: (
      this: TContext,
      a: A,
      b: B,
      c: C,
      d: D,
      e: E,
      f: F,
      g: G,
      t: T,
      u: U,
      v: V,
      w: W,
      x: X,
      y: Y,
      z: Z,
      ...args: any[]
    ) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, G, T, U, V, W, X, Y>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, G, T, U, V, W, X>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, G, T, U, V, W>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U, v: V, w: W) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, G, T, U, V>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U, v: V) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, G, T, U>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, G, T>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, G>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, g: G) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): () => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, T, U, V, W, X, Y, Z>(
    funсtion: (
      this: TContext,
      a: A,
      b: B,
      c: C,
      d: D,
      e: E,
      f: F,
      t: T,
      u: U,
      v: V,
      w: W,
      x: X,
      y: Y,
      z: Z,
      ...args: any[]
    ) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, T, U, V, W, X, Y>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, T, U, V, W, X>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, T, U, V, W>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V, w: W) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, T, U, V>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, T, U>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F, T>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F, t: T) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, F>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, f: F) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): () => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, T, U, V, W, X, Y, Z>(
    funсtion: (
      this: TContext,
      a: A,
      b: B,
      c: C,
      d: D,
      e: E,
      t: T,
      u: U,
      v: V,
      w: W,
      x: X,
      y: Y,
      z: Z,
      ...args: any[]
    ) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, T, U, V, W, X, Y>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, T, U, V, W, X>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, T, U, V, W>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V, w: W) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, T, U, V>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, T, U>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, t: T, u: U) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E, T>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E, t: T) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, E>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, e: E) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): () => TReturn;
  proxy<TContext, TReturn, A, B, C, D, T, U, V, W, X, Y, Z>(
    funсtion: (
      this: TContext,
      a: A,
      b: B,
      c: C,
      d: D,
      t: T,
      u: U,
      v: V,
      w: W,
      x: X,
      y: Y,
      z: Z,
      ...args: any[]
    ) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, T, U, V, W, X, Y>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, T, U, V, W, X>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, T, U, V, W>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, t: T, u: U, v: V, w: W) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, T, U, V>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, t: T, u: U, v: V) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, T, U>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, t: T, u: U) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U) => TReturn;
  proxy<TContext, TReturn, A, B, C, D, T>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D, t: T) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T) => TReturn;
  proxy<TContext, TReturn, A, B, C, D>(
    funсtion: (this: TContext, a: A, b: B, c: C, d: D) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C,
    d: D
  ): () => TReturn;
  proxy<TContext, TReturn, A, B, C, T, U, V, W, X, Y, Z>(
    funсtion: (this: TContext, a: A, b: B, c: C, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TContext, TReturn, A, B, C, T, U, V, W, X, Y>(
    funсtion: (this: TContext, a: A, b: B, c: C, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TContext, TReturn, A, B, C, T, U, V, W, X>(
    funсtion: (this: TContext, a: A, b: B, c: C, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TContext, TReturn, A, B, C, T, U, V, W>(
    funсtion: (this: TContext, a: A, b: B, c: C, t: T, u: U, v: V, w: W) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TContext, TReturn, A, B, C, T, U, V>(
    funсtion: (this: TContext, a: A, b: B, c: C, t: T, u: U, v: V) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TContext, TReturn, A, B, C, T, U>(
    funсtion: (this: TContext, a: A, b: B, c: C, t: T, u: U) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U) => TReturn;
  proxy<TContext, TReturn, A, B, C, T>(
    funсtion: (this: TContext, a: A, b: B, c: C, t: T) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C
  ): (t: T) => TReturn;
  proxy<TContext, TReturn, A, B, C>(
    funсtion: (this: TContext, a: A, b: B, c: C) => TReturn,
    context: TContext,
    a: A,
    b: B,
    c: C
  ): () => TReturn;
  proxy<TContext, TReturn, A, B, T, U, V, W, X, Y, Z>(
    funсtion: (this: TContext, a: A, b: B, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: TContext,
    a: A,
    b: B
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TContext, TReturn, A, B, T, U, V, W, X, Y>(
    funсtion: (this: TContext, a: A, b: B, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: TContext,
    a: A,
    b: B
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TContext, TReturn, A, B, T, U, V, W, X>(
    funсtion: (this: TContext, a: A, b: B, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: TContext,
    a: A,
    b: B
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TContext, TReturn, A, B, T, U, V, W>(
    funсtion: (this: TContext, a: A, b: B, t: T, u: U, v: V, w: W) => TReturn,
    context: TContext,
    a: A,
    b: B
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TContext, TReturn, A, B, T, U, V>(
    funсtion: (this: TContext, a: A, b: B, t: T, u: U, v: V) => TReturn,
    context: TContext,
    a: A,
    b: B
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TContext, TReturn, A, B, T, U>(
    funсtion: (this: TContext, a: A, b: B, t: T, u: U) => TReturn,
    context: TContext,
    a: A,
    b: B
  ): (t: T, u: U) => TReturn;
  proxy<TContext, TReturn, A, B, T>(
    funсtion: (this: TContext, a: A, b: B, t: T) => TReturn,
    context: TContext,
    a: A,
    b: B
  ): (t: T) => TReturn;
  proxy<TContext, TReturn, A, B>(
    funсtion: (this: TContext, a: A, b: B) => TReturn,
    context: TContext,
    a: A,
    b: B
  ): () => TReturn;
  proxy<TContext, TReturn, A, T, U, V, W, X, Y, Z>(
    funсtion: (this: TContext, a: A, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: TContext,
    a: A
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TContext, TReturn, A, T, U, V, W, X, Y>(
    funсtion: (this: TContext, a: A, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: TContext,
    a: A
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TContext, TReturn, A, T, U, V, W, X>(
    funсtion: (this: TContext, a: A, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: TContext,
    a: A
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TContext, TReturn, A, T, U, V, W>(
    funсtion: (this: TContext, a: A, t: T, u: U, v: V, w: W) => TReturn,
    context: TContext,
    a: A
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TContext, TReturn, A, T, U, V>(
    funсtion: (this: TContext, a: A, t: T, u: U, v: V) => TReturn,
    context: TContext,
    a: A
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TContext, TReturn, A, T, U>(
    funсtion: (this: TContext, a: A, t: T, u: U) => TReturn,
    context: TContext,
    a: A
  ): (t: T, u: U) => TReturn;
  proxy<TContext, TReturn, A, T>(
    funсtion: (this: TContext, a: A, t: T) => TReturn,
    context: TContext,
    a: A
  ): (t: T) => TReturn;
  proxy<TContext, TReturn, A>(funсtion: (this: TContext, a: A) => TReturn, context: TContext, a: A): () => TReturn;
  proxy<TContext, TReturn, T, U, V, W, X, Y, Z>(
    funсtion: (this: TContext, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: TContext
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TContext, TReturn, T, U, V, W, X, Y>(
    funсtion: (this: TContext, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: TContext
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TContext, TReturn, T, U, V, W, X>(
    funсtion: (this: TContext, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: TContext
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TContext, TReturn, T, U, V, W>(
    funсtion: (this: TContext, t: T, u: U, v: V, w: W) => TReturn,
    context: TContext
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TContext, TReturn, T, U, V>(
    funсtion: (this: TContext, t: T, u: U, v: V) => TReturn,
    context: TContext
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TContext, TReturn, T, U>(
    funсtion: (this: TContext, t: T, u: U) => TReturn,
    context: TContext
  ): (t: T, u: U) => TReturn;
  proxy<TContext, TReturn, T>(funсtion: (this: TContext, t: T) => TReturn, context: TContext): (t: T) => TReturn;
  proxy<TContext, TReturn>(
    funсtion: (this: TContext, ...args: any[]) => TReturn,
    context: TContext,
    ...additionalArguments: any[]
  ): (...args: any[]) => TReturn;
  proxy<TContext, TReturn>(funсtion: (this: TContext) => TReturn, context: TContext): () => TReturn;
  proxy<TContext>(context: TContext, name: keyof TContext, ...additionalArguments: any[]): (...args: any[]) => any;
  proxy<TReturn, A, B, C, D, E, F, G, T, U, V, W, X, Y, Z>(
    funсtion: (
      a: A,
      b: B,
      c: C,
      d: D,
      e: E,
      f: F,
      g: G,
      t: T,
      u: U,
      v: V,
      w: W,
      x: X,
      y: Y,
      z: Z,
      ...args: any[]
    ) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, G, T, U, V, W, X, Y>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, G, T, U, V, W, X>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, G, T, U, V, W>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U, v: V, w: W) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, G, T, U, V>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U, v: V) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, G, T, U>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T, u: U) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T, u: U) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, G, T>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, t: T) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): (t: T) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, G>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): () => TReturn;
  proxy<TReturn, A, B, C, D, E, F, T, U, V, W, X, Y, Z>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, T, U, V, W, X, Y>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, T, U, V, W, X>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, T, U, V, W>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V, w: W) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, T, U, V>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U, v: V) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, T, U>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, t: T, u: U) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T, u: U) => TReturn;
  proxy<TReturn, A, B, C, D, E, F, T>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F, t: T) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): (t: T) => TReturn;
  proxy<TReturn, A, B, C, D, E, F>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, f: F) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): () => TReturn;
  proxy<TReturn, A, B, C, D, E, T, U, V, W, X, Y, Z>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TReturn, A, B, C, D, E, T, U, V, W, X, Y>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TReturn, A, B, C, D, E, T, U, V, W, X>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TReturn, A, B, C, D, E, T, U, V, W>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V, w: W) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TReturn, A, B, C, D, E, T, U, V>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, t: T, u: U, v: V) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TReturn, A, B, C, D, E, T, U>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, t: T, u: U) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T, u: U) => TReturn;
  proxy<TReturn, A, B, C, D, E, T>(
    funсtion: (a: A, b: B, c: C, d: D, e: E, t: T) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (t: T) => TReturn;
  proxy<TReturn, A, B, C, D, E>(
    funсtion: (a: A, b: B, c: C, d: D, e: E) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): () => TReturn;
  proxy<TReturn, A, B, C, D, T, U, V, W, X, Y, Z>(
    funсtion: (a: A, b: B, c: C, d: D, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TReturn, A, B, C, D, T, U, V, W, X, Y>(
    funсtion: (a: A, b: B, c: C, d: D, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TReturn, A, B, C, D, T, U, V, W, X>(
    funсtion: (a: A, b: B, c: C, d: D, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TReturn, A, B, C, D, T, U, V, W>(
    funсtion: (a: A, b: B, c: C, d: D, t: T, u: U, v: V, w: W) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TReturn, A, B, C, D, T, U, V>(
    funсtion: (a: A, b: B, c: C, d: D, t: T, u: U, v: V) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TReturn, A, B, C, D, T, U>(
    funсtion: (a: A, b: B, c: C, d: D, t: T, u: U) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T, u: U) => TReturn;
  proxy<TReturn, A, B, C, D, T>(
    funсtion: (a: A, b: B, c: C, d: D, t: T) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D
  ): (t: T) => TReturn;
  proxy<TReturn, A, B, C, D>(
    funсtion: (a: A, b: B, c: C, d: D) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C,
    d: D
  ): () => TReturn;
  proxy<TReturn, A, B, C, T, U, V, W, X, Y, Z>(
    funсtion: (a: A, b: B, c: C, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TReturn, A, B, C, T, U, V, W, X, Y>(
    funсtion: (a: A, b: B, c: C, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TReturn, A, B, C, T, U, V, W, X>(
    funсtion: (a: A, b: B, c: C, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TReturn, A, B, C, T, U, V, W>(
    funсtion: (a: A, b: B, c: C, t: T, u: U, v: V, w: W) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TReturn, A, B, C, T, U, V>(
    funсtion: (a: A, b: B, c: C, t: T, u: U, v: V) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TReturn, A, B, C, T, U>(
    funсtion: (a: A, b: B, c: C, t: T, u: U) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C
  ): (t: T, u: U) => TReturn;
  proxy<TReturn, A, B, C, T>(
    funсtion: (a: A, b: B, c: C, t: T) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C
  ): (t: T) => TReturn;
  proxy<TReturn, A, B, C>(
    funсtion: (a: A, b: B, c: C) => TReturn,
    context: null | undefined,
    a: A,
    b: B,
    c: C
  ): () => TReturn;
  proxy<TReturn, A, B, T, U, V, W, X, Y, Z>(
    funсtion: (a: A, b: B, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: null | undefined,
    a: A,
    b: B
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TReturn, A, B, T, U, V, W, X, Y>(
    funсtion: (a: A, b: B, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: null | undefined,
    a: A,
    b: B
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TReturn, A, B, T, U, V, W, X>(
    funсtion: (a: A, b: B, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: null | undefined,
    a: A,
    b: B
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TReturn, A, B, T, U, V, W>(
    funсtion: (a: A, b: B, t: T, u: U, v: V, w: W) => TReturn,
    context: null | undefined,
    a: A,
    b: B
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TReturn, A, B, T, U, V>(
    funсtion: (a: A, b: B, t: T, u: U, v: V) => TReturn,
    context: null | undefined,
    a: A,
    b: B
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TReturn, A, B, T, U>(
    funсtion: (a: A, b: B, t: T, u: U) => TReturn,
    context: null | undefined,
    a: A,
    b: B
  ): (t: T, u: U) => TReturn;
  proxy<TReturn, A, B, T>(
    funсtion: (a: A, b: B, t: T) => TReturn,
    context: null | undefined,
    a: A,
    b: B
  ): (t: T) => TReturn;
  proxy<TReturn, A, B>(funсtion: (a: A, b: B) => TReturn, context: null | undefined, a: A, b: B): () => TReturn;
  proxy<TReturn, A, T, U, V, W, X, Y, Z>(
    funсtion: (a: A, t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: null | undefined,
    a: A
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TReturn, A, T, U, V, W, X, Y>(
    funсtion: (a: A, t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: null | undefined,
    a: A
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TReturn, A, T, U, V, W, X>(
    funсtion: (a: A, t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: null | undefined,
    a: A
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TReturn, A, T, U, V, W>(
    funсtion: (a: A, t: T, u: U, v: V, w: W) => TReturn,
    context: null | undefined,
    a: A
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TReturn, A, T, U, V>(
    funсtion: (a: A, t: T, u: U, v: V) => TReturn,
    context: null | undefined,
    a: A
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TReturn, A, T, U>(
    funсtion: (a: A, t: T, u: U) => TReturn,
    context: null | undefined,
    a: A
  ): (t: T, u: U) => TReturn;
  proxy<TReturn, A, T>(funсtion: (a: A, t: T) => TReturn, context: null | undefined, a: A): (t: T) => TReturn;
  proxy<TReturn, A>(funсtion: (a: A) => TReturn, context: null | undefined, a: A): () => TReturn;
  proxy<TReturn, T, U, V, W, X, Y, Z>(
    funсtion: (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn,
    context: null | undefined
  ): (t: T, u: U, v: V, w: W, x: X, y: Y, z: Z, ...args: any[]) => TReturn;
  proxy<TReturn, T, U, V, W, X, Y>(
    funсtion: (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn,
    context: null | undefined
  ): (t: T, u: U, v: V, w: W, x: X, y: Y) => TReturn;
  proxy<TReturn, T, U, V, W, X>(
    funсtion: (t: T, u: U, v: V, w: W, x: X) => TReturn,
    context: null | undefined
  ): (t: T, u: U, v: V, w: W, x: X) => TReturn;
  proxy<TReturn, T, U, V, W>(
    funсtion: (t: T, u: U, v: V, w: W) => TReturn,
    context: null | undefined
  ): (t: T, u: U, v: V, w: W) => TReturn;
  proxy<TReturn, T, U, V>(
    funсtion: (t: T, u: U, v: V) => TReturn,
    context: null | undefined
  ): (t: T, u: U, v: V) => TReturn;
  proxy<TReturn, T, U>(funсtion: (t: T, u: U) => TReturn, context: null | undefined): (t: T, u: U) => TReturn;
  proxy<TReturn, T>(funсtion: (t: T) => TReturn, context: null | undefined): (t: T) => TReturn;
  proxy<TReturn>(
    funсtion: (...args: any[]) => TReturn,
    context: null | undefined,
    ...additionalArguments: any[]
  ): (...args: any[]) => TReturn;
  proxy<TReturn>(funсtion: () => TReturn, context: null | undefined): () => TReturn;
  queue<T extends Element>(
    element: T,
    queueName?: string,
    newQueue?: JQuery.TypeOrArray<JQuery.QueueFunction<T>>
  ): JQuery.Queue<T>;
  readyException(error: Error): any;
  removeData(element: Document | Element | JQuery.PlainObject | Window, name?: string): void;
  speed<TElement extends Element = HTMLElement>(
    duration: JQuery.Duration,
    easing: string,
    complete: (this: TElement) => void
  ): JQuery.EffectsOptions<TElement>;
  speed<TElement extends Element = HTMLElement>(
    duration: JQuery.Duration,
    easing_complete: ((this: TElement) => void) | string
  ): JQuery.EffectsOptions<TElement>;
  speed<TElement extends Element = HTMLElement>(
    duration_complete_settings?: ((this: TElement) => void) | JQuery.Duration | JQuery.SpeedSettings<TElement>
  ): JQuery.EffectsOptions<TElement>;
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
  uniqueSort<T extends Element>(array: T[]): T[];
  when(...deferreds: any[]): JQuery.Promise<any, any, never>;
  when<TR1 = never, TJ1 = never>(
    ...deferreds: Array<JQuery.Promise<TR1, TJ1> | JQuery.Thenable<TR1> | TR1>
  ): JQuery.Promise<TR1, TJ1, never>;
  when<TR1, TJ1 = any>(
    deferred: JQuery.Promise<TR1, TJ1> | JQuery.Thenable<TR1> | TR1
  ): JQuery.Promise<TR1, TJ1, never>;
  when<TR1, TJ1, TR2, TJ2, TR3 = never, TJ3 = never>(
    deferredT:
      | JQuery.Promise2<TR1, TJ1, any, TR2, TJ2, any>
      | JQuery.Promise3<TR1, TJ1, any, TR2, TJ2, any, TR3, TJ3, any>
  ): JQuery.Promise3<TR1, TJ1, never, TR2, TJ2, never, TR3, TJ3, never>;
  when<TR1, UR1, TJ1 = any, UJ1 = any>(
    deferredT: JQuery.Promise<TR1, TJ1> | JQuery.Thenable<TR1> | TR1,
    deferredU: JQuery.Promise<UR1, UJ1> | JQuery.Thenable<UR1> | UR1
  ): JQuery.Promise2<TR1, TJ1, never, UR1, UJ1, never>;
  when<TR1, UR1, VR1, TJ1 = any, UJ1 = any, VJ1 = any>(
    deferredT: JQuery.Promise<TR1, TJ1> | JQuery.Thenable<TR1> | TR1,
    deferredU: JQuery.Promise<UR1, UJ1> | JQuery.Thenable<UR1> | UR1,
    deferredV: JQuery.Promise<VR1, VJ1> | JQuery.Thenable<VR1> | VR1
  ): JQuery.Promise3<TR1, TJ1, never, UR1, UJ1, never, VR1, VJ1, never>;
}

declare type _KeyboardEvent = KeyboardEvent;

declare type _MouseEvent = MouseEvent;

declare namespace Sizzle {
  interface Selectors {
    attrHandle: Selectors.AttrHandleFunctions;
    cacheLength: number;
    createPseudo(fn: Selectors.CreatePseudoFunction): Selectors.PseudoFunction;
    filter: Selectors.FilterFunctions;
    find: Selectors.FindFunctions;
    match: Selectors.Matches;
    preFilter: Selectors.PreFilterFunctions;
    pseudos: Selectors.PseudoFunctions;
    setFilters: Selectors.SetFilterFunctions;
  }

  namespace Selectors {
    interface Matches {
      [name: string]: RegExp;
    }

    interface FindFunction {
      (match: RegExpMatchArray, context: Document | Element, isXML: boolean): Element[] | void;
    }

    interface FindFunctions {
      [name: string]: FindFunction;
    }

    interface PreFilterFunction {
      (match: RegExpMatchArray): string[];
    }

    interface PreFilterFunctions {
      [name: string]: PreFilterFunction;
    }

    interface FilterFunction {
      (element: string, ...matches: string[]): boolean;
    }

    interface FilterFunctions {
      [name: string]: FilterFunction;
    }

    interface AttrHandleFunction {
      (elem: any, casePreservedName: string, isXML: boolean): string;
    }

    interface AttrHandleFunctions {
      [name: string]: AttrHandleFunction;
    }

    interface PseudoFunction {
      (elem: Element): boolean;
    }

    interface PseudoFunctions {
      [name: string]: PseudoFunction;
    }

    interface SetFilterFunction {
      (elements: Element[], argument: number, not: boolean): Element[];
    }

    interface SetFilterFunctions {
      [name: string]: SetFilterFunction;
    }

    interface CreatePseudoFunction {
      (...args: any[]): PseudoFunction;
    }
  }
}

declare type _TouchEvent = TouchEvent;

declare type _UIEvent = UIEvent;

declare var jQuery: JQueryStatic;

export { jQuery, jQuery as $, jQuery as default };

export type {
  JQuery,
  JQueryEventObject,
  JQueryInputEventObject,
  JQueryKeyEventObject,
  JQueryMouseEventObject,
  JQueryStatic
};
