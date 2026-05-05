import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IUsersGetUsersResult } from './types/get-users.typed.queries.ts';

const relPath = import.meta.dirname;
const getUsersQuery = cwd('get-users', relPath);

function createUsersRepository(db: DatabaseDecorator) {
  return {
    getUsers: (userId: string | null) =>
      db.query<IUsersGetUsersResult>(getUsersQuery, { userId }, 'one'),
  };
}

type UsersRepository = ReturnType<typeof createUsersRepository>;

export type { UsersRepository };
export { createUsersRepository };
