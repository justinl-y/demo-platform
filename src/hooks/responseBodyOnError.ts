import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

const responseBodyOnErrorHandler = async (req: FastifyRequest, res: FastifyReply, payload: unknown): Promise<unknown> => {
  if (String(res.statusCode).match(/^[45]\d{2}$/)) res.error = payload;

  return payload; // You must return the payload or a new one
};

export default responseBodyOnErrorHandler;
