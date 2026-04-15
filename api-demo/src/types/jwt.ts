export type TokenTypes = 'access' | 'refresh';

export interface JwtUser {
  id: string;
  type: TokenTypes;
  email: string;
  [key: string]: unknown;
}
