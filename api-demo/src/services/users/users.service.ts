import { getUsers as getUsersFromDb } from '#repositories/users/users.repository';

import type { DatabaseDecorator } from '../../types/database.ts';

interface GetUsersParams {
  userId: string | null;
}

interface Users {
  [id: string]: {
    email: string;
    full_name: string;
    known_as: string | null;
  };
}

async function getUsers(db: DatabaseDecorator, params: GetUsersParams): Promise<Users> {
  const {
    userId,
  } = params;

  const result = await getUsersFromDb(db, userId);

  return (result?.users ?? {}) as Users;
}

export {
  getUsers,
};
