import type { FastifyServerOptions } from 'fastify';
import ajvFormats from 'ajv-formats';

import customAjvFormatsPlugin from '../plugins/customAjvFormats.ts';

type AjvPlugins = NonNullable<NonNullable<FastifyServerOptions['ajv']>['plugins']>;
type AjvPlugin = Exclude<AjvPlugins[number], [unknown, unknown]>;

const ajvFormatsPlugin = ajvFormats as unknown as AjvPlugin;
const responseValidationConfig = {
  ajv: {
    plugins: [
      [ajvFormatsPlugin, { mode: 'full' }],
      customAjvFormatsPlugin as AjvPlugin,
    ],
  },
};

export {
  responseValidationConfig,
};
