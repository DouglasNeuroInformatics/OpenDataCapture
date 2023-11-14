// cypress/support/index.js

import { setupWorker } from 'msw';

import { handlers } from '././../msw/mocks/handlers.js'; // Import your MSW request handlers

const worker = setupWorker(...handlers);
worker.start();
