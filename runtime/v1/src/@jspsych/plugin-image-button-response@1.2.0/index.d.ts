import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from '../../jspsych@7.3.4/index.d.ts';

declare const info: {
  readonly name: 'image-button-response';
  readonly parameters: {
    /** The image to be displayed */
    readonly stimulus: {
      readonly type: ParameterType.IMAGE;
      readonly pretty_name: 'Stimulus';
      readonly default: any;
    };
    /** Set the image height in pixels */
    readonly stimulus_height: {
      readonly type: ParameterType.INT;
      readonly pretty_name: 'Image height';
      readonly default: any;
    };
    /** Set the image width in pixels */
    readonly stimulus_width: {
      readonly type: ParameterType.INT;
      readonly pretty_name: 'Image width';
      readonly default: any;
    };
    /** Maintain the aspect ratio after setting width or height */
    readonly maintain_aspect_ratio: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Maintain aspect ratio';
      readonly default: true;
    };
    /** Array containing the label(s) for the button(s). */
    readonly choices: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Choices';
      readonly default: any;
      readonly array: true;
    };
    /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
    readonly button_html: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'Button HTML';
      readonly default: '<button class="jspsych-btn">%choice%</button>';
      readonly array: true;
    };
    /** Any content here will be displayed under the button. */
    readonly prompt: {
      readonly type: ParameterType.HTML_STRING;
      readonly pretty_name: 'Prompt';
      readonly default: any;
    };
    /** How long to show the stimulus. */
    readonly stimulus_duration: {
      readonly type: ParameterType.INT;
      readonly pretty_name: 'Stimulus duration';
      readonly default: any;
    };
    /** How long to show the trial. */
    readonly trial_duration: {
      readonly type: ParameterType.INT;
      readonly pretty_name: 'Trial duration';
      readonly default: any;
    };
    /** The vertical margin of the button. */
    readonly margin_vertical: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Margin vertical';
      readonly default: '0px';
    };
    /** The horizontal margin of the button. */
    readonly margin_horizontal: {
      readonly type: ParameterType.STRING;
      readonly pretty_name: 'Margin horizontal';
      readonly default: '8px';
    };
    /** If true, then trial will end when user responds. */
    readonly response_ends_trial: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Response ends trial';
      readonly default: true;
    };
    /**
     * If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
     * If false, the image will be shown via an img element.
     */
    readonly render_on_canvas: {
      readonly type: ParameterType.BOOL;
      readonly pretty_name: 'Render on canvas';
      readonly default: true;
    };
    /** The delay of enabling button */
    readonly enable_button_after: {
      readonly type: ParameterType.INT;
      readonly pretty_name: 'Enable button after';
      readonly default: 0;
    };
  };
};
type Info = typeof info;
/**
 * **image-button-response**
 *
 * jsPsych plugin for displaying an image stimulus and getting a button response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-image-button-response/ image-button-response plugin documentation on jspsych.org}
 */
declare class ImageButtonResponsePlugin implements JsPsychPlugin<Info> {
  private jsPsych;
  static info: {
    readonly name: 'image-button-response';
    readonly parameters: {
      /** The image to be displayed */
      readonly stimulus: {
        readonly type: ParameterType.IMAGE;
        readonly pretty_name: 'Stimulus';
        readonly default: any;
      };
      /** Set the image height in pixels */
      readonly stimulus_height: {
        readonly type: ParameterType.INT;
        readonly pretty_name: 'Image height';
        readonly default: any;
      };
      /** Set the image width in pixels */
      readonly stimulus_width: {
        readonly type: ParameterType.INT;
        readonly pretty_name: 'Image width';
        readonly default: any;
      };
      /** Maintain the aspect ratio after setting width or height */
      readonly maintain_aspect_ratio: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Maintain aspect ratio';
        readonly default: true;
      };
      /** Array containing the label(s) for the button(s). */
      readonly choices: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Choices';
        readonly default: any;
        readonly array: true;
      };
      /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
      readonly button_html: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'Button HTML';
        readonly default: '<button class="jspsych-btn">%choice%</button>';
        readonly array: true;
      };
      /** Any content here will be displayed under the button. */
      readonly prompt: {
        readonly type: ParameterType.HTML_STRING;
        readonly pretty_name: 'Prompt';
        readonly default: any;
      };
      /** How long to show the stimulus. */
      readonly stimulus_duration: {
        readonly type: ParameterType.INT;
        readonly pretty_name: 'Stimulus duration';
        readonly default: any;
      };
      /** How long to show the trial. */
      readonly trial_duration: {
        readonly type: ParameterType.INT;
        readonly pretty_name: 'Trial duration';
        readonly default: any;
      };
      /** The vertical margin of the button. */
      readonly margin_vertical: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Margin vertical';
        readonly default: '0px';
      };
      /** The horizontal margin of the button. */
      readonly margin_horizontal: {
        readonly type: ParameterType.STRING;
        readonly pretty_name: 'Margin horizontal';
        readonly default: '8px';
      };
      /** If true, then trial will end when user responds. */
      readonly response_ends_trial: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Response ends trial';
        readonly default: true;
      };
      /**
       * If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
       * If false, the image will be shown via an img element.
       */
      readonly render_on_canvas: {
        readonly type: ParameterType.BOOL;
        readonly pretty_name: 'Render on canvas';
        readonly default: true;
      };
      /** The delay of enabling button */
      readonly enable_button_after: {
        readonly type: ParameterType.INT;
        readonly pretty_name: 'Enable button after';
        readonly default: 0;
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

export default ImageButtonResponsePlugin;
