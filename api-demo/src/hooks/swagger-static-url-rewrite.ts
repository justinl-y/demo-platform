import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import { swaggerConfig } from '#config/swagger';

// Workaround: @fastify/static v9 uses getPathnameForSend(req.raw.url, prefix) to strip the
// URL prefix before serving a file. When @fastify/swagger-ui registers @fastify/static inside
// the /api-docs scope, req.raw.url is the full path (/api-docs/static/...) but prefix is only
// /static/ — startsWith('/static/') fails and every static asset returns a JSON 404.
// The onRequest hook fires after routing (route already matched) but before the handler, so
// rewriting req.raw.url here fixes the prefix check without affecting route matching.
// index.html is excluded because its handler redirects using req.url and needs the full path.
// The hook must be at root scope (not scoped) — sibling-scope hooks don't apply to routes
// registered by a different sibling plugin.
const staticBase = `${swaggerConfig.routePrefix}/static/`;

async function swaggerStaticUrlRewrite(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (req.raw.url?.startsWith(staticBase) && !req.raw.url.includes('/index.html')) {
    req.raw.url = req.raw.url.replace(staticBase, '/static/');
  }
}

export default swaggerStaticUrlRewrite;
