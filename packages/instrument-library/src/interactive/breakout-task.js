const { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');
const { z } = await import('/runtime/v0.0.1/zod.js');

const instrumentFactory = new InstrumentFactory({
  kind: 'INTERACTIVE',
  language: 'en',
  validationSchema: z.any()
});

export default instrumentFactory.defineInstrument({
  content: {
    assets: {
      css: [import.meta.injectStylesheet('./breakout-task.styles.css')]
    },
    render() {
      return;
    }
  },
  details: {
    authors: ['Andrzej Mazur', 'Mozilla Contributors'],
    description:
      'This is a very simple interactive instrument, adapted from a 2D breakout game in the Mozilla documentation.',
    estimatedDuration: 1,
    instructions: [
      'Please attempt to win the game as quickly as possible.'
    ],
    license: 'CC0-1.0',
    referenceUrl: 'https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript',
    sourceUrl: 'https://github.com/end3r/Gamedev-Canvas-workshop/tree/gh-pages',
    title: 'Click Task'
  },
  name: 'Breakout Task',
  tags: ['Interactive'],
  version: 1.0
});
