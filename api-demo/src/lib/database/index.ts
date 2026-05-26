import {
  InternalServerError,
  ImaTeapotError,
} from 'http-errors-enhanced';

import {
  createLogger,
} from '#lib/logger';
import {
  errorsToHandle,
  getErrorDetails,
} from './errors.ts';
import { pgConnect } from './pg-client.ts';
import {
  getSqlBlob,
} from './sql-loader.ts';
import {
  flattenInstruction,
} from './transaction-instruction-flattener.ts';
import {
  TransactionBuilder,
} from './transaction-builder.ts';
import {
  MISSING_PARAMS_ERROR,
} from './pg-named.ts';

import type {
  Pool,
} from 'pg';
import type {
  QueryRow,
  SqlParams,
  TransactionInstruction,
  QueryOutputFormat,
  QueryResult,
  TransactionResult,
} from '../../types/database.ts';
import type {
  FlattenedInstruction,
} from './transaction-instruction-flattener.ts';
import type { PatchedPgClient } from './pg-client.ts';

const logger = createLogger();
// Guardrail for read-path usage: write statements must go through transaction().
const dmlRegex = /\bINSERT\b|\bUPDATE\b|\bDELETE\b/i;

interface ErrorDetails {
  code?: string;
  message: string;
  name: string;
}

function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

async function rollbackDryRun(client: PatchedPgClient, todos: FlattenedInstruction[]): Promise<never> {
  // Dry-run always rolls back and throws a sentinel error to signal intentional non-commit.
  logger.warn('Rolling back transaction');

  await client.query('ROLLBACK');
  logger.info({ todos }, 'Dry run transaction rolled back');

  throw new ImaTeapotError('Dry run enabled. Transaction rolled back.');
}

async function rollbackTransaction(client: PatchedPgClient, error: unknown): Promise<never> {
  // Runtime rollback path: preserve original failure so upstream mapping retains context.
  logger.warn('Rolling back transaction');

  try {
    await client.query('ROLLBACK');
  }
  catch (rollbackError) {
    // Preserve the original transaction error; rollback failure is diagnostic context.
    logger.error({ rollbackError }, 'Rollback failed while handling transaction error');
  }

  // Non-dry-run rollback should always preserve causal error context.
  if (error === undefined) throw new Error('rollbackTransaction requires an error argument');

  throw error;
}

function normalizeErrorCode(errorDetails: ErrorDetails): string {
  if (errorDetails.message.includes(MISSING_PARAMS_ERROR)) return 'ReferenceError';

  return errorDetails.code || errorDetails.name;
}

async function runTransactionStage(client: PatchedPgClient, stage: string, onFailure: (error: unknown) => Promise<never>): Promise<void> {
  // Centralize BEGIN/COMMIT stage execution so failures go through a single rollback hook.
  try {
    await client.query(stage);
  }
  catch (error) {
    await onFailure(error);
  }
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
    // SQL blobs are loaded from file to keep query text versioned alongside repository code.
    const blob = await getSqlBlob(file);

    if (dmlRegex.test(blob)) throw new InternalServerError('INSERT|UPDATE|DELETE queries should use db.transaction');

    pgClient = await pgConnect(this);

    const result = await pgClient.query(blob, params);
    const {
      rowCount,
    } = result;

    // Preserve existing contract: empty query results resolve as null.
    if (rowCount === 0) return null as QueryResult<F, TRow>;
    if (outputFormat === 'one') return ((result.rows[0] as TRow | undefined) ?? null) as QueryResult<F, TRow>;

    return result.rows as QueryResult<F, TRow>;
  }
  catch (err) {
    const errorDetails = getErrorDetails(err);
    const {
      message,
    } = errorDetails;
    const code = normalizeErrorCode(errorDetails);

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

  "instruction": a single instruction is an object with files and params keys.
  each key accepts a single value or an array; values are normalized to arrays during execution.
  canonical form:

   {
     files: [],
     params: []
   }

   again, the two keys can be simplified by the caller to string and object, respectively.
*/

async function executeTransaction(this: Pool, rawInstructions: TransactionInstruction | TransactionInstruction[], dryRun = false): Promise<TransactionResult> {
  let pgClient: PatchedPgClient | undefined;

  try {
    pgClient = await pgConnect(this);

    /*
      As per documentation: the instructions argument should be an array of objects. For simplicity however, instead
      of handing single object in an array, the caller may choose to just pass the object.
      If this is the case, for programming consistency & simplicity below... just force the instructions argument
      back into an array by wrapping it in [] if need be! I.e. We are standardizing so we can treat the remaining
      code as if no shorthands were used by the caller.
    */
    const instructions: TransactionInstruction[] = asArray(rawInstructions);

    // Group flattened query work by input instruction to preserve output grouping semantics.
    const instructionTodos: FlattenedInstruction[][] = [];

    for (const instruction of instructions) {
      const {
        files: rawFiles, params: rawParams,
      } = instruction;

      const files = asArray(rawFiles);
      const params = asArray(rawParams);

      instructionTodos.push(await flattenInstruction(files, params));
    }

    const pgRollbackTransaction = (error: unknown): Promise<never> => rollbackTransaction(pgClient!, error);

    // begin the transaction
    await runTransactionStage(pgClient, 'BEGIN', pgRollbackTransaction);

    // One result bucket per instruction, preserving add() order in TransactionBuilder.
    const results: TransactionResult = instructionTodos.map(() => []);

    for (let i = 0; i < instructionTodos.length; i++) {
      for (const todo of instructionTodos[i]) {
        const {
          file: fileName, query, params,
        } = todo;

        // pgClient.query supports named SQL params because pgConnect patches the client upstream.
        try {
          const result = await pgClient.query(query, params);

          results[i].push(...result.rows);
        }
        catch (err) {
          const errWithContext = Object.assign(
            err instanceof Error ? err : new Error(String(err)),
            { sqlFileName: fileName },
          );

          await pgRollbackTransaction(errWithContext);
        }
      }
    }

    if (dryRun) {
      const todos = instructionTodos.flat();
      await rollbackDryRun(pgClient, todos);
    }
    else {
      await runTransactionStage(pgClient, 'COMMIT', pgRollbackTransaction);
    }

    return results;
  }
  catch (err) {
    const errorDetails = getErrorDetails(err);
    const code = normalizeErrorCode(errorDetails);

    const {
      message,
    } = errorDetails;
    const sqlFileName = errorDetails.sqlFileName || errorDetails.path;
    throw errorsToHandle(err, code, sqlFileName, message);
  }
  finally {
    if (pgClient) pgClient.release();
  }
}

function transaction(this: Pool): TransactionBuilder {
  return new TransactionBuilder(executeTransaction.bind(this));
}

export {
  query,
  transaction,
};
