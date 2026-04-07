export type JwtTokenType = 'access' | 'refresh';

export interface JwtUser {
  id: number | string;
  email: string;
  type: JwtTokenType;
  [key: string]: unknown;
}
