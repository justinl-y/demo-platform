import { BadRequestError } from 'http-errors-enhanced';

import { paginationOffset, buildPaginatedResult } from '#utils/functions';
import { UniqueViolationError } from '#lib/database';

import type { PermissionsRepository } from '#repositories/permissions/permissions.repository';
import type { RolePermissionsRepository } from '#repositories/roles-permissions/roles-permissions.repository';
import type { PaginatedResult, SortOrder } from '../../types/general.ts';

interface FetchPermissionsParams {
  page: number;
  perPage: number;
  search: string | null;
  sort: string;
  order: SortOrder;
}

interface PermissionItem {
  permission_id: string;
  name: string;
  description: string;
}

async function fetchPermissions(repository: PermissionsRepository, params: FetchPermissionsParams): Promise<PaginatedResult<PermissionItem>> {
  const {
    page,
    perPage,
    search,
    sort,
    order,
  } = params;

  const offset = paginationOffset(page, perPage);

  const getPermissionsParams = {
    search,
    sort,
    order,
    limit: perPage,
    offset,
  };

  const result = await repository.getPermissions(getPermissionsParams);

  return buildPaginatedResult<PermissionItem>(result, {
    page,
    perPage,
    key: 'permissions',
  });
}

interface CreatePermissionParams {
  name: string;
  description: string;
}

interface CreatePermissionResult {
  permission_id: string;
  name: string;
  description: string;
}

async function createPermission(repository: PermissionsRepository, params: CreatePermissionParams): Promise<CreatePermissionResult> {
  const {
    name,
    description,
  } = params;

  const existing = await repository.getPermissionByName({ name });
  if (existing) throw new BadRequestError('Supplied permission name is not unique');

  try {
    const {
      permission: newPermission,
    } = await repository.addPermission({
      name,
      description,
    });

    return newPermission;
  }
  catch (err) {
    // Safety net for the check-then-insert race: a concurrent create can slip past the
    // getPermissionByName check and hit the UNIQUE(name) constraint. Map it to the same 400.
    if (err instanceof UniqueViolationError) throw new BadRequestError('Supplied permission name is not unique');
    throw err;
  }
}

interface EditPermissionParams {
  permissionId: string;
  name: string;
  description: string;
}

interface EditPermissionResult {
  permission_id: string;
  name: string;
  description: string;
}

async function editPermission(repository: PermissionsRepository, params: EditPermissionParams): Promise<EditPermissionResult> {
  const {
    permissionId,
    name,
    description,
  } = params;

  const existing = await repository.getPermissionByName({ name });
  if (existing && existing.permission_id !== permissionId) throw new BadRequestError('Supplied permission name is not unique');

  const {
    permission: updatedPermission,
  } = await repository.updatePermission({
    permissionId,
    name,
    description,
  });

  if (!updatedPermission) throw new BadRequestError('Invalid permission id');

  return updatedPermission;
}

interface DeletePermissionParams {
  permissionId: string;
}

interface DeletePermissionResult {
  permission_id: string;
}

async function deletePermission(
  permissionsRepository: PermissionsRepository,
  rolePermissionsRepository: RolePermissionsRepository,
  params: DeletePermissionParams,
): Promise<DeletePermissionResult> {
  const {
    permissionId,
  } = params;

  const assignedRoles = await rolePermissionsRepository.getPermissionRoleIds({ permissionId }) ?? [];
  if (assignedRoles.length > 0) throw new BadRequestError('Permission is assigned to one or more roles');

  const {
    permission: deletedPermission,
  } = await permissionsRepository.removePermission({
    permissionId,
  });

  if (!deletedPermission) throw new BadRequestError('Invalid permission id');

  return deletedPermission;
}

export {
  fetchPermissions,
  createPermission,
  editPermission,
  deletePermission,
};
