import { paginationOffset, paginationCount, paginationPages } from '#utils/functions';

import type { UsersRepository } from '#repositories/users/users.repository';
import type { GetResult } from '../../types/general.ts';

interface GetUsersParams {
  userId: string | null;
  inactive: 'include' | 'exclude' | 'only';
  page: number;
  perPage: number;
}

interface UserItem {
  email: string;
  full_name: string;
  known_as: string | null;
  is_active: boolean;
}

interface GetUsersResult extends GetResult {
  output: { [id: string]: UserItem };
}

async function getUsers(repository: UsersRepository, params: GetUsersParams): Promise<GetUsersResult> {
  const {
    inactive,
    page,
    perPage,
    userId,
  } = params;

  let isActive: boolean | null;

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

export {
  getUsers,
};
