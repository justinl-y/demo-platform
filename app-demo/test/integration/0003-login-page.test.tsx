import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';

import { API_BASE_URL } from '../../src/lib/env.ts';
import { server } from '../mocks/server.ts';
import { renderApp } from '../lib/render.tsx';

describe('LoginPage', () => {
  describe('Failure', () => {
    test('shows validation errors when submitting empty', async () => {
      const user = userEvent.setup();
      renderApp('/login');

      await user.click(await screen.findByRole('button', { name: /sign in/i }));

      expect(await screen.findByText('Email is required')).toBeInTheDocument();
      expect(await screen.findByText('Password is required')).toBeInTheDocument();
    });

    test('rejects a malformed email and does not submit', async () => {
      const user = userEvent.setup();
      renderApp('/login');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'not-an-email');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // The `type: 'email'` rule blocks submission — the form stays put and never reaches /home.
      expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    test('failed login shows an error alert and stays on /login', async () => {
      // 401 is an undocumented error path (route schemas only define success), so use plain MSW.
      server.use(
        http.post(`${API_BASE_URL}/login`, () =>
          HttpResponse.json({ message: 'Authentication failed' }, { status: 401 })),
      );

      const user = userEvent.setup();
      renderApp('/login');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'user@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(await screen.findByText('Login failed')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('surfaces the error alert on a non-401 server failure', async () => {
      // The alert is driven by login.isError, so any rejection (not just 401) must surface it —
      // a 500/outage shouldn't hang the form or fail silently.
      server.use(
        http.post(`${API_BASE_URL}/login`, () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })),
      );

      const user = userEvent.setup();
      renderApp('/login');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'user@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(await screen.findByText('Login failed')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('unauthenticated visit to /home redirects to /login', async () => {
      renderApp('/home');

      // No logged-in hint → guard sends the user to the login form without calling the API.
      expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Branding', () => {
    test('the title shows the product name over the environment label', async () => {
      renderApp('/login');

      // Vitest runs in `test` mode, so the env label resolves to "(Test)" on its own line under the
      // product name (production would show just "Demo Platform" with no second line).
      const heading = await screen.findByRole('heading', { name: /Demo Platform/ });
      expect(heading).toHaveTextContent('Demo Platform');
      expect(heading).toHaveTextContent('(Test)');
    });

    test('the build footer shows the environment name in the dev servers', async () => {
      renderApp('/login');

      // Vitest runs in the (non-deployed) `test` env, so the footer shows the env name rather than a
      // commit id. Deployed builds (stage/prod) show the commit id instead.
      expect(await screen.findByText('Build: Test')).toBeInTheDocument();
    });
  });

  describe('Success', () => {
    test('successful login navigates to /home and shows the user + permissions', async () => {
      const user = userEvent.setup();
      renderApp('/login');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'user@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // /home guard resolves via the mocked /me, then HomePage renders the user + permission tags.
      expect(await screen.findByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('INTERNAL_USERS_READ')).toBeInTheDocument();
    });

    test('recovers after a failed attempt is corrected', async () => {
      // First attempt fails with a 401 and shows the alert.
      server.use(
        http.post(`${API_BASE_URL}/login`, () =>
          HttpResponse.json({ message: 'Authentication failed' }, { status: 401 })),
      );

      const user = userEvent.setup();
      renderApp('/login');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'user@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(await screen.findByText('Login failed')).toBeInTheDocument();

      // Drop the 401 override so the default typed /login mock (200) takes over, then resubmit with
      // corrected credentials — the retry should log in and leave the error state behind.
      server.resetHandlers();

      await user.clear(screen.getByPlaceholderText('Password'));
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(await screen.findByText('Test User')).toBeInTheDocument();
      expect(screen.queryByText('Login failed')).not.toBeInTheDocument();
    });
  });
});
