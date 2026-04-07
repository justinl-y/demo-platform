import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const ROUTES_DIR = path.join(ROOT, 'src', 'routes');

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function shouldGenerate(sql: string): boolean {
  if (/<%=/.test(sql)) return false;

  return /\b(SELECT|WITH)\b/i.test(sql);
}

async function walk(dirPath: string): Promise<string[]> {
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

function getSelectBlock(sql: string): string {
  const match = sql.match(/\bSELECT\b([\s\S]*?)\bFROM\b/i);

  return match?.[1] ?? '';
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

async function main(): Promise<void> {
  const sourceSqlFiles = await walk(ROUTES_DIR);
  const refinedFiles: string[] = [];

  for (const sourceSqlPath of sourceSqlFiles) {
    if (await refineGeneratedFile(sourceSqlPath)) {
      const sourceDir = path.dirname(sourceSqlPath);
      const fileName = path.basename(sourceSqlPath);
      const generatedPath = path.join(sourceDir, 'types', fileName.replace(/\.sql$/i, '.typed.queries.ts'));
      refinedFiles.push(path.relative(ROOT, generatedPath).split(path.sep).join('/'));
    }
  }

  console.log(`Refined ${refinedFiles.length} generated query type file(s).`);
  for (const refinedFile of refinedFiles.sort()) console.log(refinedFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
