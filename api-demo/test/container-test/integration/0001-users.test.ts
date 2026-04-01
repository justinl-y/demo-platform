import path from 'path';

import {
  describe,
  expect,
  test,
} from 'vitest';

// import db from '../lib/db';
import { noAuthAPI } from '../lib/api.ts';
import { getFileNumber } from '../lib/functions.ts';

const fileNumber = getFileNumber(path.basename(__filename));

describe(`${fileNumber} Users`, () => {
  describe.skip('POST /users/login', async () => {});
  describe.skip('PUT /users/passwordRecovery', async () => {});
  describe.skip('PUT /users/passwordReset', async () => {});
  describe.skip('POST /users/invite', async () => {});

  describe.skip('GET /users', async () => {});
  describe.skip('GET /users/:userID', async () => {});
  describe.skip('POST /users', async () => {});
  describe.skip('PUT /users/:userID', async () => {});
});
