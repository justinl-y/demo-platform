import getUsers from './get-users/schema.ts';
import postUsers from './post-users/schema.ts';
import deleteUsers from './delete-users/schema.ts';
import putUsers from './put-users/schema.ts';
import patchUsersDeactivate from './patch-users-deactivate/schema.ts';

const schema = {
  getUsers,
  postUsers,
  deleteUsers,
  putUsers,
  patchUsersDeactivate,
};

export default schema;
