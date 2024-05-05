import React, { useState } from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import type { Meta, StoryObj } from '@storybook/react';

import { FileUploadDialog } from './FileUploadDialog';

type Story = StoryObj<typeof FileUploadDialog>;

export default {
  component: FileUploadDialog
} as Meta<typeof FileUploadDialog>;

export const Default: Story = {
  decorators: [
    (Story) => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <Button type="button" onClick={() => setIsOpen(true)}>
            Open
          </Button>
          <Story
            args={{
              accept: {
                'text/plain': ['.txt']
              },
              isOpen,
              onSubmit(files) {
                alert(`Submitted: ${files[0].name}`);
                setIsOpen(false);
              },
              onValidate() {
                return { result: 'success' };
              },
              setIsOpen,
              title: 'Upload Files'
            }}
          />
        </div>
      );
    }
  ]
};

export const WithError: Story = {
  decorators: [
    (Story) => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <Button type="button" onClick={() => setIsOpen(true)}>
            Open
          </Button>
          <Story
            args={{
              accept: {
                'text/plain': ['.txt']
              },
              isOpen,
              onValidate(files) {
                return { message: `Invalid file: ${files[0].name}`, result: 'error' };
              },
              setIsOpen,
              title: 'Upload Files'
            }}
          />
        </div>
      );
    }
  ]
};
