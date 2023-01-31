import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Divider } from './Divider';

export default { component: Divider } as ComponentMeta<typeof Divider>;

const Template: ComponentStory<typeof Divider> = (args) => <Divider {...args} />;

export const Default = Template.bind({});

Default.args = {};
