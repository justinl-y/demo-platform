interface JwtUser {
  id: number | string;
  email: string;
  [key: string]: unknown;
}

type SqlParams = Record<string, unknown>;

type TransactionInstruction = {
  files: string | string[];
  params: SqlParams | SqlParams[];
};

type DatabaseDecorator = {
  query: <TRow = Record<string, unknown>>(
    file: string,
    params: SqlParams,
    outputFormat: 'one',
  ) => Promise<TRow | null>;

  query: <TRow = Record<string, unknown>>(
    file: string,
    params: SqlParams,
    outputFormat?: 'collection',
  ) => Promise<TRow[] | null>;

  transaction: (
    rawInstructions: TransactionInstruction | TransactionInstruction[],
    dryRun?: boolean,
  ) => Promise<Record<string, Record<string, unknown>[]>>;
};

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUser;
    user: JwtUser;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseDecorator;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: import('@fastify/jwt').FastifyJWT['user'];
  }

  interface FastifyReply {
    error?: unknown;
  }
}

export {};
