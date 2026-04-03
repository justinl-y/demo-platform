import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

type Request = {
  body: {
    email: string;
    password: string;
  };
};

async function postLogin(request: FastifyRequest, reply: FastifyReply) {
  const {
    body: {
      email,
      password,
    },
  } = request as Request;

  const defaultResponse = {
    id: '7acd58cc-4ae5-4046-9037-383a057e4970',
    email,
    full_name: 'John Doe',
    known_as: 'John',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.signature',
  };

  return reply.send(defaultResponse);
}

export default postLogin;
