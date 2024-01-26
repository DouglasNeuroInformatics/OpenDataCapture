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
          createdAt: new Date(),
          date: new Date(),
          groupId: null,
          id: '123',
          subject: {
            createdAt: new Date(),
            dateOfBirth: new Date('2000-01-01'),
            firstName: 'John',
            groupIds: [],
            id: '12345',
            lastName: 'Appleseed',
            sex: 'MALE',
            updatedAt: new Date()
          },
          subjectId: '12345',
          updatedAt: new Date()
        });
      }, []);
      return <Story />;
    }
  ]
} as Meta<typeof ActiveVisit>;

export const Default: Story = {};
