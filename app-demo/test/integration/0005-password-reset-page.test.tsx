import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';

import { API_BASE_URL } from '../../src/lib/env.ts';
import { server } from '../mocks/server.ts';
import { renderApp } from '../lib/render.tsx';

// The route requires a token of the API's exact length (30); a wrong-length token is dropped.
const TOKEN = 'a'.repeat(30);
const RESET_PATH = `/password-reset?token=${TOKEN}`;

// Passes every composition rule AND scores >= 3 on zxcvbn.
const STRONG_PASSWORD = 'Purple9$Monkey-Dishwasher';
// Passes every composition rule but is guessable (zxcvbn score < 3).
const GUESSABLE_PASSWORD = 'Password1!';

// zxcvbn is lazy-loaded and scoring runs off a debounce, so score-dependent assertions get headroom.
const SCORE_TIMEOUT = { timeout: 8000 };

describe('PasswordResetPage', () => {
  describe('Invalid link', () => {
    test('a missing token renders the invalid-link state instead of the form', async () => {
      renderApp('/password-reset');

      expect(await screen.findByText('Invalid reset link')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('New password')).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: /request a new link/i })).toBeInTheDocument();
    });

    test('a wrong-length token renders the invalid-link state without hitting the validate endpoint', async () => {
      // A malformed-length token can only 400 on validate; dropping it in validateSearch renders the
      // invalid-link state rather than bouncing to /login as if it were a used/expired link.
      let validateCalled = false;

      server.use(
        http.post(`${API_BASE_URL}/password/reset/validate`, () => {
          validateCalled = true;

          return HttpResponse.json({ message: 'Invalid or expired password reset token' }, { status: 400 });
        }),
      );

      renderApp('/password-reset?token=tooshort');

      expect(await screen.findByText('Invalid reset link')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('New password')).not.toBeInTheDocument();
      expect(validateCalled).toBe(false);
    });

    test('a used or expired token redirects to /login instead of rendering the form', async () => {
      // The route's beforeLoad validates the token; a 400 (consumed after a reset, or expired) means
      // the link can never succeed, so the user is sent to /login rather than shown a dead form.
      server.use(
        http.post(`${API_BASE_URL}/password/reset/validate`, () =>
          HttpResponse.json({ message: 'Invalid or expired password reset token' }, { status: 400 })),
      );

      renderApp(RESET_PATH);

      expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('New password')).not.toBeInTheDocument();
    });
  });

  describe('Composition checklist', () => {
    test('shows all four rules and ticks the ones the input satisfies', async () => {
      const user = userEvent.setup({ delay: null });
      const {
        container,
      } = renderApp(RESET_PATH);

      // 'password12' — length + number met; uppercase + special not met.
      await user.type(await screen.findByPlaceholderText('New password'), 'password12');

      expect(screen.getByText('At least 10 characters')).toBeInTheDocument();
      expect(screen.getByText('One number')).toBeInTheDocument();
      expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('One special character')).toBeInTheDocument();

      // Two rules satisfied (length, number) → two check-circle icons.
      expect(container.querySelectorAll('[aria-label="check-circle"]')).toHaveLength(2);
      expect(container.querySelectorAll('[aria-label="close-circle"]')).toHaveLength(2);
      // No strength meter yet — rules aren't all met.
      expect(screen.queryByText(/^Strength:/)).not.toBeInTheDocument();
    });

    test('shows the strength meter once every rule passes', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp(RESET_PATH);

      await user.type(await screen.findByPlaceholderText('New password'), STRONG_PASSWORD);

      expect(await screen.findByText(/^Strength:/, {}, SCORE_TIMEOUT)).toBeInTheDocument();
    });
  });

  describe('Submit blocked', () => {
    test('empty submit shows required errors', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp(RESET_PATH);

      await user.click(await screen.findByRole('button', { name: /reset password/i }));

      expect(await screen.findByText('Password is required')).toBeInTheDocument();
      expect(await screen.findByText('Please confirm your password')).toBeInTheDocument();
    });

    test('a password failing the composition rules is blocked', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp(RESET_PATH);

      // meets length but no uppercase/special → rules unmet.
      await user.type(await screen.findByPlaceholderText('New password'), 'alllowercase123');
      await user.type(screen.getByPlaceholderText('Confirm password'), 'alllowercase123');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(await screen.findByText(/does not meet all the requirements/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    test('a rule-satisfying but guessable password is blocked by the score gate', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp(RESET_PATH);

      await user.type(await screen.findByPlaceholderText('New password'), GUESSABLE_PASSWORD);
      await user.type(screen.getByPlaceholderText('Confirm password'), GUESSABLE_PASSWORD);
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(await screen.findByText(/too easy to guess/i, {}, SCORE_TIMEOUT)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    test('rejects when confirmation does not match', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp(RESET_PATH);

      await user.type(await screen.findByPlaceholderText('New password'), STRONG_PASSWORD);
      await user.type(screen.getByPlaceholderText('Confirm password'), `${STRONG_PASSWORD}-different`);
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  describe('Failure', () => {
    test('surfaces an error alert on a 400 (invalid/expired token)', async () => {
      server.use(
        http.post(`${API_BASE_URL}/password/reset`, () =>
          HttpResponse.json({ message: 'Invalid or expired password reset token' }, { status: 400 })),
      );

      const user = userEvent.setup({ delay: null });
      renderApp(RESET_PATH);

      await user.type(await screen.findByPlaceholderText('New password'), STRONG_PASSWORD);
      await user.type(screen.getByPlaceholderText('Confirm password'), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(await screen.findByText('Reset failed', {}, SCORE_TIMEOUT)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  describe('Success', () => {
    test('a strong password passes both gates and navigates to /login', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp(RESET_PATH);

      await user.type(await screen.findByPlaceholderText('New password'), STRONG_PASSWORD);
      await user.type(screen.getByPlaceholderText('Confirm password'), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      // The baseline mock returns 204; the hook then routes to /login.
      expect(await screen.findByRole('button', { name: /sign in/i }, SCORE_TIMEOUT)).toBeInTheDocument();
    });
  });
});
