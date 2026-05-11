import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IUsersGetUsersParams, IUsersGetUsersResult } from './types/get-users.typed.queries.ts';
import type { IUsersGetCountUsersByEmailParams, IUsersGetCountUsersByEmailResult } from './types/get-count-users-by-email.typed.queries.ts';
import type { IUsersAddUserParams, IUsersAddUserResult } from './types/add-user.typed.queries.ts';

const relPath = import.meta.dirname;
const getUsersQuery = cwd('get-users', relPath);
const getCountUsersByEmailQuery = cwd('get-count-users-by-email', relPath);
const addUserQuery = cwd('add-user', relPath);

function createUsersRepository(db: DatabaseDecorator) {
  return {
    getUsers: ({
      userId,
      status,
      limit,
      offset,
    }: IUsersGetUsersParams) => {
      const queryParams = {
        userId,
        status,
        limit,
        offset,
      };

      return db.query<IUsersGetUsersResult>(getUsersQuery, queryParams, 'one');
    },

    getCountUsersByEmail: ({
      email,
    }: IUsersGetCountUsersByEmailParams) => {
      return db.query<IUsersGetCountUsersByEmailResult>(getCountUsersByEmailQuery, { email }, 'one');
    },

    addUser: async ({
      email,
      fullName,
      knownAs,
    }: IUsersAddUserParams): Promise<{ user: IUsersAddUserResult }> => {
      const [userRow] = await db.transaction()
        .add<IUsersAddUserResult>({
          files: [addUserQuery],
          params: {
            email,
            fullName,
            knownAs,
          },
        })
        .execute();

      return {
        user: userRow[0],
      };
    },
  };
}

type UsersRepository = ReturnType<typeof createUsersRepository>;

export type { UsersRepository };
export { createUsersRepository };

// need this for later
/* async function removeUserRefreshToken(
  db: DatabaseDecorator,
  userId: string,
): Promise<{
  token: IAuthSetUserRefreshHashNullResult | null;
  session: IAuthInvalidateSessionResult | null;
  log: IAuthAuditLogResult | null;
}> {
  const [tokenRows, sessionRows, logRows] = await buildTransaction(db)
    .add<IAuthSetUserRefreshHashNullResult>({
      files: [setUserTokenNullQuery],
      params: { userId },
    })
    .add<IAuthInvalidateSessionResult>({
      files: [invalidateSessionQuery],
      params: { userId },
    })
    .add<IAuthAuditLogResult>({
      files: [insertAuditLogQuery],
      params: { userId, action: 'logout' },
    })
    .execute();

  return {
    token: tokenRows?.[0] ?? null,
    session: sessionRows?.[0] ?? null,
    log: logRows?.[0] ?? null,
  };
} */
