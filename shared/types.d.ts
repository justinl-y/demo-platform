export interface InternalUser {
  user_id: string;
  email: string;
  full_name: string;
  known_as: string | null;
  permissions?: string[];
}

export type Login = {
  email: string;
  password: string;
}
