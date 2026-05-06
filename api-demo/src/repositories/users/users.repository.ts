import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IUsersGetUsersResult } from './types/get-users.typed.queries.ts';

const relPath = import.meta.dirname;
const getUsersQuery = cwd('get-users', relPath);

interface GetUsers {
  userId: string | null;
}

function createUsersRepository(db: DatabaseDecorator) {
  return {
    getUsers: ({
      userId,
    }: GetUsers) =>
      db.query<IUsersGetUsersResult>(getUsersQuery, { userId }, 'one'),
  };
}

type UsersRepository = ReturnType<typeof createUsersRepository>;

export type { UsersRepository };
export { createUsersRepository };
