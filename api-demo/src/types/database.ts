type QueryRow = Record<string, unknown>;

type SqlParams = Record<string, unknown>;

interface TransactionInstruction {
  files: string | string[];
  params: SqlParams | SqlParams[];
}

type QueryOutputFormat = 'collection' | 'one';

type QueryResult<F extends QueryOutputFormat, TRow extends object> = F extends 'one'
  ? TRow | null
  : TRow[] | null;

type TransactionResult = Record<string, QueryRow[]>;

interface DatabaseDecorator {
  query: {
    <TRow extends object = QueryRow>(
      file: string,
      params: SqlParams,
      outputFormat: 'one',
    ): Promise<QueryResult<'one', TRow>>;

    <TRow extends object = QueryRow>(
      file: string,
      params: SqlParams,
      outputFormat?: 'collection',
    ): Promise<QueryResult<'collection', TRow>>;
  };

  transaction: (
    rawInstructions: TransactionInstruction | TransactionInstruction[],
    dryRun?: boolean,
  ) => Promise<TransactionResult>;
}

export type {
  QueryRow,
  SqlParams,
  TransactionInstruction,
  QueryOutputFormat,
  QueryResult,
  TransactionResult,
  DatabaseDecorator,
};
