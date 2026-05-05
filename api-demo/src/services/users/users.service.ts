import type { UsersRepository } from '#repositories/users/users.repository';

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

async function getUsers(repository: UsersRepository, params: GetUsersParams): Promise<Users> {
  const {
    userId,
  } = params;

  const result = await repository.getUsers(userId);

  return (result?.users ?? {}) as Users;
}

export {
  getUsers,
};
