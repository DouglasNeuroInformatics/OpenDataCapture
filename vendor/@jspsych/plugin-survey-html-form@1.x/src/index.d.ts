import type { JsPsych, JsPsychPlugin, ParameterType, TrialType } from 'jspsych__7.x';

declare const info: {
  readonly name: 'survey-html-form';
  readonly parameters: {
    /** HTML formatted string containing all the input elements to display. Every element has to have its own distinctive name attribute. The <form> tag must not be included and is generated by the plugin. */
    readonly html: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'HTML';
      readonly default: any;
    };
    /** HTML formatted string to display at the top of the page above all the questions. */
    readonly preamble: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'Preamble';
      readonly default: any;
    };
    /** The text that appears on the button to finish the trial. */
    readonly button_label: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Button label';
      readonly default: 'Continue';
    };
    /** The HTML element ID of a form field to autofocus on. */
    readonly autofocus: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Element ID to focus';
      readonly default: '';
    };
    /** Retrieve the data as an array e.g. [{name: "INPUT_NAME", value: "INPUT_VALUE"}, ...] instead of an object e.g. {INPUT_NAME: INPUT_VALUE, ...}. */
    readonly dataAsArray: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Data As Array';
      readonly default: false;
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
 * **survey-html-form**
 *
 * jsPsych plugin for displaying free HTML forms and collecting responses from all input elements
 *
 * @author Jan Simson
 * @see {@link https://www.jspsych.org/plugins/jspsych-survey-html-form/ survey-html-form plugin documentation on jspsych.org}
 */
declare class SurveyHtmlFormPlugin implements JsPsychPlugin<Info> {
  private jsPsych;
  static info: {
    readonly name: 'survey-html-form';
    readonly parameters: {
      /** HTML formatted string containing all the input elements to display. Every element has to have its own distinctive name attribute. The <form> tag must not be included and is generated by the plugin. */
      readonly html: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'HTML';
        readonly default: any;
      };
      /** HTML formatted string to display at the top of the page above all the questions. */
      readonly preamble: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'Preamble';
        readonly default: any;
      };
      /** The text that appears on the button to finish the trial. */
      readonly button_label: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Button label';
        readonly default: 'Continue';
      };
      /** The HTML element ID of a form field to autofocus on. */
      readonly autofocus: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Element ID to focus';
        readonly default: '';
      };
      /** Retrieve the data as an array e.g. [{name: "INPUT_NAME", value: "INPUT_VALUE"}, ...] instead of an object e.g. {INPUT_NAME: INPUT_VALUE, ...}. */
      readonly dataAsArray: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Data As Array';
        readonly default: false;
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
}

export { SurveyHtmlFormPlugin as default, SurveyHtmlFormPlugin };