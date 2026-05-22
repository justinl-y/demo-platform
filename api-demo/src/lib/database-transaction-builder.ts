import type {
  QueryRow,
  TransactionInstruction,
  TransactionResult,
} from '../types/database.ts';

type ExecFn = (instructions: TransactionInstruction[], dryRun?: boolean) => Promise<TransactionResult>;

class TransactionBuilder<TResults extends object[][] = []> {
  private readonly instructions: TransactionInstruction[] = [];
  private readonly exec: ExecFn;

  constructor(exec: ExecFn) {
    this.exec = exec;
  }

  add<TRow extends object = QueryRow>(instruction: TransactionInstruction): TransactionBuilder<[...TResults, TRow[]]> {
    // Keep instruction order so execute() returns result groups in the same sequence.
    this.instructions.push(instruction);
    return this as unknown as TransactionBuilder<[...TResults, TRow[]]>;
  }

  async execute(dryRun?: boolean): Promise<TResults> {
    // Cast preserves fluent tuple typing while runtime remains plain array-of-arrays.
    const results = await this.exec(this.instructions, dryRun);
    return results as unknown as TResults;
  }
}

export type {
  ExecFn,
};

export {
  TransactionBuilder,
};
