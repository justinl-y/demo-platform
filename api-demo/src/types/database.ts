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

interface ITransactionBuilder<TResults extends object[][] = []> {
  add<TRow extends object = QueryRow>(instruction: TransactionInstruction): ITransactionBuilder<[...TResults, TRow[]]>;
  execute(dryRun?: boolean): Promise<TResults>;
}

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

  transaction: () => ITransactionBuilder;
}

export type {
  QueryRow,
  SqlParams,
  TransactionInstruction,
  QueryOutputFormat,
  QueryResult,
  TransactionResult,
  ITransactionBuilder,
  DatabaseDecorator,
};
