import type { ZxcvbnFactory } from '@zxcvbn-ts/core';

// Mirror of the API's password policy (api-demo config/auth.ts + lib/password-policy.ts). The API is
// the source of truth; these client-side checks drive the live checklist + strength meter and block
// submit early, but the server re-enforces the identical rules on POST /password/reset.
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 40;
export const PASSWORD_MIN_SCORE = 3;

export interface PasswordRule {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

// Composition gate — deterministic, kept in step with the API's failedCompositionRules().
export const passwordRules: PasswordRule[] = [
  {
    key: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: 'number',
    label: 'One number',
    test: (password) => /[0-9]/.test(password),
  },
  {
    key: 'uppercase',
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    key: 'special',
    label: 'One special character',
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export const allRulesMet = (password: string): boolean =>
  passwordRules.every((rule) => rule.test(password));

// Lazily load zxcvbn + its dictionaries so the (few-hundred-KB) analysis bundle lands in its own
// chunk, off the login/initial path — it's only fetched the first time someone types on the reset
// page. The factory is built once and memoized for the session.
let factoryPromise: Promise<ZxcvbnFactory> | null = null;

const getFactory = async (): Promise<ZxcvbnFactory> => {
  factoryPromise ??= (async () => {
    const [core, common, en] = await Promise.all([
      import('@zxcvbn-ts/core'),
      import('@zxcvbn-ts/language-common'),
      import('@zxcvbn-ts/language-en'),
    ]);

    return new core.ZxcvbnFactory({
      dictionary: {
        ...common.dictionary,
        ...en.dictionary,
      },
      graphs: common.adjacencyGraphs,
      translations: en.translations,
    });
  })().catch((error: unknown) => {
    // Never cache a failed load (e.g. a stale code-split chunk 404ing after a deploy) — otherwise
    // `??=` keeps the rejected promise and every later call rejects for the rest of the session.
    // Clear the memo so the next call retries the import.
    factoryPromise = null;

    throw error;
  });

  return factoryPromise;
};

// zxcvbn guessability score, 0–4. Only meaningful once the composition rules pass (the API scores in
// the same order); callers gate on allRulesMet() before relying on it.
export const scorePassword = async (password: string): Promise<number> => {
  if (!password) return 0;

  const factory = await getFactory();

  return factory.check(password).score;
};
