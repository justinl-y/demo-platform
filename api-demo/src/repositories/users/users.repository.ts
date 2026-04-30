import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IUsersGetUsersResult } from './types/get-users.typed.queries.ts';

const relPath = import.meta.dirname;
const getUsersQuery = cwd('get-users', relPath);

async function getUsers(db: DatabaseDecorator, userId: string | null) {
  return db.query<IUsersGetUsersResult>(getUsersQuery, { userId });
}

export {
  getUsers,
};
