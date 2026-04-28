import type {
  FastifyRequest,
  FastifyReply,
  FastifyError,
} from 'fastify';

async function consoleErrorHandler(request: FastifyRequest, reply: FastifyReply, error: FastifyError): Promise<void> {
  if (error) {
    // required for console error tracing
    request.log.error(error.stack ?? String(error));
  }
}

export default consoleErrorHandler;
