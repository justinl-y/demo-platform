import { useEffect, useState } from 'react';

import { allRulesMet, passwordRules, scorePassword } from '../../lib/password-policy.ts';

export interface RuleState {
  key: string;
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  rules: RuleState[];
  // null until the rules pass and the first async score resolves; drives whether the meter shows.
  score: number | null;
}

// Live strength state for a password field. Composition rules are evaluated synchronously on every
// keystroke; the zxcvbn score is computed only once all rules pass (mirroring the API's ordered
// gates), debounced, and off a lazily-loaded chunk.
export const usePasswordStrength = (password: string): PasswordStrength => {
  const rules = passwordRules.map((rule) => ({
    key: rule.key,
    label: rule.label,
    met: rule.test(password),
  }));

  // Stored with the exact password it was computed for, so a score left over from a previous value
  // is never shown for the current one — and the "rules not yet met" / "stale" cases both derive to
  // null below without a synchronous setState inside the effect.
  const [scored, setScored] = useState<{ password: string;
    score: number; } | null>(null);

  useEffect(() => {
    if (!allRulesMet(password)) return undefined;

    let cancelled = false;
    const timer = setTimeout(() => {
      scorePassword(password)
        .then((resolved) => {
          if (!cancelled) {
            setScored({
              password,
              score: resolved,
            });
          }
        })
        .catch(() => {
          // Scoring unavailable (e.g. the zxcvbn chunk failed to load) — leave the meter hidden; the
          // API still enforces the score on submit. Swallowed so it isn't an unhandled rejection.
        });
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [password]);

  const score = allRulesMet(password) && scored?.password === password ? scored.score : null;

  return {
    rules,
    score,
  };
};
