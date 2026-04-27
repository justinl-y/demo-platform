import v8 from 'v8';

import type { FastifyInstance } from 'fastify';

export default (instance: FastifyInstance) => {
  instance.post('/_dev/coverage', async (_, reply) => {
    v8.takeCoverage();
    reply.status(204).send();
  });
};
