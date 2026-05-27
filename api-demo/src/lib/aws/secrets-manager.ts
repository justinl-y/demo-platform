import {
  SecretsManagerClient,
  BatchGetSecretValueCommand,
  type BatchGetSecretValueCommandInput,
  type SecretValueEntry,
} from '@aws-sdk/client-secrets-manager';

import {
  Config,
} from '#config/index';

let secretsManagerClient: SecretsManagerClient | undefined;

function getSecretsManagerClient(): SecretsManagerClient {
  return (secretsManagerClient ??= new SecretsManagerClient(Config.awsConfig));
}

export {
  getSecretsManagerClient,
  BatchGetSecretValueCommand,
};

export type {
  BatchGetSecretValueCommandInput,
  SecretValueEntry,
};
