import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ArrowToggle } from './ArrowToggle';

export default { component: ArrowToggle } as ComponentMeta<typeof ArrowToggle>;

const Template: ComponentStory<typeof ArrowToggle> = (args) => <ArrowToggle {...args} />;

export const Default = Template.bind({});

Default.args = {};
