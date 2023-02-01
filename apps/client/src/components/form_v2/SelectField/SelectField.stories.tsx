import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { SelectField } from './SelectField';

export default {
  component: SelectField,
  args: {
    name: 'painkiller',
    options: [
      {
        name: 'Ibuprofen',
        altNames: ['Advil']
      },
      {
        name: 'Acetaminophen',
        altNames: ['Tylenol', 'Paracetamol']
      }
    ]
  }
} as ComponentMeta<typeof SelectField>;

const Template: ComponentStory<typeof SelectField> = (args) => <SelectField {...args} />;

export const Default = Template.bind({});

Default.args = {};
