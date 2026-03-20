const pg = require('pg');

const { Pool } = pg;

const PG_ENV = {
  PG_HOST: 'db',
  PG_DATABASE: 'test',
  PG_PORT: '5432',
  PG_USER: 'test',
  PG_PASSWORD: 'test',
};

const pool = new Pool({
  host: PG_ENV.PG_HOST,
  database: PG_ENV.PG_DATABASE,
  port: PG_ENV.PG_PORT,
  user: PG_ENV.PG_USER,
  password: PG_ENV.PG_PASSWORD,
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('PG: Unexpected error on idle client', err);
  process.exit(-1);
});

const query = async (sql, params) => {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(sql, params);

    return rows;
  }
  catch (err) {
    console.error(err);
  }
  finally {
    client.release();
  }
};

module.exports = {
  query,
};
