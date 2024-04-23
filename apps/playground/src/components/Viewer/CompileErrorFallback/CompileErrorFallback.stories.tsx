import type { Meta, StoryObj } from '@storybook/react';

import { parseTranspilerError } from '@/utils/error';

import { CompileErrorFallback } from './CompileErrorFallback';

type Story = StoryObj<typeof CompileErrorFallback>;

function createError() {
  try {
    return (function f1() {
      (function f2() {
        throw new Error('Unexpected Error', { cause: new Error('Another Error') });
      })();
    })();
  } catch (err) {
    return parseTranspilerError(err);
  }
}

export default { component: CompileErrorFallback } as Meta<typeof CompileErrorFallback>;

export const Default: Story = {
  args: {
    error: createError()
  }
};
