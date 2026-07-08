import { setupServer } from 'msw/node';

import { handlers } from './handlers.ts';

// MSW server for tests (Node). Started/stopped in the Vitest setup file.
export const server = setupServer(...handlers);
