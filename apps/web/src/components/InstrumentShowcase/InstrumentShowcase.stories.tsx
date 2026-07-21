import * as forms from '@opendatacapture/instrument-stubs/forms';
import * as interactive from '@opendatacapture/instrument-stubs/interactive';
import * as series from '@opendatacapture/instrument-stubs/series';
import { translateInstrumentInfo } from '@opendatacapture/instrument-utils';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { InstrumentShowcase } from './InstrumentShowcase';

type Story = StoryObj<typeof InstrumentShowcase>;

export default { component: InstrumentShowcase } as Meta<typeof InstrumentShowcase>;

export const Default: Story = {
  args: {
    data: [...Object.values(forms), ...Object.values(interactive), ...Object.values(series)].map(({ instance }) =>
      // The stubs are full instruments; `translateInstrumentInfo` only reads the fields common to every
      // `InstrumentInfo`, so a cast to its parameter type is sufficient for the story.
      translateInstrumentInfo(instance as unknown as Parameters<typeof translateInstrumentInfo>[0], 'en')
    )
  }
};
