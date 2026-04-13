const apiEnv: 'TEST' | 'LOCAL' | 'STAGE' | 'PROD' = (process.env.API_ENV || 'TEST').toUpperCase() as 'TEST' | 'LOCAL' | 'STAGE' | 'PROD';

const resourceEnvs = {
  TEST: 'TEST',
  LOCAL: 'STAGE',
  STAGE: 'STAGE',
  PROD: 'PROD',
} as const;

const apiResouceEnv = resourceEnvs[apiEnv];

const compressConfig = {
  global: true,
} as const;

const corsConfig = {
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'X-Demo-Application',
  ],
  credentials: true,
  exposedHeaders: [
    'Authorization',
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

const serverConfig = {
  port: 8000,
  host: '0.0.0.0',
} as const;

const userConfig = {
  allowedCountries: [
    'UNITED STATES',
    'CANADA',
  ],
  password: {
    passLength: 8,
    saltWorkFactor: 10,
    expirationTime: '30d',
  },
  phoneLength: 10,
  resetPassword: {
    randomBytesLength: 20,
    expirationTime: '28d',
  },
  zipCodeLength: 5,
} as const;

if (apiEnv === 'PROD') {
  corsConfig.origin = [
    'https://demo.discovered-check.ca',
  ];
}
else if (apiEnv === 'STAGE') {
  corsConfig.origin = [
    'https://demo-stage.discovered-check.ca',
  ];
}
else {
  corsConfig.origin = [
    'http://localhost:3000',
  ];
}

export {
  apiEnv,
  apiResouceEnv,
  compressConfig,
  corsConfig,
  externalPort,
  helmetConfig,
  serverConfig,
  userConfig,
};
