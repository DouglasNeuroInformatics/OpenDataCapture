import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from '../../jspsych@7.3.4/index.d.ts';

declare const info: {
  readonly name: 'preload';
  readonly parameters: {
    /** Whether or not to automatically preload any media files based on the timeline passed to jsPsych.run. */
    readonly auto_preload: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Auto-preload';
      readonly default: false;
    };
    /** A timeline of trials to automatically preload. If one or more trial objects is provided in the timeline array, then the plugin will attempt to preload the media files used in the trial(s). */
    readonly trials: {
      readonly type: ParameterType.TIMELINE;
      readonly pretty_name: 'Trials';
      readonly default: readonly [];
    };
    /**
     * Array with one or more image files to load. This parameter is often used in cases where media files cannot#
     * be automatically preloaded based on the timeline, e.g. because the media files are passed into an image plugin/parameter with
     * timeline variables or dynamic parameters, or because the image is embedded in an HTML string.
     */
    readonly images: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Images';
      readonly default: readonly [];
      readonly array: true;
    };
    /**
     * Array with one or more audio files to load. This parameter is often used in cases where media files cannot
     * be automatically preloaded based on the timeline, e.g. because the media files are passed into an audio plugin/parameter with
     * timeline variables or dynamic parameters, or because the audio is embedded in an HTML string.
     */
    readonly audio: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Audio';
      readonly default: readonly [];
      readonly array: true;
    };
    /**
     * Array with one or more video files to load. This parameter is often used in cases where media files cannot
     * be automatically preloaded based on the timeline, e.g. because the media files are passed into a video plugin/parameter with
     * timeline variables or dynamic parameters, or because the video is embedded in an HTML string.
     */
    readonly video: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Video';
      readonly default: readonly [];
      readonly array: true;
    };
    /** HTML-formatted message to be shown above the progress bar while the files are loading. */
    readonly message: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'Message';
      readonly default: any;
    };
    /** Whether or not to show the loading progress bar. */
    readonly show_progress_bar: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Show progress bar';
      readonly default: true;
    };
    /**
     * Whether or not to continue with the experiment if a loading error occurs. If false, then if a loading error occurs,
     * the error_message will be shown on the page and the trial will not end. If true, then if if a loading error occurs, the trial will end
     * and preloading failure will be logged in the trial data.
     */
    readonly continue_after_error: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Continue after error';
      readonly default: false;
    };
    /** Error message to show on the page in case of any loading errors. This parameter is only relevant when continue_after_error is false. */
    readonly error_message: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'Error message';
      readonly default: 'The experiment failed to load.';
    };
    /**
     * Whether or not to show a detailed error message on the page. If true, then detailed error messages will be shown on the
     * page for all files that failed to load, along with the general error_message. This parameter is only relevant when continue_after_error is false.
     */
    readonly show_detailed_errors: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Show detailed errors';
      readonly default: false;
    };
    /**
     * The maximum amount of time that the plugin should wait before stopping the preload and either ending the trial
     * (if continue_after_error is true) or stopping the experiment with an error message (if continue_after_error is false).
     * If null, the plugin will wait indefintely for the files to load.
     */
    readonly max_load_time: {
      readonly type: ParameterType.INT;
      readonly pretty_name: 'Max load time';
      readonly default: any;
    };
    /** Function to be called after a file fails to load. The function takes the file name as its only argument. */
    readonly on_error: {
      readonly type: ParameterType.FUNCTION;
      readonly pretty_name: 'On error';
      readonly default: any;
    };
    /** Function to be called after a file loads successfully. The function takes the file name as its only argument. */
    readonly on_success: {
      readonly type: ParameterType.FUNCTION;
      readonly pretty_name: 'On success';
      readonly default: any;
    };
  };
};
type Info = typeof info;
/**
 * **preload**
 *
 * jsPsych plugin for preloading image, audio, and video files
 *
 * @author Becky Gilbert
 * @see {@link https://www.jspsych.org/plugins/jspsych-preload/ preload plugin documentation on jspsych.org}
 */
declare class PreloadPlugin implements JsPsychPlugin<Info> {
  private jsPsych;
  static info: {
    readonly name: 'preload';
    readonly parameters: {
      /** Whether or not to automatically preload any media files based on the timeline passed to jsPsych.run. */
      readonly auto_preload: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Auto-preload';
        readonly default: false;
      };
      /** A timeline of trials to automatically preload. If one or more trial objects is provided in the timeline array, then the plugin will attempt to preload the media files used in the trial(s). */
      readonly trials: {
        readonly type: ParameterType.TIMELINE;
        readonly pretty_name: 'Trials';
        readonly default: readonly [];
      };
      /**
       * Array with one or more image files to load. This parameter is often used in cases where media files cannot#
       * be automatically preloaded based on the timeline, e.g. because the media files are passed into an image plugin/parameter with
       * timeline variables or dynamic parameters, or because the image is embedded in an HTML string.
       */
      readonly images: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Images';
        readonly default: readonly [];
        readonly array: true;
      };
      /**
       * Array with one or more audio files to load. This parameter is often used in cases where media files cannot
       * be automatically preloaded based on the timeline, e.g. because the media files are passed into an audio plugin/parameter with
       * timeline variables or dynamic parameters, or because the audio is embedded in an HTML string.
       */
      readonly audio: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Audio';
        readonly default: readonly [];
        readonly array: true;
      };
      /**
       * Array with one or more video files to load. This parameter is often used in cases where media files cannot
       * be automatically preloaded based on the timeline, e.g. because the media files are passed into a video plugin/parameter with
       * timeline variables or dynamic parameters, or because the video is embedded in an HTML string.
       */
      readonly video: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Video';
        readonly default: readonly [];
        readonly array: true;
      };
      /** HTML-formatted message to be shown above the progress bar while the files are loading. */
      readonly message: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'Message';
        readonly default: any;
      };
      /** Whether or not to show the loading progress bar. */
      readonly show_progress_bar: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Show progress bar';
        readonly default: true;
      };
      /**
       * Whether or not to continue with the experiment if a loading error occurs. If false, then if a loading error occurs,
       * the error_message will be shown on the page and the trial will not end. If true, then if if a loading error occurs, the trial will end
       * and preloading failure will be logged in the trial data.
       */
      readonly continue_after_error: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Continue after error';
        readonly default: false;
      };
      /** Error message to show on the page in case of any loading errors. This parameter is only relevant when continue_after_error is false. */
      readonly error_message: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'Error message';
        readonly default: 'The experiment failed to load.';
      };
      /**
       * Whether or not to show a detailed error message on the page. If true, then detailed error messages will be shown on the
       * page for all files that failed to load, along with the general error_message. This parameter is only relevant when continue_after_error is false.
       */
      readonly show_detailed_errors: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Show detailed errors';
        readonly default: false;
      };
      /**
       * The maximum amount of time that the plugin should wait before stopping the preload and either ending the trial
       * (if continue_after_error is true) or stopping the experiment with an error message (if continue_after_error is false).
       * If null, the plugin will wait indefintely for the files to load.
       */
      readonly max_load_time: {
        readonly type: ParameterType.INT;
        readonly pretty_name: 'Max load time';
        readonly default: any;
      };
      /** Function to be called after a file fails to load. The function takes the file name as its only argument. */
      readonly on_error: {
        readonly type: ParameterType.FUNCTION;
        readonly pretty_name: 'On error';
        readonly default: any;
      };
      /** Function to be called after a file loads successfully. The function takes the file name as its only argument. */
      readonly on_success: {
        readonly type: ParameterType.FUNCTION;
        readonly pretty_name: 'On success';
        readonly default: any;
      };
    };
  };
  constructor(jsPsych: JsPsych);
  trial(display_element: HTMLElement, trial: TrialType<Info>): void;
  simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
  private create_simulation_data;
  private simulate_data_only;
  private simulate_visual;
}

export default PreloadPlugin;
