/** Types generated for queries found in "src/repositories/health/types/get-pg-version.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'HealthGetPgVersion' parameters type */
export type IHealthGetPgVersionParams = void;

/** 'HealthGetPgVersion' return type */
export interface IHealthGetPgVersionResult {
  version: string | null;
}

/** 'HealthGetPgVersion' query type */
export interface IHealthGetPgVersionQuery {
  params: IHealthGetPgVersionParams;
  result: IHealthGetPgVersionResult;
}

const healthGetPgVersionIR: any = {"usedParamSet":{},"params":[],"statement":"                                                             \nSELECT\n  version()"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   version()
 * ```
 */
export const healthGetPgVersion = new PreparedQuery<IHealthGetPgVersionParams,IHealthGetPgVersionResult>(healthGetPgVersionIR);


