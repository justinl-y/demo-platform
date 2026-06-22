import getUsers from './get-users/schema.ts';
import getUsersRoles from './get-users-roles/schema.ts';
import postUsersRoles from './post-users-roles/schema.ts';
import putUsersRoles from './put-users-roles/schema.ts';
import deleteUsersRoles from './delete-users-roles/schema.ts';
import postUsers from './post-users/schema.ts';
import putUsers from './put-users/schema.ts';
import patchUsersEmail from './patch-users-email/schema.ts';
import deleteUsers from './delete-users/schema.ts';
import postUsersActivate from './post-user-activate/schema.ts';
import patchUsersInvite from './patch-users-invite/schema.ts';
import deleteUsersInvite from './delete-users-invite/schema.ts';
import patchUsersDeactivate from './patch-users-deactivate/schema.ts';

const schema = {
  getUsers,
  getUsersRoles,
  postUsersRoles,
  putUsersRoles,
  deleteUsersRoles,
  postUsers,
  putUsers,
  patchUsersEmail,
  deleteUsers,
  postUsersActivate,
  patchUsersInvite,
  deleteUsersInvite,
  patchUsersDeactivate,
};

export default schema;
