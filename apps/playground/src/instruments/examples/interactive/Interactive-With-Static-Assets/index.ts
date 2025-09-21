/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

import html from './fragment.html';
import smiley from './smiley.png';

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: 'en',
  internal: {
    edition: 1,
    name: 'INTERACTIVE_WITH_STATIC_ASSETS'
  },
  tags: [],
  content: {
    render(done) {
      const button = document.getElementById('submit-btn')!;
      button.addEventListener('click', () => {
        done({ message });
      });
    },
    html,
    staticAssets: {
      '/smiley.png': smiley
    }
  },
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please complete the task.']
  },
  details: {
    description: 'This is an example of an instrument with static assets intercepted using a service worker.',
    license: 'Apache-2.0',
    title: 'Interactive Instrument with Static Assets'
  },
  measures: {},
  validationSchema: z.object({
    message: z.string()
  })
});
