import { paginationOffset } from '#utils/functions';

import type { UsersRepository } from '#repositories/users/users.repository';

interface GetUsersParams {
  userId: string | null;
  inactive: 'include' | 'exclude' | 'only';
  page: number;
  perPage: number;
}

interface Users {
  [id: string]: {
    email: string;
    full_name: string;
    known_as: string | null;
    is_active: boolean;
  };
}

async function getUsers(repository: UsersRepository, params: GetUsersParams): Promise<Users> {
  const {
    inactive,
    page,
    perPage,
    userId,
  } = params;

  let isActive;

  if (inactive === 'exclude') isActive = true;
  else if (inactive === 'only') isActive = false;
  else isActive = null;

  const offset = paginationOffset(page, perPage);

  const getUsersParams = {
    userId,
    isActive,
    limit: perPage,
    offset,
  };

  const result = await repository.getUsers(getUsersParams);

  return (result?.users ?? {}) as Users;
}

export {
  getUsers,
};
