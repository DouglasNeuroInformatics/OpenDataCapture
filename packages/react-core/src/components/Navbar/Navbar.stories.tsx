import { range } from '@douglasneuroinformatics/utils';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import type { Meta, StoryObj } from '@storybook/react';

import { Navbar } from './Navbar';

type Story = StoryObj<typeof Navbar>;

export default {
  args: {
    i18n: {
      changeLanguage: (lang) => {
        alert(`Change Language: ${lang}`);
      },
      resolvedLanguage: 'en'
    }
  },
  component: Navbar,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof Navbar>;

export const Default: Story = {
  args: {
    items: range(1, 5).map((i) => ({
      icon: QuestionMarkCircleIcon,
      id: i.toString(),
      label: `Page ${i}`,
      onClick: () => undefined
    })),
    onNavigate: (id) => alert(`Navigate to ID: ${id}`)
  }
};
