import fs from 'fs/promises';
import path from 'path';

import type { Manifest, TypedFileRecord } from './shared.ts';
import { MANIFEST_PATH, ROOT, SRC_DIR, escapeRegex } from './shared.ts';

interface RenamePair {
  deleted: TypedFileRecord;
  created: TypedFileRecord;
}

function toCamel(pascal: string): string {
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toRelativePath(fromDir: string, toFile: string): string {
  let rel = path.relative(fromDir, toFile);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.split(path.sep).join('/');
}

/**
 * Builds an old→new identifier map for a rename pair.
 *
 * Uses the exports captured from the old .typed.queries.ts file to ensure
 * exact matches. New names are derived deterministically from the new query name.
 */
function buildIdentifierMap(pair: RenamePair): Map<string, string> {
  const {
    deleted: del,
    created,
  } = pair;
  const map = new Map<string, string>();

  const oldCamel = toCamel(del.queryName);
  const newCamel = toCamel(created.queryName);

  for (const oldName of del.exports) {
    let newName: string | undefined;

    if (oldName.startsWith(`I${del.queryName}`)) {
      // Interface types: IXxxParams, IXxxResult, IXxxQuery
      const suffix = oldName.slice(`I${del.queryName}`.length);
      newName = `I${created.queryName}${suffix}`;
    }
    else if (oldName === `${oldCamel}IR`) {
      newName = `${newCamel}IR`;
    }
    else if (oldName === oldCamel) {
      newName = newCamel;
    }
    // Skip utility types like Json that don't change with a rename.

    if (newName !== undefined && newName !== oldName) {
      map.set(oldName, newName);
    }
  }

  return map;
}

/**
 * Matches deleted→created file pairs by their types/ directory.
 *
 * Same-directory pairing handles the common rename case. When counts differ
 * it matches as many as possible (sorted alphabetically) and warns.
 */
function buildRenamePairs(manifest: Manifest): RenamePair[] {
  const pairs: RenamePair[] = [];

  const deletedByDir = new Map<string, TypedFileRecord[]>();
  for (const r of manifest.deleted) {
    const dir = path.dirname(r.typedQueriesPath);
    if (!deletedByDir.has(dir)) deletedByDir.set(dir, []);
    deletedByDir.get(dir)!.push(r);
  }

  const createdByDir = new Map<string, TypedFileRecord[]>();
  for (const r of manifest.created) {
    const dir = path.dirname(r.typedQueriesPath);
    if (!createdByDir.has(dir)) createdByDir.set(dir, []);
    createdByDir.get(dir)!.push(r);
  }

  for (const [dir, deletedList] of deletedByDir) {
    const createdList = createdByDir.get(dir);

    if (!createdList) {
      console.warn(`[update-type-deps] No replacement for deleted types in ${path.relative(ROOT, dir)} — fix imports manually.`);
      continue;
    }

    const sortedDel = [...deletedList].sort((a, b) => a.typedQueriesPath.localeCompare(b.typedQueriesPath));
    const sortedCre = [...createdList].sort((a, b) => a.typedQueriesPath.localeCompare(b.typedQueriesPath));
    const count = Math.min(sortedDel.length, sortedCre.length);

    if (sortedDel.length !== sortedCre.length) {
      console.warn(`[update-type-deps] Unequal deleted/created counts in ${path.relative(ROOT, dir)} — matched first ${count} pair(s) alphabetically.`);
    }

    for (let i = 0; i < count; i++) {
      pairs.push({
        deleted: sortedDel[i],
        created: sortedCre[i],
      });
    }
  }

  return pairs;
}

async function walkTs(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const absPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      results.push(...await walkTs(absPath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.ts')) continue;
    if (entry.name.endsWith('.typed.queries.ts')) continue;

    results.push(absPath);
  }

  return results;
}

async function updateFile(filePath: string, pairsByOldPath: Map<string, RenamePair>): Promise<boolean> {
  let content = await fs.readFile(filePath, 'utf8');
  const fileDir = path.dirname(filePath);

  // Collect all imports that reference a deleted queries file.
  const matchedPairs: RenamePair[] = [];
  const matchedImportStrings: string[] = [];

  for (const match of content.matchAll(/from\s+(['"])([^'"]+\.typed\.queries(?:\.ts)?)\1/g)) {
    const importPath = match[2];
    const resolvedPath = path.resolve(fileDir, importPath);
    const pair = pairsByOldPath.get(resolvedPath);

    if (!pair) continue;

    matchedPairs.push(pair);
    matchedImportStrings.push(importPath);
  }

  if (matchedPairs.length === 0) return false;

  // Aggregate all identifier renames across matched pairs.
  const allIdMap = new Map<string, string>();
  for (const pair of matchedPairs) {
    for (const [oldId, newId] of buildIdentifierMap(pair)) {
      allIdMap.set(oldId, newId);
    }
  }

  // Replace import paths.
  for (let i = 0; i < matchedPairs.length; i++) {
    const oldImportPath = matchedImportStrings[i];
    const newRelPath = toRelativePath(fileDir, matchedPairs[i].created.typedQueriesPath);

    content = content
      .replace(new RegExp(`'${escapeRegex(oldImportPath)}'`, 'g'), `'${newRelPath}'`)
      .replace(new RegExp(`"${escapeRegex(oldImportPath)}"`, 'g'), `"${newRelPath}"`);
  }

  // Replace identifier names (word-boundary to avoid partial matches).
  for (const [oldId, newId] of allIdMap) {
    content = content.replace(new RegExp(`\\b${escapeRegex(oldId)}\\b`, 'g'), newId);
  }

  await fs.writeFile(filePath, content, 'utf8');
  return true;
}

async function main(): Promise<void> {
  let manifest: Manifest;

  try {
    const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
    manifest = JSON.parse(raw) as Manifest;
  }
  catch {
    console.log('No type dependency manifest found; skipping dependency update.');
    return;
  }

  // Clean up the temp manifest regardless of what follows.
  await fs.rm(MANIFEST_PATH, { force: true });

  if (manifest.deleted.length === 0) {
    console.log('No deleted type files; dependency update not needed.');
    return;
  }

  const pairs = buildRenamePairs(manifest);

  if (pairs.length === 0) {
    console.log('No rename pairs detected; skipping dependency update.');
    return;
  }

  const pairsByOldPath = new Map<string, RenamePair>();
  for (const pair of pairs) {
    pairsByOldPath.set(pair.deleted.typedQueriesPath, pair);
  }

  const tsFiles = await walkTs(SRC_DIR);
  const updated: string[] = [];

  for (const filePath of tsFiles) {
    if (await updateFile(filePath, pairsByOldPath)) {
      updated.push(path.relative(ROOT, filePath).split(path.sep).join('/'));
    }
  }

  console.log(`Updated ${updated.length} source file(s).`);
  for (const f of updated.sort()) console.log(f);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
