/** Types generated for queries found in "src/repositories/roles/types/get-role-by-id.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RolesGetRoleById' parameters type */
export interface IRolesGetRoleByIdParams {
  roleId: string;
}

/** 'RolesGetRoleById' return type */
export interface IRolesGetRoleByIdResult {
  role_id: string;
}

/** 'RolesGetRoleById' query type */
export interface IRolesGetRoleByIdQuery {
  params: IRolesGetRoleByIdParams;
  result: IRolesGetRoleByIdResult;
}

const rolesGetRoleByIdIR: any = {"usedParamSet":{"roleId":true},"params":[{"name":"roleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":126,"b":133}]}],"statement":"                                                             \nSELECT\n\tr.id AS role_id\nFROM\n\tinternal.roles AS r\nWHERE\n\tr.id = :roleId!"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	r.id AS role_id
 * FROM
 * 	internal.roles AS r
 * WHERE
 * 	r.id = :roleId!
 * ```
 */
export const rolesGetRoleById = new PreparedQuery<IRolesGetRoleByIdParams,IRolesGetRoleByIdResult>(rolesGetRoleByIdIR);


