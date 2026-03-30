import { secretValues } from '../util/secrets-manager.ts';

const auth = {
  secret: secretValues.AUTH_SECRET,
  audience: secretValues.AUTH_AUDIENCE,
};

export {
  auth,
};
