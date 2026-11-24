import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import type { AnyUnilingualInteractiveInstrument } from '@opendatacapture/runtime-core';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { InteractiveContent } from './InteractiveContent';

type Story = StoryObj<typeof InteractiveContent>;

export default {
  component: InteractiveContent,
  decorators: [
    (Story) => {
      return (
        <div className="h-screen p-6">
          <Story />
        </div>
      );
    }
  ]
} as Meta<typeof InteractiveContent>;

export const Default: Story = {
  args: {
    bundle: interactiveInstrument.bundle,
    instrument: {
      ...(interactiveInstrument.instance as AnyUnilingualInteractiveInstrument),
      supportedLanguages: ['en']
    },
    language: 'en',
    onChangeLanguage() {
      // The host owns the instrument's language; this story holds it fixed.
    },
    onLockLanguage() {
      // Already fixed, so there is nothing further to hold.
    },
    onSubmit({ data }) {
      alert(JSON.stringify(data, null, 2));
    },
    skipLanguageSelect: false
  }
};
