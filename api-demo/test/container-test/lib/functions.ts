import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'node:crypto';
import { faker } from '@faker-js/faker/locale/en';

import { query } from './db.ts';

type TokenType = 'access' | 'refresh';

// Must match AUTH_SECRET in src/lib/secrets-manager.ts (TEST env initializer)
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

async function createRandomUser({ isActive = true }) {
  const firstName = removeSingleQuotes(faker.person.firstName());
  const lastName = removeSingleQuotes(faker.person.lastName());
  const email = removeSingleQuotes(faker.internet.email({ firstName, lastName }).toLowerCase());
  const knownAs = removeSingleQuotes(faker.person.firstName());

  const fullName = `${firstName} ${lastName}`;

  const addUserSQL = `SELECT public.add_user(
      '${email}'
      ,NULL
      ,'${fullName}'
      ,'${knownAs}'
      ,${isActive}
    );`
  ;

  const [{ add_user: userId }] = await query<{ add_user: string }>(addUserSQL);

  return { userId, email };
}

function toBase64Url(input: string | Buffer): string {
  return Buffer.isBuffer(input)
    ? input.toString('base64url')
    : Buffer.from(input).toString('base64url');
}

function getFileNumber(relativePath: string) {
  const fileName = path.basename(fileURLToPath(relativePath));

  const fileNumber = fileName.split('-')[0];

  return fileNumber;
}

function setCookies(headers: Record<string, string>) {
  const raw = headers['set-cookie'] as string[] | string | undefined;

  return Array.isArray(raw) ? raw : (raw ? [raw] : []);
}

function generateTestCookie(tokenType: TokenType, userId: string, userEmail: string): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(JSON.stringify({
    id: userId,
    email: userEmail,
    type: tokenType,
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
  setCookies,
};
