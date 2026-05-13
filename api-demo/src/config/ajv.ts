import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import customAjvFormatsPlugin from '../plugins/custom-ajv-formats.ts';

import type { FastifyServerOptions } from 'fastify';

type AjvPlugins = NonNullable<NonNullable<FastifyServerOptions['ajv']>['plugins']>;
type AjvPlugin = Exclude<AjvPlugins[number], [unknown, unknown]>;

const ajvPlugins: AjvPlugins = [
  [ajvFormats as unknown as AjvPlugin, { mode: 'full' }],
  [ajvKeywords as unknown as AjvPlugin, ['transform']],
  customAjvFormatsPlugin as AjvPlugin,
];

export {
  ajvPlugins,
};
