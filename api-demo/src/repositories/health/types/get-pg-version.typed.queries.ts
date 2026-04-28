/** Types generated for queries found in "src/routes/health-check/get-health-db/types/get-pg-version.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'HealthCheckGetHealthDbGetPgVersion' parameters type */
export type IHealthCheckGetHealthDbGetPgVersionParams = void;

/** 'HealthCheckGetHealthDbGetPgVersion' return type */
export interface IHealthCheckGetHealthDbGetPgVersionResult {
  version: string | null;
}

/** 'HealthCheckGetHealthDbGetPgVersion' query type */
export interface IHealthCheckGetHealthDbGetPgVersionQuery {
  params: IHealthCheckGetHealthDbGetPgVersionParams;
  result: IHealthCheckGetHealthDbGetPgVersionResult;
}

const healthCheckGetHealthDbGetPgVersionIR: any = {"usedParamSet":{},"params":[],"statement":"                                                             \nSELECT\n  version()"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   version()
 * ```
 */
export const healthCheckGetHealthDbGetPgVersion = new PreparedQuery<IHealthCheckGetHealthDbGetPgVersionParams,IHealthCheckGetHealthDbGetPgVersionResult>(healthCheckGetHealthDbGetPgVersionIR);


