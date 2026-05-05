import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

vi.mock('#lib/database-sql-loader', () => ({
  getSqlBlob: vi.fn(),
}));

import {
  flattenInstruction,
} from '#lib/database-transaction-instruction-flattener';
import {
  getSqlBlob,
} from '#lib/database-sql-loader';

describe('0011 - database-transaction-instruction-flattener', () => {
  const getSqlBlobMock = vi.mocked(getSqlBlob);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('expands non-templated SQL into one instruction per params object', async () => {
    getSqlBlobMock.mockResolvedValue('SELECT * FROM users WHERE id = $id');

    const result = await flattenInstruction(
      ['src/repositories/users/get-user'],
      [{ id: 1 }, { id: 2 }],
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      file: 'src/repositories/users/get-user',
      params: { id: 1 },
      query: 'SELECT * FROM users WHERE id = $id',
    });
    expect(result[1]).toEqual({
      file: 'src/repositories/users/get-user',
      params: { id: 2 },
      query: 'SELECT * FROM users WHERE id = $id',
    });
  });

  test('builds a single VALUES-templated statement for bulk writes', async () => {
    getSqlBlobMock.mockResolvedValue('INSERT INTO users (id, email) <%= VALUES("id", "email") %>');

    const result = await flattenInstruction(
      ['src/repositories/users/insert-users'],
      [
        {
          id: 'a',
          email: 'a@example.com',
        },
        {
          id: 'b',
          email: 'b@example.com',
        },
      ],
    );

    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('src/repositories/users/insert-users');
    expect(result[0].params).toEqual({
      id_0: 'a',
      email_0: 'a@example.com',
      id_1: 'b',
      email_1: 'b@example.com',
    });
    expect(result[0].query).toContain('VALUES ($id_0,$email_0),($id_1,$email_1)');
  });
});
