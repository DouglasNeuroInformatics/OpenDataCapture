import { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { useActiveVisitStore } from '@/stores/active-visit-store';

import { ActiveVisit } from './ActiveVisit';

type Story = StoryObj<typeof ActiveVisit>;

export default {
  component: ActiveVisit,
  decorators: [
    (Story) => {
      const { setActiveVisit } = useActiveVisitStore();
      useEffect(() => {
        setActiveVisit({
          date: new Date(),
          id: '123',
          subject: {
            dateOfBirth: new Date('2000-01-01'),
            firstName: 'John',
            identifier: '12345',
            lastName: 'Appleseed',
            sex: 'male'
          }
        });
      }, []);
      return <Story />;
    }
  ]
} as Meta<typeof ActiveVisit>;

export const Default: Story = {};
