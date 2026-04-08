import {
  describe,
} from 'vitest';

// import db from '../lib/db';
import { getFileNumber } from '../lib/functions.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - Auth`, () => {
  describe.skip('POST /login', async () => {});
  describe.skip('POST /refresh', async () => {});
  describe.skip('PUT /logout', async () => {});
  describe.skip('PUT /passwordRecovery', async () => {});
  describe.skip('PUT /passwordReset', async () => {});
  describe.skip('POST /invite', async () => {});
});
