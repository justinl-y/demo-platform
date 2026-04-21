import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'node:crypto';

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

const toBase64Url = (input: string | Buffer): string =>
  Buffer.isBuffer(input)
    ? input.toString('base64url')
    : Buffer.from(input).toString('base64url');

const getFileNumber = (relativePath: string) => {
  const fileName = path.basename(fileURLToPath(relativePath));

  const fileNumber = fileName.split('-')[0];

  return fileNumber;
};

const setCookies = (headers: Record<string, string>) => {
  const raw = headers['set-cookie'] as string[] | string | undefined;

  return Array.isArray(raw) ? raw : (raw ? [raw] : []);
};

const generateTestCookie = (tokenType: TokenType, userId: string, userEmail: string): string => {
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
};

export {
  generateTestCookie,
  getFileNumber,
  setCookies,
};
