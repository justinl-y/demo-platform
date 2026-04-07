import ajvFormats from 'ajv-formats';

import customAjvFormatsPlugin from '../plugins/custom-ajv-formats.ts';

import type { AjvPlugin } from '../types/ajv.ts';

const ajvFormatsPlugin = ajvFormats as unknown as AjvPlugin;
const replyValidationConfig = {
  ajv: {
    strict: false,
    plugins: [
      [ajvFormatsPlugin, { mode: 'full' }],
      customAjvFormatsPlugin as AjvPlugin,
    ],
  },
};

export {
  replyValidationConfig,
};
