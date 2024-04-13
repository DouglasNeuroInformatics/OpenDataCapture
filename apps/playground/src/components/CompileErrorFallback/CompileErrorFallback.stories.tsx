import type { Meta, StoryObj } from '@storybook/react';

import { CompileErrorFallback } from './CompileErrorFallback';

type Story = StoryObj<typeof CompileErrorFallback>;

function createError() {
  try {
    return (function f1() {
      (function f2() {
        throw new Error('Unexpected Error');
      })();
    })();
  } catch (err) {
    return err as Error;
  }
}

export default { component: CompileErrorFallback } as Meta<typeof CompileErrorFallback>;

export const Default: Story = {
  args: {
    error: createError()
  }
};
