import {
  routeSchema,
} from '#utils/functions';
import {
  Config,
} from '#config/index';

const route = {
  tags: ['Authentication'],
  summary: 'User password reset',
  description: 'Resets a user\'s password using the token from the reset email',
};

const {
  password: {
    passwordLengthMin,
    passwordLengthMax,
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
    new_password: {
      type: 'string',
      minLength: passwordLengthMin,
      maxLength: passwordLengthMax,
      description: 'New password to set for the account',
      transform: ['trim'],
    },
  },
  required: [
    'password_reset_token',
    'new_password',
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
