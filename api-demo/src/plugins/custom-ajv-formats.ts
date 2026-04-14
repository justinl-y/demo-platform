import type { FormatDefinition } from 'ajv';

type AjvInstance = { addFormat: (name: string, format: FormatDefinition<string | number>) => unknown };

function customAjvFormatsPlugin(ajv: unknown): void {
  const instance = ajv as AjvInstance;

  const customFormats: Record<string, FormatDefinition<string | number>> = {
    number: { validate: (x: string | number) => typeof x === 'number' || (/^-?\d*\.?\d+$/.test(String(x)) && Number(x) >= Number.MIN_VALUE && Number(x) <= Number.MAX_VALUE) },
    integer: { validate: (x: string | number) => typeof x === 'number' || (/^-?\d+$/.test(String(x)) && Number(x) >= Number.MIN_SAFE_INTEGER && Number(x) <= Number.MAX_SAFE_INTEGER) },
    // BigInt format: accepts numbers and strings that can be converted to BigInt within 64-bit signed integer range
    // This is useful for PG IDs that exceed JavaScript's safe integer limit
    bigint: { validate: (x: string | number) => typeof x === 'number' || (/^-?\d+$/.test(String(x)) && BigInt(x) >= BigInt('-9223372036854775808') && BigInt(x) <= BigInt('9223372036854775807')) },
  };

  Object.entries(customFormats).forEach(([formatName, formatDefinition]) => {
    instance.addFormat(formatName, formatDefinition);
  });
}

export default customAjvFormatsPlugin;
