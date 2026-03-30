interface JwtUser {
  id: number | string;
  email: string;
  [key: string]: unknown;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUser;
    user: JwtUser;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: import('@fastify/jwt').FastifyJWT['user'];
  }

  interface FastifyReply {
    error?: unknown;
  }
}

export {};
