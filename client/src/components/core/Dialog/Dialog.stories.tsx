import React from 'react';

import { Meta, Story } from '@storybook/react';

import { Dialog, DialogTitle } from './Dialog';

import { Button } from '@/components/base';
import { useDisclosure } from '@/hooks/useDisclosure';

const meta: Meta = {
  component: Dialog,
  parameters: {
    controls: { expanded: true }
  }
};

export default meta;

export const Demo: Story = () => {
  const { close, open, isOpen } = useDisclosure();
  const cancelButtonRef = React.useRef(null);

  return (
    <>
      <Button onClick={open}>Open Modal</Button>
      <Dialog initialFocus={cancelButtonRef} isOpen={isOpen} onClose={close}>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
              Modal Title
            </DialogTitle>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              ref={cancelButtonRef}
              type="button"
              onClick={close}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
