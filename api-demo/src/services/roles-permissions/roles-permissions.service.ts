import { BadRequestError } from 'http-errors-enhanced';

import { paginationOffset, buildPaginatedResult } from '#utils/functions';

import type { RolePermissionsRepository } from '#repositories/roles-permissions/roles-permissions.repository';
import type { RolesRepository } from '#repositories/roles/roles.repository';
import type { PermissionsRepository } from '#repositories/permissions/permissions.repository';
import type { PaginatedResult } from '../../types/general.ts';

interface FetchRolePermissionsParams {
  roleId: string | null;
  page: number;
  perPage: number;
}

interface RolePermissionEntry {
  permission_id: string;
  permission_name: string;
}

interface RoleWithPermissions {
  role_id: string;
  role_name: string;
  permissions: {
    [permission_id: string]: RolePermissionEntry;
  };
}

// Lists roles with their assigned permissions as a role-keyed nested map. roleId is an
// optional query filter; when omitted every role is returned. The nested JSON is built in
// SQL, so the service only maps it onto the paginated envelope.
async function fetchRolePermissions(repository: RolePermissionsRepository, params: FetchRolePermissionsParams): Promise<PaginatedResult<RoleWithPermissions>> {
  const {
    roleId,
    page,
    perPage,
  } = params;

  const offset = paginationOffset(page, perPage);

  const getRolePermissionsParams = {
    roleId,
    limit: perPage,
    offset,
  };

  const result = await repository.getRolePermissions(getRolePermissionsParams);

  return buildPaginatedResult<RoleWithPermissions>(result, {
    page,
    perPage,
    key: 'roles',
  });
}

interface AssignRolePermissionsParams {
  roleId: string;
  permissionIds: string[];
}

interface AssignRolePermissionsResult {
  role_id: string;
  permissions: string[];
}

// Creates role-permission assignments. The role and every supplied permission id are
// validated, and because POST only creates, any permission already assigned to the role
// is rejected — the whole request fails rather than partially assigning.
async function assignRolePermissions(
  rolePermissionsRepository: RolePermissionsRepository,
  rolesRepository: RolesRepository,
  permissionsRepository: PermissionsRepository,
  params: AssignRolePermissionsParams,
): Promise<AssignRolePermissionsResult> {
  const {
    roleId,
    permissionIds,
  } = params;

  const role = await rolesRepository.getRoleById({ roleId });
  if (!role) throw new BadRequestError('Invalid role id');

  const existingPermissions = await permissionsRepository.getPermissionIds({ permissionIds }) ?? [];
  if (existingPermissions.length !== permissionIds.length) throw new BadRequestError('One or more supplied permission ids are invalid');

  const alreadyAssigned = await rolePermissionsRepository.getRolePermissionIds({
    roleId,
    permissionIds,
  }) ?? [];
  if (alreadyAssigned.length > 0) throw new BadRequestError('One or more permissions are already assigned to the role');

  const {
    permissions: createdPermissions,
  } = await rolePermissionsRepository.addRolePermissions({
    roleId,
    permissionIds,
  });

  return {
    role_id: roleId,
    permissions: createdPermissions.map((row) => row.permission_id),
  };
}

interface EditRolePermissionsParams {
  roleId: string;
  permissionIds: string[];
}

interface EditRolePermissionsResult {
  role_id: string;
  permissions: string[];
}

// Replaces a role's entire permission set (PUT semantics). The role and every supplied
// permission id are validated, then the assignments are overwritten atomically.
async function editRolePermissions(
  rolePermissionsRepository: RolePermissionsRepository,
  rolesRepository: RolesRepository,
  permissionsRepository: PermissionsRepository,
  params: EditRolePermissionsParams,
): Promise<EditRolePermissionsResult> {
  const {
    roleId,
    permissionIds,
  } = params;

  const role = await rolesRepository.getRoleById({ roleId });
  if (!role) throw new BadRequestError('Invalid role id');

  const existingPermissions = await permissionsRepository.getPermissionIds({ permissionIds }) ?? [];
  if (existingPermissions.length !== permissionIds.length) throw new BadRequestError('One or more supplied permission ids are invalid');

  const {
    permissions: assignedPermissions,
  } = await rolePermissionsRepository.replaceRolePermissions({
    roleId,
    permissionIds,
  });

  return {
    role_id: roleId,
    permissions: assignedPermissions.map((row) => row.permission_id),
  };
}

interface DeleteRolePermissionsParams {
  roleId: string;
}

// Removes every permission assigned to a role (DELETE semantics). The role is validated so
// clearing a non-existent role is rejected rather than silently succeeding.
async function deleteRolePermissions(
  rolePermissionsRepository: RolePermissionsRepository,
  rolesRepository: RolesRepository,
  params: DeleteRolePermissionsParams,
): Promise<void> {
  const {
    roleId,
  } = params;

  const role = await rolesRepository.getRoleById({ roleId });
  if (!role) throw new BadRequestError('Invalid role id');

  await rolePermissionsRepository.removeRolePermissions({ roleId });
}

export {
  fetchRolePermissions,
  assignRolePermissions,
  editRolePermissions,
  deleteRolePermissions,
};
