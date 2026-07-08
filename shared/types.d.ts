export interface InternalUser {
  user_id: string;
  email: string;
  full_name: string;
  known_as: string | null;
  // Always present on the auth responses (/login, /me). Views that don't return it (e.g. the
  // internal-users list) omit it from their row type rather than relaxing it here.
  permissions: string[];
}

export type Login = {
  email: string;
  password: string;
}
