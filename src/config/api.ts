const apiEnv: 'TEST' | 'STAGE' | 'PROD' = (process.env.API_ENV || 'TEST').toUpperCase() as 'TEST' | 'STAGE' | 'PROD';

const compress = {
  global: true,
} as const;

const cors = {
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

const helmet = {
  global: true,
} as const;

const server = {
  port: 8000,
  host: '0.0.0.0',
} as const;

const user = {
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
  cors.origin = [
    'https://demo.discovered-check.ca',
  ];
}
else if (apiEnv === 'STAGE') {
  cors.origin = [
    'https://demo-stage.discovered-check.ca',
  ];
}
else {
  cors.origin = [
    'http://localhost:3000',
  ];
}

export {
  apiEnv,
  compress,
  cors,
  externalPort,
  helmet,
  server,
  user,
};
