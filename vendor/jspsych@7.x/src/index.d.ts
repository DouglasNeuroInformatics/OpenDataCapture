declare function createJointPluginAPIObject(
  jsPsych: JsPsych
): KeyboardListenerAPI & TimeoutAPI & MediaAPI & HardwareAPI & SimulationAPI;

declare class DataCollection {
  private trials;
  constructor(data?: any[]);
  push(new_data: any): this;
  join(other_data_collection: DataCollection): this;
  top(): DataCollection;
  /**
   * Queries the first n elements in a collection of trials.
   *
   * @param n A positive integer of elements to return. A value of
   *          n that is less than 1 will throw an error.
   *
   * @return First n objects of a collection of trials. If fewer than
   *         n trials are available, the trials.length elements will
   *         be returned.
   *
   */
  first(n?: number): DataCollection;
  /**
   * Queries the last n elements in a collection of trials.
   *
   * @param n A positive integer of elements to return. A value of
   *          n that is less than 1 will throw an error.
   *
   * @return Last n objects of a collection of trials. If fewer than
   *         n trials are available, the trials.length elements will
   *         be returned.
   *
   */
  last(n?: number): DataCollection;
  values(): any[];
  count(): number;
  readOnly(): DataCollection;
  addToAll(properties: any): this;
  addToLast(properties: any): this;
  filter(filters: any): DataCollection;
  filterCustom(fn: any): DataCollection;
  filterColumns(columns: Array<string>): DataCollection;
  select(column: any): DataColumn;
  ignore(columns: any): DataCollection;
  uniqueNames(): any[];
  csv(): string;
  json(pretty?: boolean): string;
  localSave(format: any, filename: any): void;
}

declare class DataColumn {
  values: any[];
  constructor(values?: any[]);
  sum(): number;
  mean(): number;
  median(): any;
  min(): any;
  max(): any;
  count(): number;
  variance(): number;
  sd(): number;
  frequencies(): {};
  all(eval_fn: any): boolean;
  subset(eval_fn: any): DataColumn;
}

declare function deepCopy(obj: any): any;

/**
 * Merges two objects, recursively.
 * @param obj1 Object to merge
 * @param obj2 Object to merge
 */
declare function deepMerge(obj1: any, obj2: any): any;

declare function factorial(factors: Record<string, any>, repetitions?: number, unpack?: boolean): any;

declare interface GetKeyboardResponseOptions {
  callback_function: any;
  valid_responses?: ValidResponses;
  rt_method?: 'performance' | 'audio';
  persist?: boolean;
  audio_context?: AudioContext;
  audio_context_start_time?: number;
  allow_held_key?: boolean;
  minimum_valid_rt?: number;
}

declare class HardwareAPI {
  /**
   * Indicates whether this instance of jspsych has opened a hardware connection through our browser
   * extension
   **/
  hardwareConnected: boolean;
  constructor();
  /**
   * Allows communication with user hardware through our custom Google Chrome extension + native C++ program
   * @param		mess	The message to be passed to our extension, see its documentation for the expected members of this object.
   * @author	Daniel Rivas
   *
   */
  hardware(mess: any): void;
}

declare type InferredParameter<I extends ParameterInfo> = I['array'] extends true
  ? Array<ParameterTypeMap[I['type']]>
  : ParameterTypeMap[I['type']];

declare type InferredParameters<I extends ParameterInfos> = SetRequired<
  {
    [Property in keyof I]?: InferredParameter<I[Property]>;
  },
  RequiredParameterNames<I>
>;

/**
 * Creates a new JsPsych instance using the provided options.
 *
 * @param options The options to pass to the JsPsych constructor
 * @returns A new JsPsych instance
 */
export declare function initJsPsych(options?: any): JsPsych;

export declare class JsPsych {
  extensions: any;
  turk: typeof turk;
  randomization: typeof randomization;
  utils: typeof utils;
  data: JsPsychData;
  pluginAPI: PluginAPI;
  version(): any;
  /**
   * options
   */
  private opts;
  /**
   * experiment timeline
   */
  private timeline;
  private timelineDescription;
  private global_trial_index;
  private current_trial;
  private current_trial_finished;
  private DOM_container;
  private DOM_target;
  /**
   * time that the experiment began
   */
  private exp_start_time;
  /**
   * is the experiment paused?
   */
  private paused;
  private waiting;
  /**
   * is the page retrieved directly via file:// protocol (true) or hosted on a server (false)?
   */
  private file_protocol;
  /**
   * Promise that is resolved when `finishExperiment()` is called
   */
  private finished;
  private resolveFinishedPromise;
  /**
   * is the experiment running in `simulate()` mode
   */
  private simulation_mode;
  /**
   * simulation options passed in via `simulate()`
   */
  private simulation_options;
  webaudio_context: AudioContext;
  internal: {
    /**
     * this flag is used to determine whether we are in a scope where
     * jsPsych.timelineVariable() should be executed immediately or
     * whether it should return a function to access the variable later.
     *
     **/
    call_immediate: boolean;
  };
  constructor(options?: any);
  /**
   * Starts an experiment using the provided timeline and returns a promise that is resolved when
   * the experiment is finished.
   *
   * @param timeline The timeline to be run
   */
  run(timeline: any[]): Promise<void>;
  simulate(timeline: any[], simulation_mode?: 'data-only' | 'visual', simulation_options?: {}): Promise<void>;
  getProgress(): {
    total_trials: number;
    current_trial_global: number;
    percent_complete: number;
  };
  getStartTime(): any;
  getTotalTime(): number;
  getDisplayElement(): HTMLElement;
  getDisplayContainerElement(): HTMLElement;
  finishTrial(data?: {}): void;
  endExperiment(end_message?: string, data?: {}): void;
  endCurrentTimeline(): void;
  getCurrentTrial(): any;
  getInitSettings(): any;
  getCurrentTimelineNodeID(): any;
  timelineVariable(varname: string, immediate?: boolean): any;
  getAllTimelineVariables(): any;
  addNodeToEndOfTimeline(new_timeline: any, preload_callback?: any): void;
  pauseExperiment(): void;
  resumeExperiment(): void;
  loadFail(message: any): void;
  getSafeModeStatus(): boolean;
  getTimeline(): any[];
  private prepareDom;
  private loadExtensions;
  private startExperiment;
  private finishExperiment;
  private nextTrial;
  private doTrial;
  private evaluateTimelineVariables;
  private evaluateFunctionParameters;
  private replaceFunctionsWithValues;
  private setDefaultValues;
  private checkExclusions;
  private drawProgressBar;
  private updateProgressBar;
  private progress_bar_amount;
  setProgressBar(proportion_complete: any): void;
  getProgressBarCompleted(): number;
}

declare class JsPsychData {
  private jsPsych;
  private allData;
  private interactionData;
  private dataProperties;
  private query_string;
  constructor(jsPsych: JsPsych);
  reset(): void;
  get(): DataCollection;
  getInteractionData(): DataCollection;
  write(data_object: any): void;
  addProperties(properties: any): void;
  addDataToLastTrial(data: any): void;
  getDataByTimelineNode(node_id: any): DataCollection;
  getLastTrialData(): DataCollection;
  getLastTimelineData(): DataCollection;
  displayData(format?: string): void;
  urlVariables(): any;
  getURLVariable(whichvar: any): any;
  createInteractionListeners(): void;
  _customInsert(data: any): void;
  _fullreset(): void;
}

export declare interface JsPsychExtension {
  /**
   * Called once at the start of the experiment to initialize the extension
   */
  initialize(params?: Record<string, any>): Promise<void>;
  /**
   * Called at the start of a trial, prior to invoking the plugin's trial method.
   */
  on_start(params?: Record<string, any>): void;
  /**
   * Called during a trial, after the plugin makes initial changes to the DOM.
   */
  on_load(params?: Record<string, any>): void;
  /**
   * Called at the end of the trial.
   * @returns Data to append to the trial's data object.
   */
  on_finish(params?: Record<string, any>): Record<string, any> | Promise<Record<string, any>>;
}

export declare interface JsPsychExtensionInfo {
  name: string;
}

export declare interface JsPsychPlugin<I extends PluginInfo> {
  trial(display_element: HTMLElement, trial: TrialType<I>, on_load?: () => void): void | Promise<any>;
}

declare type KeyboardListener = (e: KeyboardEvent) => void;

declare class KeyboardListenerAPI {
  private getRootElement;
  private areResponsesCaseSensitive;
  private minimumValidRt;
  constructor(getRootElement: () => Element | undefined, areResponsesCaseSensitive?: boolean, minimumValidRt?: number);
  private listeners;
  private heldKeys;
  private areRootListenersRegistered;
  /**
   * If not previously done and `this.getRootElement()` returns an element, adds the root key
   * listeners to that element.
   */
  private registerRootListeners;
  private rootKeydownListener;
  private toLowerCaseIfInsensitive;
  private rootKeyupListener;
  private isResponseValid;
  getKeyboardResponse({
    callback_function,
    valid_responses,
    rt_method,
    persist,
    audio_context,
    audio_context_start_time,
    allow_held_key,
    minimum_valid_rt
  }: GetKeyboardResponseOptions): KeyboardListener;
  cancelKeyboardResponse(listener: KeyboardListener): void;
  cancelAllKeyboardResponses(): void;
  compareKeys(key1: string | null, key2: string | null): boolean;
}

declare class MediaAPI {
  private useWebaudio;
  private webaudioContext?;
  constructor(useWebaudio: boolean, webaudioContext?: AudioContext);
  private video_buffers;
  getVideoBuffer(videoID: string): any;
  private context;
  private audio_buffers;
  initAudio(): void;
  audioContext(): any;
  getAudioBuffer(audioID: any): Promise<unknown>;
  private preload_requests;
  private img_cache;
  preloadAudio(
    files: any,
    callback_complete?: () => void,
    callback_load?: (filepath: any) => void,
    callback_error?: (error_msg: any) => void
  ): void;
  preloadImages(
    images: any,
    callback_complete?: () => void,
    callback_load?: (filepath: any) => void,
    callback_error?: (error_msg: any) => void
  ): void;
  preloadVideo(
    videos: any,
    callback_complete?: () => void,
    callback_load?: (filepath: any) => void,
    callback_error?: (error_msg: any) => void
  ): void;
  private preloadMap;
  getAutoPreloadList(timeline_description: any[]): {
    images: string[];
    audio: string[];
    video: string[];
  };
  cancelPreloads(): void;
  private microphone_recorder;
  initializeMicrophoneRecorder(stream: MediaStream): void;
  getMicrophoneRecorder(): MediaRecorder;
  private camera_stream;
  private camera_recorder;
  initializeCameraRecorder(stream: MediaStream, opts?: MediaRecorderOptions): void;
  getCameraStream(): MediaStream;
  getCameraRecorder(): MediaRecorder;
}

declare interface ParameterInfo {
  type: ParameterType;
  array?: boolean;
  pretty_name?: string;
  default?: any;
  preload?: boolean;
}

declare interface ParameterInfos {
  [key: string]: ParameterInfo;
}

/**
 * Parameter types for plugins
 */
export declare enum ParameterType {
  BOOL = 0,
  STRING = 1,
  INT = 2,
  FLOAT = 3,
  FUNCTION = 4,
  KEY = 5,
  KEYS = 6,
  SELECT = 7,
  HTML_STRING = 8,
  IMAGE = 9,
  AUDIO = 10,
  VIDEO = 11,
  OBJECT = 12,
  COMPLEX = 13,
  TIMELINE = 14
}

declare type ParameterTypeMap = {
  [ParameterType.BOOL]: boolean;
  [ParameterType.STRING]: string;
  [ParameterType.INT]: number;
  [ParameterType.FLOAT]: number;
  [ParameterType.FUNCTION]: (...args: any[]) => any;
  [ParameterType.KEY]: string;
  [ParameterType.KEYS]: string[] | 'ALL_KEYS' | 'NO_KEYS';
  [ParameterType.SELECT]: any;
  [ParameterType.HTML_STRING]: string;
  [ParameterType.IMAGE]: string;
  [ParameterType.AUDIO]: string;
  [ParameterType.VIDEO]: string;
  [ParameterType.OBJECT]: object;
  [ParameterType.COMPLEX]: any;
  [ParameterType.TIMELINE]: any;
};

declare type PluginAPI = ReturnType<typeof createJointPluginAPIObject>;

export declare interface PluginInfo {
  name: string;
  parameters: {
    [key: string]: ParameterInfo;
  };
}

declare function randomID(length?: number): string;

/**
 * Generate a random integer from `lower` to `upper`, inclusive of both end points.
 * @param lower The lowest value it is possible to generate
 * @param upper The highest value it is possible to generate
 * @returns A random integer
 */
declare function randomInt(lower: number, upper: number): number;

declare namespace randomization {
  export {
    setSeed,
    repeat,
    shuffle,
    shuffleNoRepeats,
    shuffleAlternateGroups,
    sampleWithoutReplacement,
    sampleWithReplacement,
    factorial,
    randomID,
    randomInt,
    sampleBernoulli,
    sampleNormal,
    sampleExponential,
    sampleExGaussian,
    randomWords
  };
}

/**
 * Generate one or more random words.
 *
 * This is a wrapper function for the {@link https://www.npmjs.com/package/random-words `random-words` npm package}.
 *
 * @param opts An object with optional properties `min`, `max`, `exactly`,
 * `join`, `maxLength`, `wordsPerString`, `separator`, and `formatter`.
 *
 * @returns An array of words or a single string, depending on parameter choices.
 */
declare function randomWords(opts: any): string[];

declare function repeat(array: any, repetitions: any, unpack?: boolean): any;

declare type RequiredParameterNames<I extends ParameterInfos> = {
  [K in keyof I]: I[K]['default'] extends undefined ? K : never;
}[keyof I];

/**
 * Generates a random sample from a Bernoulli distribution.
 * @param p The probability of sampling 1.
 * @returns 0, with probability 1-p, or 1, with probability p.
 */
declare function sampleBernoulli(p: number): 0 | 1;

declare function sampleExGaussian(mean: number, standard_deviation: number, rate: number, positive?: boolean): number;

declare function sampleExponential(rate: number): number;

declare function sampleNormal(mean: number, standard_deviation: number): number;

declare function sampleWithoutReplacement(arr: any, size: any): any[];

declare function sampleWithReplacement(arr: any, size: any, weights?: any): any[];

/**
 Create a type that makes the given keys required. The remaining keys are kept as is.
 Borrowed from type-fest
 */
declare type SetRequired<BaseType, Keys extends keyof BaseType> = Simplify<
  Omit<BaseType, Keys> & Required<Pick<BaseType, Keys>>
>;

/**
 * Uses the `seedrandom` package to replace Math.random() with a seedable PRNG.
 *
 * @param seed An optional seed. If none is given, a random seed will be generated.
 * @returns The seed value.
 */
declare function setSeed(seed?: string): string;

declare function shuffle(array: Array<any>): any[];

declare function shuffleAlternateGroups(arr_groups: any, random_group_order?: boolean): any[];

declare function shuffleNoRepeats(arr: Array<any>, equalityTest: (a: any, b: any) => boolean): any[];

/**
 Flatten the type output to improve type hints shown in editors.
 Borrowed from type-fest
 */
declare type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType];
};

declare class SimulationAPI {
  private getDisplayContainerElement;
  private setJsPsychTimeout;
  constructor(
    getDisplayContainerElement: () => HTMLElement,
    setJsPsychTimeout: (callback: () => void, delay: number) => number
  );
  dispatchEvent(event: Event): void;
  /**
   * Dispatches a `keydown` event for the specified key
   * @param key Character code (`.key` property) for the key to press.
   */
  keyDown(key: string): void;
  /**
   * Dispatches a `keyup` event for the specified key
   * @param key Character code (`.key` property) for the key to press.
   */
  keyUp(key: string): void;
  /**
   * Dispatches a `keydown` and `keyup` event in sequence to simulate pressing a key.
   * @param key Character code (`.key` property) for the key to press.
   * @param delay Length of time to wait (ms) before executing action
   */
  pressKey(key: string, delay?: number): void;
  /**
   * Dispatches `mousedown`, `mouseup`, and `click` events on the target element
   * @param target The element to click
   * @param delay Length of time to wait (ms) before executing action
   */
  clickTarget(target: Element, delay?: number): void;
  /**
   * Sets the value of a target text input
   * @param target A text input element to fill in
   * @param text Text to input
   * @param delay Length of time to wait (ms) before executing action
   */
  fillTextInput(target: HTMLInputElement, text: string, delay?: number): void;
  /**
   * Picks a valid key from `choices`, taking into account jsPsych-specific
   * identifiers like "NO_KEYS" and "ALL_KEYS".
   * @param choices Which keys are valid.
   * @returns A key selected at random from the valid keys.
   */
  getValidKey(choices: 'NO_KEYS' | 'ALL_KEYS' | Array<string> | Array<Array<string>>): any;
  mergeSimulationData(default_data: any, simulation_options: any): any;
  ensureSimulationDataConsistency(trial: any, data: any): void;
}

/**
 * Send data to Mechnical Turk for storage.
 * @param data An object containing `key:value` pairs to send to Mechanical Turk. Values
 * cannot contain nested objects, arrays, or functions.
 * @returns Nothing
 */
declare function submitToTurk(data: any): void;

/**
 * A class that provides a wrapper around the global setTimeout and clearTimeout functions.
 */
declare class TimeoutAPI {
  private timeout_handlers;
  /**
   * Calls a function after a specified delay, in milliseconds.
   * @param callback The function to call after the delay.
   * @param delay The number of milliseconds to wait before calling the function.
   * @returns A handle that can be used to clear the timeout with clearTimeout.
   */
  setTimeout(callback: () => void, delay: number): number;
  /**
   * Clears all timeouts that have been created with setTimeout.
   */
  clearAllTimeouts(): void;
}

export declare type TrialType<I extends PluginInfo> = InferredParameters<I['parameters']> & UniversalPluginParameters;

declare namespace turk {
  export { turkInfo, submitToTurk };
}

/**
 * Gets information about the Mechanical Turk Environment, HIT, Assignment, and Worker
 * by parsing the URL variables that Mechanical Turk generates.
 * @returns An object containing information about the Mechanical Turk Environment, HIT, Assignment, and Worker.
 */
declare function turkInfo(): turkInformation;

declare interface turkInformation {
  /**
   * Is the experiment being loaded in preview mode on Mechanical Turk?
   */
  previewMode: boolean;
  /**
   * Is the experiment being loaded outside of the Mechanical Turk environment?
   */
  outsideTurk: boolean;
  /**
   * The HIT ID.
   */
  hitId: string;
  /**
   * The Assignment ID.
   */
  assignmentId: string;
  /**
   * The worker ID.
   */
  workerId: string;
  /**
   * URL for submission of the HIT.
   */
  turkSubmitTo: string;
}

/**
 * Finds all of the unique items in an array.
 * @param arr The array to extract unique values from
 * @returns An array with one copy of each unique item in `arr`
 */
declare function unique(arr: Array<any>): any[];

export declare type UniversalPluginParameters = InferredParameters<typeof universalPluginParameters>;

export declare const universalPluginParameters: {
  /**
   * Data to add to this trial (key-value pairs)
   */
  readonly data: {
    readonly type: ParameterType.OBJECT;
    readonly pretty_name: 'Data';
    readonly default: {};
  };
  /**
   * Function to execute when trial begins
   */
  readonly on_start: {
    readonly type: ParameterType.FUNCTION;
    readonly pretty_name: 'On start';
    readonly default: () => void;
  };
  /**
   * Function to execute when trial is finished
   */
  readonly on_finish: {
    readonly type: ParameterType.FUNCTION;
    readonly pretty_name: 'On finish';
    readonly default: () => void;
  };
  /**
   * Function to execute after the trial has loaded
   */
  readonly on_load: {
    readonly type: ParameterType.FUNCTION;
    readonly pretty_name: 'On load';
    readonly default: () => void;
  };
  /**
   * Length of gap between the end of this trial and the start of the next trial
   */
  readonly post_trial_gap: {
    readonly type: ParameterType.INT;
    readonly pretty_name: 'Post trial gap';
    readonly default: any;
  };
  /**
   * A list of CSS classes to add to the jsPsych display element for the duration of this trial
   */
  readonly css_classes: {
    readonly type: ParameterType.STRING;
    readonly pretty_name: 'Custom CSS classes';
    readonly default: any;
  };
  /**
   * Options to control simulation mode for the trial.
   */
  readonly simulation_options: {
    readonly type: ParameterType.COMPLEX;
    readonly default: any;
  };
};

declare namespace utils {
  export { unique, deepCopy, deepMerge };
}

declare type ValidResponses = string[] | 'ALL_KEYS' | 'NO_KEYS';
