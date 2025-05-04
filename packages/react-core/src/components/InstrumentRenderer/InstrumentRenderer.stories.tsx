import { Card } from '@douglasneuroinformatics/libui/components';
import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { seriesInstrument } from '@opendatacapture/instrument-stubs/series';
import type { ScalarInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { InstrumentRenderer } from './InstrumentRenderer';

type Story = StoryObj<typeof InstrumentRenderer>;

const unilingualFormTarget: ScalarInstrumentBundleContainer = {
  bundle: unilingualFormInstrument.bundle,
  id: crypto.randomUUID(),
  kind: 'FORM'
};

const unilingualInteractiveTarget: ScalarInstrumentBundleContainer = {
  bundle: interactiveInstrument.bundle,
  id: crypto.randomUUID(),
  kind: 'INTERACTIVE'
};

export default {
  component: InstrumentRenderer,
  decorators: [
    (Story) => {
      return (
        <Card className="mx-auto w-screen max-w-3xl p-6">
          <Story />
        </Card>
      );
    }
  ],
  parameters: {
    layout: 'centered'
  }
} as Meta<typeof InstrumentRenderer>;

export const UnilingualForm: Story = {
  args: {
    target: unilingualFormTarget
  }
};

export const BilingualForm: Story = {
  args: {
    target: {
      bundle: bilingualFormInstrument.bundle,
      id: crypto.randomUUID(),
      kind: 'FORM'
    }
  }
};

export const UnilingualInteractive: Story = {
  args: {
    target: unilingualInteractiveTarget
  }
};

export const InteractiveWithError: Story = {
  args: {
    target: {
      bundle: 'throw new Error("BAD CODE!")',
      id: crypto.randomUUID(),
      kind: 'INTERACTIVE'
    }
  }
};

export const Series: Story = {
  args: {
    target: {
      bundle: seriesInstrument.bundle,
      id: crypto.randomUUID(),
      items: [unilingualFormTarget, unilingualInteractiveTarget],
      kind: 'SERIES'
    }
  }
};
