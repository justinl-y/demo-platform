function customAjvFormatsPlugin(ajv: any) {
  const customFormats = {
    number: { validate: (x: any) => typeof x === 'number' || (/^-?\d*\.?\d+$/.test(x) && (x) >= Number.MIN_VALUE && Number(x) <= Number.MAX_VALUE) },
    integer: { validate: (x: any) => typeof x === 'number' || (/^-?\d+$/.test(x) && (x) >= Number.MIN_SAFE_INTEGER && Number(x) <= Number.MAX_SAFE_INTEGER) },
    // BigInt format: accepts numbers and strings that can be converted to BigInt within 64-bit signed integer range
    // This is useful for PG IDs that exceed JavaScript's safe integer limit
    bigint: { validate: (x: any) => typeof x === 'number' || (/^-?\d+$/.test(x) && BigInt(x) >= BigInt('-9223372036854775808') && BigInt(x) <= BigInt('9223372036854775807')) },
  };

  Object.entries(customFormats).forEach(([formatName, formatDefinition]) => {
    ajv.addFormat(formatName, formatDefinition);
  });

  return ajv;
}

export default customAjvFormatsPlugin;
