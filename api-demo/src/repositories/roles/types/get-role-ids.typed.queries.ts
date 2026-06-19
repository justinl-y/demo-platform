/** Types generated for queries found in "src/repositories/roles/types/get-role-ids.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'RolesGetRoleIds' parameters type */
export interface IRolesGetRoleIdsParams {
  roleIds: stringArray;
}

/** 'RolesGetRoleIds' return type */
export interface IRolesGetRoleIdsResult {
  role_id: string;
}

/** 'RolesGetRoleIds' query type */
export interface IRolesGetRoleIdsQuery {
  params: IRolesGetRoleIdsParams;
  result: IRolesGetRoleIdsResult;
}

const rolesGetRoleIdsIR: any = {"usedParamSet":{"roleIds":true},"params":[{"name":"roleIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":130,"b":138}]}],"statement":"                                                             \nSELECT\n\tr.id AS role_id\nFROM\n\tinternal.roles AS r\nWHERE\n\tr.id = ANY(:roleIds!)"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	r.id AS role_id
 * FROM
 * 	internal.roles AS r
 * WHERE
 * 	r.id = ANY(:roleIds!)
 * ```
 */
export const rolesGetRoleIds = new PreparedQuery<IRolesGetRoleIdsParams,IRolesGetRoleIdsResult>(rolesGetRoleIdsIR);


