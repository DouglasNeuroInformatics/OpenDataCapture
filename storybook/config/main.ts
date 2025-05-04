import * as path from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';

function getAbsolutePath(value: string): string {
  return path.dirname(require.resolve(path.join(value, 'package.json')));
}

const config: StorybookConfig = {
  addons: [getAbsolutePath('@storybook/addon-docs'), getAbsolutePath('@storybook/addon-themes')],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {}
  },
  stories: [
    {
      directory: path.resolve(__dirname, '../../packages/react-core/src/components'),
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'React Core'
    },
    {
      directory: path.resolve(__dirname, '../../apps/playground/src/components'),
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Playground Components'
    },
    {
      directory: path.resolve(__dirname, '../../apps/web/src'),
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Web'
    }
    // {
    //   directory: path.resolve(__dirname, '../../apps/web/src/components'),
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Components'
    // }
    // {
    //   directory: '../src/features/admin/components',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Admin'
    // },
    // {
    //   directory: '../src/features/auth/components',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Auth'
    // },
    // {
    //   directory: '../src/features/contact/components',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Contact'
    // },
    // {
    //   directory: '../src/features/data-hub/components',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Data Hub'
    // },
    // {
    //   directory: '../src/features/dashboard/components',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Dashboard'
    // },
    // {
    //   directory: '../src/features/instruments/components',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Instruments'
    // },
    // {
    //   directory: '../src/features/session/components',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Session'
    // },
    // {
    //   directory: '../src/features/setup/pages',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'Setup'
    // },
    // {
    //   directory: '../src/features/user/components',
    //   files: '**/*.stories.@(js|jsx|ts|tsx)',
    //   titlePrefix: 'User'
    // }
  ]
};

export default config;
