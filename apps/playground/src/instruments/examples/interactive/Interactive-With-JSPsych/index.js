const { initJsPsych } = await import('/runtime/v1/jspsych@7.3.4/index.js');
const { default: HtmlKeyboardResponsePlugin } = await import(
  '/runtime/v1/@jspsych/plugin-html-keyboard-response@1.1.3/index.js'
);
const { default: ImageKeyboardResponsePlugin } = await import(
  '/runtime/v1/@jspsych/plugin-image-keyboard-response@1.1.3/index.js'
);
const { default: PreloadPlugin } = await import('/runtime/v1/@jspsych/plugin-preload@1.1.3/index.js');

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

// import blue from '../../assets/img/blue.png';
// import orange from '../../assets/img/orange.png';

const blue = '';
const orange = '';

export default defineInstrument({
  content: {
    render() {
      // First we have to initialize jsPsych
      const jsPsych = initJsPsych({
        on_finish: function () {
          jsPsych.data.displayData();
        }
      });

      /**
       * All jsPsych experiments are defined by a timeline. The timeline is an
       * array that contains the set of trials we want to run in the experiment.
       * @type {Record<string, any>[]} */
      const timeline = [];

      // Preload images
      const preload = {
        images: [blue, orange],
        type: PreloadPlugin
      };
      timeline.push(preload);

      // Define welcome message trial
      const welcome = {
        stimulus: 'Welcome to the experiment. Press any key to begin.',
        type: HtmlKeyboardResponsePlugin
      };
      timeline.push(welcome);

      // Define instructions trial
      const instructions = {
        post_trial_gap: 2000,
        stimulus: `
        <p>In this experiment, a circle will appear in the center 
        of the screen.</p><p>If the circle is <strong>blue</strong>, 
        press the letter F on the keyboard as fast as you can.</p>
        <p>If the circle is <strong>orange</strong>, press the letter J 
        as fast as you can.</p>
        <div style='width: 700px;'>
        <div style='float: left;'><img src='${blue}'></img>
        <p class='small'><strong>Press the F key</strong></p></div>
        <div style='float: right;'><img src='${orange}'></img>
        <p class='small'><strong>Press the J key</strong></p></div>
        </div>
        <p>Press any key to begin.</p>
      `,
        type: HtmlKeyboardResponsePlugin
      };
      timeline.push(instructions);

      // Define trial stimuli array for timeline variables
      const test_stimuli = [
        { correct_response: 'f', stimulus: blue },
        { correct_response: 'j', stimulus: orange }
      ];

      // Define fixation and test trials
      const fixation = {
        choices: 'NO_KEYS',
        data: {
          task: 'fixation'
        },
        stimulus: '<div style="font-size:60px;">+</div>',
        trial_duration: function () {
          return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
        },
        type: HtmlKeyboardResponsePlugin
      };

      const test = {
        choices: ['f', 'j'],
        data: {
          correct_response: jsPsych.timelineVariable('correct_response'),
          task: 'response'
        },
        /** @type {(data: Record<string, any>) => any} */
        on_finish: function (data) {
          data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
        },
        stimulus: jsPsych.timelineVariable('stimulus'),
        type: ImageKeyboardResponsePlugin
      };

      // Define test procedure
      const test_procedure = {
        randomize_order: true,
        repetitions: 5,
        timeline: [fixation, test],
        timeline_variables: test_stimuli
      };
      timeline.push(test_procedure);

      // Define debrief
      const debrief_block = {
        stimulus: function () {
          const trials = jsPsych.data.get().filter({ task: 'response' });
          const correct_trials = trials.filter({ correct: true });
          const accuracy = Math.round((correct_trials.count() / trials.count()) * 100);
          const rt = Math.round(correct_trials.select('rt').mean());

          return `<p>You responded correctly on ${accuracy}% of the trials.</p>
          <p>Your average response time was ${rt}ms.</p>
          <p>Press any key to complete the experiment. Thank you!</p>`;
        },
        type: HtmlKeyboardResponsePlugin
      };

      timeline.push(debrief_block);

      jsPsych.run(timeline);
    }
  },
  details: {
    description: 'This reaction time task is a non-trivial proof of concept with jspsych.',
    estimatedDuration: 1,
    instructions: ['The user will be displayed instructions on the screen'],
    license: 'MIT',
    title: 'Reaction Time Task'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {},
  name: 'ReactionTimeTask',
  tags: ['Interactive'],
  validationSchema: z.any(),
  version: 1.0
});
