import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import * as Sentry from '@sentry/node';

import { Config } from '#config/index';

async function setSentryUserOnRequest(req: FastifyRequest, res: FastifyReply) {
  if (Config.apiEnv !== 'TEST') {
    const user = req.user;

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
