import getInternalUsers from './get-internal-users/schema.ts';
import getInternalUsersRoles from './get-internal-users-roles/schema.ts';
import postInternalUsersRoles from './post-internal-users-roles/schema.ts';
import putInternalUsersRoles from './put-internal-users-roles/schema.ts';
import deleteInternalUsersRoles from './delete-internal-users-roles/schema.ts';
import postInternalUsers from './post-internal-users/schema.ts';
import putInternalUsers from './put-internal-users/schema.ts';
import patchInternalUsersEmail from './patch-internal-users-email/schema.ts';
import deleteInternalUsers from './delete-internal-users/schema.ts';
import postInternalUsersActivate from './post-internal-user-activate/schema.ts';
import patchInternalUsersInvite from './patch-internal-users-invite/schema.ts';
import deleteInternalUsersInvite from './delete-internal-users-invite/schema.ts';
import patchInternalUsersDeactivate from './patch-internal-users-deactivate/schema.ts';

const schema = {
  getInternalUsers,
  getInternalUsersRoles,
  postInternalUsersRoles,
  putInternalUsersRoles,
  deleteInternalUsersRoles,
  postInternalUsers,
  putInternalUsers,
  patchInternalUsersEmail,
  deleteInternalUsers,
  postInternalUsersActivate,
  patchInternalUsersInvite,
  deleteInternalUsersInvite,
  patchInternalUsersDeactivate,
};

export default schema;
