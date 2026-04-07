export type SqlParams = Record<string, unknown>;

export type QueryRow = Record<string, unknown>;

export type QueryOutputFormat = 'collection' | 'one';

export type QueryResult<F extends QueryOutputFormat, TRow extends object> = F extends 'one'
  ? TRow | null
  : TRow[] | null;

export type TransactionInstruction = {
  files: string | string[];
  params: SqlParams | SqlParams[];
};

export type TransactionResult = Record<string, QueryRow[]>;

export type DatabaseDecorator = {
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
};
