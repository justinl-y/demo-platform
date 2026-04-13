import * as Sentry from '@sentry/node';

import { Config } from '#config/index';

import type { RouteHandlerMethod } from 'fastify';

function withSpan(name: string, handler: RouteHandlerMethod): RouteHandlerMethod {
  const wrapped: RouteHandlerMethod = async function (request, reply) {
    return Sentry.startSpan({ name, op: 'function' }, () => handler.call(this, request, reply));
  };

  return wrapped;
}

import type { InteractionData } from '../hooks/console-interaction-handler.ts';

const INTERACTION_BREADCRUMB_CATEGORY = 'interaction.last';
const INTERACTION_BREADCRUMB_MESSAGE = 'Interaction details';

type InteractionHintException = {
  interactionData?: InteractionData;
};

type NodeProfilingIntegration = {
  nodeProfilingIntegration: () => unknown;
};

async function initSentry() {
  const sentryDsn = Config.sentryConfig.getDsn();

  if (Config.apiEnv === 'TEST' || !sentryDsn) {
    console.info('... Sentry disabled');
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
    sendDefaultPii: true,
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
      Sentry.requestDataIntegration({
        include: {
          cookies: false, // Disable cookie capture for privacy
          ip: true,       // Explicitly enable IP capture (off by default)
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

  console.info(`... Sentry ${profilingStatusMessage}`);
}

export { initSentry, withSpan };
