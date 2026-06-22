/** Types generated for queries found in "src/repositories/roles/types/remove-role.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RolesRemoveRole' parameters type */
export interface IRolesRemoveRoleParams {
  roleId: string;
}

/** 'RolesRemoveRole' return type */
export interface IRolesRemoveRoleResult {
  role_id: string;
}

/** 'RolesRemoveRole' query type */
export interface IRolesRemoveRoleQuery {
  params: IRolesRemoveRoleParams;
  result: IRolesRemoveRoleResult;
}

const rolesRemoveRoleIR: any = {"usedParamSet":{"roleId":true},"params":[{"name":"roleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":111}]}],"statement":"                                                             \nDELETE FROM\n  internal.roles\nWHERE\n  id = :roleId!\nRETURNING\n  id AS role_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * DELETE FROM
 *   internal.roles
 * WHERE
 *   id = :roleId!
 * RETURNING
 *   id AS role_id
 * ```
 */
export const rolesRemoveRole = new PreparedQuery<IRolesRemoveRoleParams,IRolesRemoveRoleResult>(rolesRemoveRoleIR);


