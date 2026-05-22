import {
  SESClient,
  SendEmailCommand,
} from '@aws-sdk/client-ses';

import {
  Config,
} from '#config/index';

// Lazily instantiated so the SDK client is created once and shared across calls.
let sesClient: SESClient | undefined;

function getSesClient(): SESClient {
  return (sesClient ??= new SESClient(Config.awsConfig));
}

interface InvitationEmail {
  toEmail: string;
  activationUrl: string;
}

async function sendInvitationEmail({
  toEmail,
  activationUrl,
}: InvitationEmail): Promise<void> {
  // Integration tests run without AWS credentials — log the link instead of sending.
  if (Config.apiEnv === 'TEST') {
    console.info(`... Invitation email skipped (TEST) — ${toEmail}: ${activationUrl}`);

    return;
  }

  const command = new SendEmailCommand({
    Source: Config.sesConfig.senderEmail,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: 'You have been invited to Demo Platform',
      },
      Body: {
        Html: {
          Data: `<p>You have been invited to Demo Platform.</p><p><a href="${activationUrl}">Activate your account</a> to set a password and sign in.</p>`,
        },
        Text: {
          Data: `You have been invited to Demo Platform. Activate your account to set a password and sign in: ${activationUrl}`,
        },
      },
    },
  });

  await getSesClient().send(command);
}

export {
  sendInvitationEmail,
};
