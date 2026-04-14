import path from 'path';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

import type {
  IHealthCheckGetHealthDbGetPgVersionResult,
} from './types/get-pg-version.typed.queries.ts';

const CWD = (rel: string) => path.resolve(import.meta.dirname, rel);

async function getHealthDB(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const healthDB = {
    status: 'BAD',
    timestamp: new Date().toISOString(),
  };
  const file = CWD('get-pg-version');

  const result = await this.db.query<IHealthCheckGetHealthDbGetPgVersionResult>(file, {}, 'one');

  const {
    version,
  } = result ?? {};

  if (!version) throw new Error('No version');

  healthDB.status = 'OK';

  reply
    .status(200)
    .send(healthDB);
}

export default getHealthDB;
