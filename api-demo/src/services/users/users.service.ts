import { getUsers as getUsersFromDb } from '#repositories/users/users.repository';

import type { DatabaseDecorator } from '../../types/database.ts';

interface Users {
  [id: string]: {
    email: string;
    full_name: string;
    known_as: string | null;
  };
}

async function getUsers(db: DatabaseDecorator, userId: string | null): Promise<Users> {
  const result = await getUsersFromDb(db, userId);

  return (result?.users ?? {}) as Users;
}

export {
  getUsers,
};
