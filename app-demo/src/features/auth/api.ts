import { api } from '../../lib/api-client.ts';

import type { Login, InternalUser } from '#shared/types';

// POST /login — sets the auth cookies and returns the authenticated user.
export const login = async (body: Login): Promise<InternalUser> => {
  const {
    data,
  } = await api.post<InternalUser>('/login', body);

  return data;
};

// GET /me — returns the current user for a valid session; used to rehydrate on app load
// (the HttpOnly cookies can't be read by JS, so the server is the source of truth).
export const fetchMe = async (): Promise<InternalUser> => {
  const {
    data,
  } = await api.get<InternalUser>('/me');

  return data;
};

// POST /logout — clears the auth cookies server-side.
export const logout = async (): Promise<void> => {
  await api.post('/logout');
};
