import { BadRequestError } from 'http-errors-enhanced';

import { paginationOffset, buildPaginatedResult } from '#utils/functions';

import type { UsersRolesRepository } from '#repositories/users-roles/users-roles.repository';
import type { UsersRepository } from '#repositories/users/users.repository';
import type { RolesRepository } from '#repositories/roles/roles.repository';
import type { PaginatedResult } from '../../types/general.ts';

interface FetchUsersRolesParams {
  userId: string | null;
  page: number;
  perPage: number;
}

interface UserRoleEntry {
  role_id: string;
  role_name: string;
}

interface UserWithRoles {
  user_id: string;
  user_email: string;
  user_full_name: string;
  roles: {
    [role_id: string]: UserRoleEntry;
  };
}

// Lists users with their assigned roles as a user-keyed nested map. userId is an optional
// query filter; when omitted every user is returned. The nested JSON is built in SQL, so the
// service only maps it onto the paginated envelope.
async function fetchUsersRoles(repository: UsersRolesRepository, params: FetchUsersRolesParams): Promise<PaginatedResult<UserWithRoles>> {
  const {
    userId,
    page,
    perPage,
  } = params;

  const offset = paginationOffset(page, perPage);

  const getUsersRolesParams = {
    userId,
    limit: perPage,
    offset,
  };

  const result = await repository.getUsersRoles(getUsersRolesParams);

  return buildPaginatedResult<UserWithRoles>(result, {
    page,
    perPage,
    key: 'users',
  });
}

interface AssignUserRolesParams {
  userId: string;
  roleIds: string[];
}

interface AssignUserRolesResult {
  user_id: string;
  roles: string[];
}

// Sets a user's initial roles. The user is validated, then rejected outright if it already
// has any role assignments — this endpoint only assigns roles to a user that has none. The
// supplied role ids are validated before the assignments are created.
async function assignUserRoles(
  usersRolesRepository: UsersRolesRepository,
  usersRepository: UsersRepository,
  rolesRepository: RolesRepository,
  params: AssignUserRolesParams,
): Promise<AssignUserRolesResult> {
  const {
    userId,
    roleIds,
  } = params;

  const user = await usersRepository.getNonDeactivatedUserById({ userId });
  if (!user) throw new BadRequestError('Invalid user id or user status');

  const existingUserRoles = await usersRolesRepository.getUserRoleIds({ userId }) ?? [];
  if (existingUserRoles.length > 0) throw new BadRequestError('User roles already exist');

  const existingRoles = await rolesRepository.getRoleIds({ roleIds }) ?? [];
  if (existingRoles.length !== roleIds.length) throw new BadRequestError('One or more supplied role ids are invalid');

  const {
    roles: createdRoles,
  } = await usersRolesRepository.addUserRoles({
    userId,
    roleIds,
  });

  return {
    user_id: userId,
    roles: createdRoles.map((row) => row.role_id),
  };
}

interface EditUserRolesParams {
  userId: string;
  roleIds: string[];
}

interface EditUserRolesResult {
  user_id: string;
  roles: string[];
}

// Replaces a user's entire role set (PUT semantics). The user and every supplied role id are
// validated, then the assignments are overwritten atomically. An empty role set is allowed and
// clears the user's roles.
async function editUserRoles(
  usersRolesRepository: UsersRolesRepository,
  usersRepository: UsersRepository,
  rolesRepository: RolesRepository,
  params: EditUserRolesParams,
): Promise<EditUserRolesResult> {
  const {
    userId,
    roleIds,
  } = params;

  const user = await usersRepository.getNonDeactivatedUserById({ userId });
  if (!user) throw new BadRequestError('Invalid user id or user status');

  const existingRoles = await rolesRepository.getRoleIds({ roleIds }) ?? [];
  if (existingRoles.length !== roleIds.length) throw new BadRequestError('One or more supplied role ids are invalid');

  const {
    roles: assignedRoles,
  } = await usersRolesRepository.replaceUserRoles({
    userId,
    roleIds,
  });

  return {
    user_id: userId,
    roles: assignedRoles.map((row) => row.role_id),
  };
}

interface DeleteUserRolesParams {
  userId: string;
}

// Removes every role assigned to a user (DELETE semantics). The user is validated so clearing
// a non-existent or deactivated user is rejected rather than silently succeeding.
async function deleteUserRoles(
  usersRolesRepository: UsersRolesRepository,
  usersRepository: UsersRepository,
  params: DeleteUserRolesParams,
): Promise<void> {
  const {
    userId,
  } = params;

  const user = await usersRepository.getNonDeactivatedUserById({ userId });
  if (!user) throw new BadRequestError('Invalid user id or user status');

  await usersRolesRepository.removeUserRoles({ userId });
}

export {
  fetchUsersRoles,
  assignUserRoles,
  editUserRoles,
  deleteUserRoles,
};
