import type { JQueryEventObject } from 'jquery__3.x';

declare namespace JQueryUI {
  interface AccordionOptions extends AccordionEvents {
    active?: any;
    animate?: any;
    collapsible?: boolean | undefined;
    disabled?: boolean | undefined;
    event?: string | undefined;
    header?: string | undefined;
    heightStyle?: string | undefined;
    icons?: any;
  }
  interface AccordionUIParams {
    newHeader: JQuery;
    oldHeader: JQuery;
    newPanel: JQuery;
    oldPanel: JQuery;
  }
  interface AccordionEvent {
    (event: JQueryEventObject, ui: AccordionUIParams): void;
  }
  interface AccordionEvents {
    activate?: AccordionEvent | undefined;
    beforeActivate?: AccordionEvent | undefined;
    create?: AccordionEvent | undefined;
  }
  interface Accordion extends Widget, AccordionOptions {}
  interface AutocompleteOptions extends AutocompleteEvents {
    appendTo?: any;
    autoFocus?: boolean | undefined;
    delay?: number | undefined;
    disabled?: boolean | undefined;
    minLength?: number | undefined;
    position?: any;
    source?: any;
    classes?: AutocompleteClasses | undefined;
  }
  interface AutocompleteClasses {
    'ui-autocomplete'?: string | undefined;
    'ui-autocomplete-input'?: string | undefined;
  }
  interface AutocompleteUIParams {
    item?: any;
    content?: any;
  }
  interface AutocompleteEvent {
    (event: JQueryEventObject, ui: AutocompleteUIParams): void;
  }
  interface AutocompleteEvents {
    change?: AutocompleteEvent | undefined;
    close?: AutocompleteEvent | undefined;
    create?: AutocompleteEvent | undefined;
    focus?: AutocompleteEvent | undefined;
    open?: AutocompleteEvent | undefined;
    response?: AutocompleteEvent | undefined;
    search?: AutocompleteEvent | undefined;
    select?: AutocompleteEvent | undefined;
  }
  interface Autocomplete extends Widget, AutocompleteOptions {
    escapeRegex: (value: string) => string;
    filter: (array: any, term: string) => any;
  }
  interface ButtonOptions {
    disabled?: boolean | undefined;
    icons?: any;
    label?: string | undefined;
    text?: string | boolean | undefined;
    click?: ((event?: Event) => void) | undefined;
  }
  interface Button extends Widget, ButtonOptions {}
  interface DatepickerOptions {
    altField?: any;
    altFormat?: string | undefined;
    appendText?: string | undefined;
    autoSize?: boolean | undefined;
    beforeShow?: ((input: Element, inst: any) => JQueryUI.DatepickerOptions) | undefined;
    beforeShowDay?: ((date: Date) => any[]) | undefined;
    buttonImage?: string | undefined;
    buttonImageOnly?: boolean | undefined;
    buttonText?: string | undefined;
    calculateWeek?: ((date: Date) => string) | undefined;
    changeMonth?: boolean | undefined;
    changeYear?: boolean | undefined;
    closeText?: string | undefined;
    constrainInput?: boolean | undefined;
    currentText?: string | undefined;
    dateFormat?: string | undefined;
    dayNames?: string[] | undefined;
    dayNamesMin?: string[] | undefined;
    dayNamesShort?: string[] | undefined;
    defaultDate?: any;
    duration?: string | undefined;
    firstDay?: number | undefined;
    gotoCurrent?: boolean | undefined;
    hideIfNoPrevNext?: boolean | undefined;
    isRTL?: boolean | undefined;
    maxDate?: any;
    minDate?: any;
    monthNames?: string[] | undefined;
    monthNamesShort?: string[] | undefined;
    navigationAsDateFormat?: boolean | undefined;
    nextText?: string | undefined;
    numberOfMonths?: any;
    onChangeMonthYear?: ((year: number, month: number, inst: any) => void) | undefined;
    onClose?: ((dateText: string, inst: any) => void) | undefined;
    onSelect?: ((dateText: string, inst: any) => void) | undefined;
    prevText?: string | undefined;
    selectOtherMonths?: boolean | undefined;
    shortYearCutoff?: any;
    showAnim?: string | undefined;
    showButtonPanel?: boolean | undefined;
    showCurrentAtPos?: number | undefined;
    showMonthAfterYear?: boolean | undefined;
    showOn?: string | undefined;
    showOptions?: any;
    showOtherMonths?: boolean | undefined;
    showWeek?: boolean | undefined;
    stepMonths?: number | undefined;
    weekHeader?: string | undefined;
    yearRange?: string | undefined;
    yearSuffix?: string | undefined;
    autohide?: boolean | undefined;
    endDate?: Date | undefined;
  }
  interface DatepickerFormatDateOptions {
    dayNamesShort?: string[] | undefined;
    dayNames?: string[] | undefined;
    monthNamesShort?: string[] | undefined;
    monthNames?: string[] | undefined;
  }
  interface Datepicker extends Widget, DatepickerOptions {
    regional: { [languageCod3: string]: any };
    setDefaults(defaults: DatepickerOptions): void;
    formatDate(format: string, date: Date, settings?: DatepickerFormatDateOptions): string;
    parseDate(format: string, date: string, settings?: DatepickerFormatDateOptions): Date;
    iso8601Week(date: Date): number;
    noWeekends(date: Date): any[];
  }
  interface DialogOptions extends DialogEvents {
    autoOpen?: boolean | undefined;
    buttons?: { [buttonText: string]: (event?: Event) => void } | DialogButtonOptions[] | undefined;
    closeOnEscape?: boolean | undefined;
    classes?: DialogClasses | undefined;
    closeText?: string | undefined;
    appendTo?: string | undefined;
    dialogClass?: string | undefined;
    disabled?: boolean | undefined;
    draggable?: boolean | undefined;
    height?: number | string | undefined;
    hide?: boolean | number | string | DialogShowHideOptions | undefined;
    maxHeight?: number | undefined;
    maxWidth?: number | undefined;
    minHeight?: number | undefined;
    minWidth?: number | undefined;
    modal?: boolean | undefined;
    position?: any;
    resizable?: boolean | undefined;
    show?: boolean | number | string | DialogShowHideOptions | undefined;
    stack?: boolean | undefined;
    title?: string | undefined;
    width?: any;
    zIndex?: number | undefined;
    open?: DialogEvent | undefined;
    close?: DialogEvent | undefined;
  }
  interface DialogClasses {
    'ui-dialog'?: string | undefined;
    'ui-dialog-content'?: string | undefined;
    'ui-dialog-dragging'?: string | undefined;
    'ui-dialog-resizing'?: string | undefined;
    'ui-dialog-buttons'?: string | undefined;
    'ui-dialog-titlebar'?: string | undefined;
    'ui-dialog-title'?: string | undefined;
    'ui-dialog-titlebar-close'?: string | undefined;
    'ui-dialog-buttonpane'?: string | undefined;
    'ui-dialog-buttonset'?: string | undefined;
    'ui-widget-overlay'?: string | undefined;
  }
  interface DialogButtonOptions {
    icons?: any;
    showText?: string | boolean | undefined;
    text?: string | undefined;
    click?: ((eventObject: JQueryEventObject) => any) | undefined;
    [attr: string]: any;
  }
  interface DialogShowHideOptions {
    effect: string;
    delay?: number | undefined;
    duration?: number | undefined;
    easing?: string | undefined;
  }
  interface DialogUIParams {}
  interface DialogEvent {
    (event: JQueryEventObject, ui: DialogUIParams): void;
  }
  interface DialogEvents {
    beforeClose?: DialogEvent | undefined;
    close?: DialogEvent | undefined;
    create?: DialogEvent | undefined;
    drag?: DialogEvent | undefined;
    dragStart?: DialogEvent | undefined;
    dragStop?: DialogEvent | undefined;
    focus?: DialogEvent | undefined;
    open?: DialogEvent | undefined;
    resize?: DialogEvent | undefined;
    resizeStart?: DialogEvent | undefined;
    resizeStop?: DialogEvent | undefined;
  }
  interface Dialog extends Widget, DialogOptions {}
  interface DraggableEventUIParams {
    helper: JQuery;
    position: { top: number; left: number };
    originalPosition: { top: number; left: number };
    offset: { top: number; left: number };
  }
  interface DraggableEvent {
    (event: JQueryEventObject, ui: DraggableEventUIParams): void;
  }
  interface DraggableOptions extends DraggableEvents {
    disabled?: boolean | undefined;
    addClasses?: boolean | undefined;
    appendTo?: any;
    axis?: string | undefined;
    cancel?: string | undefined;
    classes?: DraggableClasses | undefined;
    connectToSortable?: Element | Element[] | JQuery | string | undefined;
    containment?: any;
    cursor?: string | undefined;
    cursorAt?: any;
    delay?: number | undefined;
    distance?: number | undefined;
    grid?: number[] | undefined;
    handle?: any;
    helper?: any;
    iframeFix?: any;
    opacity?: number | undefined;
    refreshPositions?: boolean | undefined;
    revert?: any;
    revertDuration?: number | undefined;
    scope?: string | undefined;
    scroll?: boolean | undefined;
    scrollSensitivity?: number | undefined;
    scrollSpeed?: number | undefined;
    snap?: any;
    snapMode?: string | undefined;
    snapTolerance?: number | undefined;
    stack?: string | undefined;
    zIndex?: number | undefined;
  }
  interface DraggableClasses {
    'ui-draggable'?: string | undefined;
    'ui-draggable-disabled'?: string | undefined;
    'ui-draggable-dragging'?: string | undefined;
    'ui-draggable-handle'?: string | undefined;
  }
  interface DraggableEvents {
    create?: DraggableEvent | undefined;
    start?: DraggableEvent | undefined;
    drag?: DraggableEvent | undefined;
    stop?: DraggableEvent | undefined;
  }
  interface Draggable extends Widget, DraggableOptions, DraggableEvent {}
  interface DroppableEventUIParam {
    draggable: JQuery;
    helper: JQuery;
    position: { top: number; left: number };
    offset: { top: number; left: number };
  }
  interface DroppableEvent {
    (event: JQueryEventObject, ui: DroppableEventUIParam): void;
  }
  interface DroppableOptions extends DroppableEvents {
    accept?: any;
    activeClass?: string | undefined;
    addClasses?: boolean | undefined;
    disabled?: boolean | undefined;
    greedy?: boolean | undefined;
    hoverClass?: string | undefined;
    scope?: string | undefined;
    tolerance?: string | undefined;
  }
  interface DroppableEvents {
    create?: DroppableEvent | undefined;
    activate?: DroppableEvent | undefined;
    deactivate?: DroppableEvent | undefined;
    over?: DroppableEvent | undefined;
    out?: DroppableEvent | undefined;
    drop?: DroppableEvent | undefined;
  }
  interface Droppable extends Widget, DroppableOptions {}
  interface MenuOptions extends MenuEvents {
    disabled?: boolean | undefined;
    icons?: any;
    menus?: string | undefined;
    position?: any;
    role?: string | undefined;
  }
  interface MenuUIParams {
    item?: JQuery | undefined;
  }
  interface MenuEvent {
    (event: JQueryEventObject, ui: MenuUIParams): void;
  }
  interface MenuEvents {
    blur?: MenuEvent | undefined;
    create?: MenuEvent | undefined;
    focus?: MenuEvent | undefined;
    select?: MenuEvent | undefined;
  }
  interface Menu extends Widget, MenuOptions {}
  interface ProgressbarOptions extends ProgressbarEvents {
    disabled?: boolean | undefined;
    value?: number | boolean | undefined;
    max?: number | undefined;
  }
  interface ProgressbarUIParams {}
  interface ProgressbarEvent {
    (event: JQueryEventObject, ui: ProgressbarUIParams): void;
  }
  interface ProgressbarEvents {
    change?: ProgressbarEvent | undefined;
    complete?: ProgressbarEvent | undefined;
    create?: ProgressbarEvent | undefined;
  }
  interface Progressbar extends Widget, ProgressbarOptions {}
  interface ResizableOptions extends ResizableEvents {
    alsoResize?: any;
    animate?: boolean | undefined;
    animateDuration?: any;
    animateEasing?: string | undefined;
    aspectRatio?: number | boolean;
    autoHide?: boolean | undefined;
    cancel?: string | undefined;
    classes?: Partial<Record<ResizableThemingClass, string>>;
    containment?: any;
    delay?: number | undefined;
    disabled?: boolean | undefined;
    distance?: number | undefined;
    ghost?: boolean | undefined;
    grid?: any;
    handles?: any;
    helper?: string | undefined;
    maxHeight?: number | undefined;
    maxWidth?: number | undefined;
    minHeight?: number | undefined;
    minWidth?: number | undefined;
  }
  interface ResizableUIParams {
    element: JQuery;
    helper: JQuery;
    originalElement: JQuery;
    originalPosition: any;
    originalSize: any;
    position: any;
    size: any;
  }
  interface ResizableEvent {
    (event: JQueryEventObject, ui: ResizableUIParams): void;
  }
  interface ResizableEvents {
    resize?: ResizableEvent | undefined;
    start?: ResizableEvent | undefined;
    stop?: ResizableEvent | undefined;
    create?: ResizableEvent | undefined;
  }
  interface Resizable extends Widget, ResizableOptions {}
  type ResizableHandleDirection = 'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw' | 'all';
  type ResizableThemingClass =
    | 'ui-resizable'
    | 'ui-resizable-resizing'
    | 'ui-resizable-autohide'
    | 'ui-resizable-handle'
    | `ui-resizable-${ResizableHandleDirection}`
    | 'ui-resizable-ghost'
    | 'ui-resizable-helper';
  interface SelectableOptions extends SelectableEvents {
    autoRefresh?: boolean | undefined;
    cancel?: string | undefined;
    delay?: number | undefined;
    disabled?: boolean | undefined;
    distance?: number | undefined;
    filter?: string | undefined;
    tolerance?: string | undefined;
  }
  interface SelectableEvents {
    selected?(event: JQueryEventObject, ui: { selected?: Element | undefined }): void;
    selecting?(event: JQueryEventObject, ui: { selecting?: Element | undefined }): void;
    start?(event: JQueryEventObject, ui: any): void;
    stop?(event: JQueryEventObject, ui: any): void;
    unselected?(event: JQueryEventObject, ui: { unselected: Element }): void;
    unselecting?(event: JQueryEventObject, ui: { unselecting: Element }): void;
  }
  interface Selectable extends Widget, SelectableOptions {}
  interface SelectMenuOptions extends SelectMenuEvents {
    appendTo?: string | undefined;
    classes?: SelectMenuClasses | undefined;
    disabled?: boolean | undefined;
    icons?: any;
    position?: JQueryPositionOptions | undefined;
    width?: number | undefined;
  }
  interface SelectMenuClasses {
    'ui-selectmenu-button'?: string | undefined;
    'ui-selectmenu-button-closed'?: string | undefined;
    'ui-selectmenu-button-open'?: string | undefined;
    'ui-selectmenu-text'?: string | undefined;
    'ui-selectmenu-icon'?: string | undefined;
    'ui-selectmenu-menu'?: string | undefined;
    'ui-selectmenu-open'?: string | undefined;
    'ui-selectmenu-optgroup'?: string | undefined;
  }
  interface SelectMenuUIParams {
    item?: JQuery | undefined;
  }
  interface SelectMenuEvent {
    (event: JQueryEventObject, ui: SelectMenuUIParams): void;
  }
  interface SelectMenuEvents {
    change?: SelectMenuEvent | undefined;
    close?: SelectMenuEvent | undefined;
    create?: SelectMenuEvent | undefined;
    focus?: SelectMenuEvent | undefined;
    open?: SelectMenuEvent | undefined;
    select?: SelectMenuEvent | undefined;
  }
  interface SelectMenu extends Widget, SelectMenuOptions {}
  interface SliderOptions extends SliderEvents {
    animate?: any;
    disabled?: boolean | undefined;
    max?: number | undefined;
    min?: number | undefined;
    orientation?: string | undefined;
    range?: any;
    step?: number | undefined;
    value?: number | undefined;
    values?: number[] | undefined;
    highlight?: boolean | undefined;
    classes?: SliderClasses | undefined;
  }
  interface SliderClasses {
    'ui-slider'?: string | undefined;
    'ui-slider-horizontal'?: string | undefined;
    'ui-slider-vertical'?: string | undefined;
    'ui-slider-handle'?: string | undefined;
    'ui-slider-range'?: string | undefined;
    'ui-slider-range-min'?: string | undefined;
    'ui-slider-range-max'?: string | undefined;
  }
  interface SliderUIParams {
    handle?: JQuery | undefined;
    value?: number | undefined;
    values?: number[] | undefined;
  }
  interface SliderEvent {
    (event: JQueryEventObject, ui: SliderUIParams): void;
  }
  interface SliderEvents {
    change?: SliderEvent | undefined;
    create?: SliderEvent | undefined;
    slide?: SliderEvent | undefined;
    start?: SliderEvent | undefined;
    stop?: SliderEvent | undefined;
  }
  interface Slider extends Widget, SliderOptions {}
  interface SortableOptions extends SortableEvents {
    appendTo?: any;
    attribute?: string | undefined;
    axis?: string | undefined;
    cancel?: any;
    connectWith?: any;
    containment?: any;
    cursor?: string | undefined;
    cursorAt?: any;
    delay?: number | undefined;
    disabled?: boolean | undefined;
    distance?: number | undefined;
    dropOnEmpty?: boolean | undefined;
    forceHelperSize?: boolean | undefined;
    forcePlaceholderSize?: boolean | undefined;
    grid?: number[] | undefined;
    helper?: string | ((event: JQueryEventObject, element: Sortable) => Element) | undefined;
    handle?: any;
    items?: any;
    opacity?: number | undefined;
    placeholder?: string | undefined;
    revert?: any;
    scroll?: boolean | undefined;
    scrollSensitivity?: number | undefined;
    scrollSpeed?: number | undefined;
    tolerance?: string | undefined;
    zIndex?: number | undefined;
  }
  interface SortableUIParams {
    helper: JQuery;
    item: JQuery;
    offset: any;
    position: any;
    originalPosition: any;
    sender: JQuery;
    placeholder: JQuery;
  }
  interface SortableEvent {
    (event: JQueryEventObject, ui: SortableUIParams): void;
  }
  interface SortableEvents {
    activate?: SortableEvent | undefined;
    beforeStop?: SortableEvent | undefined;
    change?: SortableEvent | undefined;
    deactivate?: SortableEvent | undefined;
    out?: SortableEvent | undefined;
    over?: SortableEvent | undefined;
    receive?: SortableEvent | undefined;
    remove?: SortableEvent | undefined;
    sort?: SortableEvent | undefined;
    start?: SortableEvent | undefined;
    stop?: SortableEvent | undefined;
    update?: SortableEvent | undefined;
  }
  interface Sortable extends Widget, SortableOptions, SortableEvents {}
  interface SpinnerOptions extends SpinnerEvents {
    culture?: string | undefined;
    disabled?: boolean | undefined;
    icons?: any;
    incremental?: any;
    max?: any;
    min?: any;
    numberFormat?: string | undefined;
    page?: number | undefined;
    step?: any;
  }
  interface SpinnerUIParam {
    value: number;
  }
  interface SpinnerEvent<T> {
    (event: JQueryEventObject, ui: T): void;
  }
  interface SpinnerEvents {
    change?: SpinnerEvent<{}> | undefined;
    create?: SpinnerEvent<{}> | undefined;
    spin?: SpinnerEvent<SpinnerUIParam> | undefined;
    start?: SpinnerEvent<{}> | undefined;
    stop?: SpinnerEvent<{}> | undefined;
  }
  interface Spinner extends Widget, SpinnerOptions {}
  interface TabsOptions extends TabsEvents {
    active?: any;
    classes?: TabClasses | undefined;
    collapsible?: boolean | undefined;
    disabled?: any;
    event?: string | undefined;
    heightStyle?: string | undefined;
    hide?: any;
    show?: any;
  }
  interface TabClasses {
    'ui-tabs'?: string | undefined;
    'ui-tabs-collapsible'?: string | undefined;
    'ui-tabs-nav'?: string | undefined;
    'ui-tabs-tab'?: string | undefined;
    'ui-tabs-active'?: string | undefined;
    'ui-tabs-loading'?: string | undefined;
    'ui-tabs-anchor'?: string | undefined;
    'ui-tabs-panel'?: string | undefined;
  }
  interface TabsActivationUIParams {
    newTab: JQuery;
    oldTab: JQuery;
    newPanel: JQuery;
    oldPanel: JQuery;
  }
  interface TabsBeforeLoadUIParams {
    tab: JQuery;
    panel: JQuery;
    jqXHR: any;
    ajaxSettings: any;
  }
  interface TabsCreateOrLoadUIParams {
    tab: JQuery;
    panel: JQuery;
  }
  interface TabsEvent<UI> {
    (event: JQueryEventObject, ui: UI): void;
  }
  interface TabsEvents {
    activate?: TabsEvent<TabsActivationUIParams> | undefined;
    beforeActivate?: TabsEvent<TabsActivationUIParams> | undefined;
    beforeLoad?: TabsEvent<TabsBeforeLoadUIParams> | undefined;
    load?: TabsEvent<TabsCreateOrLoadUIParams> | undefined;
    create?: TabsEvent<TabsCreateOrLoadUIParams> | undefined;
  }
  interface Tabs extends Widget, TabsOptions {}
  interface TooltipOptions extends TooltipEvents {
    content?: any;
    disabled?: boolean | undefined;
    hide?: any;
    items?: string | JQuery | undefined;
    position?: any;
    show?: any;
    tooltipClass?: string | undefined;
    track?: boolean | undefined;
    classes?: { [key: string]: string } | undefined;
  }
  interface TooltipUIParams {
    tooltip: JQuery;
  }
  interface TooltipEvent {
    (event: JQueryEventObject, ui: TooltipUIParams): void;
  }
  interface TooltipEvents {
    close?: TooltipEvent | undefined;
    open?: TooltipEvent | undefined;
  }
  interface Tooltip extends Widget, TooltipOptions {}
  interface EffectOptions {
    effect: string;
    easing?: string | undefined;
    duration?: number | undefined;
    complete: Function;
  }
  interface BlindEffect {
    direction?: string | undefined;
  }
  interface BounceEffect {
    distance?: number | undefined;
    times?: number | undefined;
  }
  interface ClipEffect {
    direction?: number | undefined;
  }
  interface DropEffect {
    direction?: number | undefined;
  }
  interface ExplodeEffect {
    pieces?: number | undefined;
  }
  interface FadeEffect {}
  interface FoldEffect {
    size?: any;
    horizFirst?: boolean | undefined;
  }
  interface HighlightEffect {
    color?: string | undefined;
  }
  interface PuffEffect {
    percent?: number | undefined;
  }
  interface PulsateEffect {
    times?: number | undefined;
  }
  interface ScaleEffect {
    direction?: string | undefined;
    origin?: string[] | undefined;
    percent?: number | undefined;
    scale?: string | undefined;
  }
  interface ShakeEffect {
    direction?: string | undefined;
    distance?: number | undefined;
    times?: number | undefined;
  }
  interface SizeEffect {
    to?: any;
    origin?: string[] | undefined;
    scale?: string | undefined;
  }
  interface SlideEffect {
    direction?: string | undefined;
    distance?: number | undefined;
  }
  interface TransferEffect {
    className?: string | undefined;
    to?: string | undefined;
  }
  interface JQueryPositionOptions {
    my?: string | undefined;
    at?: string | undefined;
    of?: any;
    collision?: string | undefined;
    using?: Function | undefined;
    within?: any;
  }
  interface MouseOptions {
    cancel?: string | undefined;
    delay?: number | undefined;
    distance?: number | undefined;
  }
  interface KeyCode {
    BACKSPACE: number;
    COMMA: number;
    DELETE: number;
    DOWN: number;
    END: number;
    ENTER: number;
    ESCAPE: number;
    HOME: number;
    LEFT: number;
    NUMPAD_ADD: number;
    NUMPAD_DECIMAL: number;
    NUMPAD_DIVIDE: number;
    NUMPAD_ENTER: number;
    NUMPAD_MULTIPLY: number;
    NUMPAD_SUBTRACT: number;
    PAGE_DOWN: number;
    PAGE_UP: number;
    PERIOD: number;
    RIGHT: number;
    SPACE: number;
    TAB: number;
    UP: number;
  }
  interface UI {
    mouse(method: string): JQuery;
    mouse(options: MouseOptions): JQuery;
    mouse(optionLiteral: string, optionName: string, optionValue: any): JQuery;
    mouse(optionLiteral: string, optionValue: any): any;
    accordion: Accordion;
    autocomplete: Autocomplete;
    button: Button;
    buttonset: Button;
    datepicker: Datepicker;
    dialog: Dialog;
    keyCode: KeyCode;
    menu: Menu;
    progressbar: Progressbar;
    selectmenu: SelectMenu;
    slider: Slider;
    spinner: Spinner;
    tabs: Tabs;
    tooltip: Tooltip;
    version: string;
  }
  interface WidgetOptions {
    disabled?: boolean | undefined;
    hide?: any;
    show?: any;
  }
  interface WidgetCommonProperties {
    element: JQuery;
    defaultElement: string;
    document: Document;
    namespace: string;
    uuid: string;
    widgetEventPrefix: string;
    widgetFullName: string;
    window: Window;
  }
  interface Widget {
    (methodName: string): JQuery;
    (options: WidgetOptions): JQuery;
    (options: AccordionOptions): JQuery;
    (optionLiteral: string, optionName: string): any;
    (optionLiteral: string, options: WidgetOptions): any;
    (optionLiteral: string, optionName: string, optionValue: any): JQuery;
    <T>(name: string, prototype: T & ThisType<T & WidgetCommonProperties>): JQuery;
    <T>(name: string, base: Function, prototype: T & ThisType<T & WidgetCommonProperties>): JQuery;
  }
}
interface JQuery {
  accordion(): JQuery;
  accordion(methodName: 'destroy'): void;
  accordion(methodName: 'disable'): void;
  accordion(methodName: 'enable'): void;
  accordion(methodName: 'refresh'): void;
  accordion(methodName: 'widget'): JQuery;
  accordion(methodName: string): JQuery;
  accordion(options: JQueryUI.AccordionOptions): JQuery;
  accordion(optionLiteral: string, optionName: string): any;
  accordion(optionLiteral: string, options: JQueryUI.AccordionOptions): any;
  accordion(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  autocomplete(): JQuery;
  autocomplete(methodName: 'close'): void;
  autocomplete(methodName: 'destroy'): void;
  autocomplete(methodName: 'disable'): void;
  autocomplete(methodName: 'enable'): void;
  autocomplete(methodName: 'search', value?: string): void;
  autocomplete(methodName: 'widget'): JQuery;
  autocomplete(methodName: string): JQuery;
  autocomplete(options: JQueryUI.AutocompleteOptions): JQuery;
  autocomplete(optionLiteral: string, optionName: string): any;
  autocomplete(optionLiteral: string, options: JQueryUI.AutocompleteOptions): any;
  autocomplete(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  button(): JQuery;
  button(methodName: 'destroy'): JQuery;
  button(methodName: 'disable'): JQuery;
  button(methodName: 'enable'): JQuery;
  button(methodName: 'refresh'): JQuery;
  button(methodName: 'widget'): JQuery;
  button(methodName: string): JQuery;
  button(options: JQueryUI.ButtonOptions): JQuery;
  button(optionLiteral: string, optionName: string): any;
  button(optionLiteral: string, options: JQueryUI.ButtonOptions): any;
  button(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  buttonset(): JQuery;
  buttonset(methodName: 'destroy'): JQuery;
  buttonset(methodName: 'disable'): JQuery;
  buttonset(methodName: 'enable'): JQuery;
  buttonset(methodName: 'refresh'): JQuery;
  buttonset(methodName: 'widget'): JQuery;
  buttonset(methodName: string): JQuery;
  buttonset(options: JQueryUI.ButtonOptions): JQuery;
  buttonset(optionLiteral: string, optionName: string): any;
  buttonset(optionLiteral: string, options: JQueryUI.ButtonOptions): any;
  buttonset(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  datepicker(): JQuery;
  datepicker(methodName: 'destroy'): JQuery;
  datepicker(
    methodName: 'dialog',
    date: Date,
    onSelect?: () => void,
    settings?: JQueryUI.DatepickerOptions,
    pos?: number[]
  ): JQuery;
  datepicker(
    methodName: 'dialog',
    date: Date,
    onSelect?: () => void,
    settings?: JQueryUI.DatepickerOptions,
    pos?: MouseEvent
  ): JQuery;
  datepicker(
    methodName: 'dialog',
    date: string,
    onSelect?: () => void,
    settings?: JQueryUI.DatepickerOptions,
    pos?: number[]
  ): JQuery;
  datepicker(
    methodName: 'dialog',
    date: string,
    onSelect?: () => void,
    settings?: JQueryUI.DatepickerOptions,
    pos?: MouseEvent
  ): JQuery;
  datepicker(methodName: 'getDate'): Date;
  datepicker(methodName: 'hide'): JQuery;
  datepicker(methodName: 'isDisabled'): boolean;
  datepicker(methodName: 'refresh'): JQuery;
  datepicker(methodName: 'setDate', date: Date): JQuery;
  datepicker(methodName: 'setDate', date: string): JQuery;
  datepicker(methodName: 'show'): JQuery;
  datepicker(methodName: 'widget'): JQuery;
  datepicker(methodName: 'option', optionName: 'altField'): any;
  datepicker(methodName: 'option', optionName: 'altField', altFieldValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'altField', altFieldValue: JQuery): JQuery;
  datepicker(methodName: 'option', optionName: 'altField', altFieldValue: Element): JQuery;
  datepicker(methodName: 'option', optionName: 'altFormat'): string;
  datepicker(methodName: 'option', optionName: 'altFormat', altFormatValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'appendText'): string;
  datepicker(methodName: 'option', optionName: 'appendText', appendTextValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'autoSize'): boolean;
  datepicker(methodName: 'option', optionName: 'autoSize', autoSizeValue: boolean): JQuery;
  datepicker(methodName: 'option', optionName: 'beforeShow'): (input: Element, inst: any) => JQueryUI.DatepickerOptions;
  datepicker(
    methodName: 'option',
    optionName: 'beforeShow',
    beforeShowValue: (input: Element, inst: any) => JQueryUI.DatepickerOptions
  ): JQuery;
  datepicker(methodName: 'option', optionName: 'beforeShowDay'): (date: Date) => any[];
  datepicker(methodName: 'option', optionName: 'beforeShowDay', beforeShowDayValue: (date: Date) => any[]): JQuery;
  datepicker(methodName: 'option', optionName: 'buttonImage'): string;
  datepicker(methodName: 'option', optionName: 'buttonImage', buttonImageValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'buttonImageOnly'): boolean;
  datepicker(methodName: 'option', optionName: 'buttonImageOnly', buttonImageOnlyValue: boolean): JQuery;
  datepicker(methodName: 'option', optionName: 'buttonText'): string;
  datepicker(methodName: 'option', optionName: 'autohide'): boolean;
  datepicker(methodName: 'option', optionName: 'endDate'): Date;
  datepicker(methodName: 'option', optionName: 'buttonText', buttonTextValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'calculateWeek'): (date: Date) => string;
  datepicker(methodName: 'option', optionName: 'calculateWeek', calculateWeekValue: (date: Date) => string): JQuery;
  datepicker(methodName: 'option', optionName: 'changeMonth'): boolean;
  datepicker(methodName: 'option', optionName: 'changeMonth', changeMonthValue: boolean): JQuery;
  datepicker(methodName: 'option', optionName: 'changeYear'): boolean;
  datepicker(methodName: 'option', optionName: 'changeYear', changeYearValue: boolean): JQuery;
  datepicker(methodName: 'option', optionName: 'closeText'): string;
  datepicker(methodName: 'option', optionName: 'closeText', closeTextValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'constrainInput'): boolean;
  datepicker(methodName: 'option', optionName: 'constrainInput', constrainInputValue: boolean): JQuery;
  datepicker(methodName: 'option', optionName: 'currentText'): string;
  datepicker(methodName: 'option', optionName: 'currentText', currentTextValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'dateFormat'): string;
  datepicker(methodName: 'option', optionName: 'dateFormat', dateFormatValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'dayNames'): string[];
  datepicker(methodName: 'option', optionName: 'dayNames', dayNamesValue: string[]): JQuery;
  datepicker(methodName: 'option', optionName: 'dayNamesMin'): string[];
  datepicker(methodName: 'option', optionName: 'dayNamesMin', dayNamesMinValue: string[]): JQuery;
  datepicker(methodName: 'option', optionName: 'dayNamesShort'): string[];
  datepicker(methodName: 'option', optionName: 'dayNamesShort', dayNamesShortValue: string[]): JQuery;
  datepicker(methodName: 'option', optionName: 'defaultDate'): any;
  datepicker(methodName: 'option', optionName: 'defaultDate', defaultDateValue: Date): JQuery;
  datepicker(methodName: 'option', optionName: 'defaultDate', defaultDateValue: number): JQuery;
  datepicker(methodName: 'option', optionName: 'defaultDate', defaultDateValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'duration'): string;
  datepicker(methodName: 'option', optionName: 'duration', durationValue: string): JQuery;
  datepicker(methodName: 'option', optionName: 'firstDay'): number;
  datepicker(methodName: 'option', optionName: 'firstDay', firstDayValue: number): JQuery;
  datepicker(methodName: 'option', optionName: 'gotoCurrent'): boolean;
  datepicker(methodName: 'option', optionName: 'gotoCurrent', gotoCurrentValue: boolean): JQuery;
  datepicker(methodName: 'option', optionName: string): any;
  datepicker(methodName: 'option', optionName: string, ...otherParams: any[]): any;
  datepicker(methodName: string, ...otherParams: any[]): any;
  datepicker(options: JQueryUI.DatepickerOptions): JQuery;
  dialog(): JQuery;
  dialog(methodName: 'close'): JQuery;
  dialog(methodName: 'destroy'): JQuery;
  dialog(methodName: 'isOpen'): boolean;
  dialog(methodName: 'moveToTop'): JQuery;
  dialog(methodName: 'open'): JQuery;
  dialog(methodName: 'widget'): JQuery;
  dialog(methodName: string): JQuery;
  dialog(options: JQueryUI.DialogOptions): JQuery;
  dialog(optionLiteral: string, optionName: string): any;
  dialog(optionLiteral: string, options: JQueryUI.DialogOptions): any;
  dialog(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  draggable(): JQuery;
  draggable(methodName: 'destroy'): void;
  draggable(methodName: 'disable'): void;
  draggable(methodName: 'enable'): void;
  draggable(methodName: 'widget'): JQuery;
  draggable(methodName: string): JQuery;
  draggable(options: JQueryUI.DraggableOptions): JQuery;
  draggable(optionLiteral: string, optionName: string): any;
  draggable(optionLiteral: string, options: JQueryUI.DraggableOptions): any;
  draggable(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  droppable(): JQuery;
  droppable(methodName: 'destroy'): void;
  droppable(methodName: 'disable'): void;
  droppable(methodName: 'enable'): void;
  droppable(methodName: 'widget'): JQuery;
  droppable(methodName: string): JQuery;
  droppable(options: JQueryUI.DroppableOptions): JQuery;
  droppable(optionLiteral: string, optionName: string): any;
  droppable(optionLiteral: string, options: JQueryUI.DraggableOptions): any;
  droppable(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  menu: {
    (): JQuery;
    (methodName: 'blur'): void;
    (methodName: 'collapse', event?: JQueryEventObject): void;
    (methodName: 'collapseAll', event?: JQueryEventObject, all?: boolean): void;
    (methodName: 'destroy'): void;
    (methodName: 'disable'): void;
    (methodName: 'enable'): void;
    (methodName: string, event: JQueryEventObject, item: JQuery): void;
    (methodName: 'focus', event: JQueryEventObject, item: JQuery): void;
    (methodName: 'isFirstItem'): boolean;
    (methodName: 'isLastItem'): boolean;
    (methodName: 'next', event?: JQueryEventObject): void;
    (methodName: 'nextPage', event?: JQueryEventObject): void;
    (methodName: 'previous', event?: JQueryEventObject): void;
    (methodName: 'previousPage', event?: JQueryEventObject): void;
    (methodName: 'refresh'): void;
    (methodName: 'select', event?: JQueryEventObject): void;
    (methodName: 'widget'): JQuery;
    (methodName: string): JQuery;
    (options: JQueryUI.MenuOptions): JQuery;
    (optionLiteral: string, optionName: string): any;
    (optionLiteral: string, options: JQueryUI.MenuOptions): any;
    (optionLiteral: string, optionName: string, optionValue: any): JQuery;
    active: boolean;
  };
  progressbar(): JQuery;
  progressbar(methodName: 'destroy'): void;
  progressbar(methodName: 'disable'): void;
  progressbar(methodName: 'enable'): void;
  progressbar(methodName: 'refresh'): void;
  progressbar(methodName: 'value'): any;
  progressbar(methodName: 'value', value: number): void;
  progressbar(methodName: 'value', value: boolean): void;
  progressbar(methodName: 'widget'): JQuery;
  progressbar(methodName: string): JQuery;
  progressbar(options: JQueryUI.ProgressbarOptions): JQuery;
  progressbar(optionLiteral: string, optionName: string): any;
  progressbar(optionLiteral: string, options: JQueryUI.ProgressbarOptions): any;
  progressbar(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  resizable(): JQuery;
  resizable(methodName: 'destroy'): void;
  resizable(methodName: 'disable'): void;
  resizable(methodName: 'enable'): void;
  resizable(methodName: 'widget'): JQuery;
  resizable(methodName: string): JQuery;
  resizable(options: JQueryUI.ResizableOptions): JQuery;
  resizable(optionLiteral: string, optionName: string): any;
  resizable(optionLiteral: string, options: JQueryUI.ResizableOptions): any;
  resizable(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  selectable(): JQuery;
  selectable(methodName: 'destroy'): void;
  selectable(methodName: 'disable'): void;
  selectable(methodName: 'enable'): void;
  selectable(methodName: 'widget'): JQuery;
  selectable(methodName: string): JQuery;
  selectable(options: JQueryUI.SelectableOptions): JQuery;
  selectable(optionLiteral: string, optionName: string): any;
  selectable(optionLiteral: string, options: JQueryUI.SelectableOptions): any;
  selectable(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  selectmenu(): JQuery;
  selectmenu(methodName: 'close'): JQuery;
  selectmenu(methodName: 'destroy'): JQuery;
  selectmenu(methodName: 'disable'): JQuery;
  selectmenu(methodName: 'enable'): JQuery;
  selectmenu(methodName: 'instance'): any;
  selectmenu(methodName: 'menuWidget'): JQuery;
  selectmenu(methodName: 'open'): JQuery;
  selectmenu(methodName: 'refresh'): JQuery;
  selectmenu(methodName: 'widget'): JQuery;
  selectmenu(methodName: string): JQuery;
  selectmenu(options: JQueryUI.SelectMenuOptions): JQuery;
  selectmenu(optionLiteral: string, optionName: string): any;
  selectmenu(optionLiteral: string, options: JQueryUI.SelectMenuOptions): any;
  selectmenu(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  slider(): JQuery;
  slider(methodName: 'destroy'): void;
  slider(methodName: 'disable'): void;
  slider(methodName: 'enable'): void;
  slider(methodName: 'refresh'): void;
  slider(methodName: 'value'): number;
  slider(methodName: 'value', value: number): void;
  slider(methodName: 'values'): number[];
  slider(methodName: 'values', index: number): number;
  slider(methodName: string, index: number, value: number): void;
  slider(methodName: 'values', index: number, value: number): void;
  slider(methodName: string, values: number[]): void;
  slider(methodName: 'values', values: number[]): void;
  slider(methodName: 'widget'): JQuery;
  slider(methodName: string): JQuery;
  slider(options: JQueryUI.SliderOptions): JQuery;
  slider(optionLiteral: string, optionName: string): any;
  slider(optionLiteral: string, options: JQueryUI.SliderOptions): any;
  slider(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  sortable(): JQuery;
  sortable(methodName: 'destroy'): void;
  sortable(methodName: 'disable'): void;
  sortable(methodName: 'enable'): void;
  sortable(methodName: 'widget'): JQuery;
  sortable(methodName: 'toArray', options?: { attribute?: string | undefined }): string[];
  sortable(methodName: string): JQuery;
  sortable(options: JQueryUI.SortableOptions): JQuery;
  sortable(optionLiteral: string, optionName: string): any;
  sortable(
    methodName: 'serialize',
    options?: { key?: string | undefined; attribute?: string | undefined; expression?: RegExp | undefined }
  ): string;
  sortable(optionLiteral: string, options: JQueryUI.SortableOptions): any;
  sortable(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  spinner(): JQuery;
  spinner(methodName: 'destroy'): void;
  spinner(methodName: 'disable'): void;
  spinner(methodName: 'enable'): void;
  spinner(methodName: 'pageDown', pages?: number): void;
  spinner(methodName: 'pageUp', pages?: number): void;
  spinner(methodName: 'stepDown', steps?: number): void;
  spinner(methodName: 'stepUp', steps?: number): void;
  spinner(methodName: 'value'): number;
  spinner(methodName: 'value', value: number): void;
  spinner(methodName: 'widget'): JQuery;
  spinner(methodName: string): JQuery;
  spinner(options: JQueryUI.SpinnerOptions): JQuery;
  spinner(optionLiteral: string, optionName: string): any;
  spinner(optionLiteral: string, options: JQueryUI.SpinnerOptions): any;
  spinner(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  tabs(): JQuery;
  tabs(methodName: 'destroy'): void;
  tabs(methodName: 'disable'): void;
  tabs(methodName: 'disable', index: number): void;
  tabs(methodName: 'enable'): void;
  tabs(methodName: 'enable', index: number): void;
  tabs(methodName: 'load', index: number): void;
  tabs(methodName: 'refresh'): void;
  tabs(methodName: 'widget'): JQuery;
  tabs(methodName: 'select', index: number): JQuery;
  tabs(methodName: string): JQuery;
  tabs(options: JQueryUI.TabsOptions): JQuery;
  tabs(optionLiteral: string, optionName: string): any;
  tabs(optionLiteral: string, options: JQueryUI.TabsOptions): any;
  tabs(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  tooltip(): JQuery;
  tooltip(methodName: 'destroy'): void;
  tooltip(methodName: 'disable'): void;
  tooltip(methodName: 'enable'): void;
  tooltip(methodName: 'open'): void;
  tooltip(methodName: 'close'): void;
  tooltip(methodName: 'widget'): JQuery;
  tooltip(methodName: string): JQuery;
  tooltip(options: JQueryUI.TooltipOptions): JQuery;
  tooltip(optionLiteral: string, optionName: string): any;
  tooltip(optionLiteral: string, options: JQueryUI.TooltipOptions): any;
  tooltip(optionLiteral: string, optionName: string, optionValue: any): JQuery;
  addClass(classNames: string, speed?: number, callback?: Function): this;
  addClass(classNames: string, speed?: string, callback?: Function): this;
  addClass(classNames: string, speed?: number, easing?: string, callback?: Function): this;
  addClass(classNames: string, speed?: string, easing?: string, callback?: Function): this;
  removeClass(classNames: string, speed?: number, callback?: Function): this;
  removeClass(classNames: string, speed?: string, callback?: Function): this;
  removeClass(classNames: string, speed?: number, easing?: string, callback?: Function): this;
  removeClass(classNames: string, speed?: string, easing?: string, callback?: Function): this;
  switchClass(
    removeClassName: string,
    addClassName: string,
    duration?: number,
    easing?: string,
    complete?: Function
  ): this;
  switchClass(
    removeClassName: string,
    addClassName: string,
    duration?: string,
    easing?: string,
    complete?: Function
  ): this;
  toggleClass(className: string, duration?: number, easing?: string, complete?: Function): this;
  toggleClass(className: string, duration?: string, easing?: string, complete?: Function): this;
  toggleClass(className: string, aswitch?: boolean, duration?: number, easing?: string, complete?: Function): this;
  toggleClass(className: string, aswitch?: boolean, duration?: string, easing?: string, complete?: Function): this;
  effect(options: any): this;
  effect(effect: string, options?: any, duration?: number, complete?: Function): this;
  effect(effect: string, options?: any, duration?: string, complete?: Function): this;
  hide(options: any): this;
  hide(effect: string, options?: any, duration?: number, complete?: Function): this;
  hide(effect: string, options?: any, duration?: string, complete?: Function): this;
  show(options: any): this;
  show(effect: string, options?: any, duration?: number, complete?: Function): this;
  show(effect: string, options?: any, duration?: string, complete?: Function): this;
  toggle(options: any): this;
  toggle(effect: string, options?: any, duration?: number, complete?: Function): this;
  toggle(effect: string, options?: any, duration?: string, complete?: Function): this;
  position(options: JQueryUI.JQueryPositionOptions): JQuery;
  enableSelection(): JQuery;
  disableSelection(): JQuery;
  focus(delay: number, callback?: Function): JQuery;
  uniqueId(): JQuery;
  removeUniqueId(): JQuery;
  scrollParent(): JQuery;
  zIndex(): number;
  zIndex(zIndex: number): JQuery;
  widget: JQueryUI.Widget;
  jQuery: JQueryStatic;
}
interface JQueryStatic {
  ui: JQueryUI.UI;
  datepicker: JQueryUI.Datepicker;
  widget: JQueryUI.Widget;
  Widget: JQueryUI.Widget;
}
type JQueryEasingFunction = (...args: any[]) => any;

declare interface JQueryEasingFunctions {
  easeInQuad: JQueryEasingFunction;
  easeOutQuad: JQueryEasingFunction;
  easeInOutQuad: JQueryEasingFunction;
  easeInCubic: JQueryEasingFunction;
  easeOutCubic: JQueryEasingFunction;
  easeInOutCubic: JQueryEasingFunction;
  easeInQuart: JQueryEasingFunction;
  easeOutQuart: JQueryEasingFunction;
  easeInOutQuart: JQueryEasingFunction;
  easeInQuint: JQueryEasingFunction;
  easeOutQuint: JQueryEasingFunction;
  easeInOutQuint: JQueryEasingFunction;
  easeInExpo: JQueryEasingFunction;
  easeOutExpo: JQueryEasingFunction;
  easeInOutExpo: JQueryEasingFunction;
  easeInSine: JQueryEasingFunction;
  easeOutSine: JQueryEasingFunction;
  easeInOutSine: JQueryEasingFunction;
  easeInCirc: JQueryEasingFunction;
  easeOutCirc: JQueryEasingFunction;
  easeInOutCirc: JQueryEasingFunction;
  easeInElastic: JQueryEasingFunction;
  easeOutElastic: JQueryEasingFunction;
  easeInOutElastic: JQueryEasingFunction;
  easeInBack: JQueryEasingFunction;
  easeOutBack: JQueryEasingFunction;
  easeInOutBack: JQueryEasingFunction;
  easeInBounce: JQueryEasingFunction;
  easeOutBounce: JQueryEasingFunction;
  easeInOutBounce: JQueryEasingFunction;
}

export {};
