import type {
  FastifyRequest,
  FastifyReply,
  FastifyError,
} from 'fastify';

async function consoleErrorHandler(req: FastifyRequest, res: FastifyReply, error: FastifyError): Promise<void> {
  if (error) {
    // required for console error tracing
    console.log(error);
  }
};

export default consoleErrorHandler;
