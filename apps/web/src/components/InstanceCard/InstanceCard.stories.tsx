import type { Meta, StoryObj } from '@storybook/react-vite';

import { getInstanceCardStyle, INSTANCE_CARD_VARIABLES } from '@/utils/card-color';

import { InstanceCard } from './InstanceCard';

type Story = StoryObj<typeof InstanceCard>;

const content = (
  <InstanceCard.Header>
    <InstanceCard.Title>Card Title</InstanceCard.Title>
    <InstanceCard.Description>Card description</InstanceCard.Description>
  </InstanceCard.Header>
);

export default { component: InstanceCard } as Meta<typeof InstanceCard>;

export const Invisible: Story = { args: { children: content } };

export const Colored: Story = {
  args: { children: content },
  decorators: [
    (Story) => (
      <div
        className={INSTANCE_CARD_VARIABLES}
        style={getInstanceCardStyle({ darkCardTheme: 'mist', lightCardTheme: 'mist' })}
      >
        <Story />
      </div>
    )
  ]
};
