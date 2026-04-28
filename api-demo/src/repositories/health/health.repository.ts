import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IHealthCheckGetHealthDbGetPgVersionResult } from './types/get-pg-version.typed.queries.ts';

const relPath = import.meta.dirname;
const getPgVersionQuery = cwd('get-pg-version', relPath);

async function getPgVersion(db: DatabaseDecorator) {
  return db.query<IHealthCheckGetHealthDbGetPgVersionResult>(getPgVersionQuery, {}, 'one');
}

export {
  getPgVersion,
};
