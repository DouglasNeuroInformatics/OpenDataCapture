import { Card } from '@douglasneuroinformatics/libui/components';
import { bilingualFileInstrument } from '@opendatacapture/instrument-stubs/file';
import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { seriesInstrument } from '@opendatacapture/instrument-stubs/series';
import type { ScalarInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';

import { InstrumentRenderer } from './InstrumentRenderer';

type Story = StoryObj<typeof InstrumentRenderer>;

const unilingualFormTarget: ScalarInstrumentBundleContainer = {
  bundle: unilingualFormInstrument.bundle,
  id: crypto.randomUUID(),
  kind: 'FORM'
};

const unilingualInteractiveTarget: ScalarInstrumentBundleContainer = {
  bundle: interactiveInstrument.bundle,
  id: crypto.randomUUID(),
  kind: 'INTERACTIVE'
};

const bilingualFileTarget: ScalarInstrumentBundleContainer = {
  bundle: bilingualFileInstrument.bundle,
  id: crypto.randomUUID(),
  kind: 'FILE'
};

export default {
  component: InstrumentRenderer,
  decorators: [
    (Story) => {
      return (
        <Card className="mx-auto w-screen max-w-3xl p-6">
          <Story />
        </Card>
      );
    }
  ],
  parameters: {
    layout: 'centered'
  }
} as Meta<typeof InstrumentRenderer>;

export const UnilingualForm: Story = {
  args: {
    target: unilingualFormTarget
  }
};

export const BilingualForm: Story = {
  args: {
    target: {
      bundle: bilingualFormInstrument.bundle,
      id: crypto.randomUUID(),
      kind: 'FORM'
    }
  }
};

export const BilingualFile: Story = {
  args: {
    onSubmit: async (result) => {
      if (result.kind !== 'FILE') {
        throw new Error();
      }
      const { onNext, onProgress, uploadMap } = result;
      for (const file of Object.values(uploadMap).flat()) {
        const totalBytes = file.size;
        let loadedBytes = 0;
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (loadedBytes >= totalBytes) {
              clearInterval(interval);
              return resolve();
            }
            const chunkSize = Math.floor(Math.random() * 65536) + 32768;
            loadedBytes = Math.min(loadedBytes + chunkSize, totalBytes);
            onProgress(file, {
              loaded: loadedBytes,
              progress: loadedBytes / totalBytes,
              total: totalBytes
            });
          }, 100);
        });
        onNext();
      }
    },
    target: bilingualFileTarget
  },
  decorators: [
    (Story) => {
      return (
        <RouterProvider
          router={createRouter({
            history: createMemoryHistory(),
            routeTree: createRootRoute({
              component: Story
            })
          })}
        />
      );
    }
  ]
};

export const UnilingualInteractive: Story = {
  args: {
    target: unilingualInteractiveTarget
  }
};

export const InteractiveWithError: Story = {
  args: {
    target: {
      bundle: 'throw new Error("BAD CODE!")',
      id: crypto.randomUUID(),
      kind: 'INTERACTIVE'
    }
  }
};

export const Series: Story = {
  args: {
    target: {
      bundle: seriesInstrument.bundle,
      id: crypto.randomUUID(),
      items: [unilingualFormTarget, unilingualInteractiveTarget],
      kind: 'SERIES'
    }
  }
};
