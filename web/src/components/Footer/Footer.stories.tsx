import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Footer } from './Footer';

type Story = StoryObj<typeof Footer>;

export default { component: Footer } as Meta<typeof Footer>;

export const Default: Story = {
  decorators: [
    (Story) => {
      return (
        <MemoryRouter>
          <div className="container">
            <main className="mx-auto max-w-prose">
              <h1 className="mb-5 text-center text-2xl font-bold">My Website</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit libero architecto obcaecati ullam nostrum
                doloribus. Eligendi voluptatem veniam nulla, illo praesentium doloremque, cum deleniti sunt asperiores
                saepe eius iusto commodi!
              </p>
            </main>
            <Story />
          </div>
        </MemoryRouter>
      );
    }
  ]
};
