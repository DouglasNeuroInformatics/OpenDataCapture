import fail from './fail.png';
import { main } from './main.js';
import success from './success.png';
import white from './white.jpg';

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

import './styles.css';

const html = `
<div id="content">
  <div id="headText"></div>
  <div id="trialNum"></div>
  <div id="stimDiv" class="slide">
    <img src=${white} name="question" id="question" class="stims" />
    <div style="margin-top: 60px">
      <img
        src=${white}
        name="leftmostStim"
        id="leftmostStim"
        class="stims"
      />
      <img
        src=${white}
        name="leftStim"
        id="leftStim"
        class="stims"
      />
      <img
        src=${white}
        name="centerStim"
        id="centerStim"
        class="stims"
      />
      <img
        src=${white}
        name="rightStim"
        id="rightStim"
        class="stims"
      />
      <img
        src=${white}
        name="rightmostStim"
        id="rightmostStim"
        class="stims"
      />
      <br />
    </div>
  </div>
  <div id="inst2" class="slide inst_div">
    <span id="inst2text"></span>
  </div>
  <div id="warn" class="slide inst_div">
    <span id="warning_text"></span>
  </div>
  <div id="correct" class="slide">
    <img src=${success} class="smiley" /><span id="correct_text"></span>
  </div>
  <div id="incorrect" class="slide">
    <img src=${fail} class="smiley" /><span id="incorrect_text"></span>
  </div>
  <div id="empty" class="slide"></div>
</div>
<form id="form" action="/run" method="POST">
  <input type="hidden" id="data" name="data" />
  <input type="hidden" id="score" name="score" value="0" />
</form>
</body>
`;

export default defineInstrument({
  content: {
    render() {
      document.body.innerHTML = html;
      main();
    }
  },
  details: {
    authors: [
      'The Many Brains Project',
      'McLean Hospital',
      'Paolo Martini',
      'Jeremy Wilmer',
      'Douglas Neuroinformatics Platform'
    ],
    description: 'This is a matrix reasoning task adapted from the the Many Brains Open Science Repository.',
    estimatedDuration: 1,
    instructions: ['Please follow the instructions on your screen.'],
    license: 'CC-BY-SA-4.0',
    title: 'Pattern Completion Test'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  name: 'CPP-PatternCompletionTest',
  tags: ['CPP'],
  validationSchema: z.any(),
  version: 1.0
});
