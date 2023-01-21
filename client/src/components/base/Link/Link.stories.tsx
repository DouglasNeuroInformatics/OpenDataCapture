import React from 'react';

import { Meta, Story } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Link } from './Link';

const meta: Meta = {
  component: Link,
  parameters: {
    controls: { expanded: true }
  }
};

export default meta;

const Template: Story = (props) => (
  <MemoryRouter>
    <Link to="/" {...props}>
      Hello
    </Link>
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};
