import { pgPatch } from './database-pg-named.ts';

import type {
  Pool,
  PoolClient,
} from 'pg';
import type {
  QueryRow,
  SqlParams,
} from '../types/database.ts';

type PatchedPgClient = Omit<PoolClient, 'query'> & {
  query: (queryText: string, values?: SqlParams) => Promise<{
    rowCount: number | null;
    rows: QueryRow[];
  }>;
};

async function pgConnect(pool: Pool): Promise<PatchedPgClient> {
  // Every DB client is patched once to support named SQL parameters.
  const client = await pool.connect();

  // Patch the client with pgPatch for a named-parameter SQL interface. This allows for variable interpolation into SQL files. See src/lib/database-pg-named.ts for implementation details.
  pgPatch(client);

  return client as PatchedPgClient;
}

export type {
  PatchedPgClient,
};

export {
  pgConnect,
};
