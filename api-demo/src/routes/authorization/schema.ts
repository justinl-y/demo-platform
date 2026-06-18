import getPermissions from './get-permissions/schema.ts';
import postPermissions from './post-permissions/schema.ts';
import putPermissions from './put-permissions/schema.ts';
import deletePermissions from './delete-permissions/schema.ts';
import getRoles from './get-roles/schema.ts';
import postRoles from './post-roles/schema.ts';
import putRoles from './put-roles/schema.ts';
import deleteRoles from './delete-roles/schema.ts';
import getRolePermissions from './get-roles-permissions/schema.ts';
import postRolePermissions from './post-roles-permissions/schema.ts';
import putRolePermissions from './put-roles-permissions/schema.ts';
import deleteRolePermissions from './delete-roles-permissions/schema.ts';

const schema = {
  getPermissions,
  postPermissions,
  putPermissions,
  deletePermissions,
  getRoles,
  postRoles,
  putRoles,
  deleteRoles,
  getRolePermissions,
  postRolePermissions,
  putRolePermissions,
  deleteRolePermissions,
};

export default schema;
