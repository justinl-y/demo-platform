import type {
  FastifyRequest,
  FastifyReply,
  FastifyError,
} from 'fastify';

async function consoleErrorHandler(request: FastifyRequest, reply: FastifyReply, error: FastifyError): Promise<void> {
  if (error) {
    // required for console error tracing
    console.log(error);
  }
};

export default consoleErrorHandler;
