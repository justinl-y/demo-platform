import { BadRequestError } from 'http-errors-enhanced';

import { paginationOffset, paginationCount, paginationPages, randomAlphaNumeric, sha256Hex } from '#utils/functions';
import { postUsersActivateRoute } from '#utils/constants';
import { bcryptHash } from '#lib/authentication';
import { sendInvitationEmail } from '#lib/mailer';
import { Config } from '#config/index';

import {
  captureSentryException,
} from '#lib/sentry-instrument';

import type { UsersRepository } from '#repositories/users/users.repository';
import type { GetResult, UserStatus } from '../../types/general.ts';

interface GetUsersParams {
  page: number;
  perPage: number;
  userId: string | null;
  status: UserStatus[] | null;
}

interface UserItem {
  email: string;
  full_name: string;
  known_as: string | null;
  status: UserStatus;
}

interface GetUsersResult extends GetResult {
  output: {
    [user_id: string]: UserItem;
  };
}

async function getUsers(repository: UsersRepository, params: GetUsersParams): Promise<GetUsersResult> {
  const {
    page,
    perPage,
    status,
    userId,
  } = params;

  const offset = paginationOffset(page, perPage);

  const getUsersParams = {
    userId,
    status,
    limit: perPage,
    offset,
  };

  const result = await repository.getUsers(getUsersParams);

  const output = (result?.users ?? {}) as unknown as { [id: string]: UserItem };
  const count = paginationCount(output);
  const pages = paginationPages(result?.total, perPage);

  return {
    output,
    count,
    pagination: {
      page,
      pages,
    },
  };
}

interface PostUsersParams {
  email: string;
  fullName: string;
  knownAs?: string | null;
}

interface PostUsersResult {
  user_id: string;
  email: string;
  full_name: string;
  known_as: string | null;
  status: UserStatus;
}

async function postUsers(repository: UsersRepository, params: PostUsersParams): Promise<PostUsersResult> {
  const {
    email,
    fullName,
    knownAs,
  } = params;

  const existing = await repository.getUserByEmail({ email });
  if (existing) throw new BadRequestError('Supplied user email is not unique');

  const {
    user: newUser,
  } = await repository.addUser({
    email,
    fullName,
    knownAs,
  });

  return newUser;
}

interface PutUsersParams {
  userId: string;
  fullName: string;
  knownAs?: string | null;
}

interface PutUsersResult {
  user_id: string;
  full_name: string;
  known_as: string | null;
}

async function putUsers(repository: UsersRepository, params: PutUsersParams): Promise<PutUsersResult> {
  const {
    userId,
    fullName,
    knownAs,
  } = params;

  const putUsersParams = {
    userId,
    fullName,
    knownAs,
  };

  const {
    user: updatedUser,
  } = await repository.updateUser(putUsersParams);

  if (!updatedUser) throw new BadRequestError('Invalid user id');

  return updatedUser;
}

interface PatchUsersEmailParams {
  userId: string;
  newEmail: string;
}

interface PatchUsersEmailResult {
  user_id: string;
  email: string;
}

async function patchUsersEmail(repository: UsersRepository, params: PatchUsersEmailParams): Promise<PatchUsersEmailResult> {
  const {
    userId,
    newEmail,
  } = params;

  const existing = await repository.getUserByEmail({ email: newEmail });
  if (existing && existing.user_id !== userId) throw new BadRequestError('Supplied user email is not unique');

  const updateUserEmailParams = {
    userId,
    newEmail,
  };

  const {
    user: changedUser,
  } = await repository.updateUserEmail(updateUserEmailParams);

  if (!changedUser) throw new BadRequestError('Invalid user id');

  return changedUser;
}

interface DeleteUsersParams {
  userId: string;
}

interface DeleteUsersResult {
  user_id: string;
}

async function deleteUsers(repository: UsersRepository, params: DeleteUsersParams): Promise<DeleteUsersResult> {
  const {
    userId,
  } = params;

  const {
    user: deletedUser,
  } = await repository.removeUser({
    userId,
  });

  if (!deletedUser) throw new BadRequestError(`Invalid user id or user status`);

  return deletedUser;
}

interface PatchUsersInviteParams {
  userId: string;
}

interface PatchUsersInviteResult {
  user_id: string;
  status: UserStatus;
}

async function patchUsersInvite(repository: UsersRepository, params: PatchUsersInviteParams): Promise<PatchUsersInviteResult> {
  const {
    userId,
  } = params;

  const validUserParams = {
    userId,
    status: ['CREATED', 'INVITED', 'DEACTIVATED'] as UserStatus[],
  };

  const validUser = await repository.getUserByStatus(validUserParams);
  if (!validUser) throw new BadRequestError('Invalid user id or user status');

  const {
    invitationTokenExpirationDays,
    password: {
      randomBytesLength,
    },
  } = Config.authConfig();
  const {
    appBaseUrl,
  } = Config;

  // The raw token travels in the email link; only its hash is persisted.
  const inviteToken = randomAlphaNumeric(randomBytesLength);
  const inviteTokenHash = sha256Hex(inviteToken);

  const {
    user: invitedUser,
  } = await repository.inviteUser({
    userId,
    inviteTokenHash,
    inviteTokenExpiryDays: invitationTokenExpirationDays,
  });

  if (!invitedUser) throw new BadRequestError('Invalid user id or user status');

  const activationUrl = `${appBaseUrl}${postUsersActivateRoute}?token=${inviteToken}`;

  try {
    await sendInvitationEmail({
      toEmail: invitedUser.email,
      activationUrl,
    });
  }
  catch (err) {
    // The invitation is already persisted; a delivery failure must not fail the request.
    // Logged to Sentry for investigation or re-invite
    captureSentryException(err);

    console.error(err, `Invitation email delivery failed for ${invitedUser.email}`);
  }

  return {
    user_id: invitedUser.user_id,
    status: invitedUser.status,
  };
}

interface PostUsersActivateParams {
  token: string;
  password: string;
}

async function postUsersActivate(repository: UsersRepository, params: PostUsersActivateParams): Promise<void> {
  const {
    token,
    password,
  } = params;

  const inviteTokenHash = sha256Hex(token);
  const passwordHash = await bcryptHash(password);

  // Activation is a single atomic statement — it matches the user by token hash,
  // expiry and status, so no row returned means an invalid, expired or used token.
  const {
    user: activatedUser,
  } = await repository.activateUser({
    inviteTokenHash,
    passwordHash,
  });

  if (!activatedUser) throw new BadRequestError('Invalid or expired invitation');
}

interface PatchUsersDeactivateParams {
  userId: string;
}

interface PatchUsersDeactivateResult {
  user_id: string;
  status: UserStatus;
}

async function patchUsersDeactivate(repository: UsersRepository, params: PatchUsersDeactivateParams): Promise<PatchUsersDeactivateResult> {
  const {
    userId,
  } = params;

  const validUserParams = {
    userId,
    status: ['ACTIVE'] as UserStatus[],
  };

  const validUser = await repository.getUserByStatus(validUserParams);
  if (!validUser) throw new BadRequestError('Invalid user id or user status');

  const {
    password: {
      randomBytesLength,
    },
  } = Config.authConfig();

  const newPasswordHash = await bcryptHash(randomAlphaNumeric(randomBytesLength));

  const {
    user: deactivatedUser,
  } = await repository.deactivateUser({
    userId,
    newPasswordHash,
  });

  if (!deactivatedUser) throw new BadRequestError('Invalid user id or user status');

  return deactivatedUser;
}

export {
  getUsers,
  postUsers,
  putUsers,
  patchUsersEmail,
  deleteUsers,
  patchUsersInvite,
  postUsersActivate,
  patchUsersDeactivate,
};
