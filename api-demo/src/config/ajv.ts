import ajvFormats from 'ajv-formats';
import customAjvFormatsPlugin from '../plugins/custom-ajv-formats.ts';

import type { AjvPlugin, AjvPlugins } from '../types/ajv.ts';

const ajvPlugins: AjvPlugins = [
  [ajvFormats as unknown as AjvPlugin, { mode: 'full' }],
  customAjvFormatsPlugin as AjvPlugin,
];

export {
  ajvPlugins,
};
