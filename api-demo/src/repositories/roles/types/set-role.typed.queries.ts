/** Types generated for queries found in "src/repositories/roles/types/set-role.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RolesSetRole' parameters type */
export interface IRolesSetRoleParams {
  description: string;
  name: string;
  roleId: string;
}

/** 'RolesSetRole' return type */
export interface IRolesSetRoleResult {
  description: string;
  name: string;
  role_id: string;
}

/** 'RolesSetRole' query type */
export interface IRolesSetRoleQuery {
  params: IRolesSetRoleParams;
  result: IRolesSetRoleResult;
}

const rolesSetRoleIR: any = {"usedParamSet":{"name":true,"description":true,"roleId":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":99,"b":104}]},{"name":"description","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":136}]},{"name":"roleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":158}]}],"statement":"                                                             \nUPDATE\n  internal.roles\nSET\n  name = :name!\n  , description = :description!\nWHERE\n  id = :roleId!\nRETURNING\n  id AS role_id\n  , name\n  , description"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.roles
 * SET
 *   name = :name!
 *   , description = :description!
 * WHERE
 *   id = :roleId!
 * RETURNING
 *   id AS role_id
 *   , name
 *   , description
 * ```
 */
export const rolesSetRole = new PreparedQuery<IRolesSetRoleParams,IRolesSetRoleResult>(rolesSetRoleIR);


