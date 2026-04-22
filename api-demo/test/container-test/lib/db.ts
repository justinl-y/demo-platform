import pg from 'pg';

const { Pool } = pg;

const PG_ENV = {
  PG_HOST: 'db',
  PG_DATABASE: 'test',
  PG_PORT: 5432,
  PG_USER: 'test',
  PG_PASSWORD: 'test',
};

const pool = new Pool({
  host: PG_ENV.PG_HOST,
  database: PG_ENV.PG_DATABASE,
  port: PG_ENV.PG_PORT,
  user: PG_ENV.PG_USER,
  password: PG_ENV.PG_PASSWORD,
  allowExitOnIdle: true,
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('PG: Unexpected error on idle client', err);
  process.exit(-1);
});

const query = async <TRow = Record<string, unknown>>(
  sql: string,
  params?: readonly unknown[],
): Promise<TRow[]> => {
  const client = await pool.connect();

  try {
    const result = params === undefined
      ? await client.query(sql)
      : await client.query(sql, [...params]);

    return result.rows as TRow[];
  }
  finally {
    client.release();
  }
};

export {
  query,
};
