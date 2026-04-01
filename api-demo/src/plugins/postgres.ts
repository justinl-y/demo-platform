import fp from 'fastify-plugin';
import {
  Pool,
} from 'pg';
import type {
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  postgresConfig,
} from '#config/postgres';
import {
  query,
  transaction,
} from '#utils/database';

// const NUMERIC_PG_OID = 1700;

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

  // PGTypes.setTypeParser(NUMERIC_PG_OID, (val) => ((val === null) ? null : parseFloat(val)));
  // =============================================================================

  const pool = new Pool(postgresConfig());

  // bind configured pg pool to query and transaction functions as partial application
  const boundMethods = {
    query: query.bind(pool),
    transaction: transaction.bind(pool),
  };

  // decorate the fastify instance with a db object exposing these bound methods on the instance
  fastify.decorate('db', boundMethods);
}

export default fp(postgresPlugin);
