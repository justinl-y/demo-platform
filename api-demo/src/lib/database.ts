import fs from 'fs/promises';
import _ from 'lodash';
import {
  InternalServerError,
  ImaTeapotError,
} from 'http-errors-enhanced';

import { pgPatch } from './postgres-named.ts';
import { createLogger } from '#lib/logger';

const logger = createLogger();

import type {
  Pool,
  PoolClient,
} from 'pg';
import type {
  QueryRow,
  SqlParams,
  TransactionInstruction,
  QueryOutputFormat,
  QueryResult,
  TransactionResult,
} from '../types/database.ts';

type PatchedPgClient = Omit<PoolClient, 'query'> & {
  query: (queryText: string, values?: SqlParams) => Promise<{
    rowCount: number | null;
    rows: QueryRow[];
  }>;
};

type TransactionResults = Record<string, QueryRow[][]>;

interface FlattenedInstruction {
  file: string;
  params: SqlParams;
  query: string;
}

interface KnownError {
  code?: string;
  message?: string;
  name?: string;
  path?: string;
  sqlFileName?: string;
}

const wordsToSearch = ['INSERT', 'UPDATE', 'DELETE'];
const regexPattern = wordsToSearch.map((word) => `\\b${word}\\b`).join('|');
const dmlRegex = new RegExp(regexPattern, 'i');

async function getBlob(file: string): Promise<string> {
  const filePath = file.replace(/\.[^/.]+$/, '');
  const qualifiedFile = `${filePath}.sql`;

  const blob = await fs.readFile(qualifiedFile, 'utf-8');

  return blob;
}

async function pgConnect(this: Pool): Promise<PatchedPgClient> {
  const client = await this.connect();

  // Patch the client with pgPatch for a named-parameter SQL interface. This allows for variable interpolation into SQL files. See src/lib/postgres-named.ts for implementation details.
  pgPatch(client);

  return client as PatchedPgClient;
}

function getErrorDetails(err: unknown): Required<Pick<KnownError, 'message' | 'name'>> & KnownError {
  if (err instanceof Error) {
    return {
      ...err as KnownError,
      message: err.message,
      name: err.name,
    };
  }

  if (typeof err === 'object' && err !== null) {
    const knownError = err as KnownError;

    return {
      ...knownError,
      message: typeof knownError.message === 'string' ? knownError.message : String(err),
      name: typeof knownError.name === 'string' ? knownError.name : 'Error',
    };
  }

  return {
    message: String(err),
    name: 'Error',
  };
}

function errorsToHandle(err: unknown, code: string | undefined, file: string | undefined, message: string): never {
  let error;

  switch (code) {
    case 'ECONNREFUSED':
      error = new InternalServerError('Database connection was refused: Error in connection config or database unavailable');
      break;
    case 'ENOENT':
      error = new InternalServerError(`No such file or invalid path: '${file}'`);
      break;
    case 'ReferenceError':
      error = new InternalServerError(`Reference error in file '${file}.sql': A parameter is missing or invalid: '${message}'`);
      break;
    case '42601':
      error = new InternalServerError(`SQL syntax error in file '${file}.sql': '${message}'`);
      break;
    case '42P01':
      error = new InternalServerError(`SQL syntax error in file '${file}.sql': Misnamed table: '${message}'`);
      break;
    case '42703':
      error = new InternalServerError(`SQL syntax error in file '${file}.sql': Misnamed column: '${message}'`);
      break;
    case '42704':
      error = new InternalServerError(`SQL syntax error in file '${file}.sql': Type error: '${message}'`);
      break;
    case '22000':
      error = new InternalServerError(`PG error triggered by file '${file}.sql': Invalid or out-of-range input data: '${message}'`);
      break;
    case '23514':
      error = new InternalServerError(`PG error triggered by file '${file}.sql': Check constraint violation: '${message}'`);
      break;
    case '23P01':
      error = new InternalServerError(`PG error triggered by file '${file}.sql': Exclusion constraint violation: '${message}'`);
      break;
    case '23502':
      error = new InternalServerError(`PG error triggered by file '${file}.sql': Not-null constraint violation: '${message}'`);
      break;
    case '23505':
      {
        const matchedKey = message.match(/^Key (\(.*\))=(\(.*?\)) already exists.*$/);

        if (matchedKey) {
          const [, key, value] = matchedKey;

          error = new InternalServerError(`PG error triggered by file '${file}.sql': Insert operation unique key violation ${key} ${value}: '${message}'`);
          break;
        }
      }

      if (/violates unique constraint/.test(message)) {
        error = new InternalServerError(`PG error triggered by file '${file}.sql': Unique constraint violation: '${message}'`);
        break;
      }
      // otherwise fall through to default
    case '23503':
      {
        const missingKey = message.match(/^Key (\(.*\))=(\(.*?\)) is not present .*$/);

        if (missingKey) {
          const [, key, value] = missingKey;

          error = new InternalServerError(`PG error triggered by file '${file}.sql': Update operation foreign key violation ${key} ${value}: '${message}'`);
          break;
        }
      }

      {
        const referencedKey = message.match(/^Key (\(.*\))=(\(.*?\)) is still referenced .*$/);

        if (referencedKey) {
          const [, key, value] = referencedKey;

          error = new InternalServerError(`PG error triggered by file '${file}.sql: Delete operation foreign key violation: ${key} ${value}: '${message}'`);
          break;
        }
      }
      // otherwise fall through to default
    default:
      error = err;
  }

  throw error;
}

/*
   ██████╗ ██╗   ██╗███████╗██████╗ ██╗   ██╗
  ██╔═══██╗██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝
  ██║   ██║██║   ██║█████╗  ██████╔╝ ╚████╔╝
  ██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗  ╚██╔╝
  ╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║
   ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝
*/

async function query<
  TRow extends object = QueryRow,
  F extends QueryOutputFormat = 'collection',
>(
  this: Pool,
  file: string,
  params: SqlParams,
  outputFormat?: F,
): Promise<QueryResult<F, TRow>> {
  let pgClient: PatchedPgClient | undefined;

  try {
    const blob = await getBlob(file);

    if (dmlRegex.test(blob)) throw new InternalServerError('INSERT|UPDATE|DELETE queries should use db.transaction');

    pgClient = await pgConnect.call(this);

    const result = await pgClient.query(blob, params);
    const { rowCount } = result;

    if (rowCount === 0) return null as QueryResult<F, TRow>;
    if (outputFormat === 'one') return ((result.rows[0] as TRow | undefined) ?? null) as QueryResult<F, TRow>;

    return result.rows as QueryResult<F, TRow>;
  }
  catch (err) {
    let {
      code,
      message,
      name,
    } = getErrorDetails(err);

    if (!code) code = name;

    throw errorsToHandle(err, code, file, message);
  }
  finally {
    if (pgClient) pgClient.release();
  }
}

/*
████████╗██████╗  █████╗ ███╗   ██╗███████╗ █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗
╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
   ██║   ██████╔╝███████║██╔██╗ ██║███████╗███████║██║        ██║   ██║██║   ██║██╔██╗ ██║
   ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║
   ██║   ██║  ██║██║  ██║██║ ╚████║███████║██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

   For clarity of nomenclature, we define some terms:

   "instructions": the first argument handed to transaction().
   can be an array of objects, or for simplicity of the caller, a single object.

   "instruction": a single instruction is an object comprised of two arrays:
   files & params. each instruction takes the form:

   {
     files: [],
     params: []
   }

   again, the two keys can be simplified by the caller to string and object, respectively.
*/

function forgeVALUES(numParams: number) {
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
    const blob = await getBlob(file);

    if (/<%= VALUES\(.*\) ?%>/.test(blob)) {
      // blob contains a underscore call to VALUES function. This implies we're doing a bulk INSERT or UPDATE.
      const VALUES = forgeVALUES(paramsGroup.length);
      const injectVars = Object.assign([...paramsGroup], { VALUES }) as SqlParams[] & { VALUES: (...names: string[]) => string };

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

async function transaction(this: Pool, rawInstructions: TransactionInstruction | TransactionInstruction[], dryRun = false): Promise<TransactionResult> {
  let pgClient: PatchedPgClient | undefined;

  try {
    pgClient = await pgConnect.call(this);

    /*
      As per documentation: the instructions argument should be an array of objects. For simplicity however, instead
      of handing single object in an array, the caller may choose to just pass the object.
      If this is the case, for programming consistency & simplicity below... just force the instructions argument
      back into an array by wrapping it in [] if need be! I.e. We are standardizing so we can treat the remaining
      code as if no shorthands were used by the caller.
    */
    const instructions: TransactionInstruction[] = Array.isArray(rawInstructions)
      ? rawInstructions
      : [rawInstructions];

    const client = pgClient;

    // next
    const todos: FlattenedInstruction[] = [];

    for (const instruction of instructions) {
      let {
        files, params,
      } = instruction;

      // just as the instructions argument comment above ^... the files & params arrays may
      // also be shorted for Caller convenience. If so... standardize: wrap in array.
      files = Array.isArray(files) ? files : [files];
      params = Array.isArray(params) ? params : [params];

      /*
      output coming back (flatInstructions) will be...
        {
          file1: [{ query: 'SELECT * from face;', params: {p1, p2, pN} }, { query: 'SELECT 8 from face;', params: {x1, x2, xN} }],
          file2: [{ query: 'SELECT * from toes;', params: {y1, y2, yN} }],
        }
      */

      const flatInstructions = await flattenInstruction(files, params);

      todos.push(...flatInstructions);
    }

    // define (but don't run!) the rollback function to possibly be used later.
    const pgRollbackTransaction = async (error?: unknown): Promise<never> => {
      logger.warn('Rolling back transaction');

      await client.query('ROLLBACK');

      if (dryRun) {
        logger.info({ todos }, 'Dry run transaction rolled back');

        throw new ImaTeapotError('Dry run enabled. Transaction rolled back.');
      }

      throw error;
    };

    // do the transactions
    const pgTransaction = async (transactionStage: string): Promise<void> => {
      try {
        await client.query(transactionStage);
      }
      catch (error) {
        await pgRollbackTransaction(error);
      }
    };

    // begin the transaction
    await pgTransaction('BEGIN');

    // next
    const results: TransactionResults = {};

    // eachofseries will ensure the todos are done in order but also give us access to the file key.
    for (const todo of todos) {
      const {
        file: fileName, query, params,
      } = todo;

      if (!results[fileName]) results[fileName] = [];

      // keep in mind pgClient was augmented/patched by the local pgPatch implementation!
      try {
        const result = await pgClient.query(query, params);

        results[fileName].push(result.rows);
      }
      catch (err) {
        const errWithContext = Object.assign(
          err instanceof Error ? err : new Error(String(err)),
          { sqlFileName: fileName },
        );

        await pgRollbackTransaction(errWithContext);
      }
    }

    // next

    // If we make it into this function, no errors occurred & we can safely COMMIT, or display attempted queries if DryRun was enabled...
    const flatResults = _.mapValues(results, (r) => _.flatten(r));

    if (dryRun) await pgRollbackTransaction();
    else await pgTransaction('COMMIT');

    return flatResults;
  }
  catch (err) {
    const errorDetails = getErrorDetails(err);
    let code;

    if (errorDetails.message.includes('Missing Parameters')) code = 'ReferenceError';
    else code = errorDetails.code || errorDetails.name;

    const { message } = errorDetails;
    const sqlFileName = errorDetails.sqlFileName || errorDetails.path;
    throw errorsToHandle(err, code, sqlFileName, message);
  }
  finally {
    if (pgClient) pgClient.release();
  }
}

export {
  query,
  transaction,
};
