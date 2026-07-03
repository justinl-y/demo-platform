import { BadRequestError } from 'http-errors-enhanced';

import { paginationOffset, buildPaginatedResult, randomAlphaNumeric, sha256Hex } from '#utils/functions';
import { bcryptHash } from '#lib/authentication';
import { sendEmail } from '#lib/mailer';
import { captureSentryException } from '#lib/sentry-instrument';
import { Config } from '#config/index';

import type { InternalUsersRepository } from '#repositories/internal-users/internal-users.repository';
import type { PaginatedResult, UserStatus, SortOrder } from '../../types/general.ts';

interface FetchInternalUsersParams {
  page: number;
  perPage: number;
  search: string | null;
  status: UserStatus[] | null;
  sort: string;
  order: SortOrder;
}

interface UserItem {
  user_id: string;
  email: string;
  full_name: string;
  known_as: string | null;
  status: UserStatus;
}

async function fetchInternalUsers(repository: InternalUsersRepository, params: FetchInternalUsersParams): Promise<PaginatedResult<UserItem>> {
  const {
    page,
    perPage,
    search,
    status,
    sort,
    order,
  } = params;

  const offset = paginationOffset(page, perPage);

  const getUsersParams = {
    search,
    status,
    sort,
    order,
    limit: perPage,
    offset,
  };

  const result = await repository.getUsers(getUsersParams);

  return buildPaginatedResult<UserItem>(result, {
    page,
    perPage,
    key: 'users',
  });
}

interface CreateUserParams {
  email: string;
  fullName: string;
  knownAs?: string | null;
}

interface CreateUserResult {
  user_id: string;
  email: string;
  full_name: string;
  known_as: string | null;
  status: UserStatus;
}

async function createUser(repository: InternalUsersRepository, params: CreateUserParams): Promise<CreateUserResult> {
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

interface EditUserParams {
  userId: string;
  fullName: string;
  knownAs?: string | null;
}

interface EditUserResult {
  user_id: string;
  full_name: string;
  known_as: string | null;
}

async function editUser(repository: InternalUsersRepository, params: EditUserParams): Promise<EditUserResult> {
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

interface EditUserEmailParams {
  userId: string;
  newEmail: string;
}

interface EditUserEmailResult {
  user_id: string;
  email: string;
}

async function editUserEmail(repository: InternalUsersRepository, params: EditUserEmailParams): Promise<EditUserEmailResult> {
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

interface DeleteUserParams {
  userId: string;
}

interface DeleteUserResult {
  user_id: string;
}

async function deleteUser(repository: InternalUsersRepository, params: DeleteUserParams): Promise<DeleteUserResult> {
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

interface SentInvitationEmailParams {
  userId: string;
  email: string;
  actionUrl: string;
  inviteTokenHash: string;
}

// Sends the invitation email and, on success, stamps the email-sent timestamp.
// Owns its error handling — the invite is already persisted, so a delivery failure
// must not fail the request — and returns whether the email was sent so the caller
// can report it. Never throws.
async function sendInvitationEmail(repository: InternalUsersRepository, params: SentInvitationEmailParams): Promise<boolean> {
  const {
    userId,
    email,
    actionUrl,
    inviteTokenHash,
  } = params;

  try {
    await sendEmail({
      toEmail: email,
      actionUrl,
      emailType: 'INVITATION',
    });

    const {
      user: stamped,
    } = await repository.updateUserInviteEmailSent({
      userId,
      inviteTokenHash,
    });

    return Boolean(stamped);
  }
  catch (err) {
    // Logged to Sentry for investigation or re-invite
    captureSentryException(err);

    console.error(err, `Invitation email delivery failed for ${email}`);

    return false;
  }
}

interface InviteUserParams {
  userId: string;
}

interface InviteUserResult {
  user_id: string;
  status: UserStatus;
  invite_email_sent: boolean;
}

async function inviteUser(repository: InternalUsersRepository, params: InviteUserParams): Promise<InviteUserResult> {
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
      tokenLength,
    },
  } = Config.authConfig();
  const {
    appBaseUrl,
  } = Config;

  // The raw token travels in the email link; only its hash is persisted.
  const inviteToken = randomAlphaNumeric(tokenLength);
  const inviteTokenHash = sha256Hex(inviteToken);

  const {
    user: invitedUser,
  } = await repository.inviteUser({
    userId,
    inviteTokenHash,
    inviteTokenExpiryDays: invitationTokenExpirationDays,
  });
  if (!invitedUser) throw new BadRequestError('Invalid user id or user status');

  const actionUrl = `${appBaseUrl}/account-activate?token=${inviteToken}`;

  const emailSent = await sendInvitationEmail(repository, {
    userId: invitedUser.user_id,
    email: invitedUser.email,
    actionUrl,
    inviteTokenHash,
  });

  return {
    user_id: invitedUser.user_id,
    status: invitedUser.status,
    invite_email_sent: emailSent,
  };
}

interface ActivateUserParams {
  token: string;
  password: string;
}

async function activateUser(repository: InternalUsersRepository, params: ActivateUserParams): Promise<void> {
  const {
    token,
    password,
  } = params;

  const inviteTokenHash = sha256Hex(token);

  // Cheap pre-check first so bcrypt is not paid for arbitrary or expired tokens
  // on this unauthenticated endpoint.
  const pendingInvitation = await repository.getPendingInvitation({ inviteTokenHash });
  if (!pendingInvitation) throw new BadRequestError('Invalid or expired invitation');

  const passwordHash = await bcryptHash(password);

  // The atomic UPDATE re-checks the same token/expiry/status predicates so a
  // concurrent revoke or activate between the pre-check and here is still caught.
  const {
    user: activatedUser,
  } = await repository.activateUser({
    inviteTokenHash,
    passwordHash,
  });

  if (!activatedUser) throw new BadRequestError('Invalid or expired invitation');
}

interface CancelUserInviteParams {
  userId: string;
}

interface CancelUserInviteResult {
  user_id: string;
  status: UserStatus;
}

async function cancelUserInvite(repository: InternalUsersRepository, params: CancelUserInviteParams): Promise<CancelUserInviteResult> {
  const {
    userId,
  } = params;

  const {
    user: cancelledUser,
  } = await repository.cancelUserInvite({ userId });

  if (!cancelledUser) throw new BadRequestError('Invalid user id or user status');

  return cancelledUser;
}

interface DeactivateUserParams {
  userId: string;
}

interface DeactivateUserResult {
  user_id: string;
  status: UserStatus;
}

async function deactivateUser(repository: InternalUsersRepository, params: DeactivateUserParams): Promise<DeactivateUserResult> {
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
      tokenLength,
    },
  } = Config.authConfig();

  const newPasswordHash = await bcryptHash(randomAlphaNumeric(tokenLength));

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
  fetchInternalUsers,
  createUser,
  editUser,
  editUserEmail,
  deleteUser,
  inviteUser,
  cancelUserInvite,
  activateUser,
  deactivateUser,
};
