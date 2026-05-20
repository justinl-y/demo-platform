import getUsers from './get-users/schema.ts';
import postUsers from './post-users/schema.ts';
import putUsers from './put-users/schema.ts';
import patchUsersEmail from './patch-users-email/schema.ts';
import deleteUsers from './delete-users/schema.ts';
import patchUsersDeactivate from './patch-users-deactivate/schema.ts';

const schema = {
  getUsers,
  postUsers,
  putUsers,
  patchUsersEmail,
  patchUsersDeactivate,
  deleteUsers,
};

export default schema;
