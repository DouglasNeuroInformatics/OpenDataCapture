import React from 'react';

import { Meta, Story } from '@storybook/react';

import { Drawer } from './Drawer';

import { Button } from '@/components/base';
import { useDisclosure } from '@/hooks/useDisclosure';

const meta: Meta = {
  component: Drawer,
  parameters: {
    controls: { expanded: true }
  }
};

export default meta;

export const Demo: Story = () => {
  const { close, open, isOpen } = useDisclosure();

  return (
    <>
      <Button onClick={open}>Open Drawer</Button>
      <Drawer
        isOpen={isOpen}
        renderFooter={() => (
          <>
            <Button size="sm" variant="inverse" onClick={close}>
              Cancel
            </Button>
          </>
        )}
        size="md"
        title="Sample Drawer"
        onClose={close}
      >
        Hello
      </Drawer>
    </>
  );
};
