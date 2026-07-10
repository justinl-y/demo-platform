import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';

import { API_BASE_URL } from '../../src/lib/env.ts';
import { server } from '../mocks/server.ts';
import { renderApp } from '../lib/render.tsx';

describe('PasswordForgotPage', () => {
  describe('Failure', () => {
    test('shows a validation error when submitting empty', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp('/password-forgot');

      await user.click(await screen.findByRole('button', { name: /send reset link/i }));

      expect(await screen.findByText('Email is required')).toBeInTheDocument();
    });

    test('rejects a malformed email and does not submit', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp('/password-forgot');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'not-an-email');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
      // Still on the form — the generic confirmation never rendered.
      expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
    });

    test('surfaces an error alert on a server failure', async () => {
      server.use(
        http.post(`${API_BASE_URL}/password/forgot`, () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })),
      );

      const user = userEvent.setup({ delay: null });
      renderApp('/password-forgot');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'user@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
      // The form stays available to retry; no false confirmation.
      expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
    });
  });

  describe('Success', () => {
    test('shows the generic confirmation and hides the form', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp('/password-forgot');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'user@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      // Enumeration-resistant: a plain "if an account exists" message, and the email field is gone.
      expect(await screen.findByText('Check your email')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('you@example.com')).not.toBeInTheDocument();
    });

    test('an unknown address gets the same confirmation (no account-existence signal)', async () => {
      // The API returns 204 whether or not the address maps to an account; the UI must not differ.
      const user = userEvent.setup({ delay: null });
      renderApp('/password-forgot');

      await user.type(await screen.findByPlaceholderText('you@example.com'), 'nobody@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      expect(await screen.findByText('Check your email')).toBeInTheDocument();
    });
  });
});
