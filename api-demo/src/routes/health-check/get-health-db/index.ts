import path from 'path';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

type PgVersionRow = {
  version: string;
};

const CWD = (rel: string) => path.resolve(import.meta.dirname, rel);

async function getHealthDB(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const healthDB = {
    status: '',
    timestamp: new Date().toISOString(),
  };

  try {
    const file = CWD('get-pg-version');

    const result = await this.db.query<PgVersionRow>(file, {}, 'one');

    const {
      version,
    } = result ?? {};

    if (!version) throw new Error('No version');

    healthDB.status = 'OK';

    reply
      .status(200)
      .send(healthDB);
  }
  catch (err) {
    console.log(err);

    healthDB.status = 'BAD';

    reply
      .status(500)
      .send(healthDB)
    ;
  }

  return reply;
}

export default getHealthDB;
