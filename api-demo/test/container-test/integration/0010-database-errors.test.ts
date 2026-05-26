import {
  describe,
  expect,
  test,
} from 'vitest';

import {
  errorsToHandle,
} from '#lib/database/errors';

describe('0010 - database-errors', () => {
  test('maps missing parameter errors to a standardized message', () => {
    expect(() => errorsToHandle(
      new Error('Missing Parameters: id'),
      'ReferenceError',
      '/tmp/get-user',
      'Missing Parameters: id',
    )).toThrow(/Reference error in file '\/tmp\/get-user\.sql'/);
  });

  test('maps unique-key violation with parsed key/value details', () => {
    const message = 'Key (email)=(user@example.com) already exists.';

    expect(() => errorsToHandle(
      new Error(message),
      '23505',
      '/tmp/set-user',
      message,
    )).toThrow(/Insert operation unique key violation \(email\) \(user@example\.com\)/);
  });

  test('maps delete foreign-key violation with a well-formed file token', () => {
    const message = 'Key (id)=(123) is still referenced from table "child".';

    try {
      errorsToHandle(
        new Error(message),
        '23503',
        '/tmp/delete-user',
        message,
      );
    }
    catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toContain('file \'/tmp/delete-user.sql\': Delete operation foreign key violation');
      return;
    }

    throw new Error('Expected errorsToHandle to throw');
  });
});
