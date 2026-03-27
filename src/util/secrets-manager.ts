import {
  SecretsManagerClient,
  BatchGetSecretValueCommand,
  type BatchGetSecretValueCommandInput,
  type SecretValueEntry,
} from '@aws-sdk/client-secrets-manager';
import {
  aws as awsConfig,
} from '../config/aws.ts';
import {
  apiEnv,
} from '../config/api.ts';

const secretsManagerClient = new SecretsManagerClient(awsConfig);

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
const updateSecretValues = (secretsManagerValues: SecretValueEntry[], values: SecretValues): void => {
  secretsManagerValues.forEach((secretValue: SecretValueEntry) => {
    const name = secretValue.Name;
    const secret = secretValue.SecretString;

    if (!name || !secret) return;

    const key = name.split('/').pop(); // Extract the key from the Name property

    if (key && key in values) values[key as keyof SecretValues] = secret; // Update the secretValues object. Optionally process.env[key] = secret;
  });
};

const batchGetSecretValue = async () => {
  try {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/secrets-manager/command/BatchGetSecretValueCommand/

    if (!apiEnv) {
      console.warn('API_ENV is not set. Secrets fetch failed');
      return;
    }

    let envKey: string;

    if (apiEnv === 'TEST') return;  // During the tests we don't want to fetch secrets
    else envKey = apiEnv;

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

    console.log('Secrets fetched successfully');
  }
  catch (err) {
    console.error('Secrets fetch failed:', err);
  }
};

export {
  secretValues,
  batchGetSecretValue,
};
