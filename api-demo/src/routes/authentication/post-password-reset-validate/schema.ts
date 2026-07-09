import {
  routeSchema,
} from '#utils/functions';
import {
  Config,
} from '#config/index';

const route = {
  tags: ['Authentication'],
  summary: 'Validate a password reset token',
  description: 'Checks whether a password reset token is still valid (active user, unused and unexpired) without consuming it. Lets the front-end redirect a used or expired reset link before rendering the form.',
};

const {
  password: {
    tokenLength,
  },
} = Config.authConfig();

const body = {
  type: 'object',
  properties: {
    password_reset_token: {
      type: 'string',
      minLength: tokenLength,
      maxLength: tokenLength,
      description: 'Reset token from the password reset email link',
    },
  },
  required: [
    'password_reset_token',
  ],
  additionalProperties: false,
};

const response = {
  204: {
    type: 'null',
  },
};

export default routeSchema({
  route,
  body,
  response,
});
