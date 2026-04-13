import pino from 'pino';
import { Writable } from 'node:stream';

import { apiEnv } from '#config/api';

// Extracts just the `msg` field from pino's JSON output, preserving the
// existing human-readable console format produced by the interaction hooks.
function createMsgStream(): Writable {
  return new Writable({
    write(chunk, _encoding, done) {
      const line = String(chunk).trimEnd();

      if (line) {
        try {
          const { msg } = JSON.parse(line) as { msg?: unknown };

          if (msg !== undefined && !String(msg).startsWith('Server listening at')) {
            process.stdout.write(String(msg));
          }
        }
        catch {
          process.stdout.write(String(chunk));
        }
      }

      done();
    },
  });
}

function createLogger() {
  if (apiEnv === 'TEST') return pino({ level: 'silent' });

  if (apiEnv === 'STAGE' || apiEnv === 'PROD') {
    return pino(
      { level: 'info' },
      pino.multistream([
        { stream: createMsgStream() }, // plain text → stdout
        { stream: process.stderr },    // JSON → stderr → awslogs → CloudWatch
      ]),
    );
  }

  return pino({ level: 'info' }, createMsgStream());
}

export { createLogger };
