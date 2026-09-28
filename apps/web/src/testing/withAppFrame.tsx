import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import type { Decorator } from '@storybook/react-vite';

import { PageHeader } from '@/components/PageHeader';

/**
 * The frame `Layout` puts around every page - a sidebar-wide gutter, then `main.container` - so a
 * page-level story gets the width and padding the app gives the component. `Layout` itself renders
 * a router `Outlet`, so it cannot wrap a story directly.
 */
export const withAppFrame = (title: string): Decorator => {
  const AppFrame: Decorator = (Story) => (
    <div className="flex h-screen w-screen">
      <div className="w-[19rem] shrink-0 bg-slate-900" />
      <div className="scrollbar-none relative flex grow flex-col overflow-y-scroll pt-14 md:pt-0">
        <main className="container flex grow flex-col">
          <PageHeader>
            <Heading className="text-center" variant="h2">
              {title}
            </Heading>
          </PageHeader>
          <Story />
        </main>
      </div>
    </div>
  );
  return AppFrame;
};
