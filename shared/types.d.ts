export interface InternalUser {
  user_id: string;
  email: string;
  full_name: string;
  known_as: string | null;
  // Always present on the auth responses (/login, /me). Views that don't return it (e.g. the
  // internal-users list) omit it from their row type rather than relaxing it here.
  permissions: string[];
}

export interface Login {
  email: string;
  password: string;
}

// The `{ data, pagination }` envelope every GET list route returns (mirrors the API's
// paginationSchema / PaginatedResult<T>).
export interface Pagination {
  page: number;
  per_page: number;
  pages: number;
  count_page: number;
  count_total: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

// A row from GET /roles.
export interface Role {
  role_id: string;
  name: string;
  description: string;
}

// Editable fields of a role (PUT /roles/:role_id body).
export interface RoleInput {
  name: string;
  description: string;
}

export interface PasswordForgot {
  email: string;
}

export interface PasswordReset {
  password_reset_token: string;
  new_password: string;
}
