const apiEnv: 'TEST' | 'LOCAL' | 'STAGE' | 'PROD' = (process.env.API_ENV || 'TEST').toUpperCase() as 'TEST' | 'LOCAL' | 'STAGE' | 'PROD';

const resourceEnvs = {
  TEST: 'TEST',
  LOCAL: 'STAGE',
  STAGE: 'STAGE',
  PROD: 'PROD',
} as const;

const apiResourceEnv = resourceEnvs[apiEnv];

const liveEnvironments = ['PROD', 'STAGE'];

const compressConfig = {
  global: true,
} as const;

const corsConfig = {
  allowedHeaders: [
    'Content-Type',
    'X-Demo-Application',
    // Sentry distributed tracing: the front-end SPA sends these to link its trace to the API's.
    'sentry-trace',
    'baggage',
  ],
  credentials: true,
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After',
  ],
  maxAge: 5,
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
  ],
  origin: [] as string[],
};

const externalPort = apiEnv === 'TEST' ? '6663' : '6662' as const;

const helmetConfig = {
  global: true,
} as const;

const rateLimitConfig = {
  max: apiEnv === 'TEST' ? 10000 : 250,
  timeWindow: '1 minute',
};

const serverConfig = {
  port: 8000,
  host: '0.0.0.0',
} as const;

// Base URL of the frontend app — used to build the activation link in invitation emails.
let appBaseUrl: string;

if (apiEnv === 'PROD') {
  appBaseUrl = 'https://demo.discovered-check.ca';
  corsConfig.origin = [
    appBaseUrl,
  ];
}
else if (apiEnv === 'STAGE') {
  appBaseUrl = 'https://demo-stage.discovered-check.ca';
  corsConfig.origin = [
    appBaseUrl,
  ];
}
else {
  appBaseUrl = 'http://localhost:5173';
  corsConfig.origin = [
    appBaseUrl,
  ];
}

export {
  apiEnv,
  apiResourceEnv,
  appBaseUrl,
  compressConfig,
  corsConfig,
  externalPort,
  helmetConfig,
  liveEnvironments,
  rateLimitConfig,
  serverConfig,
};
