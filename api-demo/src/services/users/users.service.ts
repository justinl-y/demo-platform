import { paginationOffset, paginationCount, paginationPages } from '#utils/functions';

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

/* interface PostUsersResult {
  id: string;
  email: string;
  fullName: string;
  knownAs: string | null;
} */

async function postUsers(repository: UsersRepository, params: PostUsersParams): Promise<void> { // Promise<PostUsersResult>

}

export {
  getUsers,
  postUsers,
};
