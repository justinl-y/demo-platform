import * as Sentry from '@sentry/node';

import { Config } from '#config/index';

import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

async function setSentryUserOnRequest(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (Config.apiEnv !== 'TEST') {
    const user = request.user;

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email, // Set the user email here
        // Add other user data if needed
      });
    }
    else {
      Sentry.setUser(null);
    }
  }
}

export default setSentryUserOnRequest;
