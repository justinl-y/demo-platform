import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { UserStatus } from '../../types/general.ts';
import type { IUsersGetUsersResult } from './types/get-users.typed.queries.ts';

const relPath = import.meta.dirname;
const getUsersQuery = cwd('get-users', relPath);

interface GetUsers {
  userId: string | null;
  status: UserStatus[] | null;
  limit: number;
  offset: number;
}

function createUsersRepository(db: DatabaseDecorator) {
  return {
    getUsers: ({
      userId,
      status,
      limit,
      offset,
    }: GetUsers) => {
      const queryParams = {
        userId,
        status,
        limit,
        offset,
      };

      return db.query<IUsersGetUsersResult>(getUsersQuery, queryParams, 'one');
    },
  };
}

type UsersRepository = ReturnType<typeof createUsersRepository>;

export type { UsersRepository };
export { createUsersRepository };
