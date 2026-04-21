import { fileURLToPath } from 'url';
import path from 'path';

const getFileNumber = (relativePath: string) => {
  const fileName = path.basename(fileURLToPath(relativePath));

  const fileNumber = fileName.split('-')[0];

  return fileNumber;
};

const setCookies = (headers: Record<string, string>) => {
  const raw = headers['set-cookie'] as string[] | string | undefined;

  return Array.isArray(raw) ? raw : (raw ? [raw] : []);
};

export {
  getFileNumber,
  setCookies,
};
