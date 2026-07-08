import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import buildInstance from '../src/build-instance.ts';

// Writes the OpenAPI spec to shared/openapi.json — the single contract artifact the front-end
// derives its mock API and request/response types from. Generated offline: buildInstance() skips
// the AWS secrets fetch and Sentry in TEST, and the pg pool only connects on first query (never at
// ready()), so no DB/secrets are needed. Run after changing any route schema; the spec is committed
// and CI verifies it is in sync.
async function generateOpenApi(): Promise<void> {
  // Collect the permission each route enforces (routePropertiesCore's `config.permission`) as the
  // instance registers its routes — the source of truth, so the list stays current as routes grow.
  const permissions = new Set<string>();
  const app = await buildInstance({
    onRoute: (routeOptions) => {
      const permission = routeOptions.config?.permission;
      if (permission) permissions.add(permission);
    },
  });
  await app.ready();

  // `swagger()` is added by @fastify/swagger (registered in non-live envs); typed loosely here to
  // avoid depending on the plugin's module augmentation in this standalone script.
  const spec = (app as unknown as { swagger: () => Record<string, unknown> }).swagger();

  // Expose the full permission set as a vendor extension so consumers (e.g. the front-end mock's
  // admin user) derive it from the spec instead of hardcoding a list that drifts.
  spec['x-permissions'] = [...permissions].sort();

  const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../shared/openapi.json');
  writeFileSync(outPath, `${JSON.stringify(spec, null, 2)}\n`);

  await app.close();

  console.info(`OpenAPI spec written to ${outPath}`);
}

generateOpenApi().catch((err) => {
  console.error(err);
  process.exit(1);
});
