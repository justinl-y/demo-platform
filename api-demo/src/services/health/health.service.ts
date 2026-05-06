import type { HealthRepository } from '#repositories/health/health.repository';

interface HealthStatus {
  status: 'OK' | 'BAD';
  timestamp: string;
}

async function checkDb(repository: HealthRepository): Promise<HealthStatus> {
  const result = await repository.getPgVersion();

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
