import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

// Mock the config so the mailer loads without real secret/Sentry wiring, and so
// apiEnv is not 'TEST' — that lets sendInvitationEmail run the real SES send
// path, which aws-sdk-client-mock then intercepts (no live AWS call is made).
vi.mock('#config/index', () => ({
  Config: {
    apiEnv: 'LOCAL',
    awsConfig: {
      region: 'us-west-2',
    },
    sesConfig: {
      senderEmail: 'noreply@demo.test',
    },
  },
}));

import { mockClient } from 'aws-sdk-client-mock';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { getFileNumber } from '../lib/functions.ts';
import { sendInvitationEmail } from '#lib/mailer';

const fileNumber = getFileNumber(import.meta.url);
const SENDER_EMAIL = 'noreply@demo.test';

const sesMock = mockClient(SESClient);

describe(`${fileNumber} - Invitation email (AWS SES)`, () => {
  const invitation = {
    toEmail: 'invitee@example.com',
    activationUrl: 'https://app.demo.test/users/activate?token=Abc123Token',
  };

  beforeEach(() => {
    sesMock.reset();
  });

  describe('Request Success', () => {
    test('Sends exactly one SendEmailCommand to SES', async () => {
      await sendInvitationEmail(invitation);

      expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(1);
    });

    test('Sends from the configured sender to the invitee', async () => {
      await sendInvitationEmail(invitation);

      const {
        input,
      } = sesMock.commandCalls(SendEmailCommand)[0].args[0];

      expect(input.Source).toBe(SENDER_EMAIL);
      expect(input.Destination?.ToAddresses).toEqual([invitation.toEmail]);
    });

    test('Embeds the activation URL in the HTML and text bodies', async () => {
      await sendInvitationEmail(invitation);

      const {
        input,
      } = sesMock.commandCalls(SendEmailCommand)[0].args[0];

      expect(input.Message?.Subject?.Data).toBeTypeOf('string');
      expect(input.Message?.Body?.Html?.Data).toContain(invitation.activationUrl);
      expect(input.Message?.Body?.Text?.Data).toContain(invitation.activationUrl);
    });
  });

  describe('Request Failure', () => {
    test('Propagates an SES delivery failure to the caller', async () => {
      sesMock.on(SendEmailCommand).rejects(new Error('SES is unavailable'));

      await expect(sendInvitationEmail(invitation)).rejects.toThrow('SES is unavailable');
    });

    test('A delivery failure attempts the send exactly once', async () => {
      sesMock.on(SendEmailCommand).rejects(new Error('SES is unavailable'));

      await expect(sendInvitationEmail(invitation)).rejects.toThrow();
      expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(1);
    });
  });
});
