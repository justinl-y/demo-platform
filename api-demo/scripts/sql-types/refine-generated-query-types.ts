import fs from 'fs/promises';
import path from 'path';

import { ROOT, SOURCE_DIRS, escapeRegex, shouldGenerate, walk } from './shared.ts';

function getSelectBlock(sql: string): string {
  // Match the last SELECT…FROM to get the outer SELECT in CTEs, not an inner one.
  const matches = [...sql.matchAll(/\bSELECT\b([\s\S]*?)\bFROM\b/gi)];

  return matches.at(-1)?.[1] ?? '';
}

function getSelectedColumnMap(sql: string): Map<string, string> {
  const selectBlock = getSelectBlock(sql);
  const regex = /(?:^|,)\s*(?:[a-zA-Z_][a-zA-Z0-9_]*\.)?([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*))?/gim;
  const selectedColumnMap = new Map<string, string>();
  let match = regex.exec(selectBlock);

  while (match) {
    const [, columnName, aliasName] = match;

    selectedColumnMap.set(columnName, aliasName ?? columnName);
    match = regex.exec(selectBlock);
  }

  return selectedColumnMap;
}

function getNonNullSelectedProperties(sql: string): Set<string> {
  const selectedColumnMap = getSelectedColumnMap(sql);
  const regex = /\b(?:[a-zA-Z_][a-zA-Z0-9_]*\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s+IS\s+NOT\s+NULL\b/gi;
  const properties = new Set<string>();
  let match = regex.exec(sql);

  while (match) {
    const [, columnName] = match;
    const propertyName = selectedColumnMap.get(columnName) ?? columnName;

    properties.add(propertyName);
    match = regex.exec(sql);
  }

  return properties;
}

async function refineGeneratedFile(sourceSqlPath: string): Promise<boolean> {
  const sql = await fs.readFile(sourceSqlPath, 'utf8');

  if (!shouldGenerate(sql)) return false;

  const nonNullProperties = getNonNullSelectedProperties(sql);

  if (nonNullProperties.size === 0) return false;

  const sourceDir = path.dirname(sourceSqlPath);
  const fileName = path.basename(sourceSqlPath);
  const generatedPath = path.join(sourceDir, 'types', fileName.replace(/\.sql$/i, '.typed.queries.ts'));
  const generatedExists = await fs.access(generatedPath).then(() => true).catch(() => false);

  if (!generatedExists) return false;

  let generatedBlob = await fs.readFile(generatedPath, 'utf8');
  let updated = false;

  for (const propertyName of nonNullProperties) {
    const pattern = new RegExp(`(\\b${escapeRegex(propertyName)}\\s*:\\s*[^;\\n]+?)\\s*\\|\\s*null;`, 'g');
    const nextBlob = generatedBlob.replace(pattern, '$1;');

    if (nextBlob !== generatedBlob) {
      generatedBlob = nextBlob;
      updated = true;
    }
  }

  if (!updated) return false;

  await fs.writeFile(generatedPath, generatedBlob, 'utf8');

  return true;
}

async function processDir(sourceDir: string, refinedFiles: string[]): Promise<void> {
  const dirExists = await fs.access(sourceDir).then(() => true).catch(() => false);

  if (!dirExists) return;

  const sourceSqlFiles = await walk(sourceDir);

  for (const sourceSqlPath of sourceSqlFiles) {
    if (await refineGeneratedFile(sourceSqlPath)) {
      const fileDir = path.dirname(sourceSqlPath);
      const fileName = path.basename(sourceSqlPath);
      const generatedPath = path.join(fileDir, 'types', fileName.replace(/\.sql$/i, '.typed.queries.ts'));
      refinedFiles.push(path.relative(ROOT, generatedPath).split(path.sep).join('/'));
    }
  }
}

async function main(): Promise<void> {
  const refinedFiles: string[] = [];

  for (const sourceDir of SOURCE_DIRS) {
    await processDir(sourceDir, refinedFiles);
  }

  console.log(`Refined ${refinedFiles.length} generated query type file(s).`);
  for (const refinedFile of refinedFiles.sort()) console.log(refinedFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
