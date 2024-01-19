const { HtmlKeyboardResponsePlugin, ImageKeyboardResponsePlugin, PreloadPlugin, initJsPsych } = await import(
  '/runtime/v0.0.1/jspsych.js'
);

// import { initJsPsych } from 'jspsych';
// import HtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
// import Preload from '@jspsych/plugin-preload';
// import ImageKeyboardResponsePlugin from '@jspsych/plugin-image-keyboard-response';

import 'jspsych/css/jspsych.css';

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
  images: ['img/blue.png', 'img/orange.png'],
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
        <div style='float: left;'><img src='img/blue.png'></img>
        <p class='small'><strong>Press the F key</strong></p></div>
        <div style='float: right;'><img src='img/orange.png'></img>
        <p class='small'><strong>Press the J key</strong></p></div>
        </div>
        <p>Press any key to begin.</p>
      `,
  type: HtmlKeyboardResponsePlugin
};
timeline.push(instructions);

// Define trial stimuli array for timeline variables
const test_stimuli = [
  { correct_response: 'f', stimulus: 'img/blue.png' },
  { correct_response: 'j', stimulus: 'img/orange.png' }
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

// Start the experiment
jsPsych.run(timeline);
