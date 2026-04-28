import { getUsers } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

async function getUsers_(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const result = await getUsers(this.db);

  reply.send(result);
}

export default getUsers_;
