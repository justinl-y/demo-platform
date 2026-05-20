import { BadRequestError } from 'http-errors-enhanced';

import { paginationOffset, paginationCount, paginationPages, randomAlphaNumeric } from '#utils/functions';
import { bcryptHash } from '#lib/authentication';

import type { UsersRepository } from '#repositories/users/users.repository';
import type { GetResult, UserStatus } from '../../types/general.ts';

interface GetUsersParams {
  page: number;
  perPage: number;
  userId: string | null;
  status: UserStatus[] | null;
}

interface UserItem {
  email: string;
  full_name: string;
  known_as: string | null;
  status: UserStatus;
}

interface GetUsersResult extends GetResult {
  output: { [id: string]: UserItem };
}

async function getUsers(repository: UsersRepository, params: GetUsersParams): Promise<GetUsersResult> {
  const {
    page,
    perPage,
    status,
    userId,
  } = params;

  const offset = paginationOffset(page, perPage);

  const getUsersParams = {
    userId,
    status,
    limit: perPage,
    offset,
  };

  const result = await repository.getUsers(getUsersParams);

  const output = (result?.users ?? {}) as unknown as { [id: string]: UserItem };
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

interface PostUsersParams {
  email: string;
  fullName: string;
  knownAs?: string | null;
}

interface PostUsersResult {
  id: string;
  email: string;
  full_name: string;
  known_as: string | null;
  status: UserStatus;
}

async function postUsers(repository: UsersRepository, params: PostUsersParams): Promise<PostUsersResult> {
  const {
    email,
    fullName,
    knownAs,
  } = params;

  const existing = await repository.getUserByEmail({ email });
  if (existing) throw new BadRequestError('Supplied user email is not unique');

  const {
    user: newUser,
  } = await repository.addUser({
    email,
    fullName,
    knownAs,
  });

  return newUser;
}

interface PutUsersParams {
  userId: string;
  fullName: string;
  knownAs?: string | null;
}

interface PutUsersResult {
  id: string;
  full_name: string;
  known_as: string | null;
}

async function putUsers(repository: UsersRepository, params: PutUsersParams): Promise<PutUsersResult> {
  const {
    userId,
    fullName,
    knownAs,
  } = params;

  const putUsersParams = {
    userId,
    fullName,
    knownAs,
  };

  const {
    user: updatedUser,
  } = await repository.updateUser(putUsersParams);

  if (!updatedUser) throw new BadRequestError('Invalid user id');

  return updatedUser;
}

interface DeleteUsersParams {
  userId: string;
}

interface DeleteUsersResult {
  id: string;
}

interface PatchUsersEmailParams {
  userId: string;
  newEmail: string;
}

interface PatchUsersEmailResult {
  id: string;
  email: string;
}

async function patchUsersEmail(repository: UsersRepository, params: PatchUsersEmailParams): Promise<PatchUsersEmailResult> {
  const {
    userId,
    newEmail,
  } = params;

  const existing = await repository.getUserByEmail({ email: newEmail });
  if (existing && existing.id !== userId) throw new BadRequestError('Supplied user email is not unique');

  const updateUserEmailParams = {
    userId,
    newEmail,
  };

  const {
    user: changedUser,
  } = await repository.updateUserEmail(updateUserEmailParams);

  if (!changedUser) throw new BadRequestError('Invalid user id');

  return changedUser;
}

async function deleteUsers(repository: UsersRepository, params: DeleteUsersParams): Promise<DeleteUsersResult> {
  const {
    userId,
  } = params;

  const {
    user: deletedUser,
  } = await repository.removeUser({
    userId,
  });

  if (!deletedUser) throw new BadRequestError(`Invalid user id or user status`);

  return deletedUser;
}

interface PatchUsersDeactivateParams {
  userId: string;
}

interface PatchUsersDeactivateResult {
  id: string;
}

async function patchUsersDeactivate(repository: UsersRepository, params: PatchUsersDeactivateParams): Promise<PatchUsersDeactivateResult> {
  const {
    userId,
  } = params;

  const validUserParams = {
    userId,
    status: 'ACTIVE' as UserStatus,
  };

  const validUser = await repository.getUserByStatus(validUserParams);
  if (!validUser) throw new BadRequestError('Invalid user id or user status');

  const newPasswordHash = await bcryptHash(randomAlphaNumeric());

  const {
    user: deactivatedUser,
  } = await repository.deactivateUser({
    userId,
    newPasswordHash,
  });

  if (!deactivatedUser) throw new BadRequestError('Invalid user id or user status');

  return deactivatedUser;
}

export {
  getUsers,
  postUsers,
  putUsers,
  patchUsersEmail,
  deleteUsers,
  patchUsersDeactivate,
};
