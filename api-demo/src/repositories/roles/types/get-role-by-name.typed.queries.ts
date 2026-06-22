/** Types generated for queries found in "src/repositories/roles/types/get-role-by-name.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RolesGetRoleByName' parameters type */
export interface IRolesGetRoleByNameParams {
  name: string;
}

/** 'RolesGetRoleByName' return type */
export interface IRolesGetRoleByNameResult {
  role_id: string;
}

/** 'RolesGetRoleByName' query type */
export interface IRolesGetRoleByNameQuery {
  params: IRolesGetRoleByNameParams;
  result: IRolesGetRoleByNameResult;
}

const rolesGetRoleByNameIR: any = {"usedParamSet":{"name":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":133}]}],"statement":"                                                             \nSELECT\n\tr.id AS role_id\nFROM\n\tinternal.roles AS r\nWHERE\n\tr.name = :name!"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	r.id AS role_id
 * FROM
 * 	internal.roles AS r
 * WHERE
 * 	r.name = :name!
 * ```
 */
export const rolesGetRoleByName = new PreparedQuery<IRolesGetRoleByNameParams,IRolesGetRoleByNameResult>(rolesGetRoleByNameIR);


