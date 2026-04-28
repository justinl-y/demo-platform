import { cwd } from '#utils/functions';

import type { DatabaseDecorator, QueryRow } from '../../types/database.ts';

const relPath = import.meta.dirname;
const getUsersQuery = cwd('get-users', relPath);

async function getUsers(db: DatabaseDecorator) {
  return db.query<QueryRow>(getUsersQuery, {});
}

export {
  getUsers,
};
