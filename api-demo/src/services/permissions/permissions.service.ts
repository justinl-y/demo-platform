import { BadRequestError } from 'http-errors-enhanced';

import { paginationOffset, paginationCount, paginationPages } from '#utils/functions';

import type { PermissionsRepository } from '#repositories/permissions/permissions.repository';
import type { GetResult } from '../../types/general.ts';

interface FetchPermissionsParams {
  page: number;
  perPage: number;
  permissionId: string | null;
}

interface PermissionItem {
  name: string;
  description: string;
}

interface FetchPermissionsResult extends GetResult {
  output: {
    [permission_id: string]: PermissionItem;
  };
}

async function fetchPermissions(repository: PermissionsRepository, params: FetchPermissionsParams): Promise<FetchPermissionsResult> {
  const {
    page,
    perPage,
    permissionId,
  } = params;

  const offset = paginationOffset(page, perPage);

  const getPermissionsParams = {
    permissionId,
    limit: perPage,
    offset,
  };

  const result = await repository.getPermissions(getPermissionsParams);

  const output = (result?.permissions ?? {}) as unknown as { [id: string]: PermissionItem };
  const count = paginationCount(output);
  const pages = paginationPages(result?.total, perPage);

  return {
    output,
    count,
    pagination: {
      page,
      pages,
    },
  };
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

  const {
    permission: newPermission,
  } = await repository.addPermission({
    name,
    description,
  });

  return newPermission;
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

async function deletePermission(repository: PermissionsRepository, params: DeletePermissionParams): Promise<DeletePermissionResult> {
  const {
    permissionId,
  } = params;

  const {
    permission: deletedPermission,
  } = await repository.removePermission({
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
