import {
  routeSchema,
} from '#utils/functions';
import {
  Config,
} from '#config/index';

const route = {
  tags: ['users'],
  summary: 'Activate an invited user',
  description: 'Activates an invited user using the token from the activation email and sets the account password',
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
    token: {
      type: 'string',
      minLength: tokenLength,
      maxLength: tokenLength,
      description: 'Invitation token from the activation email link',
    },
    password: {
      type: 'string',
      minLength: passwordLengthMin,
      maxLength: passwordLengthMax,
      description: 'Password to set for the account',
      transform: ['trim'],
    },
  },
  required: ['token', 'password'],
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
