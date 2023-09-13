import React, { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ActiveSubject } from './ActiveSubject';

import { useActiveSubjectStore } from '@/stores/active-subject-store';

type Story = StoryObj<typeof ActiveSubject>;

export default {
  component: ActiveSubject,
  decorators: [
    (Story) => {
      const { setActiveSubject } = useActiveSubjectStore();
      useEffect(() => {
        setActiveSubject({
          firstName: 'John',
          lastName: 'Appleseed',
          sex: 'male',
          dateOfBirth: '2000-01-01'
        });
      }, []);
      return <Story />;
    }
  ]
} as Meta<typeof ActiveSubject>;

export const Default: Story = {};
