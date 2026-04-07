import type { FastifyServerOptions } from 'fastify';

type AjvPlugins = NonNullable<NonNullable<FastifyServerOptions['ajv']>['plugins']>;

export type AjvPlugin = Exclude<AjvPlugins[number], [unknown, unknown]>;
