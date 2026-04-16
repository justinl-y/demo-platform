import * as Sentry from '@sentry/node';

import { Config } from '#config/index';
import { createLogger } from '#utils/logger';
import { buildInteractionData } from '../hooks/console-interaction-handler.ts';

import type { FastifyError, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import type { InteractionData } from '../hooks/console-interaction-handler.ts';

type InteractionHintException = {
  interactionData?: InteractionData;
};

type NodeProfilingIntegration = {
  nodeProfilingIntegration: () => unknown;
};

type SentryAugmentedError = FastifyError & {
  interactionData?: InteractionData;
};

const logger = createLogger();
const INTERACTION_BREADCRUMB_CATEGORY = 'interaction.last';
const INTERACTION_BREADCRUMB_MESSAGE = 'Interaction details';
const SENTRY_EXCLUDED_STATUS_CODES = [400, 401, 403, 404, 409, 418, 429];

async function initSentry() {
  const sentryDsn = Config.sentryConfig.getDsn();

  if (Config.apiEnv === 'TEST' || !sentryDsn) {
    logger.info('... Sentry disabled');
    return;
  }

  let profilingIntegration: unknown;
  let profilesSampleRate: number | undefined;
  let profilingStatusMessage = 'disabled: integration not initialized';

  try {
    const { nodeProfilingIntegration } = await import('@sentry/profiling-node') as NodeProfilingIntegration;

    profilingIntegration = nodeProfilingIntegration();
    profilesSampleRate = Config.sentryConfig.profilesSampleRate[Config.apiEnv];
    profilingStatusMessage = `enabled`;
  }
  catch (err) {
    // Profiling is optional and may be unavailable for some Node/libc combinations.
    const message = err instanceof Error ? err.message : String(err);
    profilingStatusMessage = `disabled: failed to load profiling integration (${message})`;
  }

  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: Config.sentryConfig.tracesSampleRate[Config.apiEnv],
    environment: Config.apiEnv,
    ignoreTransactions: [
      '/health_eb',
      '/favicon.ico',
      /^\/api-docs(?:\/.*)?$/,
    ],
    beforeSend(event, hint) {
      const headers = event.request?.headers;
      const originalException = hint?.originalException;
      const interactionData = (originalException as InteractionHintException | undefined)?.interactionData;
      const stack = originalException instanceof Error ? originalException.stack : undefined;

      if (headers) {
        delete headers.authorization;
        delete headers.cookie;
        delete headers['set-cookie'];
        delete headers['x-api-key'];
      }

      if (interactionData) {
        event.breadcrumbs = event.breadcrumbs ?? [];
        event.breadcrumbs.push({
          category: INTERACTION_BREADCRUMB_CATEGORY,
          type: 'default',
          level: 'error',
          message: INTERACTION_BREADCRUMB_MESSAGE,
          data: interactionData,
          timestamp: Date.now() / 1000,
        });
      }

      if (stack) {
        event.extra = { ...event.extra, stackTrace: stack };
      }

      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      const breadcrumbMessage = breadcrumb.message ?? '';

      if (breadcrumb.category === 'console') return null;
      if (breadcrumbMessage.includes('/health_eb')) return null;

      return breadcrumb;
    },
    integrations: [
      Sentry.fastifyIntegration(),
      Sentry.requestDataIntegration({
        include: {
          cookies: false,
          ip: true,
        },
      }),
      Sentry.postgresIntegration(),
      ...(profilingIntegration ? [profilingIntegration as any] : []),
    ],
    profilesSampleRate,
    serverName: 'api-demo',
    attachStacktrace: true,
    maxBreadcrumbs: 50,
    normalizeDepth: 5,
  });

  logger.info(`... Sentry ${profilingStatusMessage}`);
}

function withSpan(name: string, handler: RouteHandlerMethod): RouteHandlerMethod {
  const wrapped: RouteHandlerMethod = async function (request, reply) {
    await Sentry.startSpan({ name, op: 'function' }, async () => {
      await handler.call(this, request, reply);
    });
  };

  Object.defineProperty(wrapped, 'name', { value: name });

  return wrapped;
}

function setSentryUser(user: { id: string; email: string }): void {
  if (Config.apiEnv === 'TEST') return;
  Sentry.getIsolationScope().setUser(user);
}

function processSentryError(
  statusCode: number,
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (Config.apiEnv === 'TEST') return;
  if (SENTRY_EXCLUDED_STATUS_CODES.includes(statusCode)) return;

  try {
    const sentryError = error as SentryAugmentedError;

    try {
      sentryError.interactionData = buildInteractionData(request, reply) ?? undefined;
    }
    catch {
      // captured without interaction data
    }

    Sentry.captureException(sentryError);
  }
  catch {
    // Sentry failure must not affect the HTTP response
  }
}

export {
  initSentry,
  withSpan,
  setSentryUser,
  processSentryError,
};
