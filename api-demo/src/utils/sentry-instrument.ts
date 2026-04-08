import * as Sentry from '@sentry/node';

import { Config } from '#config/index';

const INTERACTION_BREADCRUMB_CATEGORY = 'interaction.last';
const INTERACTION_BREADCRUMB_MESSAGE = 'Interaction details';

type InteractionHintException = {
  interactionConsoleLog?: string;
};

type NodeProfilingIntegration = {
  nodeProfilingIntegration: () => unknown;
};

function parseInteractionData(interactionLog: string) {
  return {
    route: interactionLog.match(/Route:\s(.+)/)?.[1],
    request: interactionLog.match(/Request:\s(.+)/)?.[1],
    requestOn: interactionLog.match(/Request On:\s(.+)/)?.[1],
    user: interactionLog.match(/User:\s(.+)/)?.[1],
    response: interactionLog.match(/Response:\s(.+)/)?.[1],
    responseBody: interactionLog.match(/Response Body:\s(.+)/)?.[1],
    responseTime: interactionLog.match(/Response Time:\s(.+)/)?.[1],
  };
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
    // sendDefaultPii: true,
    tracesSampleRate: Config.sentryConfig.tracesSampleRate[Config.apiEnv],
    environment: Config.apiEnv,
    ignoreTransactions: [
      '/health_eb',
      '/favicon.ico',
      /^\/api-docs(?:\/.*)?$/,
    ],
    beforeSend(event, hint) {
      const headers = event.request?.headers;
      const hintedException = hint?.originalException as InteractionHintException | undefined;
      const interactionLog = event.extra?.interaction_console_log ?? hintedException?.interactionConsoleLog;

      if (headers) {
        delete headers.authorization;
        delete headers.cookie;
        delete headers['set-cookie'];
        delete headers['x-api-key'];
      }

      if (typeof interactionLog === 'string' && interactionLog.length > 0) {
        const interactionData = parseInteractionData(interactionLog);

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

export { initSentry };
