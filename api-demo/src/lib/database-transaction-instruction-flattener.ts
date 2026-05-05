import _ from 'lodash';

import {
  getSqlBlob,
} from './database-sql-loader.ts';

import type {
  SqlParams,
} from '../types/database.ts';

interface FlattenedInstruction {
  file: string;
  params: SqlParams;
  query: string;
}

function forgeVALUES(numParams: number) {
  // Generates VALUES (...), (...) templates for underscore SQL interpolation.
  const func = (...names: string[]): string => {
    const results: string[] = [];

    for (let i = 0; i <= numParams - 1; i += 1) {
      const dollared = names.map((n) => `$${n}_${i}`);

      results.push(`(${dollared.join(',')})`);
    }

    return `VALUES ${results.join(',')}`;
  };

  return func;
}

async function flattenInstruction(files: string[], paramsGroup: SqlParams[]): Promise<FlattenedInstruction[]> {
  // both files and paramGroup are arrays, guaranteed by the caller!
  const results: FlattenedInstruction[] = [];

  for (const file of files) {
    const blob = await getSqlBlob(file);

    if (/<%= VALUES\(.*\) ?%>/.test(blob)) {
      // blob contains a underscore call to VALUES function. This implies we're doing a bulk INSERT or UPDATE.
      const VALUES = forgeVALUES(paramsGroup.length);
      const injectVars = Object.assign([...paramsGroup], { VALUES }) as SqlParams[] & { VALUES: (...names: string[]) => string };

      // Namespace each param object by index so placeholder names are unique across rows.
      const reducedParams = paramsGroup.reduce<SqlParams>((masterObject, params, idx) => {
        const idified = _.fromPairs(_.map(params, (param, key) => [`${key}_${idx}`, param]));

        return Object.assign(masterObject, idified);
      }, {});

      results.push({
        file,
        params: reducedParams,
        query: _.template(blob)(injectVars),
      });
    }
    else {
      for (const params of paramsGroup) {
        results.push({
          file,
          params,
          query: blob,
        });
      }
    }
  }

  return results;
}

export type {
  FlattenedInstruction,
};

export {
  flattenInstruction,
};
