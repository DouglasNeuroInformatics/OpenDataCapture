import type { Meta, StoryObj } from '@storybook/react-vite';

import { DownloadButton } from './DownloadButton';

type Story = StoryObj<typeof DownloadButton>;

export default { component: DownloadButton } as Meta<typeof DownloadButton>;

export const Default: Story = {};
