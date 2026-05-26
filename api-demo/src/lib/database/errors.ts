import {
  InternalServerError,
} from 'http-errors-enhanced';

interface KnownError {
  code?: string;
  message?: string;
  name?: string;
  path?: string;
  sqlFileName?: string;
}

function sqlSyntaxError(file: string | undefined, context: string, message: string): string {
  return `SQL syntax error in file '${file}.sql': ${context}: '${message}'`;
}

function pgError(file: string | undefined, context: string, message: string): string {
  return `PG error triggered by file '${file}.sql': ${context}: '${message}'`;
}

function getErrorDetails(err: unknown): Required<Pick<KnownError, 'message' | 'name'>> & KnownError {
  // Normalize unknown error shapes into a consistent structure for mapping.
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
  // Translate low-level/system/PG errors into API-safe domain messages.
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
      error = new InternalServerError(sqlSyntaxError(file, 'Syntax error', message));
      break;
    case '42P01':
      error = new InternalServerError(sqlSyntaxError(file, 'Misnamed table', message));
      break;
    case '42703':
      error = new InternalServerError(sqlSyntaxError(file, 'Misnamed column', message));
      break;
    case '42704':
      error = new InternalServerError(sqlSyntaxError(file, 'Type error', message));
      break;
    case '22000':
      error = new InternalServerError(pgError(file, 'Invalid or out-of-range input data', message));
      break;
    case '23514':
      error = new InternalServerError(pgError(file, 'Check constraint violation', message));
      break;
    case '23P01':
      error = new InternalServerError(pgError(file, 'Exclusion constraint violation', message));
      break;
    case '23502':
      error = new InternalServerError(pgError(file, 'Not-null constraint violation', message));
      break;
    case '23505':
      {
        const matchedKey = message.match(/^Key (\(.*\))=(\(.*?\)) already exists.*$/);

        if (matchedKey) {
          const [, key, value] = matchedKey;

          error = new InternalServerError(pgError(file, `Insert operation unique key violation ${key} ${value}`, message));
          break;
        }
      }

      if (/violates unique constraint/.test(message)) {
        error = new InternalServerError(pgError(file, 'Unique constraint violation', message));
        break;
      }
      // falls through
    case '23503':
      {
        const missingKey = message.match(/^Key (\(.*\))=(\(.*?\)) is not present .*$/);

        if (missingKey) {
          const [, key, value] = missingKey;

          error = new InternalServerError(pgError(file, `Update operation foreign key violation ${key} ${value}`, message));
          break;
        }
      }

      {
        const referencedKey = message.match(/^Key (\(.*\))=(\(.*?\)) is still referenced .*$/);

        if (referencedKey) {
          const [, key, value] = referencedKey;

          error = new InternalServerError(pgError(file, `Delete operation foreign key violation: ${key} ${value}`, message));
          break;
        }
      }
      // falls through
    default:
      error = err;
  }

  throw error;
}

export {
  getErrorDetails,
  errorsToHandle,
};
