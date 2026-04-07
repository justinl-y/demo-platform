import type { VerifyPayloadType } from '@fastify/jwt';

type TokenTypes = 'access' | 'refresh';

export type VerifyPayloadTypeCustom = VerifyPayloadType & { type: TokenTypes; id: string; email: string };
