import getPermissions from './get-permissions/schema.ts';
import postPermissions from './post-permissions/schema.ts';
import putPermissions from './put-permissions/schema.ts';
import deletePermissions from './delete-permissions/schema.ts';

const schema = {
  getPermissions,
  postPermissions,
  putPermissions,
  deletePermissions,
};

export default schema;
