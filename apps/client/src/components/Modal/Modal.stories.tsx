import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Modal } from './Modal';

import { Button } from '@/components';

export default {
  component: Modal,
  args: {
    open: true,
    title: 'Terms and Conditions',
    onClose: () => alert('Close!')
  }
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = (args) => (
  <Modal {...args}>
    <div className="mt-2">
      <p className="text-sm text-gray-500">Please indicate whether you accept our terms and conditions</p>
    </div>

    <div className="mt-4 flex">
      <Button className="mr-2" label="Accept" size="sm" />
      <Button label="Decline" size="sm" variant="light" />
    </div>
  </Modal>
);

export const Default = Template.bind({});

Default.args = {};
