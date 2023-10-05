import { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { useActiveSubjectStore } from '@/stores/active-subject-store';

import { ActiveSubject } from './ActiveSubject';

type Story = StoryObj<typeof ActiveSubject>;

export default {
  component: ActiveSubject,
  decorators: [
    (Story) => {
      const { setActiveSubject } = useActiveSubjectStore();
      useEffect(() => {
        setActiveSubject({
          dateOfBirth: '2000-01-01',
          firstName: 'John',
          lastName: 'Appleseed',
          sex: 'male'
        });
      }, []);
      return <Story />;
    }
  ]
} as Meta<typeof ActiveSubject>;

export const Default: Story = {};
