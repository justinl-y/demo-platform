import fs from 'fs/promises';

import {
  apiEnv,
  liveEnvironments,
} from '#config/api';

interface GetSqlBlobOptions {
  cache?: boolean;
}

const sqlBlobCache = new Map<string, string>();

function isCacheEnabledByDefault(): boolean {
  // Cache SQL only in live environments; local/test should reflect file edits immediately.
  return liveEnvironments.includes(apiEnv);
}

function qualifySqlFile(file: string): string {
  const filePath = file.replace(/\.[^/.]+$/, '');
  return `${filePath}.sql`;
}

async function getSqlBlob(file: string, options: GetSqlBlobOptions = {}): Promise<string> {
  const qualifiedFile = qualifySqlFile(file);
  const cacheByDefault = isCacheEnabledByDefault();
  const {
    cache = cacheByDefault,
  } = options;

  if (cache) {
    const cachedBlob = sqlBlobCache.get(qualifiedFile);

    if (cachedBlob) return cachedBlob;
  }

  const blob = await fs.readFile(qualifiedFile, 'utf-8');

  if (cache) sqlBlobCache.set(qualifiedFile, blob);

  return blob;
}

function clearSqlBlobCache(): void {
  // Primarily useful for tests or explicit runtime invalidation hooks.
  sqlBlobCache.clear();
}

export {
  clearSqlBlobCache,
  getSqlBlob,
};
