import React from 'react';

import { value ComponentMeta, value ComponentStory } from '@storybook/react';

import { value ArrowToggle } from './ArrowToggle';

export default { component: ArrowToggle } as ComponentMeta<typeof ArrowToggle>;

const Template: ComponentStory<typeof ArrowToggle> = (args) => <ArrowToggle {...args} />;

export const Default = Template.bind({});

Default.args = {};
