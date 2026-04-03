import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

async function authenticateOnRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  }
  catch (err) {
    reply.send(err);
  }
};

export default authenticateOnRequest;
