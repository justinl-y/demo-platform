import { getUsers as getUsersService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

async function getUsers(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const result = await getUsersService(this.db);

  reply.send(result);
}

export default getUsers;
