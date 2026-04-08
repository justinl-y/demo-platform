import {
  describe,
} from 'vitest';

// import db from '../lib/db';
import { getFileNumber } from '../lib/functions.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - Users`, () => {
  describe.skip('GET /users', async () => {});
  describe.skip('GET /users/:userID', async () => {});
  describe.skip('POST /users', async () => {});
  describe.skip('PUT /users/:userID', async () => {});
});
