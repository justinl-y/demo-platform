import ajvFormats from 'ajv-formats';
import customAjvFormatsPlugin from '../plugins/custom-ajv-formats.ts';

import type { FastifyServerOptions } from 'fastify';

type AjvPlugins = NonNullable<NonNullable<FastifyServerOptions['ajv']>['plugins']>;
type AjvPlugin = Exclude<AjvPlugins[number], [unknown, unknown]>;

const ajvPlugins: AjvPlugins = [
  [ajvFormats as unknown as AjvPlugin, { mode: 'full' }],
  customAjvFormatsPlugin as AjvPlugin,
];

export {
  ajvPlugins,
};
