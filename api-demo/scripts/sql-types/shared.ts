import fs from 'fs/promises';
import os from 'os';
import path from 'path';

export const MANIFEST_PATH = path.join(os.tmpdir(), 'sql-types-manifest.json');

export const ROOT = process.cwd();
export const SRC_DIR = path.join(ROOT, 'src');
export const SOURCE_DIRS = [
  path.join(SRC_DIR, 'routes'),
  path.join(SRC_DIR, 'repositories'),
];

export interface TypedFileRecord {
  typedSqlPath: string;
  typedQueriesPath: string;
  queryName: string;
  /** Exports read from the file (populated for deleted records; empty for created records). */
  exports: string[];
}

export interface Manifest {
  deleted: TypedFileRecord[];
  created: TypedFileRecord[];
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function shouldGenerate(sql: string): boolean {
  if (/<%=/.test(sql)) return false;

  return /\b(SELECT|WITH)\b/i.test(sql);
}

export async function walk(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      results.push(...await walk(absolutePath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.sql')) continue;
    if (entry.name.endsWith('.typed.sql')) continue;

    results.push(absolutePath);
  }

  return results;
}
