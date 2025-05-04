import type { Meta, StoryObj } from '@storybook/react-vite';

import { Header as HeaderComponent } from './Header';

type Story = StoryObj<typeof HeaderComponent>;

export default { component: HeaderComponent } as Meta<typeof HeaderComponent>;

export const Header: Story = {};
