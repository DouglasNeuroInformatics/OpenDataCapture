import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from '../../jspsych@7.3.4/index.d.ts';

declare const info: {
  readonly name: 'html-keyboard-response';
  readonly parameters: {
    /**
     * The HTML string to be displayed.
     */
    readonly stimulus: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'Stimulus';
      readonly default: any;
    };
    /**
     * Array containing the key(s) the subject is allowed to press to respond to the stimulus.
     */
    readonly choices: {
      readonly type: ParameterType.KEYS;
      readonly pretty_name: 'Choices';
      readonly default: 'ALL_KEYS';
    };
    /**
     * Any content here will be displayed below the stimulus.
     */
    readonly prompt: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'Prompt';
      readonly default: any;
    };
    /**
     * How long to show the stimulus.
     */
    readonly stimulus_duration: {
      readonly type: ParameterType.INT;
      readonly pretty_name: 'Stimulus duration';
      readonly default: any;
    };
    /**
     * How long to show trial before it ends.
     */
    readonly trial_duration: {
      readonly type: ParameterType.INT;
      readonly pretty_name: 'Trial duration';
      readonly default: any;
    };
    /**
     * If true, trial will end when subject makes a response.
     */
    readonly response_ends_trial: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Response ends trial';
      readonly default: true;
    };
  };
};
type Info = typeof info;
/**
 * **html-keyboard-response**
 *
 * jsPsych plugin for displaying a stimulus and getting a keyboard response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-html-keyboard-response/ html-keyboard-response plugin documentation on jspsych.org}
 */
declare class HtmlKeyboardResponsePlugin implements JsPsychPlugin<Info> {
  private jsPsych;
  static info: {
    readonly name: 'html-keyboard-response';
    readonly parameters: {
      /**
       * The HTML string to be displayed.
       */
      readonly stimulus: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'Stimulus';
        readonly default: any;
      };
      /**
       * Array containing the key(s) the subject is allowed to press to respond to the stimulus.
       */
      readonly choices: {
        readonly type: ParameterType.KEYS;
        readonly pretty_name: 'Choices';
        readonly default: 'ALL_KEYS';
      };
      /**
       * Any content here will be displayed below the stimulus.
       */
      readonly prompt: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'Prompt';
        readonly default: any;
      };
      /**
       * How long to show the stimulus.
       */
      readonly stimulus_duration: {
        readonly type: ParameterType.INT;
        readonly pretty_name: 'Stimulus duration';
        readonly default: any;
      };
      /**
       * How long to show trial before it ends.
       */
      readonly trial_duration: {
        readonly type: ParameterType.INT;
        readonly pretty_name: 'Trial duration';
        readonly default: any;
      };
      /**
       * If true, trial will end when subject makes a response.
       */
      readonly response_ends_trial: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Response ends trial';
        readonly default: true;
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

export default HtmlKeyboardResponsePlugin;
