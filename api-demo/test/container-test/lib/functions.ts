import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'node:crypto';
import { faker } from '@faker-js/faker/locale/en';

import { query } from './db.ts';

import type Supertest from 'supertest';

type TokenType = 'access' | 'refresh';

// Must match AUTH_SECRET in src/lib/api-secrets.ts (TEST env initializer)
const TEST_JWT_SECRET = '7EK4IwwNr0bPre30jAzLztWfQiIwhP8m';

const TOKEN_EXPIRY_SECONDS = {
  access: 3600,
  refresh: 604800,
} as const;

const TOKEN_COOKIE_NAMES = {
  access: 'access_token',
  refresh: 'refresh_token',
} as const;

function removeSingleQuotes(originalString: string) {
  return originalString.replace(/'/g, '');
}

type UserStatus = 'CREATED' | 'INVITED' | 'ACTIVE' | 'DEACTIVATED';

async function createRandomUser({
  status = 'ACTIVE',
  email: emailOverride,
}: {
  status?: UserStatus;
  email?: string;
} = {}) {
  const firstName = removeSingleQuotes(faker.person.firstName());
  const lastName = removeSingleQuotes(faker.person.lastName());
  const email = emailOverride ?? removeSingleQuotes(faker.internet.email({
    firstName,
    lastName,
  }).toLowerCase());
  const knownAs = removeSingleQuotes(faker.person.firstName());

  const fullName = `${firstName} ${lastName}`;

  const addUserSQL = `SELECT public.add_user(
      '${email}'
      , NULL
      ,'${fullName}'
      ,'${knownAs}'
      ,'${status}'
    );`
  ;

  const [{
    add_user: userId,
  }] = await query<{ add_user: string }>(addUserSQL);

  return {
    userId,
    email,
  };
}

async function getUserIdByEmail(email: string): Promise<string> {
  const getUserSql = 'SELECT u.id FROM internal.users AS u WHERE u.email = $1';

  const [user] = await query<{ id: string }>(getUserSql, [email]);

  if (!user) throw new Error(`getUserIdByEmail: user not found (${email})`);

  return user.id;
}

// Reset tokens are only ever known to the email recipient in production, so an
// integration test seeds the persisted hash + expiry directly to drive the
// endpoint. A pre-existing refresh token is seeded so callers can assert the
// reset clears it (invalidating any existing sessions).
async function seedUserWithResetToken({
  rawToken,
  expiresAt,
  status = 'ACTIVE',
}: {
  rawToken: string;
  expiresAt?: Date;
  status?: UserStatus;
}) {
  const {
    userId,
  } = await createRandomUser({ status });

  const resetTokenHash = sha256Hex(rawToken);
  const resetExpiresAt = expiresAt ?? new Date(Date.now() + 30 * 60 * 1000);

  const updateUsersAuthenticationSql = `UPDATE
    internal.users_authentication
  SET
    password_reset_token_hash = $1
    , password_reset_token_expiry_at = $2
    , refresh_token_hash = $3
  WHERE
    user_id = $4
  ;`;

  // refresh_token_hash is unique-constrained, so derive a distinct value per seeded user
  const refreshTokenHash = `pre-existing-refresh-${resetTokenHash}`;

  await query(updateUsersAuthenticationSql, [resetTokenHash, resetExpiresAt, refreshTokenHash, userId]);

  return { userId };
}

function toBase64Url(input: string | Buffer): string {
  return Buffer.isBuffer(input)
    ? input.toString('base64url')
    : Buffer.from(input).toString('base64url');
}

function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getFileNumber(relativePath: string) {
  const fileName = path.basename(fileURLToPath(relativePath));

  const fileNumber = fileName.split('-')[0];

  return fileNumber;
}

function setCookies(headers: Supertest.Response['headers']) {
  const raw = headers['set-cookie'];

  return Array.isArray(raw) ? raw : (raw ? [raw] : []);
}

// Polls produce() until it returns a defined value, for asserting on work that
// completes asynchronously (e.g. background email-sent stamping). Throws on timeout.
async function waitForCondition<T>(
  produce: () => Promise<T | undefined>,
  {
    timeoutMs = 2000,
    intervalMs = 25,
  }: {
    timeoutMs?: number;
    intervalMs?: number;
  } = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const result = await produce();
    if (result !== undefined) return result;

    if (Date.now() >= deadline) throw new Error(`waitForCondition timed out after ${timeoutMs}ms`);

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

function generateTestCookie(tokenType: TokenType, userId: string, userEmail: string, permissions?: string[]): string {
  const header = toBase64Url(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT',
  }));
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(JSON.stringify({
    id: userId,
    email: userEmail,
    type: tokenType,
    ...(tokenType === 'access' && permissions ? { permissions } : {}),
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS[tokenType],
  }));
  const signingInput = `${header}.${payload}`;
  const signature = toBase64Url(
    crypto.createHmac('sha256', TEST_JWT_SECRET).update(signingInput).digest(),
  );

  return `${TOKEN_COOKIE_NAMES[tokenType]}=${signingInput}.${signature}`;
}

export {
  createRandomUser,
  generateTestCookie,
  getFileNumber,
  getUserIdByEmail,
  seedUserWithResetToken,
  setCookies,
  sha256Hex,
  waitForCondition,
};
