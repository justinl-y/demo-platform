import { BadRequestError } from 'http-errors-enhanced';

import { paginationOffset, buildPaginatedResult } from '#utils/functions';

import type { RolesRepository } from '#repositories/roles/roles.repository';
import type { PaginatedResult } from '../../types/general.ts';

interface FetchRolesParams {
  page: number;
  perPage: number;
  roleId: string | null;
}

interface RoleItem {
  name: string;
  description: string;
}

async function fetchRoles(repository: RolesRepository, params: FetchRolesParams): Promise<PaginatedResult<RoleItem>> {
  const {
    page,
    perPage,
    roleId,
  } = params;

  const offset = paginationOffset(page, perPage);

  const getRolesParams = {
    roleId,
    limit: perPage,
    offset,
  };

  const result = await repository.getRoles(getRolesParams);

  return buildPaginatedResult<RoleItem>(result, {
    page,
    perPage,
    key: 'roles',
  });
}

interface CreateRoleParams {
  name: string;
  description: string;
}

interface CreateRoleResult {
  role_id: string;
  name: string;
  description: string;
}

async function createRole(repository: RolesRepository, params: CreateRoleParams): Promise<CreateRoleResult> {
  const {
    name,
    description,
  } = params;

  const existing = await repository.getRoleByName({ name });
  if (existing) throw new BadRequestError('Supplied role name is not unique');

  const {
    role: newRole,
  } = await repository.addRole({
    name,
    description,
  });

  return newRole;
}

interface EditRoleParams {
  roleId: string;
  name: string;
  description: string;
}

interface EditRoleResult {
  role_id: string;
  name: string;
  description: string;
}

async function editRole(repository: RolesRepository, params: EditRoleParams): Promise<EditRoleResult> {
  const {
    roleId,
    name,
    description,
  } = params;

  const existing = await repository.getRoleByName({ name });
  if (existing && existing.role_id !== roleId) throw new BadRequestError('Supplied role name is not unique');

  const {
    role: updatedRole,
  } = await repository.updateRole({
    roleId,
    name,
    description,
  });

  if (!updatedRole) throw new BadRequestError('Invalid role id');

  return updatedRole;
}

interface DeleteRoleParams {
  roleId: string;
}

interface DeleteRoleResult {
  role_id: string;
}

async function deleteRole(repository: RolesRepository, params: DeleteRoleParams): Promise<DeleteRoleResult> {
  const {
    roleId,
  } = params;

  const {
    role: deletedRole,
  } = await repository.removeRole({
    roleId,
  });

  if (!deletedRole) throw new BadRequestError('Invalid role id');

  return deletedRole;
}

export {
  fetchRoles,
  createRole,
  editRole,
  deleteRole,
};
