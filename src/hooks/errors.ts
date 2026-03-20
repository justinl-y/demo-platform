import type {
  FastifyRequest,
  FastifyReply,
  FastifyError,
} from 'fastify';

const consoleErrorHandler = async (req: FastifyRequest, res: FastifyReply, error: FastifyError): Promise<void> => {
  if (error) {
    // required for console error tracing
    console.log(error);
  }
};

export default consoleErrorHandler;
