import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from '../../jspsych@7.3.4/index.d.ts';

declare const info: {
  readonly name: 'survey-text';
  readonly parameters: {
    readonly questions: {
      readonly type: ParameterType.COMPLEX;
      readonly array: true;
      readonly pretty_name: 'Questions';
      readonly default: any;
      readonly nested: {
        /** Question prompt. */
        readonly prompt: {
          readonly type: ParameterType.HTML_STRING;
          readonly pretty_name: 'Prompt';
          readonly default: any;
        };
        /** Placeholder text in the response text box. */
        readonly placeholder: {
          readonly type: ParameterType.STRING;
          readonly pretty_name: 'Placeholder';
          readonly default: '';
        };
        /** The number of rows for the response text box. */
        readonly rows: {
          readonly type: ParameterType.INT;
          readonly pretty_name: 'Rows';
          readonly default: 1;
        };
        /** The number of columns for the response text box. */
        readonly columns: {
          readonly type: ParameterType.INT;
          readonly pretty_name: 'Columns';
          readonly default: 40;
        };
        /** Whether or not a response to this question must be given in order to continue. */
        readonly required: {
          readonly type: ParameterType.BOOL;
          readonly pretty_name: 'Required';
          readonly default: false;
        };
        /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
        readonly name: {
          readonly type: ParameterType.STRING;
          readonly pretty_name: 'Question Name';
          readonly default: '';
        };
      };
    };
    /** If true, the order of the questions in the 'questions' array will be randomized. */
    readonly randomize_question_order: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Randomize Question Order';
      readonly default: false;
    };
    /** HTML-formatted string to display at top of the page above all of the questions. */
    readonly preamble: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'Preamble';
      readonly default: any;
    };
    /** Label of the button to submit responses. */
    readonly button_label: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Button label';
      readonly default: 'Continue';
    };
    /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
    readonly autocomplete: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Allow autocomplete';
      readonly default: false;
    };
  };
};
type Info = typeof info;
/**
 * **survey-text**
 *
 * jsPsych plugin for free text response survey questions
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-survey-text/ survey-text plugin documentation on jspsych.org}
 */
declare class SurveyTextPlugin implements JsPsychPlugin<Info> {
  private jsPsych;
  static info: {
    readonly name: 'survey-text';
    readonly parameters: {
      readonly questions: {
        readonly type: ParameterType.COMPLEX;
        readonly array: true;
        readonly pretty_name: 'Questions';
        readonly default: any;
        readonly nested: {
          /** Question prompt. */
          readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly pretty_name: 'Prompt';
            readonly default: any;
          };
          /** Placeholder text in the response text box. */
          readonly placeholder: {
            readonly type: ParameterType.STRING;
            readonly pretty_name: 'Placeholder';
            readonly default: '';
          };
          /** The number of rows for the response text box. */
          readonly rows: {
            readonly type: ParameterType.INT;
            readonly pretty_name: 'Rows';
            readonly default: 1;
          };
          /** The number of columns for the response text box. */
          readonly columns: {
            readonly type: ParameterType.INT;
            readonly pretty_name: 'Columns';
            readonly default: 40;
          };
          /** Whether or not a response to this question must be given in order to continue. */
          readonly required: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: 'Required';
            readonly default: false;
          };
          /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
          readonly name: {
            readonly type: ParameterType.STRING;
            readonly pretty_name: 'Question Name';
            readonly default: '';
          };
        };
      };
      /** If true, the order of the questions in the 'questions' array will be randomized. */
      readonly randomize_question_order: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Randomize Question Order';
        readonly default: false;
      };
      /** HTML-formatted string to display at top of the page above all of the questions. */
      readonly preamble: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'Preamble';
        readonly default: any;
      };
      /** Label of the button to submit responses. */
      readonly button_label: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Button label';
        readonly default: 'Continue';
      };
      /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
      readonly autocomplete: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Allow autocomplete';
        readonly default: false;
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

export default SurveyTextPlugin;
