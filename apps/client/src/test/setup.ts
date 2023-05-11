import '@testing-library/jest-dom';
import { setGlobalConfig } from '@storybook/react';

import globalStorybookConfig from '../../.storybook/preview';

import { server } from './mocks/server';

setGlobalConfig(globalStorybookConfig);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
