import { BadRequestError } from 'http-errors-enhanced';
import * as zxcvbnCore from '@zxcvbn-ts/core';
import * as zxcvbnCommon from '@zxcvbn-ts/language-common';
import * as zxcvbnEn from '@zxcvbn-ts/language-en';

import { Config } from '#config/index';

// Namespace imports (not `import { zxcvbn }`) so this resolves identically under Node/tsx, where the
// package's CJS `main` ships the class API — not the ESM `zxcvbn`/`zxcvbnOptions` singletons. A single
// factory is built once at module load with the English + common dictionaries and reused per check.
const zxcvbnFactory = new zxcvbnCore.ZxcvbnFactory({
  dictionary: {
    ...zxcvbnCommon.dictionary,
    ...zxcvbnEn.dictionary,
  },
  graphs: zxcvbnCommon.adjacencyGraphs,
  translations: zxcvbnEn.translations,
});

type PasswordRule = 'length' | 'number' | 'uppercase' | 'special';

interface PasswordPolicy {
  minLength: number;
  minScore: number;
}

interface PasswordAssessment {
  ok: boolean;
  failedRules: PasswordRule[];
  score: number;
}

// Deterministic composition gate. Kept in step with the UI's live checklist (app-demo mirrors these
// exact rules) and with the schema length bound.
function failedCompositionRules(password: string, minLength: number): PasswordRule[] {
  const failed: PasswordRule[] = [];

  if (password.length < minLength) failed.push('length');
  if (!/[0-9]/.test(password)) failed.push('number');
  if (!/[A-Z]/.test(password)) failed.push('uppercase');
  if (!/[^A-Za-z0-9]/.test(password)) failed.push('special');

  return failed;
}

// Two ordered gates: composition rules first (cheap, deterministic), then the zxcvbn guessability
// score — only evaluated once the rules pass, so we never pay the pattern analysis on input we've
// already rejected, and a rule-satisfying-but-weak password (e.g. "Password1!") is still caught.
function assessPassword(password: string, {
  minLength, minScore,
}: PasswordPolicy): PasswordAssessment {
  const failedRules = failedCompositionRules(password, minLength);

  if (failedRules.length > 0) {
    return {
      ok: false,
      failedRules,
      score: 0,
    };
  }

  const {
    score,
  } = zxcvbnFactory.check(password);

  return {
    ok: score >= minScore,
    failedRules: [],
    score,
  };
}

// Server-side strength gate shared by every flow that sets a password (reset, activation): the API
// is the source of truth even though the UI enforces the same policy. Reads the configured bounds,
// assesses, and throws a 400 on failure — so the rule and the message live in one place. Call before
// the expensive bcrypt hash.
function assertPasswordMeetsPolicy(password: string): void {
  const {
    password: {
      passwordLengthMin,
      passwordMinScore,
    },
  } = Config.authConfig();

  const {
    ok,
  } = assessPassword(password, {
    minLength: passwordLengthMin,
    minScore: passwordMinScore,
  });

  if (!ok) throw new BadRequestError('Password does not meet the strength requirements');
}

export type { PasswordAssessment, PasswordRule };
export { assessPassword, assertPasswordMeetsPolicy };
