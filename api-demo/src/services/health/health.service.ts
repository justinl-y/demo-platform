import { getPgVersion } from '#repositories/health/health.repository';

import type { DatabaseDecorator } from '../../types/database.ts';

interface HealthStatus {
  status: 'OK' | 'BAD';
  timestamp: string;
}

async function checkDb(db: DatabaseDecorator): Promise<HealthStatus> {
  const result = await getPgVersion(db);

  if (!result?.version) throw new Error('No version');

  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };
}

function checkEb(): HealthStatus {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };
}

export {
  checkDb,
  checkEb,
};
