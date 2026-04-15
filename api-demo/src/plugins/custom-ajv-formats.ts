import type { FormatDefinition } from 'ajv';

type AjvInstance = { addFormat: (name: string, format: FormatDefinition<string | number>) => unknown };

function customAjvFormatsPlugin(ajv: unknown): void {
  const instance = ajv as AjvInstance;

  const customFormats: Record<string, FormatDefinition<string | number>> = {
    number: {
      validate: (x: string | number) => {
        const n = typeof x === 'number' ? x : Number(x);

        return Number.isFinite(n) && n >= -Number.MAX_VALUE && n <= Number.MAX_VALUE;
      },
    },
    integer: {
      validate: (x: string | number) => {
        const n = typeof x === 'number' ? x : Number(x);

        return Number.isFinite(n) && Number.isInteger(n) && n >= Number.MIN_SAFE_INTEGER && n <= Number.MAX_SAFE_INTEGER;
      },
    },
    // BigInt format: accepts numbers and strings within 64-bit signed integer range.
    // String inputs are parsed directly with BigInt() to preserve precision beyond MAX_SAFE_INTEGER,
    // which is exactly the case for Postgres int8/bigint IDs.
    // Number inputs are restricted to MAX_SAFE_INTEGER to avoid silent rounding.
    bigint: {
      validate: (x: string | number) => {
        const INT64_MIN = BigInt('-9223372036854775808');
        const INT64_MAX = BigInt('9223372036854775807');

        if (typeof x === 'number') {
          if (!Number.isFinite(x) || !Number.isInteger(x)) return false;
          if (x < Number.MIN_SAFE_INTEGER || x > Number.MAX_SAFE_INTEGER) return false;

          return BigInt(x) >= INT64_MIN && BigInt(x) <= INT64_MAX;
        }

        if (!/^-?\d+$/.test(x)) return false;

        try {
          const b = BigInt(x);

          return b >= INT64_MIN && b <= INT64_MAX;
        }
        catch {
          return false;
        }
      },
    },
  };

  Object.entries(customFormats).forEach(([formatName, formatDefinition]) => {
    instance.addFormat(formatName, formatDefinition);
  });
}

export default customAjvFormatsPlugin;
