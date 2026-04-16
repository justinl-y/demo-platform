import * as Sentry from '@sentry/node';

import type { RouteHandlerMethod } from 'fastify';

/**
 * Wraps fn in an *active* Sentry span (startSpan).
 * The span becomes the current active span for the duration of the call, so
 * any child operations (DB queries, etc.) are nested under it correctly.
 * Use for sequential work where span hierarchy matters.
 */
function wrapWithActiveSpan<This, Args extends unknown[], Return>(
  name: string,
  fn: (this: This, ...args: Args) => Return,
): (this: This, ...args: Args) => Return {
  const wrapped = function (this: This, ...args: Args): Return {
    return Sentry.startSpan({ name, op: 'function' }, () => fn.call(this, ...args));
  };

  Object.defineProperty(wrapped, 'name', { value: name });

  return wrapped;
}

/**
 * Wraps fn in an *inactive* Sentry span (startInactiveSpan).
 * The span is recorded as a child of the current active span but does NOT
 * replace the async context, so concurrent calls (e.g. inside Promise.all)
 * run in parallel without serialising each other's async contexts.
 * Use for methods that may be awaited in parallel.
 */
function wrapWithInactiveSpan<This, Args extends unknown[], Return>(
  name: string,
  fn: (this: This, ...args: Args) => Return,
): (this: This, ...args: Args) => Return {
  const wrapped = function (this: This, ...args: Args): Return {
    const span = Sentry.startInactiveSpan({ name, op: 'function' });
    const result = fn.call(this, ...args);

    if (result instanceof Promise) {
      return (result as Promise<unknown>).then(
        (value) => {
          span.end();
          return value;
        },
        (error) => {
          span.end();
          throw error;
        },
      ) as Return;
    }

    span.end();
    return result;
  };

  Object.defineProperty(wrapped, 'name', { value: name });

  return wrapped;
}

/**
 * HOF form — wraps a standalone route handler in an active Sentry span.
 * Used by routePropertiesCore to instrument every route at registration time.
 */
function setWithSpan(name: string, handler: RouteHandlerMethod): RouteHandlerMethod {
  return wrapWithActiveSpan(name, handler);
}

/**
 * Decorator form — wraps a class method in an inactive Sentry span.
 * Safe to use on methods called concurrently inside Promise.all.
 * The span name defaults to the method name and can be overridden.
 *
 * @example
 * class AuthService {
 *   @SetWithSpan()
 *   async login(email: string) { ... }          // span name: 'login'
 *
 *   @SetWithSpan('auth.refresh-token')
 *   async refresh(token: string) { ... }        // span name: 'auth.refresh-token'
 * }
 */
function SetWithSpan(name?: string) {
  return function <This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ): (this: This, ...args: Args) => Return {
    return wrapWithInactiveSpan(name ?? String(context.name), target);
  };
}

export {
  setWithSpan,
  SetWithSpan,
};
