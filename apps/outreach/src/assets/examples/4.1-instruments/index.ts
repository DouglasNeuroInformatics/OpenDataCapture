/* eslint-disable */
// @ts-nocheck

const formInstrument = {
  kind: 'FORM',
  language: 'en',
  tags: ['Example'],
  internal: {
    edition: 1,
    name: 'HAPPINESS_QUESTIONNAIRE'
  },
  content: {
    overallHappiness: {
      description: 'Please select a number from 1 to 10 (inclusive)',
      kind: 'number',
      label: 'How happy are you overall?',
      max: 10,
      min: 1,
      variant: 'slider'
    }
  },
  details: {
    description: 'The Happiness Questionnaire is a questionnaire about happiness.',
    estimatedDuration: 1,
    instructions: ['Please answer the questions based on your current feelings.'],
    license: 'AGPL-3.0',
    title: 'Happiness Questionnaire'
  },
  measures: null,
  validationSchema: z.object({
    overallHappiness: z.number().int().min(1).max(10)
  })
};

const interactiveInstrument = {
  kind: 'INTERACTIVE',
  language: 'en',
  tags: ['EXAMPLE'],
  internal: {
    edition: 1,
    name: 'CLICK_THE_BUTTON_TASK'
  },
  content: {
    render(done) {
      // the timestamp when the render function is first called
      const start = Date.now();

      // create a <button> element and append it to the document <body>
      const button = document.createElement('button');
      button.textContent = 'Submit Instrument';
      document.body.appendChild(button);

      // attach a function to button we created, which is called when the 'click' event is triggered
      button.addEventListener('click', () => {
        done({ seconds: (Date.now() - start) / 1000 });
      });
    }
  },
  details: {
    description: 'This is a very simple interactive instrument.',
    estimatedDuration: 1,
    instructions: ['Please click the button when you are done.'],
    license: 'AGPL-3.0',
    title: 'Click the Button Task'
  },
  measures: null,
  validationSchema: z.object({
    seconds: z.number()
  })
};

// **logo.png**

// **index.ts**

// ```diff lang="ts"
// import logoSrc from './logo.png';
// import './styles.css';

// const interactiveInstrument = {
//   content: {
//     render(done) {
// +      const logo = document.createElement('img');
// +      logo.alt = 'Open Data Capture Logo';
// +      logo.src = logoSrc;
// +      document.body.appendChild(logo);
//     }
//   }
// };
// ```
