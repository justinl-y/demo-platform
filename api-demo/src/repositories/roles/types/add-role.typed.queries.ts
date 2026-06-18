/** Types generated for queries found in "src/repositories/roles/types/add-role.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RolesAddRole' parameters type */
export interface IRolesAddRoleParams {
  description: string;
  name: string;
}

/** 'RolesAddRole' return type */
export interface IRolesAddRoleResult {
  description: string;
  name: string;
  role_id: string;
}

/** 'RolesAddRole' query type */
export interface IRolesAddRoleQuery {
  params: IRolesAddRoleParams;
  result: IRolesAddRoleResult;
}

const rolesAddRoleIR: any = {"usedParamSet":{"name":true,"description":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":130,"b":135}]},{"name":"description","required":true,"transform":{"type":"scalar"},"locs":[{"a":141,"b":153}]}],"statement":"                                                             \nINSERT INTO internal.roles\n\t(\n\t\tname\n\t\t, description\n\t)\nVALUES\n\t(\n\t\t:name!\n\t\t, :description!\n\t)\nRETURNING\n\tid AS role_id\n\t, name\n\t, description"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * INSERT INTO internal.roles
 * 	(
 * 		name
 * 		, description
 * 	)
 * VALUES
 * 	(
 * 		:name!
 * 		, :description!
 * 	)
 * RETURNING
 * 	id AS role_id
 * 	, name
 * 	, description
 * ```
 */
export const rolesAddRole = new PreparedQuery<IRolesAddRoleParams,IRolesAddRoleResult>(rolesAddRoleIR);


