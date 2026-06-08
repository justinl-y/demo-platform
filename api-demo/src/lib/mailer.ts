import {
  getSesClient,
  SendEmailCommand,
} from './aws/ses.ts';

import { defaultSenderEmailAddress } from '#utils/constants';
import { Config } from '#config/index';

import type { SendEmailCommandInput } from './aws/ses.ts';
import type { SentEmailType } from '../types/general.ts';

interface SendEmail {
  toEmail: string;
  actionUrl: string;
  emailType: SentEmailType;
}

function sendCommandEmailParamsInvite(toEmail: string, actionUrl: string) {
  return {
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Html: {
          Data: `<p>You have been invited to Demo Platform - ${Config.apiEnv}.</p><p><a href="${actionUrl}">Activate your account</a> to set a password and sign in.</p>`,
        },
        Text: {
          Data: `You have been invited to Demo Platform. Activate your account to set a password and sign in: ${actionUrl}`,
        },
      },
      Subject: {
        Data: `You have been invited to Demo Platform - ${Config.apiEnv}`,
      },
    },
    Source: defaultSenderEmailAddress,
  };
}

function sendCommandEmailParamsPasswordReset(toEmail: string, actionUrl: string, passwordResetTokenExpirationMinutes: number) {
  return {
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Html: {
          Data: `<p>We received a request to reset your Demo Platform - ${Config.apiEnv} password.</p><p><a href="${actionUrl}">Reset your password</a> to choose a new one. This link expires in ${passwordResetTokenExpirationMinutes} minutes.</p><p>If you did not request this, you can safely ignore this email and your password will remain unchanged.</p>`,
        },
        Text: {
          Data: `We received a request to reset your Demo Platform password. Reset your password to choose a new one (this link expires in ${passwordResetTokenExpirationMinutes} minutes): ${actionUrl}\n\nIf you did not request this, you can safely ignore this email and your password will remain unchanged.`,
        },
      },
      Subject: {
        Data: `Reset your Demo Platform password - ${Config.apiEnv}`,
      },
    },
    Source: defaultSenderEmailAddress,
  };
}

async function sendEmail({
  toEmail,
  actionUrl,
  emailType,
}: SendEmail): Promise<void> {
  if (Config.apiEnv === 'TEST') {
    // Test seam: an RFC 2606 reserved-domain sentinel forces the failure path
    // so the route's catch branch (Sentry capture) has integration coverage.
    if (toEmail.endsWith('@mailer-fail.test')) throw new Error('TEST: forced mailer failure');

    console.info(`... Send email skipped (TEST) — ${toEmail}: ${actionUrl}`);

    return;
  }

  let sendCommandEmailParams: SendEmailCommandInput;

  switch (emailType) {
    case 'INVITATION':
      sendCommandEmailParams = sendCommandEmailParamsInvite(toEmail, actionUrl);
      break;
    case 'PASSWORD_RESET': {
      const {
        passwordResetTokenExpirationMinutes,
      } = Config.authConfig();

      sendCommandEmailParams = sendCommandEmailParamsPasswordReset(toEmail, actionUrl, passwordResetTokenExpirationMinutes);
      break;
    }
    default:
      throw new Error(`Unhandled email type: ${emailType satisfies never}`);
  }

  const sendEmailCommand = new SendEmailCommand(sendCommandEmailParams);

  await getSesClient()
    .send(sendEmailCommand)
  ;
}

export {
  sendEmail,
};
