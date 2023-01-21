import React from 'react';

import { Meta, Story } from '@storybook/react';

import { ConfirmationDialog, ConfirmationDialogProps } from './ConfirmationDialog';

import { Button } from '@/components/base';

const meta: Meta = {
  component: ConfirmationDialog,
  parameters: {
    controls: { expanded: true }
  }
};

export default meta;

const Template: Story<ConfirmationDialogProps> = (props) => <ConfirmationDialog {...props} />;

export const Danger = Template.bind({});
Danger.args = {
  icon: 'danger',
  title: 'Confirmation',
  body: 'Hello World',
  confirmButton: <Button className="bg-red-500">Confirm</Button>,
  triggerButton: <Button>Open</Button>
};

export const Info = Template.bind({});
Info.args = {
  icon: 'info',
  title: 'Confirmation',
  body: 'Hello World',
  confirmButton: <Button>Confirm</Button>,
  triggerButton: <Button>Open</Button>
};
