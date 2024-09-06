import HtmlKeyboardResponsePlugin from '/runtime/v1/@jspsych/plugin-html-keyboard-response@2.x';
import ImageKeyboardResponsePlugin from '/runtime/v1/@jspsych/plugin-image-keyboard-response@2.x';
import PreloadPlugin from '/runtime/v1/@jspsych/plugin-preload@2.x';
import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { initJsPsych } from '/runtime/v1/jspsych@8.x';
import type { TimelineArray } from '/runtime/v1/jspsych@8.x';
import { z } from '/runtime/v1/zod@3.23.x';

import blue from './blue.png';
import orange from './orange.png';

import '/runtime/v1/jspsych@8.x/css/jspsych.css';

export default defineInstrument({
  content: {
    async render(done) {
      const jsPsych = initJsPsych({
        on_finish: () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          done(jsPsych.data.get() as any);
        }
      });
      const timeline: TimelineArray = [];

      /* preload images */
      timeline.push({
        images: [blue, orange],
        type: PreloadPlugin
      });

      /* define welcome message trial */
      timeline.push({
        stimulus: 'Welcome to the experiment. Press any key to begin.',
        type: HtmlKeyboardResponsePlugin
      });

      /* define instructions trial */
      timeline.push({
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
      });

      /* define trial stimuli array for timeline variables */
      const test_stimuli = [
        { correct_response: 'f', stimulus: blue },
        { correct_response: 'j', stimulus: orange }
      ];

      /* define fixation and test trials */
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
        on_finish: function (data: { correct: boolean; correct_response: string; response: string }) {
          data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
        },
        stimulus: jsPsych.timelineVariable('stimulus'),
        type: ImageKeyboardResponsePlugin
      };

      /* define test procedure */
      const test_procedure = {
        randomize_order: true,
        repetitions: 5,
        timeline: [fixation, test],
        timeline_variables: test_stimuli
      };
      timeline.push(test_procedure);

      /* define debrief */
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

      /* start the experiment */
      await jsPsych.run(timeline);
    }
  },
  details: {
    description: 'This reaction time task is a non-trivial proof of concept with jspsych.',
    estimatedDuration: 1,
    instructions: ['The user will be displayed instructions on the screen'],
    license: 'MIT',
    title: 'Reaction Time Task'
  },
  internal: {
    edition: 1,
    name: 'REACTION_TIME_TASK'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {},
  tags: ['Interactive'],
  validationSchema: z.array(
    z
      .object({
        failed_audio: z.array(z.any()),
        failed_images: z.array(z.any()),
        failed_video: z.array(z.any()),
        plugin_version: z.string(),
        success: z.boolean(),
        time_elapsed: z.number(),
        timeout: z.boolean(),
        trial_index: z.number(),
        trial_type: z.string()
      })
      .partial()
  )
});
