import {
  SESClient,
  SendEmailCommand,
} from '@aws-sdk/client-ses';

import type {
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';

import {
  Config,
} from '#config/index';

let sesClient: SESClient | undefined;

function getSesClient(): SESClient {
  return (sesClient ??= new SESClient(Config.awsConfig));
}

export {
  getSesClient,
  SendEmailCommand,
};

export type {
  SendEmailCommandInput,
};
