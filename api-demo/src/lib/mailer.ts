import {
  getSesClient,
  SendEmailCommand,
} from './aws/ses.ts';

import { defaultSenderEmailAddress } from '#utils/constants';

import {
  Config,
} from '#config/index';

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

  const sendCommandEmailParams = {
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Html: {
          Data: `<p>You have been invited to Demo Platform - ${Config.apiEnv}.</p><p><a href="${activationUrl}">Activate your account</a> to set a password and sign in.</p>`,
        },
        Text: {
          Data: `You have been invited to Demo Platform. Activate your account to set a password and sign in: ${activationUrl}`,
        },
      },
      Subject: {
        Data: `You have been invited to Demo Platform - ${Config.apiEnv}`,
      },
    },
    Source: defaultSenderEmailAddress,
  };

  const sendEmailCommand = new SendEmailCommand(sendCommandEmailParams);

  await getSesClient()
    .send(sendEmailCommand)
  ;
}

export {
  sendInvitationEmail,
};
