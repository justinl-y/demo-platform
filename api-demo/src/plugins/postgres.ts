import fp from 'fastify-plugin';
import {
  Pool,
  types as PGTypes,
} from 'pg';

import {
  Config,
} from '#config/index';
import {
  query,
  transaction,
} from '#lib/database';

import type {
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

const NUMERIC_PG_OID = 1700;

function postgresPlugin(fastify: FastifyInstance, options: FastifyPluginOptions): void {
  // =============================================================================
  // node pg will return numeric/decimal values as strings
  // because the max Postgres float (64 bit) will exceed the maximum JS can handle.

  // Good news: we can overide it. This converts all strings coming back from Nodepg
  // into Javascript Floats. But be warned. If PG throws us a Decimal we cannot handle
  // we will roll-over / die.

  // OIDs can be fetched from PSQL using sql:
  // SELECT typname, oid, typarray FROM pg_type ORDER BY typname, oid;
  // https://github.com/brianc/node-pg-types

  // NOTE: This fix is a global override — PGTypes.setTypeParser affects every query in the process. If there will be a mix of safe and unsafe numeric columns, global parser is blunt. A safer pattern is to handle the conversion per-query in the result mapping rather than globally in this scenario.

  PGTypes.setTypeParser(NUMERIC_PG_OID, (val) => ((val === null) ? null : parseFloat(val)));
  // =============================================================================

  const pool = new Pool(Config.postgresConfig());

  // bind configured pg pool to query and transaction functions as partial application
  const boundMethods = {
    query: query.bind(pool) as FastifyInstance['db']['query'],
    transaction: transaction.bind(pool),
  };

  // decorate the fastify instance with a db object exposing these bound methods on the instance
  fastify.decorate('db', boundMethods);
}

export default fp(postgresPlugin);
