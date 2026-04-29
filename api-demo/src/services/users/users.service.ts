import { getUsers as getUsersFromDb } from '#repositories/users/users.repository';

import type { JWT } from '@fastify/jwt';
import type { DatabaseDecorator } from '../../types/database.ts';

type UsersResult = {
  [id: string]: {
    email: string;
    full_name: string;
    known_as: string;
  };
} | null;

async function getUsers(db: DatabaseDecorator, jwt: JWT, userId: string | null): Promise<UsersResult> {
  const result = await getUsersFromDb(db, userId);

  return (result?.[0]?.users ?? null) as UsersResult;
}

export {
  getUsers,
};
