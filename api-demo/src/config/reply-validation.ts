import { ajvPlugins } from './ajv.ts';

const replyValidationConfig = {
  ajv: {
    plugins: ajvPlugins,
    strict: false,
  },
};

export {
  replyValidationConfig,
};
