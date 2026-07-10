import { api } from '../../lib/api-client.ts';

import type { Paginated, Role, RoleInput } from '#shared/types';

// The API paginates, sorts, and filters roles server-side, so the whole catalog is navigable (not
// just a fetched slice). `order` toggles the name sort; omitted, the API's default (name ASC) applies.
export interface RolesQuery {
  page: number;
  perPage: number;
  search?: string;
  order?: 'ASC' | 'DESC';
}

// GET /roles — one page of the roles catalog with its pagination envelope. `search` filters by role
// name/id; `sort` is always `name` (the only sortable field), with `order` giving the direction.
export const fetchRoles = async ({
  page,
  perPage,
  search,
  order,
}: RolesQuery): Promise<Paginated<Role>> => {
  const {
    data,
  } = await api.get<Paginated<Role>>('/roles', {
    params: {
      page,
      per_page: perPage,
      ...(search ? { search } : {}),
      // `sort` is always `name` (the only sortable field); `order` gives the direction.
      ...(order
        ? {
            sort: 'name',
            order,
          }
        : {}),
    },
  });

  return data;
};

// POST /roles — creates a role and returns the new row. Requires the INTERNAL_ROLES_WRITE permission
// (a 403 otherwise); the name must be unique (a 409 otherwise).
export const createRole = async (body: RoleInput): Promise<Role> => {
  const {
    data,
  } = await api.post<Role>('/roles', body);

  return data;
};

// PUT /roles/:role_id — updates a role's name/description and returns the updated row. Requires the
// INTERNAL_ROLES_WRITE permission (a 403 otherwise).
export const updateRole = async (roleId: string, body: RoleInput): Promise<Role> => {
  const {
    data,
  } = await api.put<Role>(`/roles/${roleId}`, body);

  return data;
};

// DELETE /roles/:role_id — removes a role. Requires the INTERNAL_ROLES_WRITE permission (a 403
// otherwise). Resolves 204 with no body on success.
export const deleteRole = async (roleId: string): Promise<void> => {
  await api.delete(`/roles/${roleId}`);
};
