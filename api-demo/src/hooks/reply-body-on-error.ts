import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

async function replyBodyOnErrorHandler(request: FastifyRequest, reply: FastifyReply, payload: unknown): Promise<unknown> {
  if (reply.statusCode >= 400) reply.error = payload;

  return payload; // You must return the payload or a new one
};

export default replyBodyOnErrorHandler;
