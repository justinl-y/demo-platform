import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

vi.mock('#lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

vi.mock('#lib/database/sql-loader', () => ({
  getSqlBlob: vi.fn(),
}));

vi.mock('#lib/database/pg-client', () => ({
  pgConnect: vi.fn(),
}));

vi.mock('#lib/database/errors', () => ({
  getErrorDetails: vi.fn(),
  errorsToHandle: vi.fn(),
}));

vi.mock('#lib/database/transaction-instruction-flattener', () => ({
  flattenInstruction: vi.fn(),
}));

import {
  query,
  transaction,
} from '#lib/database';
import {
  getSqlBlob,
} from '#lib/database/sql-loader';
import {
  pgConnect,
} from '#lib/database/pg-client';
import {
  errorsToHandle,
  getErrorDetails,
} from '#lib/database/errors';
import {
  flattenInstruction,
} from '#lib/database/transaction-instruction-flattener';

describe('0012 - database', () => {
  const getSqlBlobMock = vi.mocked(getSqlBlob);
  const pgConnectMock = vi.mocked(pgConnect);
  const getErrorDetailsMock = vi.mocked(getErrorDetails);
  const errorsToHandleMock = vi.mocked(errorsToHandle);
  const flattenInstructionMock = vi.mocked(flattenInstruction);

  beforeEach(() => {
    vi.clearAllMocks();

    getErrorDetailsMock.mockImplementation((err: unknown) => {
      if (err instanceof Error) {
        return {
          ...err,
          message: err.message,
          name: err.name,
        };
      }

      return {
        message: String(err),
        name: 'Error',
      };
    });

    errorsToHandleMock.mockImplementation((err: unknown) => {
      throw err;
    });
  });

  test('normalizes Missing Parameters to ReferenceError in query path', async () => {
    getSqlBlobMock.mockResolvedValue('SELECT 1');

    const dbError = new Error('Missing Parameters: userId');
    const pgClient = {
      query: vi.fn().mockRejectedValue(dbError),
      release: vi.fn(),
    };

    pgConnectMock.mockResolvedValue(pgClient as never);
    getErrorDetailsMock.mockReturnValue({
      message: 'Missing Parameters: userId',
      name: 'Error',
      code: undefined,
    });
    errorsToHandleMock.mockImplementation((_err, code) => {
      throw new Error(`mapped:${String(code)}`);
    });

    await expect(query.call({} as never, 'src/repositories/users/get-user', { userId: 'abc' }, 'one')).rejects.toThrow('mapped:ReferenceError');

    expect(errorsToHandleMock).toHaveBeenCalledWith(
      dbError,
      'ReferenceError',
      'src/repositories/users/get-user',
      'Missing Parameters: userId',
    );
    expect(pgClient.release).toHaveBeenCalledTimes(1);
  });

  test('dry-run transaction rolls back and throws dry-run error', async () => {
    flattenInstructionMock.mockResolvedValue([
      {
        file: 'src/repositories/auth/set-user-token',
        params: { userId: 'u1' },
        query: `UPDATE
          internal.users_authentication
        SET
          refresh_token_hash = $hashedRefreshToken
        WHERE
          user_id = $userId;`,
      },
    ]);

    const pgClient = {
      query: vi.fn(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'ROLLBACK') return { rows: [] };
        return { rows: [{ id: 'u1' }] };
      }),
      release: vi.fn(),
    };

    pgConnectMock.mockResolvedValue(pgClient as never);

    const resultPromise = transaction.call({} as never)
      .add({
        files: 'src/repositories/auth/set-user-token',
        params: {
          userId: 'u1',
          hashedRefreshToken: 'hash',
        },
      })
      .execute(true);

    await expect(resultPromise).rejects.toThrow('Dry run enabled. Transaction rolled back.');
    expect(pgClient.query).toHaveBeenCalledWith('BEGIN');
    expect(pgClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(pgClient.query).not.toHaveBeenCalledWith('COMMIT');
    expect(pgClient.release).toHaveBeenCalledTimes(1);
  });

  test('groups multi-step transaction results by instruction order', async () => {
    flattenInstructionMock.mockImplementation(async (files) => {
      if (files[0] === 'step1') {
        return [{
          file: 'step1',
          params: { a: 1 },
          query: 'STEP_1_QUERY',
        }];
      }

      return [{
        file: 'step2',
        params: { b: 2 },
        query: 'STEP_2_QUERY',
      }];
    });

    const pgClient = {
      query: vi.fn(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return { rows: [] };
        if (sql === 'STEP_1_QUERY') return { rows: [{ id: 1 }] };
        if (sql === 'STEP_2_QUERY') return { rows: [{ id: 2 }, { id: 3 }] };
        return { rows: [] };
      }),
      release: vi.fn(),
    };

    pgConnectMock.mockResolvedValue(pgClient as never);

    const result = await transaction.call({} as never)
      .add({
        files: 'step1',
        params: {
          a: 1,
        },
      })
      .add({
        files: 'step2',
        params: {
          b: 2,
        },
      })
      .execute();

    expect(result).toEqual([
      [{ id: 1 }],
      [{ id: 2 }, { id: 3 }],
    ]);
    expect(pgClient.query).toHaveBeenCalledWith('BEGIN');
    expect(pgClient.query).toHaveBeenCalledWith('COMMIT');
    expect(pgClient.release).toHaveBeenCalledTimes(1);
  });
});
