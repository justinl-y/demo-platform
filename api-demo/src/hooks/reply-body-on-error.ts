import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

async function replyBodyOnErrorHandler(request: FastifyRequest, reply: FastifyReply, payload: unknown): Promise<unknown> {
  if (String(reply.statusCode).match(/^[45]\d{2}$/)) reply.error = payload;

  return payload; // You must return the payload or a new one
};

export default replyBodyOnErrorHandler;
