import {
  SecretsManagerClient,
  BatchGetSecretValueCommand,
  type BatchGetSecretValueCommandInput,
  type SecretValueEntry,
} from '@aws-sdk/client-secrets-manager';
import {
  Config,
} from '#config/index';
import { createLogger } from '#utils/logger';

const logger = createLogger();

// initialized with values for env test
const secretValues = {
  AUTH_SECRET: '7EK4IwwNr0bPre30jAzLztWfQiIwhP8m',
  AUTH_AUDIENCE: 'test-audience',
  PG_HOST: 'db',
  PG_DATABASE: 'test',
  PG_ROLE: 'test',
  PG_PASSWORD: 'test',
  PG_SSL_CERT: '',
  SENTRY_DSN: '',
};

type SecretValues = typeof secretValues;

// Function to update secretValues based on the response from the Secrets Manager
function updateSecretValues(secretsManagerValues: SecretValueEntry[], values: SecretValues): void {
  secretsManagerValues.forEach((secretValue: SecretValueEntry) => {
    const name = secretValue.Name;
    const secret = secretValue.SecretString;

    if (!name || !secret) return;

    const key = name.split('/').pop(); // Extract the key from the Name property

    if (key && key in values) values[key as keyof SecretValues] = secret; // Update the secretValues object. Optionally process.env[key] = secret;
  });
};

async function batchGetSecretValue() {
  try {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/secrets-manager/command/BatchGetSecretValueCommand/

    if (!Config.apiEnv) {
      logger.warn('Secrets fetch failed: API_ENV is not set');
      return;
    }

    const secretsManagerClient = new SecretsManagerClient(Config.awsConfig);

    let envKey: string;

    if (Config.apiEnv === 'TEST') {
      logger.info('... Secrets fetch skipped');

      return;  // During the tests we don't want to fetch secrets
    }
    else envKey = Config.apiResourceEnv;

    const params: BatchGetSecretValueCommandInput = {
      Filters: [
        {
          Key: 'name',
          Values: [`API_DEMO/${envKey}`],
        },
      ],
    };

    let secrets: SecretValueEntry[] = [];
    let response = await secretsManagerClient.send(new BatchGetSecretValueCommand(params));

    secrets = [...secrets, ...(response.SecretValues ?? [])];

    // If there are more secrets to fetch, keep fetching until there are no more
    // BatchGetSecretValueCommand has a hard limit of 10 secrets per request.
    while (response.NextToken) {
      params.NextToken = response.NextToken;

      response = await secretsManagerClient.send(new BatchGetSecretValueCommand(params));
      secrets = [...secrets, ...(response.SecretValues ?? [])];
    }

    updateSecretValues(secrets, secretValues);

    logger.info('... Secrets fetch successful');
  }
  catch (err) {
    if (['PROD', 'STAGE'].includes(Config.apiEnv)) process.exit(1);

    logger.error(err, '... Secrets fetch failed');
  }
};

export {
  secretValues,
  batchGetSecretValue,
};
