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
    // BigInt format: accepts numbers and strings that can be converted to BigInt within 64-bit signed integer range
    // This is useful for PG IDs that exceed JavaScript's safe integer limit
    bigint: {
      validate: (x: string | number) => {
        const n = typeof x === 'number' ? x : Number(x);

        if (!Number.isFinite(n) || !Number.isInteger(n)) return false;

        const b = BigInt(Math.trunc(n));

        return b >= BigInt('-9223372036854775808') && b <= BigInt('9223372036854775807');
      },
    },
  };

  Object.entries(customFormats).forEach(([formatName, formatDefinition]) => {
    instance.addFormat(formatName, formatDefinition);
  });
}

export default customAjvFormatsPlugin;
