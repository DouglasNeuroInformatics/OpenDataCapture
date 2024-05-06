import { InstrumentBundlerBuildError } from '@opendatacapture/instrument-bundler';
import type { Meta, StoryObj } from '@storybook/react';

import { ViewerErrorFallback } from './ViewerErrorFallback';

type Story = StoryObj<typeof ViewerErrorFallback>;

export default { component: ViewerErrorFallback } as Meta<typeof ViewerErrorFallback>;

export const Build: Story = {
  args: {
    error: InstrumentBundlerBuildError.fromBuildFailure({
      errors: [],
      message: '',
      name: 'InstrumentBundlerBuildError',
      warnings: []
    }),
    title: 'Failed to Compile'
  }
};

export const Unknown: Story = {
  args: {
    error: new Error('Unexpected Error', { cause: new Error('Another Error') }),
    title: 'Runtime Error'
  }
};
