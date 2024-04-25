import { InstrumentBundlerBuildError } from '@opendatacapture/instrument-bundler';
import type { Meta, StoryObj } from '@storybook/react';

import { CompileErrorFallback } from './CompileErrorFallback';

type Story = StoryObj<typeof CompileErrorFallback>;

export default { component: CompileErrorFallback } as Meta<typeof CompileErrorFallback>;

export const Build: Story = {
  args: {
    error: InstrumentBundlerBuildError.fromBuildFailure({
      errors: [],
      message: '',
      name: 'InstrumentBundlerBuildError',
      warnings: []
    })
  }
};

export const Unknown: Story = {
  args: {
    error: new Error('Unexpected Error', { cause: new Error('Another Error') })
  }
};
