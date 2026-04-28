import { getUsers as getUsersFromDb } from '#repositories/users/users.repository';

import type { DatabaseDecorator, QueryRow } from '../../types/database.ts';

async function getUsers(db: DatabaseDecorator): Promise<QueryRow[] | null> {
  return getUsersFromDb(db);
}

export {
  getUsers,
};
